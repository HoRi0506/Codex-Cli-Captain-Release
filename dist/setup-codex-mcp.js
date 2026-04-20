"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexMcpSetupConflictError = void 0;
exports.resolveInstalledCodexForemanMcpLaunchTarget = resolveInstalledCodexForemanMcpLaunchTarget;
exports.checkCodexMcpInstall = checkCodexMcpInstall;
exports.setupCodexMcp = setupCodexMcp;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = __importDefault(require("node:path"));
const public_surface_1 = require("./public-surface");
const run_lifecycle_1 = require("./run-lifecycle");
const runtime_1 = require("./runtime");
const tool_routing_1 = require("./tool-routing");
const role_roster_1 = require("./role-roster");
const DEFAULT_CODEX_MCP_INSPECTION_TIMEOUT_MS = 8_000;
const RUN_HYGIENE_WARNING_THRESHOLD = 1;
class CodexMcpSetupConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CodexMcpSetupConflictError';
    }
}
exports.CodexMcpSetupConflictError = CodexMcpSetupConflictError;
function defaultPackageRoot() {
    return node_path_1.default.resolve(__dirname, '..');
}
function resolveCodexHome() {
    const configured = process.env.CODEX_HOME?.trim();
    if (configured && configured.length > 0) {
        return configured;
    }
    return node_path_1.default.join((0, node_os_1.homedir)(), '.codex');
}
function resolveCodexSkillPath(skillName) {
    return node_path_1.default.join(resolveCodexHome(), 'skills', skillName);
}
function resolveCodexAgentsDirectoryPath() {
    return node_path_1.default.join(resolveCodexHome(), 'agents');
}
function resolvePackagedForemanCapSkillPath(packageRoot = defaultPackageRoot()) {
    return node_path_1.default.join(packageRoot, 'skills', public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME, 'SKILL.md');
}
function resolvePackagedForemanAgentsDirectoryPath(packageRoot = defaultPackageRoot()) {
    return node_path_1.default.join(packageRoot, 'agents');
}
async function readTextIfExists(filePath) {
    try {
        return await (0, promises_1.readFile)(filePath, 'utf8');
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function listPackagedForemanCustomAgentFiles(packageRoot = defaultPackageRoot()) {
    const agentsDir = resolvePackagedForemanAgentsDirectoryPath(packageRoot);
    const entries = await (0, promises_1.readdir)(agentsDir, { withFileTypes: true });
    const presentFiles = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
    return public_surface_1.FOREMAN_PACKAGED_CUSTOM_AGENT_FILES.filter((fileName) => presentFiles.has(fileName));
}
function createConfiguredRoleModelsSummary(config) {
    const documenterConfig = (config.agents.documenter ?? (0, runtime_1.getDefaultForemanAgentConfigForRole)('documenter'));
    const entries = [
        {
            role: 'captain',
            rosterName: config.agents.orchestrator.name,
            model: config.agents.orchestrator.model,
            variant: config.agents.orchestrator.variant,
        },
        {
            role: 'tactician',
            rosterName: config.agents.planner.name,
            model: config.agents.planner.model,
            variant: config.agents.planner.variant,
        },
        ...(config.agents.explorer
            ? [
                {
                    role: 'scout',
                    rosterName: config.agents.explorer.name,
                    model: config.agents.explorer.model,
                    variant: config.agents.explorer.variant,
                },
            ]
            : []),
        {
            role: 'raider',
            rosterName: config.agents['code specialist'].name,
            model: config.agents['code specialist'].model,
            variant: config.agents['code specialist'].variant,
        },
        {
            role: 'scribe',
            rosterName: documenterConfig.name,
            model: documenterConfig.model,
            variant: documenterConfig.variant,
        },
        {
            role: 'arbiter',
            rosterName: config.agents.verifier.name,
            model: config.agents.verifier.model,
            variant: config.agents.verifier.variant,
        },
        ...(config.companion_agents
            ? [
                {
                    role: 'companion_reader',
                    rosterName: config.companion_agents.companion_reader.name,
                    model: config.companion_agents.companion_reader.model,
                    variant: config.companion_agents.companion_reader.variant,
                },
                {
                    role: 'companion_operator',
                    rosterName: config.companion_agents.companion_operator.name,
                    model: config.companion_agents.companion_operator.model,
                    variant: config.companion_agents.companion_operator.variant,
                },
            ]
            : []),
    ];
    const status = entries.every((entry) => entry.model && entry.variant) ? 'coherent' : 'warning';
    const summary = entries
        .map((entry) => `${entry.role}=${entry.model ?? 'none'}/${entry.variant ?? 'none'}`)
        .join(' ');
    return {
        status,
        summary: `Configured role-model policy: ${summary}`,
        entries,
    };
}
function createConfiguredToolRoutesSummary(config) {
    const entries = Object.keys(config.tool_routing.tools).flatMap((tool) => {
        const policy = config.tool_routing.tools[tool];
        const readOwnerTarget = policy.owner_companion_agent ?? policy.owner_role;
        const readOwnerRoleConfig = (0, role_roster_1.getOwnershipTargetConfig)(readOwnerTarget, config);
        const readEntry = {
            tool,
            operation: 'read',
            ownerRole: (0, role_roster_1.getOwnershipTargetName)(readOwnerTarget, config),
            model: policy.model ?? readOwnerRoleConfig.model ?? config.tool_routing.default_model,
            variant: policy.variant ?? readOwnerRoleConfig.variant ?? config.tool_routing.default_variant,
            fallbackMode: policy.fallback_mode ?? config.tool_routing.fallback_mode,
        };
        if (!policy.allowed_operations.includes('mutation')) {
            return [readEntry];
        }
        const mutationOwnerTarget = policy.mutation_owner_companion_agent ?? policy.mutation_owner_role ?? policy.owner_companion_agent ?? policy.owner_role;
        const mutationOwnerRoleConfig = (0, role_roster_1.getOwnershipTargetConfig)(mutationOwnerTarget, config);
        const mutationEntry = {
            tool,
            operation: 'mutation',
            ownerRole: (0, role_roster_1.getOwnershipTargetName)(mutationOwnerTarget, config),
            model: policy.mutation_model ?? mutationOwnerRoleConfig.model ?? policy.model ?? config.tool_routing.default_model,
            variant: policy.mutation_variant ?? mutationOwnerRoleConfig.variant ?? policy.variant ?? config.tool_routing.default_variant,
            fallbackMode: policy.fallback_mode ?? config.tool_routing.fallback_mode,
        };
        return [readEntry, mutationEntry];
    });
    const status = entries.every((entry) => entry.model && entry.variant) ? 'coherent' : 'warning';
    return {
        status,
        summary: (0, tool_routing_1.summarizeConfiguredToolRoutes)(config.tool_routing, config),
        entries,
    };
}
async function inspectActiveRunHygiene(cwd) {
    const lifecycleViews = await (0, run_lifecycle_1.inspectWorkspaceRunLifecycleViews)(cwd);
    const activeCount = lifecycleViews.filter((view) => view.status === 'active').length;
    const blockedCount = lifecycleViews.filter((view) => view.status === 'blocked').length;
    const freshCount = lifecycleViews.filter((view) => view.freshness === 'fresh').length;
    const staleCount = lifecycleViews.filter((view) => view.freshness === 'stale').length;
    const cleanupCandidates = lifecycleViews.filter((view) => view.cleanup_action !== 'retain');
    const recommendedRunId = lifecycleViews.find((view) => view.resume_recommended)?.run_id ?? lifecycleViews[0]?.run_id ?? null;
    const status = freshCount > RUN_HYGIENE_WARNING_THRESHOLD || cleanupCandidates.length > 0 ? 'warning' : 'clean';
    if (lifecycleViews.length === 0) {
        return {
            status: 'clean',
            summary: `clean; workspace=${cwd} active=0 blocked=0 fresh=0 stale=0 resumable=none.`,
            recommendedRunId: null,
        };
    }
    const summaryBase = `workspace=${cwd} active=${activeCount} blocked=${blockedCount} fresh=${freshCount} stale=${staleCount} ` +
        `resumable=${recommendedRunId ?? 'none'}`;
    const cleanupCommand = `codex-foreman clear-runs --cwd ${cwd} --include-blocked`;
    const summary = status === 'clean'
        ? `clean; ${summaryBase}.`
        : cleanupCandidates.length > 0
            ? `warning; ${summaryBase} cleanup_candidates=${cleanupCandidates.length} reuse_ambiguity=cleanup_recommended. ` +
                `Cleanup recommended: ${cleanupCommand}`
            : `warning; ${summaryBase} cleanup_candidates=0 reuse_ambiguity=manual_review_advised. ` +
                `Multiple fresh runs are still active in this workspace. If they are accidental or stale, clear them with: ${cleanupCommand}`;
    return {
        status,
        summary,
        recommendedRunId,
    };
}
async function readInstalledPackageManifest(packageRoot = defaultPackageRoot()) {
    try {
        const manifest = JSON.parse(await (0, promises_1.readFile)(node_path_1.default.join(packageRoot, 'package.json'), 'utf8'));
        return {
            name: typeof manifest.name === 'string' ? manifest.name : null,
            version: typeof manifest.version === 'string' ? manifest.version : null,
        };
    }
    catch {
        return {
            name: null,
            version: null,
        };
    }
}
function createCapSkillSummary(status, skillPath) {
    switch (status) {
        case 'matching_install':
            return `Codex skill ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} is installed at ${skillPath} and matches the packaged Foreman skill content.`;
        case 'missing_install':
            return `Codex skill ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} is missing at ${skillPath}. Run codex-foreman setup, then restart Codex CLI.`;
        case 'outdated_install':
            return `Codex skill ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} exists at ${skillPath} but does not match the packaged Foreman skill content. Re-run codex-foreman setup, then restart Codex CLI.`;
        case 'unreadable_install':
        default:
            return `Codex skill ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} at ${skillPath} could not be inspected reliably.`;
    }
}
function createCustomAgentSummary(status, directoryPath, agentNames, fileCount, details) {
    const namesSummary = agentNames.length > 0 ? ` (${agentNames.join(', ')})` : '';
    switch (status) {
        case 'matching_install':
            return `Codex custom agent roster is installed at ${directoryPath} with ${fileCount} packaged files${namesSummary}.`;
        case 'missing_install':
            return `Codex custom agent roster is missing packaged files at ${directoryPath}. Re-run codex-foreman setup, then restart Codex CLI.${details?.missingFiles?.length ? ` Missing: ${details.missingFiles.join(', ')}.` : ''}`;
        case 'outdated_install':
            return `Codex custom agent roster at ${directoryPath} does not match the packaged Foreman agent files. Re-run codex-foreman setup, then restart Codex CLI.${details?.outdatedFiles?.length ? ` Outdated: ${details.outdatedFiles.join(', ')}.` : ''}${details?.missingFiles?.length ? ` Missing: ${details.missingFiles.join(', ')}.` : ''}`;
        case 'unreadable_install':
        default:
            return `Codex custom agent roster at ${directoryPath} could not be inspected reliably.`;
    }
}
async function installPackagedForemanCapSkill(packageRoot = defaultPackageRoot()) {
    const sourceSkillFile = resolvePackagedForemanCapSkillPath(packageRoot);
    const destinationSkillDir = resolveCodexSkillPath(public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME);
    const destinationSkillFile = node_path_1.default.join(destinationSkillDir, 'SKILL.md');
    const packagedContent = await (0, promises_1.readFile)(sourceSkillFile, 'utf8');
    const installedContent = await readTextIfExists(destinationSkillFile);
    if (installedContent === packagedContent) {
        return {
            skillName: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
            skillPath: destinationSkillDir,
            status: 'already_installed',
        };
    }
    await (0, promises_1.mkdir)(destinationSkillDir, { recursive: true });
    await (0, promises_1.cp)(sourceSkillFile, destinationSkillFile, { force: true });
    return {
        skillName: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
        skillPath: destinationSkillDir,
        status: installedContent === null ? 'installed' : 'updated',
    };
}
async function installPackagedForemanCustomAgents(packageRoot = defaultPackageRoot()) {
    const sourceAgentsDir = resolvePackagedForemanAgentsDirectoryPath(packageRoot);
    const destinationAgentsDir = resolveCodexAgentsDirectoryPath();
    const agentFiles = await listPackagedForemanCustomAgentFiles(packageRoot);
    let installedCount = 0;
    let updatedCount = 0;
    await (0, promises_1.mkdir)(destinationAgentsDir, { recursive: true });
    for (const fileName of agentFiles) {
        const sourceFile = node_path_1.default.join(sourceAgentsDir, fileName);
        const destinationFile = node_path_1.default.join(destinationAgentsDir, fileName);
        const packagedContent = await (0, promises_1.readFile)(sourceFile, 'utf8');
        const installedContent = await readTextIfExists(destinationFile);
        if (installedContent === packagedContent) {
            continue;
        }
        await (0, promises_1.cp)(sourceFile, destinationFile, { force: true });
        if (installedContent === null) {
            installedCount += 1;
        }
        else {
            updatedCount += 1;
        }
    }
    const status = updatedCount > 0 ? 'updated' : installedCount > 0 ? 'installed' : 'already_installed';
    return {
        directoryPath: destinationAgentsDir,
        status,
        agentNames: agentFiles.map((fileName) => node_path_1.default.basename(fileName, '.toml')),
        fileCount: agentFiles.length,
    };
}
async function inspectPackagedForemanCapSkill(packageRoot = defaultPackageRoot()) {
    const skillPath = resolveCodexSkillPath(public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME);
    const packagedSkillFile = resolvePackagedForemanCapSkillPath(packageRoot);
    const installedSkillFile = node_path_1.default.join(skillPath, 'SKILL.md');
    try {
        const [packagedContent, installedContent] = await Promise.all([
            (0, promises_1.readFile)(packagedSkillFile, 'utf8'),
            readTextIfExists(installedSkillFile),
        ]);
        const status = installedContent === null ? 'missing_install' : installedContent === packagedContent ? 'matching_install' : 'outdated_install';
        return {
            skillName: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
            skillPath,
            status,
            summary: createCapSkillSummary(status, skillPath),
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
        return {
            skillName: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
            skillPath,
            status: 'unreadable_install',
            summary: `${createCapSkillSummary('unreadable_install', skillPath)} ${message}`,
        };
    }
}
async function inspectPackagedForemanCustomAgents(packageRoot = defaultPackageRoot()) {
    const directoryPath = resolveCodexAgentsDirectoryPath();
    const sourceAgentsDir = resolvePackagedForemanAgentsDirectoryPath(packageRoot);
    try {
        const agentFiles = await listPackagedForemanCustomAgentFiles(packageRoot);
        const missingFiles = [];
        const outdatedFiles = [];
        for (const fileName of agentFiles) {
            const [packagedContent, installedContent] = await Promise.all([
                (0, promises_1.readFile)(node_path_1.default.join(sourceAgentsDir, fileName), 'utf8'),
                readTextIfExists(node_path_1.default.join(directoryPath, fileName)),
            ]);
            if (installedContent === null) {
                missingFiles.push(fileName);
                continue;
            }
            if (installedContent !== packagedContent) {
                outdatedFiles.push(fileName);
            }
        }
        const status = outdatedFiles.length > 0
            ? 'outdated_install'
            : missingFiles.length > 0
                ? 'missing_install'
                : 'matching_install';
        return {
            directoryPath,
            status,
            summary: createCustomAgentSummary(status, directoryPath, agentFiles.map((fileName) => node_path_1.default.basename(fileName, '.toml')), agentFiles.length, {
                missingFiles,
                outdatedFiles,
            }),
            agentNames: agentFiles.map((fileName) => node_path_1.default.basename(fileName, '.toml')),
            fileCount: agentFiles.length,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
        return {
            directoryPath,
            status: 'unreadable_install',
            summary: `${createCustomAgentSummary('unreadable_install', directoryPath, [], 0)} ${message}`,
            agentNames: [],
            fileCount: 0,
        };
    }
}
function quoteCommandPart(value) {
    if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
        return value;
    }
    return JSON.stringify(value);
}
function formatCommand(command, args) {
    return [command, ...args].map(quoteCommandPart).join(' ');
}
function formatCommandFailure(command, args, result) {
    const stdout = result.stdout.trim();
    const stderr = result.stderr.trim();
    return [
        `Command failed: ${formatCommand(command, args)}`,
        `exit_code=${String(result.code)} signal=${String(result.signal)}`,
        `timed_out=${result.timedOut} duration_ms=${result.durationMs}${result.timeoutMs === null ? '' : ` timeout_ms=${result.timeoutMs}`}`,
        `STDOUT:\n${stdout.length > 0 ? stdout : '(empty)'}`,
        `STDERR:\n${stderr.length > 0 ? stderr : '(empty)'}`,
    ].join('\n');
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function isMissingRegistration(serverName, result) {
    if (result.code === 0 && result.signal === null) {
        return false;
    }
    const outputLines = `${result.stdout}\n${result.stderr}`
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const expectedPatterns = [
        new RegExp(`^No global MCP server named ${escapeRegex(JSON.stringify(serverName))}\.$`, 'u'),
        new RegExp(`^Error: No MCP server named '${escapeRegex(serverName)}' found\.$`, 'u'),
    ];
    return outputLines.some((line) => expectedPatterns.some((pattern) => pattern.test(line)));
}
function normalizeStringArray(value) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
        return null;
    }
    return [...value];
}
function normalizeOptionalString(value) {
    return typeof value === 'string' ? value : null;
}
async function pathExists(targetPath) {
    try {
        await (0, promises_1.stat)(targetPath);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
function describeRegisteredServer(record) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio' || typeof transport.command !== 'string') {
        return 'a non-stdio or unreadable registration';
    }
    const args = normalizeStringArray(transport.args) ?? [];
    return formatCommand(transport.command, args);
}
async function resolveRegisteredEntrypointPath(record) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio') {
        return null;
    }
    const args = normalizeStringArray(transport.args) ?? [];
    const firstArg = args[0];
    if (!firstArg) {
        return null;
    }
    try {
        return await (0, promises_1.realpath)(firstArg);
    }
    catch {
        return node_path_1.default.isAbsolute(firstArg) ? firstArg : null;
    }
}
async function areEquivalentCommandArgs(registeredArgs, expectedArgs) {
    if (registeredArgs.length !== expectedArgs.length) {
        return false;
    }
    for (let index = 0; index < registeredArgs.length; index += 1) {
        const registeredArg = registeredArgs[index];
        const expectedArg = expectedArgs[index];
        if (registeredArg === undefined || expectedArg === undefined) {
            return false;
        }
        if (registeredArg === expectedArg) {
            continue;
        }
        try {
            const [registeredRealPath, expectedRealPath] = await Promise.all([(0, promises_1.realpath)(registeredArg), (0, promises_1.realpath)(expectedArg)]);
            if (registeredRealPath !== expectedRealPath) {
                return false;
            }
        }
        catch {
            return false;
        }
    }
    return true;
}
async function hasMatchingRegistration(record, command, args) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio' || typeof transport.command !== 'string') {
        return false;
    }
    const registeredArgs = normalizeStringArray(transport.args);
    if (registeredArgs === null) {
        return false;
    }
    if (transport.command !== command) {
        return false;
    }
    return await areEquivalentCommandArgs(registeredArgs, args);
}
async function spawnCommand(command, args, options) {
    return await new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const child = (0, node_child_process_1.spawn)(command, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        let settled = false;
        let timedOut = false;
        const timeoutMs = options?.timeoutMs ?? null;
        const finish = (result) => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(result);
        };
        const timeoutHandle = timeoutMs === null
            ? null
            : setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
            }, timeoutMs);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });
        child.on('error', (error) => {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
            reject(error instanceof Error ? error : new Error(`Failed to start ${command}.`));
        });
        child.on('close', (code, signal) => {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
            finish({
                code,
                signal,
                stdout,
                stderr,
                timedOut,
                durationMs: Date.now() - startedAt,
                timeoutMs,
            });
        });
    });
}
function classifyCompanionMcpServer(name) {
    switch (name) {
        case 'context7':
            return {
                compatibility: 'recommended_companion',
                approvalExpectation: 'none',
                recommendationScope: 'docs_and_reference',
                usageHint: 'Use for current library and framework documentation lookups before planning or implementation.',
            };
        case 'fetch':
            return {
                compatibility: 'recommended_companion',
                approvalExpectation: 'operator_confirmation_recommended',
                recommendationScope: 'remote_artifacts',
                usageHint: 'Use for bounded URL fetches when release work needs authoritative remote artifacts or docs.',
            };
        case 'filesystem':
            return {
                compatibility: 'recommended_companion',
                approvalExpectation: 'none',
                recommendationScope: 'workspace_repository',
                usageHint: 'Use for repository and workspace file inspection when the client exposes filesystem MCP tools.',
            };
        case 'git':
            return {
                compatibility: 'recommended_companion',
                approvalExpectation: 'external_side_effect_review',
                recommendationScope: 'release_provenance',
                usageHint: 'Use for release provenance, branch state, diffs, and regression-oriented history checks.',
            };
        case 'notebooklm':
            return {
                compatibility: 'recommended_companion',
                approvalExpectation: 'operator_confirmation_recommended',
                recommendationScope: 'archive_export',
                usageHint: 'Use for settled-run archive export after browser authentication is completed outside Foreman config.',
            };
        default:
            return {
                compatibility: 'generic_companion',
                approvalExpectation: 'operator_confirmation_recommended',
                recommendationScope: 'general_support',
                usageHint: 'Registered alongside Foreman as a subordinate tool surface for bounded supporting work and not as a replacement specialist route.',
            };
    }
}
function summarizeCompanionMcpServers(servers) {
    if (servers.length === 0) {
        return 'No other Codex MCP servers are currently registered alongside Foreman.';
    }
    const recommendedServers = servers.filter((server) => server.compatibility === 'recommended_companion').map((server) => server.name);
    const allNames = servers.map((server) => server.name);
    if (recommendedServers.length === 0) {
        return `Other installed MCP servers: ${allNames.join(', ')}. These remain subordinate tool surfaces under Foreman specialist ownership when policy selects them.`;
    }
    return `Other installed MCP servers: ${allNames.join(', ')}. Recommended Foreman companions: ${recommendedServers.join(', ')}. Companions remain subordinate tool surfaces under configured specialist ownership and do not replace packaged Foreman specialist routes.`;
}
function createNotebookLmArchiveTargetSummary(input) {
    const target = input.foremanConfig?.archive_targets?.notebooklm ?? null;
    if (!target?.enabled) {
        return {
            notebookLmArchiveTargetStatus: 'disabled',
            notebookLmArchiveTargetSummary: 'NotebookLM archive target is disabled. To enable repo-scoped archive prep, register notebooklm MCP, complete browser auth, then set archive_targets.notebooklm.enabled=true with notebook_url or notebook_id.',
        };
    }
    const notebookLmServer = input.otherInstalledMcpServers.find((server) => server.name === 'notebooklm') ?? null;
    if (!notebookLmServer) {
        return {
            notebookLmArchiveTargetStatus: input.registryInspectionStatus === 'listed' ? 'notebooklm_not_registered' : 'notebooklm_session_unavailable',
            notebookLmArchiveTargetSummary: input.registryInspectionStatus === 'listed'
                ? 'NotebookLM archive target is enabled, but Codex MCP registry does not list notebooklm.'
                : 'NotebookLM archive target is enabled, but Codex MCP registry readiness could not be inspected.',
        };
    }
    if (!notebookLmServer.enabled) {
        return {
            notebookLmArchiveTargetStatus: 'notebooklm_session_unavailable',
            notebookLmArchiveTargetSummary: `NotebookLM archive target is enabled, but notebooklm MCP is disabled${notebookLmServer.disabledReason ? `: ${notebookLmServer.disabledReason}` : '.'}`,
        };
    }
    if (!target.notebook_url && !target.notebook_id) {
        return {
            notebookLmArchiveTargetStatus: 'notebooklm_target_not_configured',
            notebookLmArchiveTargetSummary: 'NotebookLM archive target is enabled, but notebook_url or notebook_id is not configured for the repo-scoped archive target.',
        };
    }
    if (notebookLmServer.authStatus && !['authenticated', 'unsupported'].includes(notebookLmServer.authStatus)) {
        return {
            notebookLmArchiveTargetStatus: 'notebooklm_auth_required',
            notebookLmArchiveTargetSummary: `NotebookLM archive target is configured, but MCP auth status is ${notebookLmServer.authStatus}.`,
        };
    }
    return {
        notebookLmArchiveTargetStatus: 'ready',
        notebookLmArchiveTargetSummary: 'NotebookLM archive target is configured and notebooklm MCP is registered; browser authentication is managed outside foreman-config.json and repo-scoped local archive export is ready.',
    };
}
function createRegistrationSummary(status, serverName) {
    switch (status) {
        case 'matching_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} matches the installed Foreman launch target.`;
        case 'missing_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} is missing. Run codex-foreman setup to register it.`;
        case 'conflicting_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} points at a different command than the installed Foreman launch target.`;
        case 'unreadable_registration':
        default:
            return `Codex MCP registration ${JSON.stringify(serverName)} could not be inspected reliably.`;
    }
}
async function inspectPackagedHarnessSurface(packageRoot = defaultPackageRoot()) {
    const installedPackage = await readInstalledPackageManifest(packageRoot);
    const components = [
        {
            component: 'docs_install',
            path: node_path_1.default.join(packageRoot, 'docs', 'install.md'),
            status: 'missing',
            summary: 'Packaged install guide is missing.',
        },
        {
            component: 'cap_skill',
            path: resolvePackagedForemanCapSkillPath(packageRoot),
            status: 'missing',
            summary: `Packaged ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} skill is missing.`,
        },
        {
            component: 'plugin_manifest',
            path: node_path_1.default.join(packageRoot, '.codex-plugin', 'plugin.json'),
            status: 'missing',
            summary: 'Packaged Codex plugin manifest is missing.',
        },
        {
            component: 'mcp_manifest',
            path: node_path_1.default.join(packageRoot, '.mcp.json'),
            status: 'missing',
            summary: 'Packaged MCP manifest is missing.',
        },
    ];
    const presentAgentFiles = await listPackagedForemanCustomAgentFiles(packageRoot).catch(() => []);
    const expectedAgentFiles = [...public_surface_1.FOREMAN_PACKAGED_CUSTOM_AGENT_FILES];
    const missingAgentFiles = expectedAgentFiles.filter((fileName) => !presentAgentFiles.includes(fileName));
    components.push({
        component: 'custom_agents',
        path: resolvePackagedForemanAgentsDirectoryPath(packageRoot),
        status: presentAgentFiles.length === 0 ? 'missing' : missingAgentFiles.length > 0 ? 'mismatched' : 'present',
        summary: presentAgentFiles.length === 0
            ? 'Packaged custom-agent roster is missing.'
            : missingAgentFiles.length > 0
                ? `Packaged custom-agent roster is drifted. Missing: ${missingAgentFiles.join(', ')}.`
                : `Packaged custom-agent roster includes ${presentAgentFiles.length} Foreman agent file${presentAgentFiles.length === 1 ? '' : 's'} (${public_surface_1.FOREMAN_PACKAGED_CUSTOM_AGENT_NAMES.join(', ')}).`,
    });
    for (const component of components) {
        if (component.component === 'custom_agents') {
            continue;
        }
        component.status = (await pathExists(component.path)) ? 'present' : 'missing';
        component.summary =
            component.status === 'present'
                ? {
                    docs_install: 'Packaged install guide is present.',
                    cap_skill: `Packaged ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} skill is present.`,
                    plugin_manifest: 'Packaged Codex plugin manifest is present.',
                    mcp_manifest: 'Packaged MCP manifest is present.',
                    custom_agents: component.summary,
                }[component.component]
                : component.summary;
    }
    const pluginComponent = components.find((component) => component.component === 'plugin_manifest');
    if (pluginComponent && pluginComponent.status === 'present') {
        try {
            const pluginManifest = JSON.parse(await (0, promises_1.readFile)(pluginComponent.path, 'utf8'));
            const expectedPluginManifest = (0, public_surface_1.createCodexPluginManifest)(installedPackage.name ?? public_surface_1.FOREMAN_PACKAGE_NAME, installedPackage.version ?? 'unknown');
            if (pluginManifest.name !== expectedPluginManifest.name || pluginManifest.version !== expectedPluginManifest.version) {
                pluginComponent.status = 'mismatched';
                pluginComponent.summary = `Packaged Codex plugin manifest drifted from package metadata. Expected name=${String(expectedPluginManifest.name)} version=${String(expectedPluginManifest.version)} but found name=${String(pluginManifest.name)} version=${String(pluginManifest.version)}.`;
            }
            else {
                pluginComponent.summary = `Packaged Codex plugin manifest matches package metadata (${String(expectedPluginManifest.name)}@${String(expectedPluginManifest.version)}).`;
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown plugin manifest parse error.';
            pluginComponent.status = 'mismatched';
            pluginComponent.summary = `Packaged Codex plugin manifest could not be verified. ${message}`;
        }
    }
    const missingComponents = components.filter((component) => component.status === 'missing').map((component) => component.component);
    const mismatchedComponents = components.filter((component) => component.status === 'mismatched').map((component) => component.component);
    const status = missingComponents.length > 0
        ? 'incomplete_surface'
        : mismatchedComponents.length > 0
            ? 'drifted_surface'
            : 'coherent_surface';
    return {
        status,
        summary: status === 'coherent_surface'
            ? `Packaged harness surface is coherent: install guide, ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} skill, custom agents, plugin manifest, and MCP manifest are aligned.`
            : status === 'drifted_surface'
                ? `Packaged harness surface is drifted. Mismatched: ${mismatchedComponents.join(', ')}.`
                : `Packaged harness surface is incomplete. Missing: ${missingComponents.join(', ')}.`,
        components,
    };
}
async function resolveInstalledCodexForemanMcpLaunchTarget(packageRoot = defaultPackageRoot()) {
    const entrypointPath = node_path_1.default.join(packageRoot, 'dist', 'mcp-main.js');
    try {
        const resolvedEntrypointPath = await (0, promises_1.realpath)(entrypointPath);
        return {
            command: process.execPath,
            args: [resolvedEntrypointPath],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
        throw new Error(`Unable to resolve the installed codex-foreman MCP entrypoint at ${entrypointPath}. Build or install the package before running setup.\n${message}`);
    }
}
async function checkCodexMcpInstall(options, dependencies = {}) {
    const runCommand = dependencies.runCommand ?? spawnCommand;
    const installedPackage = await readInstalledPackageManifest(dependencies.packageRoot);
    const launchTarget = await resolveInstalledCodexForemanMcpLaunchTarget(dependencies.packageRoot);
    const expectedEntrypointPath = launchTarget.args[0] ?? null;
    const configPath = (0, runtime_1.resolveForemanConfigFilePath)();
    const configExists = await pathExists(configPath);
    let modelPolicyAudit = null;
    let toolRoutingAudit = null;
    let foremanConfig = null;
    try {
        foremanConfig = await (0, runtime_1.loadForemanConfig)(options.cwd);
        modelPolicyAudit = createConfiguredRoleModelsSummary(foremanConfig);
        toolRoutingAudit = createConfiguredToolRoutesSummary(foremanConfig);
    }
    catch (error) {
        modelPolicyAudit = {
            status: 'warning',
            summary: `Configured role-model policy could not be loaded: ${error instanceof Error ? error.message : 'Unknown error.'}`,
            entries: [],
        };
        toolRoutingAudit = {
            status: 'warning',
            summary: `Configured companion tool routing could not be loaded: ${error instanceof Error ? error.message : 'Unknown error.'}`,
            entries: [],
        };
    }
    const activeRunHygiene = await inspectActiveRunHygiene(options.cwd);
    let registrationStatus = 'missing_registration';
    let registrationSummary = createRegistrationSummary(registrationStatus, options.serverName);
    let registeredLaunchCommand = null;
    let registeredLaunchArgs = [];
    let registeredEntrypointPath = null;
    const getArgs = ['mcp', 'get', '--json', options.serverName];
    const existingRegistrationResult = await runCommand(options.codexPath, getArgs, {
        timeoutMs: DEFAULT_CODEX_MCP_INSPECTION_TIMEOUT_MS,
    });
    if (!isMissingRegistration(options.serverName, existingRegistrationResult)) {
        if (existingRegistrationResult.code !== 0 || existingRegistrationResult.signal !== null) {
            registrationStatus = 'unreadable_registration';
            registrationSummary = `${createRegistrationSummary(registrationStatus, options.serverName)} ${formatCommandFailure(options.codexPath, getArgs, existingRegistrationResult)}`;
        }
        else {
            try {
                const existingRegistration = JSON.parse(existingRegistrationResult.stdout);
                const transport = existingRegistration.transport;
                registeredLaunchCommand = transport && typeof transport.command === 'string' ? transport.command : null;
                registeredLaunchArgs = normalizeStringArray(transport?.args) ?? [];
                registeredEntrypointPath = await resolveRegisteredEntrypointPath(existingRegistration);
                registrationStatus = (await hasMatchingRegistration(existingRegistration, launchTarget.command, launchTarget.args))
                    ? 'matching_registration'
                    : 'conflicting_registration';
                registrationSummary =
                    registrationStatus === 'conflicting_registration'
                        ? [
                            createRegistrationSummary(registrationStatus, options.serverName),
                            `Existing: ${describeRegisteredServer(existingRegistration)}`,
                            `Expected: ${formatCommand(launchTarget.command, launchTarget.args)}`,
                        ].join('\n')
                        : createRegistrationSummary(registrationStatus, options.serverName);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
                registrationStatus = 'unreadable_registration';
                registrationSummary = [
                    createRegistrationSummary(registrationStatus, options.serverName),
                    `Failed to parse Codex MCP registration JSON for ${options.serverName}.`,
                    message,
                ].join('\n');
            }
        }
    }
    let registryInspectionStatus = 'unavailable';
    let registryInspectionSummary = 'Unable to inspect the full Codex MCP registry.';
    let otherInstalledMcpServers = [];
    const listArgs = ['mcp', 'list', '--json'];
    const listResult = await runCommand(options.codexPath, listArgs, {
        timeoutMs: DEFAULT_CODEX_MCP_INSPECTION_TIMEOUT_MS,
    });
    if (listResult.code === 0 && listResult.signal === null) {
        try {
            const records = JSON.parse(listResult.stdout);
            registryInspectionStatus = 'listed';
            otherInstalledMcpServers = Array.isArray(records)
                ? records
                    .filter((record) => normalizeOptionalString(record.name) !== options.serverName)
                    .map((record) => {
                    const name = normalizeOptionalString(record.name) ?? 'unknown';
                    const args = normalizeStringArray(record.transport?.args) ?? [];
                    const classification = classifyCompanionMcpServer(name);
                    return {
                        name,
                        enabled: record.enabled !== false,
                        disabledReason: normalizeOptionalString(record.disabled_reason),
                        transportType: normalizeOptionalString(record.transport?.type),
                        command: normalizeOptionalString(record.transport?.command),
                        args,
                        authStatus: normalizeOptionalString(record.auth_status),
                        compatibility: classification.compatibility,
                        approvalExpectation: classification.approvalExpectation,
                        recommendationScope: classification.recommendationScope,
                        usageHint: classification.usageHint,
                    };
                })
                : [];
            registryInspectionSummary = summarizeCompanionMcpServers(otherInstalledMcpServers);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
            registryInspectionSummary = `Unable to parse codex mcp list --json output. ${message}`;
        }
    }
    else {
        registryInspectionSummary = `${registryInspectionSummary} ${formatCommandFailure(options.codexPath, listArgs, listResult)}`;
    }
    const capSkill = await inspectPackagedForemanCapSkill(dependencies.packageRoot);
    const customAgents = await inspectPackagedForemanCustomAgents(dependencies.packageRoot);
    const packagedHarnessSurface = await inspectPackagedHarnessSurface(dependencies.packageRoot);
    const notebookLmArchiveTarget = createNotebookLmArchiveTargetSummary({
        foremanConfig,
        registryInspectionStatus,
        otherInstalledMcpServers,
    });
    const timeoutDiagnosis = existingRegistrationResult.timedOut || listResult.timedOut
        ? {
            tool_name: 'foreman_server_identity',
            stage: 'install_check',
            budget_ms: DEFAULT_CODEX_MCP_INSPECTION_TIMEOUT_MS,
            elapsed_ms: Math.max(existingRegistrationResult.durationMs, listResult.durationMs),
            summary: 'Codex MCP install inspection exceeded the bounded subprocess budget. Registration or registry data may be partial.',
            recorded_at: new Date().toISOString(),
        }
        : null;
    const status = registrationStatus === 'matching_registration' &&
        configExists &&
        registryInspectionStatus === 'listed' &&
        (notebookLmArchiveTarget.notebookLmArchiveTargetStatus === 'disabled' ||
            notebookLmArchiveTarget.notebookLmArchiveTargetStatus === 'ready') &&
        packagedHarnessSurface.status === 'coherent_surface' &&
        capSkill.status === 'matching_install' &&
        customAgents.status === 'matching_install'
        ? 'ok'
        : 'warning';
    return {
        status,
        packageName: installedPackage.name ?? public_surface_1.FOREMAN_PACKAGE_NAME,
        packageVersion: installedPackage.version ?? 'unknown',
        publicEntrySkillName: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
        publicEntryLabel: public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL,
        serverName: options.serverName,
        expectedLaunchCommand: launchTarget.command,
        expectedLaunchArgs: [...launchTarget.args],
        expectedEntrypointPath,
        registrationStatus,
        registrationSummary,
        registeredLaunchCommand,
        registeredLaunchArgs,
        registeredEntrypointPath,
        configPath,
        configExists,
        registryInspectionStatus,
        registryInspectionSummary,
        otherInstalledMcpServers,
        companionMcpUsageSummary: summarizeCompanionMcpServers(otherInstalledMcpServers),
        notebookLmArchiveTargetStatus: notebookLmArchiveTarget.notebookLmArchiveTargetStatus,
        notebookLmArchiveTargetSummary: notebookLmArchiveTarget.notebookLmArchiveTargetSummary,
        packagedHarnessSurfaceStatus: packagedHarnessSurface.status,
        packagedHarnessSurfaceSummary: packagedHarnessSurface.summary,
        packagedHarnessSurface: packagedHarnessSurface.components,
        capSkillName: capSkill.skillName,
        capSkillPath: capSkill.skillPath,
        capSkillStatus: capSkill.status,
        capSkillSummary: capSkill.summary,
        customAgentDirectoryPath: customAgents.directoryPath,
        customAgentNames: customAgents.agentNames,
        customAgentFileCount: customAgents.fileCount,
        customAgentStatus: customAgents.status,
        customAgentSummary: customAgents.summary,
        modelPolicyStatus: modelPolicyAudit.status,
        modelPolicySummary: modelPolicyAudit.summary,
        configuredRoleModels: modelPolicyAudit.entries,
        toolRoutingPolicyStatus: toolRoutingAudit.status,
        toolRoutingPolicySummary: toolRoutingAudit.summary,
        configuredToolRoutes: toolRoutingAudit.entries,
        activeRunHygieneStatus: activeRunHygiene.status,
        activeRunHygieneSummary: activeRunHygiene.summary,
        activeRunRecommendedId: activeRunHygiene.recommendedRunId,
        activeRunWorkspacePath: options.cwd,
        timeout_diagnosis: timeoutDiagnosis,
    };
}
async function setupCodexMcp(options, dependencies = {}) {
    const runCommand = dependencies.runCommand ?? spawnCommand;
    const launchTarget = await resolveInstalledCodexForemanMcpLaunchTarget(dependencies.packageRoot);
    const getArgs = ['mcp', 'get', '--json', options.serverName];
    const existingRegistrationResult = await runCommand(options.codexPath, getArgs);
    if (!isMissingRegistration(options.serverName, existingRegistrationResult)) {
        if (existingRegistrationResult.code !== 0 || existingRegistrationResult.signal !== null) {
            throw new Error(formatCommandFailure(options.codexPath, getArgs, existingRegistrationResult));
        }
        let existingRegistration;
        try {
            existingRegistration = JSON.parse(existingRegistrationResult.stdout);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
            throw new Error(`Failed to parse Codex MCP registration JSON for ${options.serverName}.\n${message}\nSTDOUT:\n${existingRegistrationResult.stdout.trim() || '(empty)'}\nSTDERR:\n${existingRegistrationResult.stderr.trim() || '(empty)'}`);
        }
        if (await hasMatchingRegistration(existingRegistration, launchTarget.command, launchTarget.args)) {
            const configResult = await (0, runtime_1.ensureForemanConfig)(options.cwd);
            const capSkill = await installPackagedForemanCapSkill(dependencies.packageRoot);
            const customAgents = await installPackagedForemanCustomAgents(dependencies.packageRoot);
            return {
                status: 'already_registered',
                serverName: options.serverName,
                launchCommand: launchTarget.command,
                launchArgs: [...launchTarget.args],
                configPath: configResult.configPath,
                configCreated: configResult.configCreated,
                capSkillName: capSkill.skillName,
                capSkillPath: capSkill.skillPath,
                capSkillStatus: capSkill.status,
                customAgentDirectoryPath: customAgents.directoryPath,
                customAgentNames: customAgents.agentNames,
                customAgentFileCount: customAgents.fileCount,
                customAgentStatus: customAgents.status,
                restartRequired: capSkill.status !== 'already_installed' || customAgents.status !== 'already_installed',
            };
        }
        throw new CodexMcpSetupConflictError([
            `Codex MCP server ${JSON.stringify(options.serverName)} is already registered to a different command.`,
            `Existing: ${describeRegisteredServer(existingRegistration)}`,
            `Expected: ${formatCommand(launchTarget.command, launchTarget.args)}`,
            'Remove or rename the existing registration before running codex-foreman setup again.',
        ].join('\n'));
    }
    const addArgs = ['mcp', 'add', options.serverName, '--', launchTarget.command, ...launchTarget.args];
    const addResult = await runCommand(options.codexPath, addArgs);
    if (addResult.code !== 0 || addResult.signal !== null) {
        throw new Error(formatCommandFailure(options.codexPath, addArgs, addResult));
    }
    const configResult = await (0, runtime_1.ensureForemanConfig)(options.cwd);
    const capSkill = await installPackagedForemanCapSkill(dependencies.packageRoot);
    const customAgents = await installPackagedForemanCustomAgents(dependencies.packageRoot);
    return {
        status: 'registered',
        serverName: options.serverName,
        launchCommand: launchTarget.command,
        launchArgs: [...launchTarget.args],
        configPath: configResult.configPath,
        configCreated: configResult.configCreated,
        capSkillName: capSkill.skillName,
        capSkillPath: capSkill.skillPath,
        capSkillStatus: capSkill.status,
        customAgentDirectoryPath: customAgents.directoryPath,
        customAgentNames: customAgents.agentNames,
        customAgentFileCount: customAgents.fileCount,
        customAgentStatus: customAgents.status,
        restartRequired: true,
    };
}
//# sourceMappingURL=setup-codex-mcp.js.map