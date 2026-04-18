"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSessionWorkstream = loadSessionWorkstream;
exports.activateSessionWorkstream = activateSessionWorkstream;
exports.replaceSessionWorkstreamCurrentRequest = replaceSessionWorkstreamCurrentRequest;
exports.enqueueSessionWorkstreamFollowUp = enqueueSessionWorkstreamFollowUp;
exports.releaseSessionWorkstream = releaseSessionWorkstream;
exports.closeTouchedSessionWorkstreams = closeTouchedSessionWorkstreams;
exports.isContinuationOnlySessionRequest = isContinuationOnlySessionRequest;
exports.deriveSessionWorkstreamRoutingRequest = deriveSessionWorkstreamRoutingRequest;
exports.createSessionWorkstreamView = createSessionWorkstreamView;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
const touchedWorkstreamsBySession = new Map();
function createSessionWorkstreamDirectoryPath(cwd) {
    return node_path_1.default.join(cwd, '.foreman', 'session-workstreams');
}
function createSessionWorkstreamFilePath(cwd, sessionId) {
    return node_path_1.default.join(createSessionWorkstreamDirectoryPath(cwd), `${encodeURIComponent(sessionId)}.json`);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function normalizeRequestText(value) {
    const normalized = (value ?? '').replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : null;
}
function isSameRequest(a, b) {
    return normalizeRequestText(a) === normalizeRequestText(b);
}
function summarizeRequestForView(value) {
    const normalized = normalizeRequestText(value);
    if (!normalized) {
        return null;
    }
    if (normalized.length <= 72) {
        return normalized;
    }
    return `${normalized.slice(0, 69).trimEnd()}...`;
}
async function writeJsonFile(filePath, value) {
    await (0, promises_1.mkdir)(node_path_1.default.dirname(filePath), { recursive: true });
    await (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function registerTouchedWorkstream(session, cwd) {
    const workspaces = touchedWorkstreamsBySession.get(session.sessionId) ?? new Set();
    workspaces.add(cwd);
    touchedWorkstreamsBySession.set(session.sessionId, workspaces);
}
function createBaseRecord(input) {
    return {
        version: 1,
        session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        state: 'active',
        active_run_id: input.runId,
        current_request: normalizeRequestText(input.request),
        current_request_recorded_at: normalizeRequestText(input.request) ? input.timestamp : null,
        pending_requests: [],
        updated_at: input.timestamp,
        released_at: null,
        release_reason: null,
    };
}
function parsePendingRequestRecord(value) {
    if (!isRecord(value) || typeof value.request !== 'string' || typeof value.recorded_at !== 'string') {
        return null;
    }
    const request = normalizeRequestText(value.request);
    if (!request) {
        return null;
    }
    return {
        request,
        recorded_at: value.recorded_at,
    };
}
function parseSessionWorkstreamRecord(value) {
    if (!isRecord(value) ||
        value.version !== 1 ||
        typeof value.session_id !== 'string' ||
        typeof value.owner_started_at !== 'string' ||
        (value.owner_process_id !== null && typeof value.owner_process_id !== 'number') ||
        (value.state !== 'active' && value.state !== 'released') ||
        (value.active_run_id !== null && typeof value.active_run_id !== 'string') ||
        (value.current_request !== null && typeof value.current_request !== 'string') ||
        (value.current_request_recorded_at !== null && typeof value.current_request_recorded_at !== 'string') ||
        !Array.isArray(value.pending_requests) ||
        typeof value.updated_at !== 'string' ||
        (value.released_at !== null && typeof value.released_at !== 'string') ||
        (value.release_reason !== null &&
            value.release_reason !== 'session_end' &&
            value.release_reason !== 'operator_closed' &&
            value.release_reason !== 'new_run_requested' &&
            value.release_reason !== 'stale_owner')) {
        return null;
    }
    return {
        version: 1,
        session_id: value.session_id,
        owner_process_id: typeof value.owner_process_id === 'number' ? value.owner_process_id : null,
        owner_started_at: value.owner_started_at,
        state: value.state,
        active_run_id: value.active_run_id,
        current_request: normalizeRequestText(value.current_request),
        current_request_recorded_at: value.current_request_recorded_at,
        pending_requests: value.pending_requests
            .map((candidate) => parsePendingRequestRecord(candidate))
            .filter((candidate) => candidate !== null),
        updated_at: value.updated_at,
        released_at: value.released_at,
        release_reason: value.release_reason,
    };
}
async function loadSessionWorkstream(cwd, sessionId) {
    const filePath = createSessionWorkstreamFilePath(cwd, sessionId);
    try {
        const candidate = JSON.parse(await (0, promises_1.readFile)(filePath, 'utf8'));
        return parseSessionWorkstreamRecord(candidate);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load session workstream from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
}
async function persistSessionWorkstream(cwd, sessionId, record) {
    await writeJsonFile(createSessionWorkstreamFilePath(cwd, sessionId), record);
}
async function activateSessionWorkstream(input) {
    const timestamp = (0, runtime_1.nowTimestamp)();
    const existing = await loadSessionWorkstream(input.cwd, input.session.sessionId);
    const normalizedRequest = normalizeRequestText(input.request);
    const preservePending = existing?.state === 'active' && existing.active_run_id === input.runId;
    const nextRecord = {
        ...(existing ?? createBaseRecord({ session: input.session, runId: input.runId, request: normalizedRequest, timestamp })),
        session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        state: 'active',
        active_run_id: input.runId,
        current_request: normalizedRequest,
        current_request_recorded_at: normalizedRequest ? timestamp : null,
        pending_requests: preservePending ? existing?.pending_requests ?? [] : [],
        updated_at: timestamp,
        released_at: null,
        release_reason: null,
    };
    await persistSessionWorkstream(input.cwd, input.session.sessionId, nextRecord);
    registerTouchedWorkstream(input.session, input.cwd);
    return nextRecord;
}
async function replaceSessionWorkstreamCurrentRequest(input) {
    const timestamp = (0, runtime_1.nowTimestamp)();
    const existing = (await loadSessionWorkstream(input.cwd, input.session.sessionId)) ??
        createBaseRecord({
            session: input.session,
            runId: input.runId,
            request: input.request,
            timestamp,
        });
    const normalizedRequest = normalizeRequestText(input.request);
    const nextRecord = {
        ...existing,
        session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        state: 'active',
        active_run_id: input.runId,
        current_request: normalizedRequest,
        current_request_recorded_at: normalizedRequest ? timestamp : null,
        pending_requests: input.clearPending ? [] : existing.pending_requests,
        updated_at: timestamp,
        released_at: null,
        release_reason: null,
    };
    await persistSessionWorkstream(input.cwd, input.session.sessionId, nextRecord);
    registerTouchedWorkstream(input.session, input.cwd);
    return nextRecord;
}
async function enqueueSessionWorkstreamFollowUp(input) {
    const timestamp = (0, runtime_1.nowTimestamp)();
    const existing = (await loadSessionWorkstream(input.cwd, input.session.sessionId)) ??
        createBaseRecord({
            session: input.session,
            runId: input.runId,
            request: null,
            timestamp,
        });
    const normalizedRequest = normalizeRequestText(input.request);
    if (!normalizedRequest) {
        await persistSessionWorkstream(input.cwd, input.session.sessionId, existing);
        registerTouchedWorkstream(input.session, input.cwd);
        return existing;
    }
    if (isSameRequest(existing.current_request, normalizedRequest) ||
        existing.pending_requests.some((candidate) => isSameRequest(candidate.request, normalizedRequest))) {
        const dedupedRecord = {
            ...existing,
            state: 'active',
            active_run_id: input.runId,
            updated_at: timestamp,
            released_at: null,
            release_reason: null,
        };
        await persistSessionWorkstream(input.cwd, input.session.sessionId, dedupedRecord);
        registerTouchedWorkstream(input.session, input.cwd);
        return dedupedRecord;
    }
    const nextRecord = {
        ...existing,
        session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        state: 'active',
        active_run_id: input.runId,
        pending_requests: [...existing.pending_requests, { request: normalizedRequest, recorded_at: timestamp }],
        updated_at: timestamp,
        released_at: null,
        release_reason: null,
    };
    await persistSessionWorkstream(input.cwd, input.session.sessionId, nextRecord);
    registerTouchedWorkstream(input.session, input.cwd);
    return nextRecord;
}
async function releaseSessionWorkstream(input) {
    const existing = await loadSessionWorkstream(input.cwd, input.session.sessionId);
    if (!existing) {
        return null;
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    const releasedRecord = {
        ...existing,
        session_id: input.session.sessionId,
        owner_process_id: input.session.processId,
        owner_started_at: input.session.startedAt,
        state: 'released',
        active_run_id: null,
        current_request: null,
        current_request_recorded_at: null,
        pending_requests: [],
        updated_at: timestamp,
        released_at: timestamp,
        release_reason: input.reason,
    };
    await persistSessionWorkstream(input.cwd, input.session.sessionId, releasedRecord);
    registerTouchedWorkstream(input.session, input.cwd);
    return releasedRecord;
}
async function closeTouchedSessionWorkstreams(session) {
    const workspaces = touchedWorkstreamsBySession.get(session.sessionId);
    if (!workspaces || workspaces.size === 0) {
        return;
    }
    try {
        await Promise.all([...workspaces].map((cwd) => releaseSessionWorkstream({
            cwd,
            session,
            reason: 'session_end',
        })));
    }
    finally {
        touchedWorkstreamsBySession.delete(session.sessionId);
    }
}
function isContinuationOnlySessionRequest(request) {
    const normalized = normalizeRequestText(request);
    if (!normalized) {
        return false;
    }
    const continuationOnlyPatterns = [
        /^(continue|resume|proceed|advance)[.!?]?(?:\s+(?:please|now))?$/i,
        /^(keep going|go on)[.!?]?(?:\s+(?:please|now))?$/i,
        /^(continue|resume|proceed|advance)\s+(?:the\s+)?(?:current|same)\s+(?:run|workstream)[.!?]?$/i,
        /^(keep going|go on)\s+(?:with\s+)?(?:the\s+)?(?:current|same)\s+(?:run|workstream)[.!?]?$/i,
        /^(continue|resume|proceed|advance)\s+(?:the\s+)?(?:current|same)(?:\s+[a-z0-9-]+){0,3}\s+(?:task|run|workstream)[.!?]?$/i,
        /^(keep going|go on)\s+(?:with\s+)?(?:the\s+)?(?:current|same)(?:\s+[a-z0-9-]+){0,3}\s+(?:task|run|workstream)[.!?]?$/i,
        /^(continue|resume|proceed|advance)\s+(?:the\s+)?(?:current|same)(?:\s+[a-z0-9-]+){0,3}\s+(?:task|run|workstream)\s+(?:through|via|under)\s+(?:captain|foreman)[.!?]?$/i,
        /^(keep going|go on)\s+(?:with\s+)?(?:the\s+)?(?:current|same)(?:\s+[a-z0-9-]+){0,3}\s+(?:task|run|workstream)\s+(?:through|via|under)\s+(?:captain|foreman)[.!?]?$/i,
    ];
    return continuationOnlyPatterns.some((pattern) => pattern.test(normalized));
}
function deriveSessionWorkstreamRoutingRequest(input) {
    const normalizedRawRequest = normalizeRequestText(input.rawRequest);
    if (!normalizedRawRequest ||
        input.workstream === null ||
        input.workstream.state !== 'active' ||
        !isContinuationOnlySessionRequest(normalizedRawRequest) ||
        !input.workstream.current_request) {
        return {
            request: input.rawRequest,
            merged_from_workstream: false,
            merged_pending_count: 0,
        };
    }
    const uniquePendingRequests = input.workstream.pending_requests
        .map((candidate) => normalizeRequestText(candidate.request))
        .filter((candidate, index, values) => candidate !== null && candidate !== input.workstream?.current_request && values.indexOf(candidate) === index);
    if (uniquePendingRequests.length === 0) {
        return {
            request: input.workstream.current_request,
            merged_from_workstream: true,
            merged_pending_count: 0,
        };
    }
    return {
        request: `${input.workstream.current_request}\n\nPending operator follow-up to merge:\n` +
            uniquePendingRequests.map((candidate) => `- ${candidate}`).join('\n'),
        merged_from_workstream: true,
        merged_pending_count: uniquePendingRequests.length,
    };
}
function createSessionWorkstreamView(input) {
    if (input.record === null) {
        return null;
    }
    const currentRequest = summarizeRequestForView(input.record.current_request);
    const latestPendingRequest = summarizeRequestForView(input.record.pending_requests.at(-1)?.request ?? null);
    const activeRunMatch = input.record.active_run_id === null
        ? 'none'
        : input.record.active_run_id === input.runId
            ? 'current_run'
            : 'other_run';
    const pendingCount = input.record.pending_requests.length;
    return {
        state: input.record.state,
        active_run_match: activeRunMatch,
        current_request: currentRequest,
        pending_request_count: pendingCount,
        latest_pending_request: latestPendingRequest,
        updated_at: input.record.updated_at,
        summary: input.record.state === 'released'
            ? 'released'
            : pendingCount > 0
                ? `active pending=${pendingCount} current=${currentRequest ?? 'none'} latest_pending=${latestPendingRequest ?? 'none'}`
                : `active pending=0 current=${currentRequest ?? 'none'}`,
    };
}
//# sourceMappingURL=session-workstream.js.map