"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotebookLmStatus = getNotebookLmStatus;
exports.prepareNotebookLmSessionExport = prepareNotebookLmSessionExport;
exports.recordNotebookLmExportResult = recordNotebookLmExportResult;
const node_child_process_1 = require("node:child_process");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = require("node:util");
const setup_codex_mcp_1 = require("./setup-codex-mcp");
const runtime_1 = require("./runtime");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
function nowTimestamp() {
    return new Date().toISOString();
}
function sanitizePathSegment(value) {
    const normalized = value.trim().replace(/[\\/:]+/g, '__').replace(/[^A-Za-z0-9._-]+/g, '_');
    return normalized.length > 0 ? normalized : 'unknown';
}
function createArchiveEventRecord(input) {
    return JSON.stringify({
        version: 1,
        event_id: `archive-${(0, node_crypto_1.randomUUID)()}`,
        run_id: input.runId,
        kind: input.kind,
        recorded_at: nowTimestamp(),
        actor: 'notebooklm_archive',
        phase_id: null,
        task_card_id: null,
        source_ref: null,
        summary: input.summary,
        payload: input.payload,
    });
}
async function appendArchiveEvents(cwd, runId, events) {
    if (events.length === 0) {
        return;
    }
    const runPaths = (0, runtime_1.createRunPaths)(cwd, runId);
    await (0, promises_1.appendFile)(runPaths.runEventsFile, `${events.map((event) => createArchiveEventRecord({ runId, ...event })).join('\n')}\n`, 'utf8');
}
async function readJsonFileIfPresent(filePath) {
    try {
        return JSON.parse(await (0, promises_1.readFile)(filePath, 'utf8'));
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function writeJsonFile(filePath, value) {
    await (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
async function writeTextFileIfPresent(sourcePath, destinationPath) {
    try {
        const content = await (0, promises_1.readFile)(sourcePath, 'utf8');
        await (0, promises_1.writeFile)(destinationPath, content, 'utf8');
        return destinationPath;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
function parseGitRemote(remoteUrl) {
    const trimmed = remoteUrl.trim();
    const httpsMatch = trimmed.match(/github\.com[/:]([^/:\s]+)\/([^/\s]+?)(?:\.git)?$/i);
    if (httpsMatch) {
        const owner = httpsMatch[1] ?? 'unknown-owner';
        const repo = httpsMatch[2] ?? 'unknown-repo';
        return {
            repoLabel: `${owner}/${repo}`,
            repoKey: `${sanitizePathSegment(owner)}__${sanitizePathSegment(repo)}`,
        };
    }
    return null;
}
async function deriveRepoIdentity(cwd, configuredRepoKey) {
    if (configuredRepoKey && configuredRepoKey.trim().length > 0) {
        return {
            repoLabel: configuredRepoKey,
            repoKey: sanitizePathSegment(configuredRepoKey),
        };
    }
    try {
        const { stdout } = await execFileAsync('git', ['-C', cwd, 'remote', 'get-url', 'origin']);
        const parsed = parseGitRemote(stdout);
        if (parsed) {
            return parsed;
        }
    }
    catch {
        // Fall back to directory name below.
    }
    const basename = node_path_1.default.basename(cwd);
    return {
        repoLabel: basename,
        repoKey: sanitizePathSegment(basename),
    };
}
function resolveLocalArchiveRoot(cwd, localArchiveRoot) {
    return node_path_1.default.isAbsolute(localArchiveRoot) ? localArchiveRoot : node_path_1.default.resolve(cwd, localArchiveRoot);
}
function deriveSuggestedNextSteps(input) {
    const steps = [];
    switch (input.readinessStatus) {
        case 'disabled':
            steps.push('Enable archive_targets.notebooklm.enabled and set notebook_url or notebook_id.');
            break;
        case 'notebooklm_not_registered':
            steps.push('Run codex mcp add notebooklm -- npx -y notebooklm-mcp@latest and restart Codex CLI.');
            break;
        case 'notebooklm_session_unavailable':
            steps.push('Restart Codex CLI so the notebooklm MCP registration is attached to the current session.');
            break;
        case 'notebooklm_auth_required':
            steps.push('Complete NotebookLM browser login and confirm authenticated=true through NotebookLM MCP get_health.');
            break;
        case 'notebooklm_target_not_configured':
            steps.push('Set archive_targets.notebooklm.notebook_url or notebook_id in foreman-config.json.');
            break;
        case 'ready':
            steps.push('Use codex-foreman notebooklm-export-session --run-id <id> to prepare a repo-scoped archive bundle.');
            break;
        default:
            break;
    }
    if (input.commandStatus === 'ready_local_archive_only') {
        steps.push('Use the NotebookLM MCP itself for the final upload, then record the result through foreman_notebooklm_record_export_result.');
    }
    return steps;
}
async function getNotebookLmStatus(options) {
    const cwd = node_path_1.default.resolve(options.cwd);
    const foremanConfig = await (0, runtime_1.loadForemanConfig)(cwd);
    const target = foremanConfig.archive_targets?.notebooklm ?? null;
    if (!target) {
        throw new Error('Foreman config is missing archive_targets.notebooklm.');
    }
    const installCheck = await (0, setup_codex_mcp_1.checkCodexMcpInstall)(options);
    const companion = installCheck.otherInstalledMcpServers.find((server) => server.name === 'notebooklm') ?? null;
    const { repoLabel, repoKey } = await deriveRepoIdentity(cwd, target.repo_key);
    const readinessStatus = installCheck.notebookLmArchiveTargetStatus;
    const commandStatus = readinessStatus === 'disabled' ? 'disabled' : readinessStatus === 'ready' ? 'ready_local_archive_only' : 'degraded';
    const uploadCapabilityStatus = readinessStatus === 'ready' ? 'missing' : 'unknown';
    const uploadCapabilitySummary = readinessStatus === 'ready'
        ? 'Foreman prepares a repo-scoped local archive bundle, but direct NotebookLM source upload is not wired through the Foreman MCP surface.'
        : 'Upload capability is only meaningful after NotebookLM archive readiness is satisfied.';
    return {
        cwd,
        repoLabel,
        repoKey,
        localArchiveRoot: resolveLocalArchiveRoot(cwd, target.local_archive_root),
        commandStatus,
        readinessStatus,
        readinessSummary: installCheck.notebookLmArchiveTargetSummary,
        uploadCapabilityStatus,
        uploadCapabilitySummary,
        targetEnabled: target.enabled,
        targetMode: target.mode,
        targetAutoCreateNotebook: target.auto_create_notebook,
        targetNotebookUrl: target.notebook_url,
        targetNotebookId: target.notebook_id,
        secretRef: target.secret_ref,
        companionRegistered: companion !== null,
        companionEnabled: companion?.enabled ?? false,
        companionAuthStatus: companion?.authStatus ?? null,
        configPath: installCheck.configPath,
        suggestedNextSteps: deriveSuggestedNextSteps({ readinessStatus, commandStatus }),
    };
}
function selectArchiveSessionId(run, requestedSessionId) {
    return requestedSessionId ?? run.active_thread_id ?? run.latest_entry_trace?.requester_session_id ?? `run-${run.run_id}`;
}
function createSessionSummaryMarkdown(input) {
    return [
        `# Foreman NotebookLM Session Archive`,
        '',
        `- Repo: ${input.repoLabel}`,
        `- Run ID: ${input.run.run_id}`,
        `- Session ID: ${input.manifest.session_id}`,
        `- Goal: ${input.run.goal}`,
        `- Status: ${input.run.status}`,
        `- Stage: ${input.run.stage}`,
        `- Updated At: ${input.run.updated_at}`,
        `- Archive Dir: ${input.archiveDir}`,
        '',
        `## Readiness`,
        '',
        input.readinessSummary,
        '',
        `## Upload Boundary`,
        '',
        input.uploadCapabilitySummary,
        '',
        `## Included Files`,
        '',
        `- manifest.json`,
        `- session-summary.md`,
        `- run.json`,
        `- run-state.json (if present)`,
        `- planning-checklist.json (if present)`,
        `- events.jsonl (if present)`,
        '',
    ].join('\n');
}
async function prepareNotebookLmSessionExport(options) {
    const status = await getNotebookLmStatus(options);
    const runPaths = (0, runtime_1.createRunPaths)(status.cwd, options.runId);
    const run = await readJsonFileIfPresent(runPaths.runFile);
    if (!run) {
        throw new Error(`Run ${options.runId} does not exist at ${runPaths.runFile}.`);
    }
    const sessionId = sanitizePathSegment(selectArchiveSessionId(run, options.sessionId));
    const archiveDate = (run.updated_at || nowTimestamp()).slice(0, 10);
    const archiveDir = node_path_1.default.join(status.localArchiveRoot, status.repoKey, archiveDate, sessionId);
    await (0, promises_1.mkdir)(archiveDir, { recursive: true });
    const manifestPath = node_path_1.default.join(archiveDir, 'manifest.json');
    const sessionSummaryPath = node_path_1.default.join(archiveDir, 'session-summary.md');
    const runCopyPath = node_path_1.default.join(archiveDir, 'run.json');
    const runStateCopyPath = node_path_1.default.join(archiveDir, 'run-state.json');
    const checklistCopyPath = node_path_1.default.join(archiveDir, 'planning-checklist.json');
    const eventsCopyPath = node_path_1.default.join(archiveDir, 'events.jsonl');
    await writeJsonFile(runCopyPath, run);
    const runState = await (0, runtime_1.loadRunStateProjectionIfPresent)(runPaths);
    if (runState !== null) {
        await writeJsonFile(runStateCopyPath, runState);
    }
    const planningChecklistPath = await writeTextFileIfPresent(runPaths.planningChecklistFile, checklistCopyPath);
    const runEvents = await (0, runtime_1.loadRunEventRecordsIfPresent)(runPaths);
    if (runEvents.length > 0) {
        await (0, promises_1.writeFile)(eventsCopyPath, `${runEvents.map((event) => JSON.stringify(event)).join('\n')}\n`, 'utf8');
    }
    const manifest = {
        version: 1,
        generated_at: nowTimestamp(),
        cwd: status.cwd,
        repo_label: status.repoLabel,
        repo_key: status.repoKey,
        run_id: run.run_id,
        session_id: sessionId,
        archive_status: 'local_archive_prepared',
        readiness_status: status.readinessStatus,
        upload_capability_status: status.uploadCapabilityStatus,
        local_archive_root: status.localArchiveRoot,
        archive_dir: archiveDir,
        config_path: status.configPath,
        target: {
            enabled: status.targetEnabled,
            mode: status.targetMode,
            auto_create_notebook: status.targetAutoCreateNotebook,
            notebook_url: status.targetNotebookUrl,
            notebook_id: status.targetNotebookId,
            secret_ref: status.secretRef,
        },
        files: {
            manifest: manifestPath,
            session_summary: sessionSummaryPath,
            run: runCopyPath,
            run_state: runState !== null ? runStateCopyPath : null,
            planning_checklist: planningChecklistPath,
            events: runEvents.length > 0 ? eventsCopyPath : null,
        },
        upload_record: {
            status: 'pending',
            recorded_at: null,
            summary: null,
            notebook_url: status.targetNotebookUrl,
            notebook_id: status.targetNotebookId,
            source_ids: [],
        },
    };
    await writeJsonFile(manifestPath, manifest);
    await (0, promises_1.writeFile)(sessionSummaryPath, createSessionSummaryMarkdown({
        run,
        archiveDir,
        repoLabel: status.repoLabel,
        readinessSummary: status.readinessSummary,
        uploadCapabilitySummary: status.uploadCapabilitySummary,
        manifest,
    }), 'utf8');
    const summary = status.readinessStatus === 'ready'
        ? `Prepared local NotebookLM archive bundle at ${archiveDir}. Direct upload remains outside Foreman; use NotebookLM MCP for upload and record the result afterward.`
        : `Prepared local NotebookLM archive bundle at ${archiveDir}. NotebookLM target is not ready yet: ${status.readinessSummary}`;
    await appendArchiveEvents(status.cwd, run.run_id, [
        {
            kind: 'archive_export_started',
            summary: `Prepared local NotebookLM archive bundle at ${archiveDir}.`,
            payload: {
                archive_dir: archiveDir,
                repo_key: status.repoKey,
                session_id: sessionId,
            },
        },
        {
            kind: 'archive_export_blocked',
            summary: status.readinessStatus === 'ready'
                ? 'NotebookLM upload remains host-driven because Foreman has no direct NotebookLM source-upload surface.'
                : `NotebookLM upload cannot proceed yet: ${status.readinessSummary}`,
            payload: {
                archive_dir: archiveDir,
                readiness_status: status.readinessStatus,
                upload_capability_status: status.uploadCapabilityStatus,
            },
        },
    ]);
    return {
        cwd: status.cwd,
        runId: run.run_id,
        sessionId,
        repoLabel: status.repoLabel,
        repoKey: status.repoKey,
        localArchiveRoot: status.localArchiveRoot,
        archiveDir,
        manifestPath,
        status: 'local_archive_prepared',
        summary,
        readinessStatus: status.readinessStatus,
        uploadCapabilityStatus: status.uploadCapabilityStatus,
        targetNotebookUrl: status.targetNotebookUrl,
        targetNotebookId: status.targetNotebookId,
    };
}
async function recordNotebookLmExportResult(options) {
    const archiveDir = node_path_1.default.resolve(options.archiveDir);
    const manifestPath = node_path_1.default.join(archiveDir, 'manifest.json');
    const manifest = await readJsonFileIfPresent(manifestPath);
    if (!manifest) {
        throw new Error(`NotebookLM archive manifest is missing at ${manifestPath}.`);
    }
    const recordedAt = nowTimestamp();
    const nextManifest = {
        ...manifest,
        upload_record: {
            status: options.status,
            recorded_at: recordedAt,
            summary: options.summary,
            notebook_url: options.notebookUrl ?? manifest.upload_record.notebook_url ?? manifest.target.notebook_url,
            notebook_id: options.notebookId ?? manifest.upload_record.notebook_id ?? manifest.target.notebook_id,
            source_ids: options.sourceIds ?? manifest.upload_record.source_ids,
        },
    };
    await writeJsonFile(manifestPath, nextManifest);
    await appendArchiveEvents(manifest.cwd, manifest.run_id, [
        {
            kind: options.status === 'completed' ? 'archive_export_completed' : 'archive_export_blocked',
            summary: options.summary,
            payload: {
                archive_dir: archiveDir,
                notebook_url: nextManifest.upload_record.notebook_url,
                notebook_id: nextManifest.upload_record.notebook_id,
                source_ids: nextManifest.upload_record.source_ids,
                upload_status: options.status,
            },
        },
    ]);
    return {
        archiveDir,
        manifestPath,
        runId: manifest.run_id,
        sessionId: manifest.session_id,
        status: options.status,
        summary: options.summary,
        recordedAt,
        notebookUrl: nextManifest.upload_record.notebook_url,
        notebookId: nextManifest.upload_record.notebook_id,
        sourceIds: nextManifest.upload_record.source_ids,
    };
}
//# sourceMappingURL=notebooklm-archive.js.map