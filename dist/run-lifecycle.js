"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_ENTRY_FRESH_RUN_THRESHOLD_MS = void 0;
exports.classifyRunFreshness = classifyRunFreshness;
exports.deriveRunLifecycleView = deriveRunLifecycleView;
exports.inspectWorkspaceRunLifecycleViews = inspectWorkspaceRunLifecycleViews;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
exports.AUTO_ENTRY_FRESH_RUN_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_CANDIDATE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;
const PRUNE_CANDIDATE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_LIFECYCLE_SCAN_RUNS = 50;
function parseAgeMs(updatedAt, nowMs) {
    const updatedAtMs = Date.parse(updatedAt);
    if (!Number.isFinite(updatedAtMs)) {
        return null;
    }
    return Math.max(0, nowMs - updatedAtMs);
}
function classifyRunFreshness(updatedAt, nowMs = Date.now()) {
    const ageMs = parseAgeMs(updatedAt, nowMs);
    if (ageMs === null) {
        return 'stale';
    }
    return ageMs <= exports.AUTO_ENTRY_FRESH_RUN_THRESHOLD_MS ? 'fresh' : 'stale';
}
function isManualHoldRun(run) {
    return ((0, runtime_1.isPlanningClarificationHold)(run) ||
        run.latest_response?.boundary === 'manual_hold' ||
        run.latest_orchestrator_synthesis?.boundary === 'manual_hold' ||
        run.status === 'blocked');
}
function deriveRunLifecycleView(run, activeWorkspaceRuns, nowMs = Date.now()) {
    const ageMs = parseAgeMs(run.updated_at, nowMs);
    const freshness = classifyRunFreshness(run.updated_at, nowMs);
    const sameWorkspaceActiveRuns = activeWorkspaceRuns.length;
    const newerActiveRuns = activeWorkspaceRuns.filter((candidate) => candidate.run_id !== run.run_id && Date.parse(candidate.updated_at) > Date.parse(run.updated_at));
    const newerFreshActiveRuns = newerActiveRuns.filter((candidate) => classifyRunFreshness(candidate.updated_at, nowMs) === 'fresh');
    const manualHold = isManualHoldRun(run);
    let state;
    let cleanupAction = 'retain';
    let resumeRecommended = false;
    let decisionReason;
    let recoveryHint;
    if (manualHold) {
        state = 'manual_hold';
        decisionReason = 'Run is waiting on an explicit clarification, verification, or operator decision boundary.';
        recoveryHint = 'Resume this run only when the held boundary still matches the operator request.';
    }
    else if (newerFreshActiveRuns.length > 0) {
        state = 'superseded';
        cleanupAction = freshness === 'stale' ? 'archive_candidate' : 'retain';
        decisionReason = 'A newer fresh active run exists in the same workspace, so this run should not be the default resume target.';
        recoveryHint = 'Inspect this run explicitly if it still matters; otherwise prefer the newer active run.';
    }
    else if (ageMs !== null && ageMs >= PRUNE_CANDIDATE_THRESHOLD_MS) {
        state = 'prune_candidate';
        cleanupAction = 'prune_candidate';
        decisionReason = 'Run is far beyond the bounded retention window and no longer looks like the primary resume target.';
        recoveryHint = 'Prune only after checking that no pending operator follow-up still depends on this run.';
    }
    else if (ageMs !== null && ageMs >= ARCHIVE_CANDIDATE_THRESHOLD_MS) {
        state = 'archive_candidate';
        cleanupAction = 'archive_candidate';
        decisionReason = 'Run is stale enough to move out of the active working set while remaining inspectable.';
        recoveryHint = 'Archive this run instead of keeping it as the default active context.';
    }
    else {
        state = 'resumable';
        resumeRecommended = run.status === 'active';
        decisionReason =
            freshness === 'fresh'
                ? 'Run is the freshest active workspace candidate and can be resumed safely.'
                : 'Run is stale but still within the bounded retention window and remains resumable.';
        recoveryHint =
            freshness === 'fresh'
                ? 'Prefer resuming this run when the next operator request clearly continues the same work.'
                : 'Resume only when the operator request clearly continues the same stale run.';
    }
    return {
        run_id: run.run_id,
        status: run.status,
        stage: run.stage,
        freshness,
        state,
        updated_at: run.updated_at,
        age_ms: ageMs,
        same_workspace_active_run_count: sameWorkspaceActiveRuns,
        newer_active_run_count: newerActiveRuns.length,
        newer_fresh_active_run_count: newerFreshActiveRuns.length,
        cleanup_action: cleanupAction,
        resume_recommended: resumeRecommended,
        decision_reason: decisionReason,
        recovery_hint: recoveryHint,
    };
}
async function inspectWorkspaceRunLifecycleViews(cwd) {
    const runsDirectory = (0, runtime_1.createRunPaths)(cwd, 'placeholder').runsDir;
    let runIds = [];
    try {
        runIds = await (0, promises_1.readdir)(runsDirectory);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
    const scoredRunIds = await Promise.all(runIds.map(async (runId) => {
        try {
            const runJsonPath = node_path_1.default.join(runsDirectory, runId, 'run.json');
            const runStat = await (0, promises_1.stat)(runJsonPath);
            return {
                runId,
                updatedAtMs: runStat.mtimeMs,
            };
        }
        catch {
            return {
                runId,
                updatedAtMs: 0,
            };
        }
    }));
    const allRuns = [];
    for (const { runId } of scoredRunIds
        .sort((left, right) => right.updatedAtMs - left.updatedAtMs || left.runId.localeCompare(right.runId))
        .slice(0, MAX_LIFECYCLE_SCAN_RUNS)) {
        try {
            allRuns.push(await (0, runtime_1.loadRunRecord)((0, runtime_1.createRunPaths)(cwd, runId)));
        }
        catch {
            continue;
        }
    }
    const activeRuns = allRuns.filter((run) => run.status === 'active' || run.status === 'blocked');
    const nowMs = Date.now();
    return activeRuns
        .map((run) => deriveRunLifecycleView(run, activeRuns, nowMs))
        .sort((left, right) => {
        const ageDelta = Date.parse(right.updated_at) - Date.parse(left.updated_at);
        if (Number.isFinite(ageDelta) && ageDelta !== 0) {
            return ageDelta;
        }
        return left.run_id.localeCompare(right.run_id);
    });
}
//# sourceMappingURL=run-lifecycle.js.map