"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForemanRunLabel = createForemanRunLabel;
exports.loadSessionRunBinding = loadSessionRunBinding;
exports.bindRunToSession = bindRunToSession;
exports.releaseRunFromSession = releaseRunFromSession;
exports.cleanupStaleSessionBoundRuns = cleanupStaleSessionBoundRuns;
exports.findSessionBoundRun = findSessionBoundRun;
exports.closeTouchedSessionRuns = closeTouchedSessionRuns;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
const touchedRunsBySession = new Map();
function createSessionRunBindingFilePath(cwd, runId) {
    return node_path_1.default.join((0, runtime_1.createRunPaths)(cwd, runId).runDir, 'session-binding.json');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseFiniteInteger(value) {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}
function assertValidSessionRunBindingRecord(value) {
    if (!isRecord(value) ||
        value.version !== 1 ||
        typeof value.run_id !== 'string' ||
        value.run_id.trim().length === 0 ||
        typeof value.owner_session_id !== 'string' ||
        value.owner_session_id.trim().length === 0 ||
        (value.owner_process_id !== null && parseFiniteInteger(value.owner_process_id) === null) ||
        typeof value.owner_started_at !== 'string' ||
        typeof value.bound_at !== 'string' ||
        typeof value.updated_at !== 'string' ||
        (value.state !== 'active' && value.state !== 'released') ||
        (value.released_at !== null && typeof value.released_at !== 'string') ||
        (value.release_reason !== null &&
            value.release_reason !== 'session_end' &&
            value.release_reason !== 'operator_closed' &&
            value.release_reason !== 'new_run_requested' &&
            value.release_reason !== 'stale_owner')) {
        throw new Error('Session run binding record is invalid.');
    }
}
async function readJsonFile(filePath) {
    return JSON.parse(await (0, promises_1.readFile)(filePath, 'utf8'));
}
async function writeJsonFile(filePath, value) {
    await (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function createSessionRunBindingRecord(input) {
    return {
        version: 1,
        run_id: input.runId,
        owner_session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        bound_at: input.timestamp,
        updated_at: input.timestamp,
        state: 'active',
        released_at: null,
        release_reason: null,
    };
}
function normalizeRunLabelTitle(title) {
    const normalized = (title ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.?!:]+$/g, '');
    if (normalized.length === 0) {
        return 'untitled run';
    }
    if (normalized.length <= 72) {
        return normalized;
    }
    return `${normalized.slice(0, 69).trimEnd()}...`;
}
function createForemanRunLabel(input) {
    const labelTimestamp = selectRunLabelTimestamp(input.createdAt, input.updatedAt ?? null);
    const timestamp = formatRunLabelTimestamp(labelTimestamp);
    const title = normalizeRunLabelTitle(input.title ?? input.goal ?? null);
    return `${timestamp} - ${title}`;
}
function selectRunLabelTimestamp(createdAt, updatedAt) {
    const updatedAtMs = updatedAt === null ? Number.NaN : Date.parse(updatedAt);
    if (Number.isFinite(updatedAtMs)) {
        return updatedAt;
    }
    return createdAt;
}
function formatRunLabelTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) {
        return timestamp.replace('T', ' ').slice(0, 16);
    }
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
function registerTouchedRun(session, cwd, runId) {
    const byWorkspace = touchedRunsBySession.get(session.sessionId) ?? new Map();
    const runIds = byWorkspace.get(cwd) ?? new Set();
    runIds.add(runId);
    byWorkspace.set(cwd, runIds);
    touchedRunsBySession.set(session.sessionId, byWorkspace);
}
function isOwnerProcessActive(processId) {
    if (processId === null || !Number.isInteger(processId) || processId <= 0) {
        return null;
    }
    try {
        process.kill(processId, 0);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ESRCH') {
            return false;
        }
        return true;
    }
}
async function doesRunDirectoryExist(cwd, runId) {
    try {
        await (0, promises_1.access)((0, runtime_1.createRunPaths)(cwd, runId).runDir);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
async function loadSessionRunBinding(cwd, runId) {
    const filePath = createSessionRunBindingFilePath(cwd, runId);
    let candidate;
    try {
        candidate = await readJsonFile(filePath);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load session run binding from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    assertValidSessionRunBindingRecord(candidate);
    return candidate;
}
async function persistSessionRunBinding(cwd, runId, record) {
    await writeJsonFile(createSessionRunBindingFilePath(cwd, runId), record);
}
async function createSessionRunBindingIfAbsent(cwd, runId, record) {
    const filePath = createSessionRunBindingFilePath(cwd, runId);
    try {
        const handle = await (0, promises_1.open)(filePath, 'wx');
        try {
            await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
        }
        finally {
            await handle.close();
        }
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST') {
            return false;
        }
        throw new Error(`Unable to create session run binding at ${filePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
}
async function bindRunToSession(input) {
    if (!(await doesRunDirectoryExist(input.cwd, input.runId))) {
        return;
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    const requestedRecord = createSessionRunBindingRecord({
        runId: input.runId,
        session: input.session,
        timestamp,
    });
    const currentRecord = await loadSessionRunBinding(input.cwd, input.runId);
    if (currentRecord === null) {
        const created = await createSessionRunBindingIfAbsent(input.cwd, input.runId, requestedRecord);
        if (created) {
            registerTouchedRun(input.session, input.cwd, input.runId);
            return;
        }
    }
    await persistSessionRunBinding(input.cwd, input.runId, requestedRecord);
    registerTouchedRun(input.session, input.cwd, input.runId);
}
function createClosedBySessionFailure(reason, timestamp) {
    const summary = reason === 'operator_closed'
        ? 'The current session run was closed explicitly by the operator.'
        : reason === 'new_run_requested'
            ? 'The previous session run was closed because the operator requested a new run.'
            : reason === 'stale_owner'
                ? 'The previous session owner exited without clean shutdown, so Foreman closed the stale bound run.'
                : 'The owning Codex CLI session ended, so Foreman closed the bound run.';
    return {
        stage: 'execution',
        reason: 'cancelled',
        summary,
        recorded_at: timestamp,
    };
}
async function closeRunRecordForSession(input) {
    const runPaths = (0, runtime_1.createRunPaths)(input.cwd, input.runId);
    const run = await (0, runtime_1.loadRunRecord)(runPaths);
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
        return;
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    run.status = 'cancelled';
    run.updated_at = timestamp;
    run.completed_at = timestamp;
    run.latest_failure = createClosedBySessionFailure(input.reason, timestamp);
    await (0, runtime_1.persistRunRecord)(runPaths, run);
}
async function releaseRunFromSession(input) {
    const currentRecord = await loadSessionRunBinding(input.cwd, input.runId);
    if (currentRecord === null) {
        if (input.closeRun) {
            await closeRunRecordForSession({
                cwd: input.cwd,
                runId: input.runId,
                reason: input.reason,
            });
        }
        return;
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    await persistSessionRunBinding(input.cwd, input.runId, {
        ...currentRecord,
        owner_session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        updated_at: timestamp,
        state: 'released',
        released_at: timestamp,
        release_reason: input.reason,
    });
    if (input.closeRun) {
        await closeRunRecordForSession({
            cwd: input.cwd,
            runId: input.runId,
            reason: input.reason,
        });
    }
}
async function closeStaleBoundRunIfNeeded(cwd, runId, binding) {
    if (binding.state !== 'active' || isOwnerProcessActive(binding.owner_process_id) !== false) {
        return false;
    }
    await releaseRunFromSession({
        cwd,
        runId,
        session: {
            sessionId: binding.owner_session_id,
            processId: binding.owner_process_id,
            startedAt: binding.owner_started_at,
        },
        reason: 'stale_owner',
        closeRun: true,
    });
    return true;
}
async function cleanupStaleSessionBoundRuns(cwd) {
    const runsDirectory = node_path_1.default.join(cwd, '.foreman', 'runs');
    let entries = [];
    try {
        entries = await (0, promises_1.readdir)(runsDirectory);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return;
        }
        throw error;
    }
    for (const runId of entries) {
        const binding = await loadSessionRunBinding(cwd, runId);
        if (binding === null) {
            continue;
        }
        await closeStaleBoundRunIfNeeded(cwd, runId, binding);
    }
}
async function findSessionBoundRun(input) {
    const runsDirectory = node_path_1.default.join(input.cwd, '.foreman', 'runs');
    let entries = [];
    try {
        entries = await (0, promises_1.readdir)(runsDirectory);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
    const candidates = [];
    for (const runId of entries) {
        const binding = await loadSessionRunBinding(input.cwd, runId);
        if (binding === null) {
            continue;
        }
        if (await closeStaleBoundRunIfNeeded(input.cwd, runId, binding)) {
            continue;
        }
        if (binding.state !== 'active' || binding.owner_session_id !== input.session.sessionId) {
            continue;
        }
        const run = await (0, runtime_1.loadRunRecord)((0, runtime_1.createRunPaths)(input.cwd, runId));
        if (run.status === 'active' || run.status === 'blocked') {
            candidates.push(run);
        }
    }
    candidates.sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at));
    return candidates[0] ?? null;
}
async function closeTouchedSessionRuns(session) {
    const byWorkspace = touchedRunsBySession.get(session.sessionId);
    if (!byWorkspace) {
        return;
    }
    for (const [cwd, runIds] of byWorkspace.entries()) {
        for (const runId of runIds.values()) {
            await releaseRunFromSession({
                cwd,
                runId,
                session,
                reason: 'session_end',
                closeRun: true,
            });
        }
    }
    touchedRunsBySession.delete(session.sessionId);
}
//# sourceMappingURL=session-run-binding.js.map