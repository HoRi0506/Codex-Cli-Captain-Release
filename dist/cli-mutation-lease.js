"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCliMutationLeaseSessionContext = createCliMutationLeaseSessionContext;
exports.acquireCliRunMutationLease = acquireCliRunMutationLease;
const promises_1 = require("node:fs/promises");
const node_crypto_1 = require("node:crypto");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
const CLI_RUN_MUTATION_LEASE_TTL_MS = 10 * 60 * 1000;
function createRunMutationLeaseFilePath(cwd, runId) {
    return node_path_1.default.join((0, runtime_1.createRunPaths)(cwd, runId).runDir, 'mcp-mutation-lease.json');
}
async function doesRunDirectoryExist(cwd, runId) {
    try {
        await (0, promises_1.access)((0, runtime_1.createRunPaths)(cwd, runId).runDir);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
async function readJsonFile(filePath) {
    const content = await (0, promises_1.readFile)(filePath, 'utf8');
    return JSON.parse(content);
}
async function writeJsonFile(filePath, value) {
    await (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function parseFiniteInteger(value) {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isExpiredIsoTimestamp(timestamp, nowIsoTimestamp) {
    const expiresAtMs = Date.parse(timestamp);
    const nowMs = Date.parse(nowIsoTimestamp);
    if (Number.isNaN(expiresAtMs) || Number.isNaN(nowMs)) {
        return true;
    }
    return expiresAtMs <= nowMs;
}
function assertValidRunMutationLeaseRecord(value) {
    if (!isRecord(value) ||
        value.version !== 1 ||
        typeof value.run_id !== 'string' ||
        value.run_id.trim().length === 0 ||
        typeof value.owner_session_id !== 'string' ||
        value.owner_session_id.trim().length === 0 ||
        (value.owner_process_id !== null && parseFiniteInteger(value.owner_process_id) === null) ||
        typeof value.owner_started_at !== 'string' ||
        typeof value.acquired_at !== 'string' ||
        typeof value.updated_at !== 'string' ||
        typeof value.expires_at !== 'string' ||
        typeof value.last_mutating_tool !== 'string') {
        throw new Error('Run mutation lease record is invalid.');
    }
}
function createRunMutationLeaseRecord(input) {
    return {
        version: 1,
        run_id: input.runId,
        owner_session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        acquired_at: input.timestamp,
        updated_at: input.timestamp,
        expires_at: new Date(Date.parse(input.timestamp) + CLI_RUN_MUTATION_LEASE_TTL_MS).toISOString(),
        last_mutating_tool: input.action,
    };
}
async function loadRunMutationLeaseRecord(cwd, runId) {
    const leaseFilePath = createRunMutationLeaseFilePath(cwd, runId);
    let candidate;
    try {
        candidate = await readJsonFile(leaseFilePath);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load Foreman run mutation lease from ${leaseFilePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        assertValidRunMutationLeaseRecord(candidate);
    }
    catch (error) {
        throw new Error(`Foreman run mutation lease at ${leaseFilePath} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
    if (candidate.run_id !== runId) {
        throw new Error(`Foreman run mutation lease at ${leaseFilePath} belongs to run ${candidate.run_id}, not ${runId}.`);
    }
    return candidate;
}
async function createRunMutationLeaseRecordIfAbsent(cwd, runId, record) {
    const leaseFilePath = createRunMutationLeaseFilePath(cwd, runId);
    try {
        const handle = await (0, promises_1.open)(leaseFilePath, 'wx');
        try {
            await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
        }
        finally {
            await handle.close();
        }
        return true;
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'EEXIST') {
            return false;
        }
        throw new Error(`Unable to create Foreman run mutation lease at ${leaseFilePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
}
async function persistRunMutationLeaseRecord(cwd, runId, record) {
    await writeJsonFile(createRunMutationLeaseFilePath(cwd, runId), record);
}
function describeRunMutationLeaseConflict(record, runId) {
    const ownerProcess = record.owner_process_id === null ? 'unknown pid' : `pid ${record.owner_process_id}`;
    return (`Run ${runId} is currently bound to session ${record.owner_session_id} (${ownerProcess}) ` +
        `through ${record.last_mutating_tool} until ${record.expires_at}. ` +
        'Retry from the same CLI or MCP session, or wait for that lease to expire before mutating this run.');
}
function isActiveOwnerProcessId(processId) {
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
function createCliMutationLeaseSessionContext(env = process.env) {
    const configuredSessionId = env.FOREMAN_SESSION_ID?.trim();
    const parentScopedSessionId = typeof process.ppid === 'number' && Number.isInteger(process.ppid) && process.ppid > 0
        ? `cli-session-ppid-${process.ppid}`
        : `cli-session-${(0, node_crypto_1.randomUUID)()}`;
    return {
        sessionId: configuredSessionId && configuredSessionId.length > 0 ? configuredSessionId : parentScopedSessionId,
        processId: typeof process.pid === 'number' && Number.isInteger(process.pid) && process.pid > 0 ? process.pid : null,
        startedAt: (0, runtime_1.nowTimestamp)(),
    };
}
async function acquireCliRunMutationLease(input) {
    if (!(await doesRunDirectoryExist(input.cwd, input.runId))) {
        return;
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    const requestedRecord = createRunMutationLeaseRecord({
        runId: input.runId,
        session: input.session,
        action: input.action,
        timestamp,
    });
    const currentRecord = await loadRunMutationLeaseRecord(input.cwd, input.runId);
    if (currentRecord === null) {
        const created = await createRunMutationLeaseRecordIfAbsent(input.cwd, input.runId, requestedRecord);
        if (created) {
            return;
        }
        const racedRecord = await loadRunMutationLeaseRecord(input.cwd, input.runId);
        if (racedRecord === null) {
            throw new Error(`Foreman run mutation lease for run ${input.runId} vanished during acquisition.`);
        }
        if (racedRecord.owner_session_id !== input.session.sessionId && !isExpiredIsoTimestamp(racedRecord.expires_at, timestamp)) {
            throw new Error(describeRunMutationLeaseConflict(racedRecord, input.runId));
        }
        await persistRunMutationLeaseRecord(input.cwd, input.runId, requestedRecord);
        return;
    }
    if (currentRecord.owner_session_id === input.session.sessionId) {
        await persistRunMutationLeaseRecord(input.cwd, input.runId, {
            ...currentRecord,
            owner_process_id: input.session.processId,
            owner_started_at: input.session.startedAt,
            updated_at: timestamp,
            expires_at: requestedRecord.expires_at,
            last_mutating_tool: input.action,
        });
        return;
    }
    const ownerProcessActive = isActiveOwnerProcessId(currentRecord.owner_process_id);
    if (ownerProcessActive !== false && !isExpiredIsoTimestamp(currentRecord.expires_at, timestamp)) {
        throw new Error(describeRunMutationLeaseConflict(currentRecord, input.runId));
    }
    await persistRunMutationLeaseRecord(input.cwd, input.runId, requestedRecord);
}
//# sourceMappingURL=cli-mutation-lease.js.map