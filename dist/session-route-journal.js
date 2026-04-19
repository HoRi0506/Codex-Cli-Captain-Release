"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSessionRouteJournalEvent = recordSessionRouteJournalEvent;
exports.loadSessionRouteJournalView = loadSessionRouteJournalView;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const CURRENT_JSON_TARGET_BYTES = 8 * 1024;
const LATEST_MD_TARGET_LINES = 100;
function encodeSessionId(sessionId) {
    return encodeURIComponent(sessionId);
}
function createSessionJournalPaths(cwd, sessionId) {
    const sessionDir = node_path_1.default.join(cwd, '.foreman', 'sessions', encodeSessionId(sessionId));
    const runsDir = node_path_1.default.join(sessionDir, 'runs');
    const archiveDir = node_path_1.default.join(sessionDir, 'archive');
    return {
        sessionDir,
        runsDir,
        archiveDir,
        sessionFile: node_path_1.default.join(sessionDir, 'session.json'),
        currentFile: node_path_1.default.join(sessionDir, 'current.json'),
        latestFile: node_path_1.default.join(sessionDir, 'latest.md'),
        indexFile: node_path_1.default.join(sessionDir, 'route-index.json'),
        ledgerFile: node_path_1.default.join(sessionDir, 'route-ledger.jsonl'),
    };
}
function relativePath(cwd, filePath) {
    return node_path_1.default.relative(cwd, filePath);
}
async function readJsonIfPresent(filePath) {
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
async function statSizeIfPresent(filePath) {
    try {
        return (await (0, promises_1.stat)(filePath)).size;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return 0;
        }
        throw error;
    }
}
function createEventId(timestamp, eventCount) {
    return `event-${String(eventCount).padStart(6, '0')}-${timestamp.replace(/[^0-9TZ]/g, '')}`;
}
function createDefaultIndex(cwd, sessionId) {
    const paths = createSessionJournalPaths(cwd, sessionId);
    return {
        version: 1,
        session_id: sessionId,
        updated_at: new Date().toISOString(),
        event_count: 0,
        latest_event_id: null,
        latest_run_id: null,
        latest_heartbeat: null,
        files: {
            current: relativePath(cwd, paths.currentFile),
            latest: relativePath(cwd, paths.latestFile),
            index: relativePath(cwd, paths.indexFile),
            ledger: relativePath(cwd, paths.ledgerFile),
            runs_dir: relativePath(cwd, paths.runsDir),
            archive_dir: relativePath(cwd, paths.archiveDir),
        },
        runs: {},
        bounded_read_contract: {
            hot_path_reads: ['current.json', 'route-index.json metadata'],
            warm_path_reads: ['runs/<run-id>.md', 'runs/<run-id>.json'],
            cold_path_reads: ['route-ledger.jsonl', 'archive/*.jsonl.gz'],
            summary: 'Status and normal $cap reads should use the compact current/index view; full ledger history is reserved for explicit activity/debug inspection.',
        },
    };
}
function createEvent(input, eventCount, timestamp) {
    return {
        version: 1,
        event_id: createEventId(timestamp, eventCount),
        event_name: input.eventName,
        session_id: input.sessionId,
        run_id: input.runId,
        task_card_id: input.taskCardId ?? null,
        recorded_at: timestamp,
        status: input.status ?? null,
        stage: input.stage ?? null,
        next_step: input.nextStep ?? null,
        can_advance: input.canAdvance ?? null,
        route: {
            workflow_variant: input.workflowVariant ?? null,
            workflow_skill_id: input.workflowSkillId ?? null,
            agent_route: input.route ?? [],
            current_step: input.currentRouteStep ?? null,
            next_step: input.nextRouteStep ?? null,
        },
        proof: {
            owner_role: input.ownerRole ?? null,
            owner_agent_id: input.ownerAgentId ?? null,
            execution_owner: input.executionOwner ?? null,
            proof_state: input.proofState ?? null,
            model: input.model ?? null,
            variant: input.variant ?? null,
            companion_mcps: input.companionMcps ?? [],
        },
        summary: input.summary,
    };
}
function createHeartbeatSnapshot(event) {
    return {
        event_id: event.event_id,
        run_id: event.run_id,
        task_card_id: event.task_card_id,
        recorded_at: event.recorded_at,
        status: event.status,
        stage: event.stage,
        next_step: event.next_step,
        owner_role: event.proof.owner_role,
        proof_state: event.proof.proof_state,
        summary: event.summary,
    };
}
function summarizeEvent(event) {
    const route = event.route.agent_route.length > 0 ? event.route.agent_route.join(' -> ') : event.route.current_step ?? 'none';
    const proof = [
        event.proof.execution_owner ?? 'owner=unknown',
        event.proof.proof_state ? `proof=${event.proof.proof_state}` : null,
        event.proof.model ? `model=${event.proof.model}/${event.proof.variant ?? 'default'}` : null,
        event.proof.companion_mcps.length > 0 ? `mcps=${event.proof.companion_mcps.join(',')}` : null,
    ]
        .filter((part) => part !== null)
        .join(' ');
    return `${event.event_name}: route=${route}; ${proof || 'proof=unavailable'}; ${event.summary}`;
}
function renderLatestMarkdown(input) {
    const lines = [
        `# Foreman Session Route`,
        '',
        `- Session: ${input.sessionId}`,
        `- Latest event: ${input.event.event_name}`,
        `- Run: ${input.event.run_id ?? 'none'}`,
        `- Task: ${input.event.task_card_id ?? 'none'}`,
        `- Status: ${input.event.status ?? 'unknown'} / ${input.event.stage ?? 'unknown'}`,
        `- Next step: ${input.event.next_step ?? 'none'} / can_advance=${String(input.event.can_advance ?? false)}`,
        `- Route: ${input.event.route.agent_route.length > 0 ? input.event.route.agent_route.join(' -> ') : input.event.route.current_step ?? 'none'}`,
        `- Owner: ${input.event.proof.execution_owner ?? 'unknown'}`,
        `- Model: ${input.event.proof.model ?? 'unknown'} / ${input.event.proof.variant ?? 'unknown'}`,
        `- MCPs: ${input.event.proof.companion_mcps.length > 0 ? input.event.proof.companion_mcps.join(', ') : 'none recorded'}`,
        `- Event count: ${input.index.event_count}`,
        `- Latest heartbeat: ${input.latestHeartbeat
            ? `${input.latestHeartbeat.recorded_at} run=${input.latestHeartbeat.run_id ?? 'none'} task=${input.latestHeartbeat.task_card_id ?? 'none'}`
            : 'none'}`,
        `- Detail: ${input.runSummaryFile ?? 'none'}`,
        '',
        summarizeEvent(input.event),
        '',
    ];
    return `${lines.slice(0, LATEST_MD_TARGET_LINES).join('\n')}\n`;
}
function renderRunMarkdown(input) {
    return [
        `# Foreman Run Route`,
        '',
        `- Run: ${input.runId}`,
        `- Latest event: ${input.event.event_name}`,
        `- Event count: ${input.eventCount}`,
        `- Updated: ${input.event.recorded_at}`,
        `- Route: ${input.event.route.agent_route.length > 0 ? input.event.route.agent_route.join(' -> ') : input.event.route.current_step ?? 'none'}`,
        `- Owner: ${input.event.proof.execution_owner ?? 'unknown'}`,
        `- Proof: ${input.event.proof.proof_state ?? 'unknown'}`,
        `- Model: ${input.event.proof.model ?? 'unknown'} / ${input.event.proof.variant ?? 'unknown'}`,
        `- MCPs: ${input.event.proof.companion_mcps.length > 0 ? input.event.proof.companion_mcps.join(', ') : 'none recorded'}`,
        '',
        summarizeEvent(input.event),
        '',
    ].join('\n');
}
async function recordSessionRouteJournalEvent(input) {
    const paths = createSessionJournalPaths(input.cwd, input.sessionId);
    await Promise.all([(0, promises_1.mkdir)(paths.sessionDir, { recursive: true }), (0, promises_1.mkdir)(paths.runsDir, { recursive: true }), (0, promises_1.mkdir)(paths.archiveDir, { recursive: true })]);
    const timestamp = new Date().toISOString();
    const existingIndex = await readJsonIfPresent(paths.indexFile);
    const index = existingIndex ?? createDefaultIndex(input.cwd, input.sessionId);
    const nextEventCount = index.event_count + 1;
    const event = createEvent(input, nextEventCount, timestamp);
    const runSummaryFile = event.run_id === null ? null : node_path_1.default.join(paths.runsDir, `${event.run_id}.md`);
    const runDetailFile = event.run_id === null ? null : node_path_1.default.join(paths.runsDir, `${event.run_id}.json`);
    await (0, promises_1.appendFile)(paths.ledgerFile, `${JSON.stringify(event)}\n`, 'utf8');
    if (event.run_id !== null && runSummaryFile !== null && runDetailFile !== null) {
        const previousRun = index.runs[event.run_id];
        const runEventCount = (previousRun?.event_count ?? 0) + 1;
        const runSummaryRelativePath = relativePath(input.cwd, runSummaryFile);
        const runDetailRelativePath = relativePath(input.cwd, runDetailFile);
        index.runs[event.run_id] = {
            run_id: event.run_id,
            latest_event_id: event.event_id,
            event_count: runEventCount,
            updated_at: timestamp,
            summary_file: runSummaryRelativePath,
            detail_file: runDetailRelativePath,
        };
        await (0, promises_1.writeFile)(runSummaryFile, renderRunMarkdown({ runId: event.run_id, event, eventCount: runEventCount }), 'utf8');
        await (0, promises_1.writeFile)(runDetailFile, `${JSON.stringify({
            version: 1,
            session_id: input.sessionId,
            run_id: event.run_id,
            updated_at: timestamp,
            event_count: runEventCount,
            latest_event: event,
        }, null, 2)}\n`, 'utf8');
    }
    index.updated_at = timestamp;
    index.event_count = nextEventCount;
    index.latest_event_id = event.event_id;
    index.latest_run_id = event.run_id;
    index.latest_heartbeat = event.event_name === 'worker_heartbeat' ? createHeartbeatSnapshot(event) : index.latest_heartbeat ?? null;
    const current = {
        version: 1,
        session_id: input.sessionId,
        updated_at: timestamp,
        latest_event: event,
        latest_heartbeat: index.latest_heartbeat,
        bounded_limits: {
            current_json_target_bytes: CURRENT_JSON_TARGET_BYTES,
            latest_md_target_lines: LATEST_MD_TARGET_LINES,
        },
        files: {
            current: relativePath(input.cwd, paths.currentFile),
            latest: relativePath(input.cwd, paths.latestFile),
            index: relativePath(input.cwd, paths.indexFile),
            ledger: relativePath(input.cwd, paths.ledgerFile),
            run_summary: runSummaryFile === null ? null : relativePath(input.cwd, runSummaryFile),
        },
        summary: summarizeEvent(event),
    };
    await Promise.all([
        (0, promises_1.writeFile)(paths.sessionFile, `${JSON.stringify({ version: 1, session_id: input.sessionId, updated_at: timestamp }, null, 2)}\n`, 'utf8'),
        (0, promises_1.writeFile)(paths.indexFile, `${JSON.stringify(index, null, 2)}\n`, 'utf8'),
        (0, promises_1.writeFile)(paths.currentFile, `${JSON.stringify(current, null, 2)}\n`, 'utf8'),
        (0, promises_1.writeFile)(paths.latestFile, renderLatestMarkdown({
            sessionId: input.sessionId,
            event,
            index,
            runSummaryFile: runSummaryFile === null ? null : relativePath(input.cwd, runSummaryFile),
            latestHeartbeat: index.latest_heartbeat,
        }), 'utf8'),
    ]);
    return loadSessionRouteJournalView(input.cwd, input.sessionId);
}
async function loadSessionRouteJournalView(cwd, sessionId) {
    const paths = createSessionJournalPaths(cwd, sessionId);
    const [current, index, currentBytes, latestMarkdown] = await Promise.all([
        readJsonIfPresent(paths.currentFile),
        readJsonIfPresent(paths.indexFile),
        statSizeIfPresent(paths.currentFile),
        (0, promises_1.readFile)(paths.latestFile, 'utf8').catch((error) => {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                return '';
            }
            throw error;
        }),
    ]);
    const latestRunEntry = index?.latest_run_id ? index.runs[index.latest_run_id] : null;
    const latestRunSummaryPath = latestRunEntry?.summary_file ?? null;
    if (current === null || index === null) {
        return {
            state: 'missing',
            session_id: sessionId,
            current_summary_path: relativePath(cwd, paths.currentFile),
            latest_summary_path: relativePath(cwd, paths.latestFile),
            index_path: relativePath(cwd, paths.indexFile),
            ledger_path: relativePath(cwd, paths.ledgerFile),
            latest_run_summary_path: latestRunSummaryPath,
            latest_heartbeat: index?.latest_heartbeat ?? null,
            hot_summary_bytes: currentBytes,
            latest_summary_lines: latestMarkdown === '' ? 0 : latestMarkdown.split('\n').length,
            event_count: index?.event_count ?? 0,
            has_more_history: false,
            summary: 'No session route journal has been recorded for this MCP session yet.',
        };
    }
    return {
        state: 'available',
        session_id: sessionId,
        current_summary_path: current.files.current,
        latest_summary_path: current.files.latest,
        index_path: current.files.index,
        ledger_path: current.files.ledger,
        latest_run_summary_path: latestRunSummaryPath,
        latest_heartbeat: current.latest_heartbeat ?? index.latest_heartbeat ?? null,
        hot_summary_bytes: currentBytes,
        latest_summary_lines: latestMarkdown === '' ? 0 : latestMarkdown.split('\n').length,
        event_count: index.event_count,
        has_more_history: index.event_count > 1,
        summary: current.summary,
    };
}
//# sourceMappingURL=session-route-journal.js.map