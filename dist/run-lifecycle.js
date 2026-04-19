"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_ENTRY_FRESH_RUN_THRESHOLD_MS = void 0;
exports.classifyRunFreshness = classifyRunFreshness;
exports.deriveRunLifecycleView = deriveRunLifecycleView;
exports.inspectWorkspaceRunLifecycleViews = inspectWorkspaceRunLifecycleViews;
exports.maintainWorkspaceRuns = maintainWorkspaceRuns;
exports.clearWorkspaceRuns = clearWorkspaceRuns;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
exports.AUTO_ENTRY_FRESH_RUN_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_CANDIDATE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;
const PRUNE_CANDIDATE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
const SUPERSEDED_FRESH_ARCHIVE_THRESHOLD = 5;
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
function deriveRetentionPolicy(cleanupAction) {
    if (cleanupAction === 'prune_candidate') {
        return {
            tier: 'prunable_after_checkpoint',
            canonical_state: 'structured_local_state',
            markdown_role: 'operator_summary_only',
            raw_artifact_action: 'prune_after_structured_checkpoint',
            cleanup_guard: 'Prune only after compact summary, route/proof/failure index, and changed-files evidence have been preserved.',
            summary: 'This run is outside the bounded retention window; raw artifacts may be pruned only after structured checkpoint proof remains local.',
        };
    }
    if (cleanupAction === 'archive_candidate') {
        return {
            tier: 'warm_archive_candidate',
            canonical_state: 'structured_local_state',
            markdown_role: 'operator_summary_only',
            raw_artifact_action: 'compress_after_compact_summary',
            cleanup_guard: 'Archive only after active/resumable state is closed and compact summary plus proof indexes are available.',
            summary: 'This run can move out of the hot working set after compact summary and structured proof indexes are retained.',
        };
    }
    return {
        tier: 'hot',
        canonical_state: 'structured_local_state',
        markdown_role: 'operator_summary_only',
        raw_artifact_action: 'retain',
        cleanup_guard: 'Retain active, blocked, manual-hold, or recently updated runs in the hot local working set.',
        summary: 'This run remains hot local state; markdown is only an operator summary and structured artifacts stay canonical.',
    };
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
        cleanupAction =
            freshness === 'stale' || sameWorkspaceActiveRuns >= SUPERSEDED_FRESH_ARCHIVE_THRESHOLD
                ? 'archive_candidate'
                : 'retain';
        decisionReason = 'A newer fresh active run exists in the same workspace, so this run should not be the default resume target.';
        recoveryHint =
            cleanupAction === 'archive_candidate'
                ? 'Inspect this run explicitly if it still matters; otherwise archive it out of the active working set and prefer the newer active run.'
                : 'Inspect this run explicitly if it still matters; otherwise prefer the newer active run.';
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
        retention_policy: deriveRetentionPolicy(cleanupAction),
        resume_recommended: resumeRecommended,
        decision_reason: decisionReason,
        recovery_hint: recoveryHint,
    };
}
async function inspectWorkspaceRunLifecycleViews(cwd) {
    const allRuns = await loadWorkspaceRuns(cwd);
    const activeRuns = allRuns.filter((run) => run.status === 'active' || run.status === 'blocked');
    const nowMs = Date.now();
    return activeRuns
        .map((run) => deriveRunLifecycleView(run, activeRuns, nowMs))
        .sort(sortLifecycleViews);
}
async function loadWorkspaceRuns(cwd) {
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
    for (const { runId } of scoredRunIds.sort((left, right) => right.updatedAtMs - left.updatedAtMs || left.runId.localeCompare(right.runId))) {
        try {
            allRuns.push(await (0, runtime_1.loadRunRecord)((0, runtime_1.createRunPaths)(cwd, runId)));
        }
        catch {
            continue;
        }
    }
    return allRuns;
}
function sortLifecycleViews(left, right) {
    const ageDelta = Date.parse(right.updated_at) - Date.parse(left.updated_at);
    if (Number.isFinite(ageDelta) && ageDelta !== 0) {
        return ageDelta;
    }
    return left.run_id.localeCompare(right.run_id);
}
async function inspectAllWorkspaceRunLifecycleViews(cwd) {
    const allRuns = await loadWorkspaceRuns(cwd);
    const activeRuns = allRuns.filter((run) => run.status === 'active' || run.status === 'blocked');
    const nowMs = Date.now();
    return allRuns
        .map((run) => ({
        run,
        lifecycle: deriveRunLifecycleView(run, activeRuns, nowMs),
    }))
        .sort((left, right) => sortLifecycleViews(left.lifecycle, right.lifecycle));
}
function cleanupActionForMaintenance(action) {
    return action === 'archive' ? 'archive_candidate' : 'prune_candidate';
}
function hasPruneCheckpointProof(run) {
    return run.latest_verified_checkpoint !== null || run.latest_failure !== null || run.latest_response !== null;
}
async function maintainWorkspaceRuns(cwd, options) {
    const action = options.action;
    const dryRun = options.dryRun ?? true;
    const expectedCleanupAction = cleanupActionForMaintenance(action);
    const inspected = await inspectAllWorkspaceRunLifecycleViews(cwd);
    const candidates = inspected.filter(({ lifecycle }) => lifecycle.cleanup_action === expectedCleanupAction);
    const timestamp = new Date().toISOString();
    const changedRunIds = [];
    const skipped = [];
    for (const { run, lifecycle } of candidates) {
        if (lifecycle.state === 'manual_hold' || lifecycle.resume_recommended) {
            skipped.push({ run_id: run.run_id, reason: 'manual_hold_or_resume_recommended' });
            continue;
        }
        const paths = (0, runtime_1.createRunPaths)(cwd, run.run_id);
        if (action === 'archive') {
            if (run.status !== 'active') {
                skipped.push({ run_id: run.run_id, reason: 'archive_only_closes_active_candidates' });
                continue;
            }
            if (!dryRun) {
                run.status = 'cancelled';
                run.completed_at = run.completed_at ?? timestamp;
                run.updated_at = timestamp;
                run.latest_failure = run.latest_failure ?? {
                    stage: run.stage,
                    reason: 'cancelled',
                    summary: 'Archived through the explicit maintain-runs archive command after lifecycle retention classification.',
                    recorded_at: timestamp,
                };
                await (0, runtime_1.persistRunRecord)(paths, run);
            }
            changedRunIds.push(run.run_id);
            continue;
        }
        if (run.status === 'active' || run.status === 'blocked') {
            skipped.push({ run_id: run.run_id, reason: 'active_or_blocked_runs_are_not_pruned' });
            continue;
        }
        if (!hasPruneCheckpointProof(run)) {
            skipped.push({ run_id: run.run_id, reason: 'missing_structured_checkpoint_or_failure_proof' });
            continue;
        }
        if (!dryRun) {
            await (0, promises_1.rm)(paths.rawEventsDir, { force: true, recursive: true });
        }
        changedRunIds.push(run.run_id);
    }
    return {
        cwd,
        action,
        dry_run: dryRun,
        candidate_count: candidates.length,
        changed_count: changedRunIds.length,
        changed_run_ids: changedRunIds,
        skipped,
        timestamp,
        summary: `Run maintenance ${action} ${dryRun ? 'dry-run' : 'applied'} in ${cwd}: ` +
            `${changedRunIds.length}/${candidates.length} candidate(s) ${dryRun ? 'would change' : 'changed'}, ` +
            `${skipped.length} skipped.`,
    };
}
async function clearWorkspaceRuns(cwd, options = {}) {
    const runsDirectory = (0, runtime_1.createRunPaths)(cwd, 'placeholder').runsDir;
    const includeBlocked = options.includeBlocked ?? true;
    let runIds = [];
    try {
        runIds = await (0, promises_1.readdir)(runsDirectory);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            const timestamp = new Date().toISOString();
            return {
                cwd,
                cleared_count: 0,
                cleared_run_ids: [],
                timestamp,
                include_blocked: includeBlocked,
                summary: `Cleared 0 persisted ${includeBlocked ? 'active or blocked' : 'active'} runs in ${cwd}.`,
            };
        }
        throw error;
    }
    const now = new Date().toISOString();
    const clearedRunIds = [];
    for (const runId of runIds) {
        const paths = (0, runtime_1.createRunPaths)(cwd, runId);
        try {
            const run = await (0, runtime_1.loadRunRecord)(paths);
            const shouldClear = run.status === 'active' || (includeBlocked && run.status === 'blocked');
            if (!shouldClear) {
                continue;
            }
            run.status = 'cancelled';
            run.completed_at = run.completed_at ?? now;
            run.updated_at = now;
            run.latest_failure = run.latest_failure ?? {
                stage: run.stage,
                reason: 'cancelled',
                summary: 'Cleared through the explicit clear-runs maintenance command.',
                recorded_at: now,
            };
            await (0, runtime_1.persistRunRecord)(paths, run);
            clearedRunIds.push(runId);
        }
        catch {
            continue;
        }
    }
    return {
        cwd,
        cleared_count: clearedRunIds.length,
        cleared_run_ids: clearedRunIds,
        timestamp: now,
        include_blocked: includeBlocked,
        summary: `Cleared ${clearedRunIds.length} persisted ${includeBlocked ? 'active or blocked' : 'active'} runs in ${cwd}.`,
    };
}
//# sourceMappingURL=run-lifecycle.js.map