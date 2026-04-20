"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDelegationWorkerLifecycleRecord = createDelegationWorkerLifecycleRecord;
exports.deriveRoleModelObservationDefaults = deriveRoleModelObservationDefaults;
exports.nowTimestamp = nowTimestamp;
exports.resolveForemanConfigDirectory = resolveForemanConfigDirectory;
exports.resolveForemanConfigFilePath = resolveForemanConfigFilePath;
exports.createRunPaths = createRunPaths;
exports.loadRunEventRecordsIfPresent = loadRunEventRecordsIfPresent;
exports.decideNextActionFromRunState = decideNextActionFromRunState;
exports.foldRunEventsToState = foldRunEventsToState;
exports.loadRunStateProjectionIfPresent = loadRunStateProjectionIfPresent;
exports.loadPlanningChecklistRecordIfPresent = loadPlanningChecklistRecordIfPresent;
exports.createForemanRunRef = createForemanRunRef;
exports.resolveForemanRunDirectory = resolveForemanRunDirectory;
exports.resolveForemanRunRef = resolveForemanRunRef;
exports.createEmptyRoleDefaults = createEmptyRoleDefaults;
exports.createDefaultForemanEntryPolicy = createDefaultForemanEntryPolicy;
exports.createDefaultForemanOutputConfig = createDefaultForemanOutputConfig;
exports.createDefaultForemanRuntimeConfig = createDefaultForemanRuntimeConfig;
exports.createDefaultForemanArchiveTargetsConfig = createDefaultForemanArchiveTargetsConfig;
exports.createDefaultForemanConfig = createDefaultForemanConfig;
exports.createRequestSettingsFromForemanAgentConfig = createRequestSettingsFromForemanAgentConfig;
exports.getDefaultForemanAgentConfigForRole = getDefaultForemanAgentConfigForRole;
exports.getRunActiveAgentIdForRole = getRunActiveAgentIdForRole;
exports.getForemanAgentConfigForRole = getForemanAgentConfigForRole;
exports.getAssignedRoleForTaskKind = getAssignedRoleForTaskKind;
exports.getAgentIdForRole = getAgentIdForRole;
exports.createTaskRoleConfigSnapshot = createTaskRoleConfigSnapshot;
exports.deriveTaskModelTierIntent = deriveTaskModelTierIntent;
exports.deriveTaskChildAggregationContract = deriveTaskChildAggregationContract;
exports.deriveTaskFanInBarrierSemantics = deriveTaskFanInBarrierSemantics;
exports.deriveTaskOrchestratorReviewGate = deriveTaskOrchestratorReviewGate;
exports.createDefaultAlwaysOnModeRecord = createDefaultAlwaysOnModeRecord;
exports.loadAlwaysOnModeRecord = loadAlwaysOnModeRecord;
exports.persistAlwaysOnModeRecord = persistAlwaysOnModeRecord;
exports.loadForemanConfig = loadForemanConfig;
exports.ensureForemanConfig = ensureForemanConfig;
exports.loadRoleDefaults = loadRoleDefaults;
exports.ensureRunPaths = ensureRunPaths;
exports.createPlannerAttemptPaths = createPlannerAttemptPaths;
exports.ensurePlannerAttemptPaths = ensurePlannerAttemptPaths;
exports.allocatePlannerAttemptId = allocatePlannerAttemptId;
exports.allocateDelegationId = allocateDelegationId;
exports.allocateOrchestrationAttemptId = allocateOrchestrationAttemptId;
exports.createDelegationArtifactFilePath = createDelegationArtifactFilePath;
exports.createDelegationWorkerResultFilePath = createDelegationWorkerResultFilePath;
exports.loadDelegationArtifact = loadDelegationArtifact;
exports.listDelegationArtifactIds = listDelegationArtifactIds;
exports.loadDelegationArtifacts = loadDelegationArtifacts;
exports.summarizeTaskDelegations = summarizeTaskDelegations;
exports.loadTaskDelegationSummary = loadTaskDelegationSummary;
exports.persistDelegationArtifact = persistDelegationArtifact;
exports.persistDelegationWithVisibilitySync = persistDelegationWithVisibilitySync;
exports.updateDelegationWithVisibilitySync = updateDelegationWithVisibilitySync;
exports.markDelegationLaunchingWithVisibilitySync = markDelegationLaunchingWithVisibilitySync;
exports.updateDelegationPolicyDecisionWithVisibilitySync = updateDelegationPolicyDecisionWithVisibilitySync;
exports.createOrchestrationAttemptArtifactFilePath = createOrchestrationAttemptArtifactFilePath;
exports.loadOrchestrationAttemptArtifact = loadOrchestrationAttemptArtifact;
exports.listOrchestrationAttemptIds = listOrchestrationAttemptIds;
exports.loadLatestOrchestrationAttempt = loadLatestOrchestrationAttempt;
exports.persistOrchestrationAttemptArtifact = persistOrchestrationAttemptArtifact;
exports.persistRunRecord = persistRunRecord;
exports.createInitialRunRecord = createInitialRunRecord;
exports.createInitialTaskCardRecord = createInitialTaskCardRecord;
exports.createQueuedTaskCardRecord = createQueuedTaskCardRecord;
exports.createPlanningRunRecord = createPlanningRunRecord;
exports.isPlanningClarificationHold = isPlanningClarificationHold;
exports.markPlanningRunClarificationHold = markPlanningRunClarificationHold;
exports.createHandoffRecord = createHandoffRecord;
exports.createDefaultOrchestrationPolicy = createDefaultOrchestrationPolicy;
exports.createOrchestratorState = createOrchestratorState;
exports.setOrchestratorDecision = setOrchestratorDecision;
exports.applyInitialTaskHandoff = applyInitialTaskHandoff;
exports.activatePlannedTask = activatePlannedTask;
exports.reactivateBlockedTask = reactivateBlockedTask;
exports.cancelQueuedTaskCard = cancelQueuedTaskCard;
exports.findNextQueuedTaskCard = findNextQueuedTaskCard;
exports.findReadyQueuedTaskCards = findReadyQueuedTaskCards;
exports.addUniqueValue = addUniqueValue;
exports.updateExecutionThread = updateExecutionThread;
exports.markExecutionCompleted = markExecutionCompleted;
exports.assertVerificationResolutionAllowed = assertVerificationResolutionAllowed;
exports.applyVerificationResolution = applyVerificationResolution;
exports.promoteNextPlannedTask = promoteNextPlannedTask;
exports.markRunTerminalState = markRunTerminalState;
exports.markPlanningRunTerminalState = markPlanningRunTerminalState;
exports.createVisibilityProjection = createVisibilityProjection;
exports.persistHandoffRecord = persistHandoffRecord;
exports.persistPlannerEvidence = persistPlannerEvidence;
exports.persistPlanningArtifact = persistPlanningArtifact;
exports.persistPlanUpdateArtifact = persistPlanUpdateArtifact;
exports.createExploreArtifactFilePath = createExploreArtifactFilePath;
exports.persistExploreArtifact = persistExploreArtifact;
exports.loadPlanUpdateArtifactIfPresent = loadPlanUpdateArtifactIfPresent;
exports.loadExploreArtifactIfPresent = loadExploreArtifactIfPresent;
exports.persistOrchestratorState = persistOrchestratorState;
exports.loadRunRecord = loadRunRecord;
exports.loadResumeCheckpointRecordIfPresent = loadResumeCheckpointRecordIfPresent;
exports.loadRunContext = loadRunContext;
exports.loadPersistedTaskCardsForRun = loadPersistedTaskCardsForRun;
exports.loadMutableRunContext = loadMutableRunContext;
exports.loadTaskCardTitlesForRun = loadTaskCardTitlesForRun;
exports.loadHotRunContext = loadHotRunContext;
exports.loadSelectiveProgressProjection = loadSelectiveProgressProjection;
exports.loadSelectiveTaskCardIndex = loadSelectiveTaskCardIndex;
exports.assertRunContextIntegrity = assertRunContextIntegrity;
exports.persistRunArtifacts = persistRunArtifacts;
exports.createContinuityProjection = createContinuityProjection;
exports.createDerivedProgressProjection = createDerivedProgressProjection;
exports.writeDerivedProgressDocFromContext = writeDerivedProgressDocFromContext;
exports.writeDerivedProgressDoc = writeDerivedProgressDoc;
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const orchestrator_1 = require("./orchestrator");
const execution_plan_1 = require("./execution-plan");
const workflow_variants_1 = require("./workflow-variants");
const tool_routing_1 = require("./tool-routing");
const role_roster_1 = require("./role-roster");
const validation_1 = require("./validation");
function writeJsonDocument(filePath, value) {
    return (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
async function readJsonDocument(filePath) {
    const content = await (0, promises_1.readFile)(filePath, 'utf8');
    return JSON.parse(content);
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function upsertChildAgentSnapshot(childAgents, nextSnapshot) {
    const existingIndex = childAgents.findIndex((childAgent) => childAgent.agent_id === nextSnapshot.agent_id);
    if (existingIndex < 0) {
        return [...childAgents, nextSnapshot];
    }
    return childAgents.map((childAgent, index) => (index === existingIndex ? nextSnapshot : childAgent));
}
function buildSpecialistExecutorId(childAgentId) {
    return `specialist-executor:${childAgentId}`;
}
function summarizeWorkerLifecycleState(state) {
    switch (state) {
        case 'queued':
            return 'Worker is queued and waiting for captain to launch it.';
        case 'launching':
            return 'Captain requested worker launch and is waiting for the running checkpoint.';
        case 'running':
            return 'Worker is running under captain supervision.';
        case 'returned':
            return 'Worker returned a bounded result to captain.';
        case 'failed':
            return 'Worker ended in failure and needs captain follow-up.';
        case 'cancelled':
            return 'Worker was cancelled under captain control.';
        case 'stale':
            return 'Worker appears stale and should be reclaimed explicitly.';
        case 'timed_out':
            return 'Worker exceeded the bounded timeout window and should be reclaimed explicitly.';
    }
}
function createDelegationWorkerLifecycleRecord(input) {
    const state = input.state ?? 'queued';
    return {
        state,
        reclaim_state: input.reclaimState ?? (state === 'returned' ? 'resumable' : 'not_needed'),
        queued_at: input.createdAt,
        launch_requested_at: input.launchRequestedAt ?? null,
        started_at: input.startedAt ?? null,
        last_progress_at: input.lastProgressAt ?? input.createdAt,
        returned_at: input.returnedAt ?? null,
        stale_at: input.staleAt ?? null,
        timed_out_at: input.timedOutAt ?? null,
        stale_after_ms: constants_1.FOREMAN_WORKER_STALE_AFTER_MS,
        timeout_after_ms: constants_1.FOREMAN_WORKER_TIMEOUT_AFTER_MS,
        summary: summarizeWorkerLifecycleState(state),
    };
}
function normalizeLoadedWorkerLifecycle(candidate, fallback) {
    if (isRecord(candidate) &&
        typeof candidate.state === 'string' &&
        typeof candidate.reclaim_state === 'string' &&
        typeof candidate.queued_at === 'string' &&
        typeof candidate.last_progress_at === 'string' &&
        typeof candidate.stale_after_ms === 'number' &&
        typeof candidate.timeout_after_ms === 'number' &&
        typeof candidate.summary === 'string') {
        return {
            state: candidate.state,
            reclaim_state: candidate.reclaim_state,
            queued_at: candidate.queued_at,
            launch_requested_at: typeof candidate.launch_requested_at === 'string' ? candidate.launch_requested_at : null,
            started_at: typeof candidate.started_at === 'string' ? candidate.started_at : null,
            last_progress_at: candidate.last_progress_at,
            returned_at: typeof candidate.returned_at === 'string' ? candidate.returned_at : null,
            stale_at: typeof candidate.stale_at === 'string' ? candidate.stale_at : null,
            timed_out_at: typeof candidate.timed_out_at === 'string' ? candidate.timed_out_at : null,
            stale_after_ms: candidate.stale_after_ms,
            timeout_after_ms: candidate.timeout_after_ms,
            summary: candidate.summary,
        };
    }
    if (fallback.childStatus === 'running') {
        return createDelegationWorkerLifecycleRecord({
            createdAt: fallback.createdAt,
            state: 'running',
            launchRequestedAt: fallback.updatedAt,
            startedAt: fallback.updatedAt,
            lastProgressAt: fallback.updatedAt,
        });
    }
    if (fallback.childStatus === 'completed') {
        const returnedAt = fallback.completedAt ?? fallback.updatedAt;
        return createDelegationWorkerLifecycleRecord({
            createdAt: fallback.createdAt,
            state: 'returned',
            reclaimState: 'resumable',
            launchRequestedAt: fallback.updatedAt,
            startedAt: fallback.updatedAt,
            lastProgressAt: returnedAt,
            returnedAt,
        });
    }
    if (fallback.childStatus === 'failed' || fallback.childStatus === 'cancelled') {
        return createDelegationWorkerLifecycleRecord({
            createdAt: fallback.createdAt,
            state: fallback.childStatus,
            reclaimState: 'not_needed',
            launchRequestedAt: fallback.updatedAt,
            startedAt: fallback.updatedAt,
            lastProgressAt: fallback.completedAt ?? fallback.updatedAt,
            returnedAt: fallback.completedAt ?? fallback.updatedAt,
        });
    }
    return createDelegationWorkerLifecycleRecord({
        createdAt: fallback.createdAt,
        state: 'queued',
        reclaimState: 'not_needed',
        lastProgressAt: fallback.updatedAt,
    });
}
function normalizeLoadedWorkerPolicyDecision(candidate) {
    if (isRecord(candidate) &&
        typeof candidate.outcome === 'string' &&
        typeof candidate.configured_role === 'string' &&
        (typeof candidate.selected_agent_id === 'string' || candidate.selected_agent_id === null) &&
        Array.isArray(candidate.allowed_agent_ids) &&
        candidate.allowed_agent_ids.every((entry) => typeof entry === 'string') &&
        typeof candidate.configured_model_tier === 'string' &&
        (typeof candidate.requested_model_tier === 'string' || candidate.requested_model_tier === null) &&
        Array.isArray(candidate.allowed_model_tiers) &&
        candidate.allowed_model_tiers.every((entry) => typeof entry === 'string') &&
        (typeof candidate.configured_variant === 'string' || candidate.configured_variant === null) &&
        (typeof candidate.requested_variant === 'string' || candidate.requested_variant === null) &&
        (typeof candidate.rejection_reason === 'string' || candidate.rejection_reason === null) &&
        typeof candidate.read_only_fallback_allowed === 'boolean' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.recorded_at === 'string') {
        return {
            outcome: candidate.outcome,
            configured_role: candidate.configured_role,
            selected_agent_id: candidate.selected_agent_id,
            allowed_agent_ids: [...candidate.allowed_agent_ids],
            configured_model_tier: candidate.configured_model_tier,
            requested_model_tier: candidate.requested_model_tier,
            allowed_model_tiers: [...candidate.allowed_model_tiers],
            configured_variant: candidate.configured_variant,
            requested_variant: candidate.requested_variant,
            rejection_reason: candidate.rejection_reason,
            read_only_fallback_allowed: candidate.read_only_fallback_allowed,
            summary: candidate.summary,
            recorded_at: candidate.recorded_at,
        };
    }
    return null;
}
function createSpecialistExecutorSnapshot(delegation) {
    return {
        executor_id: buildSpecialistExecutorId(delegation.child_agent.agent_id),
        status: delegation.child_agent.status,
        task_card_id: delegation.task_card_id,
        delegation_id: delegation.delegation_id,
        child_agent_id: delegation.child_agent.agent_id,
    };
}
function upsertSpecialistExecutorSnapshot(specialistExecutors, nextSnapshot) {
    const existingIndex = specialistExecutors.findIndex((executor) => executor.executor_id === nextSnapshot.executor_id);
    if (existingIndex < 0) {
        return [...specialistExecutors, nextSnapshot];
    }
    return specialistExecutors.map((executor, index) => (index === existingIndex ? nextSnapshot : executor));
}
function assertDelegationExecutorIntegrity(delegation) {
    const expectedExecutor = createSpecialistExecutorSnapshot(delegation);
    if (delegation.executor.executor_id !== expectedExecutor.executor_id ||
        delegation.executor.status !== expectedExecutor.status ||
        delegation.executor.task_card_id !== expectedExecutor.task_card_id ||
        delegation.executor.delegation_id !== expectedExecutor.delegation_id ||
        delegation.executor.child_agent_id !== expectedExecutor.child_agent_id) {
        throw new Error(`Delegation integrity mismatch: executor snapshot for ${delegation.delegation_id} must remain synchronized with the delegation child-agent state.`);
    }
}
function deriveRoleModelObservationDefaults(input) {
    if (input.requestKind !== 'execution') {
        return {
            observed_capability: input.launchSource === 'foreman_spawn' ? 'launch_request_only' : 'unsupported',
            observation_status: 'unavailable',
            observation_match_state: 'unavailable',
            observation_unavailable_reason: 'unsupported',
        };
    }
    if (input.launchSource === 'foreman_spawn') {
        return {
            observed_capability: 'thread_observable',
            observation_status: 'not_started',
            observation_match_state: 'not_started',
            observation_unavailable_reason: null,
        };
    }
    return {
        observed_capability: 'unsupported',
        observation_status: 'unavailable',
        observation_match_state: 'unavailable',
        observation_unavailable_reason: 'unsupported',
    };
}
function deriveObservedCapabilityFromLaunchSource(requestKind, launchSource) {
    return deriveRoleModelObservationDefaults({ requestKind, launchSource }).observed_capability;
}
function normalizeLoadedRoleValue(candidate) {
    switch (candidate) {
        case 'orchestrator':
        case 'planner':
        case 'explorer':
        case 'code specialist':
        case 'verifier':
            return candidate;
        default:
            return 'code specialist';
    }
}
function normalizeLoadedLaunchRequestKind(candidate, role) {
    switch (candidate) {
        case 'execution':
        case 'verification':
        case 'planning':
        case 'advisory':
            return candidate;
        default:
            return role === 'verifier' ? 'verification' : role === 'planner' ? 'planning' : 'execution';
    }
}
function normalizeLoadedRoleModelLaunchEvidence(candidate) {
    if (candidate === null || candidate === undefined) {
        return null;
    }
    if (!isRecord(candidate)) {
        return candidate;
    }
    const role = normalizeLoadedRoleValue(candidate.role);
    const launchSource = Object.prototype.hasOwnProperty.call(candidate, 'launch_source') && candidate.launch_source === 'foreman_spawn'
        ? 'foreman_spawn'
        : 'foreman_spawn';
    const requestKind = normalizeLoadedLaunchRequestKind(candidate.request_kind, role);
    const observedDefaults = deriveRoleModelObservationDefaults({
        requestKind,
        launchSource,
    });
    const configuredProfile = Object.prototype.hasOwnProperty.call(candidate, 'configured_profile')
        ? candidate.configured_profile
        : candidate.actual_profile ?? candidate.dispatched_profile ?? null;
    const configuredModel = Object.prototype.hasOwnProperty.call(candidate, 'configured_model')
        ? candidate.configured_model
        : candidate.actual_model ?? candidate.dispatched_model ?? null;
    const configuredVariant = Object.prototype.hasOwnProperty.call(candidate, 'configured_variant')
        ? candidate.configured_variant
        : candidate.actual_variant ?? candidate.dispatched_variant ?? null;
    const dispatchedProfile = Object.prototype.hasOwnProperty.call(candidate, 'dispatched_profile')
        ? candidate.dispatched_profile
        : candidate.actual_profile;
    const dispatchedModel = Object.prototype.hasOwnProperty.call(candidate, 'dispatched_model')
        ? candidate.dispatched_model
        : candidate.actual_model;
    const dispatchedVariant = Object.prototype.hasOwnProperty.call(candidate, 'dispatched_variant')
        ? candidate.dispatched_variant
        : candidate.actual_variant;
    const dispatchedConfigEntries = Object.prototype.hasOwnProperty.call(candidate, 'dispatched_config_entries')
        ? candidate.dispatched_config_entries
        : candidate.actual_config_entries;
    const normalizedDispatchedModel = typeof dispatchedModel === 'string' ? dispatchedModel : null;
    const normalizedDispatchedVariant = dispatchedVariant === 'low' || dispatchedVariant === 'medium' || dispatchedVariant === 'high' || dispatchedVariant === 'xhigh'
        ? dispatchedVariant
        : null;
    const normalizedDispatchedConfigEntries = Array.isArray(dispatchedConfigEntries)
        ? dispatchedConfigEntries
        : normalizeAgentConfigEntries(normalizedDispatchedModel, normalizedDispatchedVariant, []);
    const actualProfile = Object.prototype.hasOwnProperty.call(candidate, 'actual_profile')
        ? candidate.actual_profile
        : dispatchedProfile ?? null;
    const actualModel = Object.prototype.hasOwnProperty.call(candidate, 'actual_model')
        ? candidate.actual_model
        : dispatchedModel ?? null;
    const actualVariant = Object.prototype.hasOwnProperty.call(candidate, 'actual_variant')
        ? candidate.actual_variant
        : dispatchedVariant ?? null;
    const actualConfigEntries = Array.isArray(candidate.actual_config_entries)
        ? candidate.actual_config_entries
        : normalizedDispatchedConfigEntries;
    const mismatchReasons = [];
    if (configuredProfile !== actualProfile) {
        mismatchReasons.push(`profile expected ${configuredProfile ?? 'none'} but launched ${actualProfile ?? 'none'}`);
    }
    if (configuredModel !== actualModel) {
        mismatchReasons.push(`model expected ${configuredModel ?? 'none'} but launched ${actualModel ?? 'none'}`);
    }
    if (configuredVariant !== actualVariant) {
        mismatchReasons.push(`reasoning expected ${configuredVariant ?? 'none'} but launched ${actualVariant ?? 'none'}`);
    }
    return {
        ...candidate,
        role,
        request_kind: requestKind,
        launch_source: launchSource,
        codex_path: Object.prototype.hasOwnProperty.call(candidate, 'codex_path') && typeof candidate.codex_path === 'string'
            ? candidate.codex_path
            : 'codex',
        configured_profile: configuredProfile ?? null,
        configured_model: configuredModel ?? null,
        configured_variant: configuredVariant ?? null,
        dispatched_profile: dispatchedProfile ?? null,
        dispatched_model: dispatchedModel ?? null,
        dispatched_variant: dispatchedVariant ?? null,
        dispatched_config_entries: normalizedDispatchedConfigEntries,
        actual_profile: actualProfile,
        actual_model: actualModel,
        actual_variant: actualVariant,
        actual_config_entries: actualConfigEntries,
        observed_profile: Object.prototype.hasOwnProperty.call(candidate, 'observed_profile') ? candidate.observed_profile : null,
        observed_model: Object.prototype.hasOwnProperty.call(candidate, 'observed_model') ? candidate.observed_model : null,
        observed_variant: Object.prototype.hasOwnProperty.call(candidate, 'observed_variant') ? candidate.observed_variant : null,
        observed_source: Object.prototype.hasOwnProperty.call(candidate, 'observed_source') ? candidate.observed_source : null,
        observed_confidence: Object.prototype.hasOwnProperty.call(candidate, 'observed_confidence')
            ? candidate.observed_confidence
            : null,
        observed_capability: Object.prototype.hasOwnProperty.call(candidate, 'observed_capability')
            ? candidate.observed_capability
            : deriveObservedCapabilityFromLaunchSource(requestKind, launchSource),
        observation_status: Object.prototype.hasOwnProperty.call(candidate, 'observation_status')
            ? candidate.observation_status
            : observedDefaults.observation_status,
        observation_match_state: Object.prototype.hasOwnProperty.call(candidate, 'observation_match_state')
            ? candidate.observation_match_state
            : observedDefaults.observation_match_state,
        observation_unavailable_reason: Object.prototype.hasOwnProperty.call(candidate, 'observation_unavailable_reason')
            ? candidate.observation_unavailable_reason
            : observedDefaults.observation_unavailable_reason,
        observation_mismatch_summary: Object.prototype.hasOwnProperty.call(candidate, 'observation_mismatch_summary')
            ? candidate.observation_mismatch_summary
            : null,
        match_state: Object.prototype.hasOwnProperty.call(candidate, 'match_state')
            ? candidate.match_state
            : mismatchReasons.length === 0
                ? 'verified_match'
                : 'mismatch',
        mismatch_summary: Object.prototype.hasOwnProperty.call(candidate, 'mismatch_summary')
            ? candidate.mismatch_summary
            : mismatchReasons.length === 0
                ? null
                : `Configured role launch mismatch for ${role} ${requestKind}: ${mismatchReasons.join('; ')}.`,
        recorded_at: Object.prototype.hasOwnProperty.call(candidate, 'recorded_at') && typeof candidate.recorded_at === 'string'
            ? candidate.recorded_at
            : nowTimestamp(),
    };
}
function normalizeLoadedWorkerResult(candidate) {
    if (candidate === null || candidate === undefined) {
        return null;
    }
    if (!isRecord(candidate)) {
        return candidate;
    }
    return {
        ...candidate,
        scope: Object.prototype.hasOwnProperty.call(candidate, 'scope') ? candidate.scope : null,
        slice_label: Object.prototype.hasOwnProperty.call(candidate, 'slice_label') ? candidate.slice_label : null,
        partition_strategy: Object.prototype.hasOwnProperty.call(candidate, 'partition_strategy')
            ? candidate.partition_strategy
            : null,
        coverage_focus: Object.prototype.hasOwnProperty.call(candidate, 'coverage_focus') && Array.isArray(candidate.coverage_focus)
            ? candidate.coverage_focus
            : [],
        key_findings: Object.prototype.hasOwnProperty.call(candidate, 'key_findings') && Array.isArray(candidate.key_findings)
            ? candidate.key_findings
            : [],
        evidence_paths: Object.prototype.hasOwnProperty.call(candidate, 'evidence_paths') && Array.isArray(candidate.evidence_paths)
            ? candidate.evidence_paths
            : [],
        confidence: Object.prototype.hasOwnProperty.call(candidate, 'confidence') ? candidate.confidence : null,
        uncertainty_summary: Object.prototype.hasOwnProperty.call(candidate, 'uncertainty_summary')
            ? candidate.uncertainty_summary
            : null,
    };
}
function normalizeLoadedOwnershipChain(candidate) {
    if (candidate === null || candidate === undefined) {
        return null;
    }
    if (!isRecord(candidate)) {
        return candidate;
    }
    return {
        ...candidate,
        selected_agent_id: Object.prototype.hasOwnProperty.call(candidate, 'selected_agent_id')
            ? candidate.selected_agent_id
            : Object.prototype.hasOwnProperty.call(candidate, 'assigned_agent_id')
                ? candidate.assigned_agent_id
                : null,
        worker_count: Object.prototype.hasOwnProperty.call(candidate, 'worker_count') ? candidate.worker_count : 0,
        launched_worker_id: Object.prototype.hasOwnProperty.call(candidate, 'launched_worker_id')
            ? candidate.launched_worker_id
            : null,
        observed_worker_id: Object.prototype.hasOwnProperty.call(candidate, 'observed_worker_id')
            ? candidate.observed_worker_id
            : null,
        observed_evidence_state: Object.prototype.hasOwnProperty.call(candidate, 'observed_evidence_state')
            ? candidate.observed_evidence_state
            : null,
        observed_model: Object.prototype.hasOwnProperty.call(candidate, 'observed_model') ? candidate.observed_model : null,
        observed_variant: Object.prototype.hasOwnProperty.call(candidate, 'observed_variant') ? candidate.observed_variant : null,
        observed_source: Object.prototype.hasOwnProperty.call(candidate, 'observed_source') ? candidate.observed_source : null,
        observed_confidence: Object.prototype.hasOwnProperty.call(candidate, 'observed_confidence')
            ? candidate.observed_confidence
            : null,
        reviewer_count: Object.prototype.hasOwnProperty.call(candidate, 'reviewer_count') ? candidate.reviewer_count : 0,
        reviewer_agent_id: Object.prototype.hasOwnProperty.call(candidate, 'reviewer_agent_id')
            ? candidate.reviewer_agent_id
            : null,
        reviewer_link_state: Object.prototype.hasOwnProperty.call(candidate, 'reviewer_link_state')
            ? candidate.reviewer_link_state
            : 'missing',
        captain_agent_id: Object.prototype.hasOwnProperty.call(candidate, 'captain_agent_id')
            ? candidate.captain_agent_id
            : 'captain',
        execution_owner_mode: Object.prototype.hasOwnProperty.call(candidate, 'execution_owner_mode')
            ? candidate.execution_owner_mode
            : 'host_session_fallback',
        fallback_reason: Object.prototype.hasOwnProperty.call(candidate, 'fallback_reason') ? candidate.fallback_reason : null,
    };
}
function normalizeLoadedWorkerRequest(candidate) {
    if (candidate === null || candidate === undefined) {
        return null;
    }
    if (!isRecord(candidate)) {
        return candidate;
    }
    return {
        ...candidate,
        workflow_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_skill_id') ? candidate.workflow_skill_id : null,
        workflow_step_index: Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_index') &&
            typeof candidate.workflow_step_index === 'number'
            ? candidate.workflow_step_index
            : null,
        workflow_step_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_skill_id')
            ? candidate.workflow_step_skill_id
            : null,
        workflow_next_step_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_next_step_skill_id')
            ? candidate.workflow_next_step_skill_id
            : null,
        scope: Object.prototype.hasOwnProperty.call(candidate, 'scope') ? candidate.scope : null,
        slice_label: Object.prototype.hasOwnProperty.call(candidate, 'slice_label') ? candidate.slice_label : null,
        partition_strategy: Object.prototype.hasOwnProperty.call(candidate, 'partition_strategy')
            ? candidate.partition_strategy
            : null,
        coverage_focus: Object.prototype.hasOwnProperty.call(candidate, 'coverage_focus') && Array.isArray(candidate.coverage_focus)
            ? candidate.coverage_focus
            : [],
        coverage_rules: Object.prototype.hasOwnProperty.call(candidate, 'coverage_rules') && Array.isArray(candidate.coverage_rules)
            ? candidate.coverage_rules
            : [],
    };
}
function normalizeLoadedDelegationRecord(candidate) {
    if (!isRecord(candidate)) {
        (0, validation_1.assertValidDelegationRecord)(candidate);
        assertDelegationExecutorIntegrity(candidate);
        return candidate;
    }
    const normalizedCandidate = {
        ...candidate,
        source_task_card_id: Object.prototype.hasOwnProperty.call(candidate, 'source_task_card_id')
            ? candidate.source_task_card_id
            : null,
        review_round: Object.prototype.hasOwnProperty.call(candidate, 'review_round') ? candidate.review_round : null,
        executor: Object.prototype.hasOwnProperty.call(candidate, 'executor')
            ? candidate.executor
            : isRecord(candidate.child_agent) &&
                typeof candidate.delegation_id === 'string' &&
                typeof candidate.task_card_id === 'string' &&
                typeof candidate.child_agent.agent_id === 'string'
                ? {
                    executor_id: buildSpecialistExecutorId(candidate.child_agent.agent_id),
                    status: candidate.child_agent.status,
                    task_card_id: candidate.task_card_id,
                    delegation_id: candidate.delegation_id,
                    child_agent_id: candidate.child_agent.agent_id,
                }
                : candidate.executor,
        worker_request: Object.prototype.hasOwnProperty.call(candidate, 'worker_request')
            ? normalizeLoadedWorkerRequest(candidate.worker_request)
            : null,
        worker_role_config_snapshot: Object.prototype.hasOwnProperty.call(candidate, 'worker_role_config_snapshot')
            ? candidate.worker_role_config_snapshot
            : null,
        worker_launch_evidence: Object.prototype.hasOwnProperty.call(candidate, 'worker_launch_evidence')
            ? normalizeLoadedRoleModelLaunchEvidence(candidate.worker_launch_evidence)
            : null,
        worker_policy_decision: Object.prototype.hasOwnProperty.call(candidate, 'worker_policy_decision')
            ? normalizeLoadedWorkerPolicyDecision(candidate.worker_policy_decision)
            : null,
        worker_lifecycle: normalizeLoadedWorkerLifecycle(Object.prototype.hasOwnProperty.call(candidate, 'worker_lifecycle') ? candidate.worker_lifecycle : null, {
            childStatus: isRecord(candidate.child_agent) ? candidate.child_agent.status : 'queued',
            createdAt: typeof candidate.created_at === 'string' ? candidate.created_at : nowTimestamp(),
            updatedAt: typeof candidate.updated_at === 'string' ? candidate.updated_at : nowTimestamp(),
            completedAt: typeof candidate.completed_at === 'string' ? candidate.completed_at : null,
        }),
        worker_result: Object.prototype.hasOwnProperty.call(candidate, 'worker_result')
            ? normalizeLoadedWorkerResult(candidate.worker_result)
            : null,
        reviewer_outcome: Object.prototype.hasOwnProperty.call(candidate, 'reviewer_outcome') ? candidate.reviewer_outcome : null,
        fan_in_collapsed_at: Object.prototype.hasOwnProperty.call(candidate, 'fan_in_collapsed_at')
            ? candidate.fan_in_collapsed_at
            : null,
    };
    (0, validation_1.assertValidDelegationRecord)(normalizedCandidate);
    assertDelegationExecutorIntegrity(normalizedCandidate);
    return normalizedCandidate;
}
function assertDelegationTransitionAllowed(currentStatus, nextStatus) {
    const allowedTransitions = new Map([
        ['queued', new Set(['running', 'failed', 'cancelled'])],
        ['running', new Set(['completed', 'failed', 'cancelled'])],
        ['completed', new Set()],
        ['failed', new Set()],
        ['cancelled', new Set()],
    ]);
    if (currentStatus === nextStatus) {
        throw new Error(`Delegation transition is a no-op: ${currentStatus} -> ${nextStatus} is not allowed.`);
    }
    const allowedNextStatuses = allowedTransitions.get(currentStatus);
    if (!allowedNextStatuses?.has(nextStatus)) {
        throw new Error(`Delegation transition ${currentStatus} -> ${nextStatus} is not allowed in this checkpoint.`);
    }
}
function nowTimestamp() {
    return new Date().toISOString();
}
function resolveSharedConfigHome(env = process.env) {
    const xdgConfigHome = env.XDG_CONFIG_HOME?.trim();
    if (xdgConfigHome) {
        return xdgConfigHome;
    }
    const homeDirectory = env.HOME?.trim() || (0, node_os_1.homedir)().trim();
    if (homeDirectory) {
        return node_path_1.default.join(homeDirectory, '.config');
    }
    throw new Error('Unable to resolve the shared Foreman config home. Set XDG_CONFIG_HOME or HOME.');
}
function resolveForemanConfigDirectory(env = process.env) {
    return node_path_1.default.join(resolveSharedConfigHome(env), 'foreman');
}
function resolveForemanConfigFilePath(env = process.env) {
    return node_path_1.default.join(resolveForemanConfigDirectory(env), 'foreman-config.json');
}
const FOREMAN_RUN_REF_PREFIX = 'foreman-run:';
function createRunPaths(baseDirectory, runId) {
    const foremanDir = node_path_1.default.join(baseDirectory, '.foreman');
    const sisyphusDir = node_path_1.default.join(baseDirectory, '.sisyphus');
    const sisyphusRunsDir = node_path_1.default.join(sisyphusDir, 'runs');
    const runsDir = node_path_1.default.join(foremanDir, 'runs');
    const runDir = node_path_1.default.join(runsDir, runId);
    const delegationsDir = node_path_1.default.join(runDir, 'delegations');
    const orchestrationDir = node_path_1.default.join(runDir, 'orchestration');
    return {
        workspaceDir: baseDirectory,
        foremanDir,
        foremanConfigFile: resolveForemanConfigFilePath(),
        roleDefaultsFile: node_path_1.default.join(foremanDir, 'role-defaults.json'),
        sisyphusDir,
        sisyphusRunsDir,
        runsDir,
        runDir,
        runFile: node_path_1.default.join(runDir, 'run.json'),
        planningChecklistFile: node_path_1.default.join(runDir, 'planning-checklist.json'),
        runEventsFile: node_path_1.default.join(runDir, 'events.jsonl'),
        runStateFile: node_path_1.default.join(runDir, 'run-state.json'),
        progressFile: node_path_1.default.join(sisyphusRunsDir, `${runId}.md`),
        resumeCheckpointFile: node_path_1.default.join(sisyphusRunsDir, `${runId}.resume.json`),
        alwaysOnModeFile: node_path_1.default.join(sisyphusRunsDir, `${runId}.always-on.json`),
        visibilityFile: node_path_1.default.join(runDir, 'visibility.json'),
        orchestratorStateFile: node_path_1.default.join(runDir, 'orchestrator-state.json'),
        delegationsDir,
        orchestrationDir,
        orchestrationAttemptsDir: node_path_1.default.join(orchestrationDir, 'attempts'),
        plannerDir: node_path_1.default.join(runDir, 'planner'),
        plannerAttemptsDir: node_path_1.default.join(runDir, 'planner', 'attempts'),
        exploreArtifactsDir: node_path_1.default.join(runDir, 'explore'),
        taskCardsDir: node_path_1.default.join(runDir, 'task-cards'),
        handoffsDir: node_path_1.default.join(runDir, 'handoffs'),
        rawEventsDir: node_path_1.default.join(runDir, 'raw-events'),
    };
}
function isChecklistTerminalStatus(status) {
    return status === 'completed' || status === 'blocked' || status === 'cancelled';
}
function mapChecklistPhaseName(run, taskCard) {
    if (taskCard.task_kind === 'plan') {
        return 'plan';
    }
    if (taskCard.task_kind === 'explore') {
        return 'inspect';
    }
    if (taskCard.task_kind === 'review' || taskCard.owner_role === 'verifier' || run.stage === 'verification') {
        return 'verify';
    }
    if (taskCard.node_kind === 'fan_in') {
        return 'fan_in';
    }
    return 'mutate';
}
function mapChecklistOwnerAgent(role, fallbackAgentId) {
    if (fallbackAgentId) {
        return fallbackAgentId;
    }
    switch (role) {
        case 'orchestrator':
            return 'captain';
        case 'planner':
            return 'tactician';
        case 'explorer':
            return 'scout';
        case 'code specialist':
            return 'raider';
        case 'verifier':
            return 'arbiter';
        default:
            return 'captain';
    }
}
function isCaptainOwnedReadOnlyFallbackAllowedForChecklist(taskCard) {
    if (taskCard.task_kind === 'review' || taskCard.assigned_role === 'verifier') {
        return false;
    }
    if (taskCard.task_kind === 'execution') {
        return taskCard.assigned_role === 'code specialist' && taskCard.model_tier_intent === 'low_cost';
    }
    return taskCard.owner_role === 'orchestrator' && taskCard.model_tier_intent === 'low_cost';
}
function dedupeLinks(links) {
    return Array.from(new Set(links.filter((value) => value.trim().length > 0)));
}
function createChecklistCheckpointId(run, taskCardId) {
    const compactTimestamp = run.updated_at.replace(/[^0-9]/g, '');
    const phaseToken = taskCardId ?? 'none';
    return `checkpoint-${run.run_id}-${phaseToken}-${compactTimestamp}`;
}
function createChecklistEventId(phase) {
    return `event-${String(phase.phase_events.length + 1).padStart(4, '0')}`;
}
function appendChecklistPhaseEvent(phase, event) {
    const duplicate = phase.phase_events.some((candidate) => candidate.kind === event.kind &&
        candidate.summary === event.summary &&
        candidate.proof_ref === event.proof_ref);
    if (duplicate) {
        return;
    }
    phase.phase_events.push({
        event_id: createChecklistEventId(phase),
        ...event,
    });
}
function createRunEventId(eventIndex) {
    return `run-event-${String(eventIndex + 1).padStart(6, '0')}`;
}
function mapChecklistEventToRunEventKind(phase, event) {
    switch (event.kind) {
        case 'phase_selected':
            return phase.phase_name === 'plan' ? 'plan_created' : 'phase_started';
        case 'launch_confirmed':
            return 'worker_launched';
        case 'await_fan_in':
            return 'fan_in_completed';
        case 'completed':
            return phase.phase_name === 'verify' ? 'verification_passed' : 'phase_completed';
        case 'blocked':
            return phase.phase_name === 'verify' ? 'verification_failed' : 'captain_judgment_requested';
        case 'degraded':
            return 'captain_judgment_requested';
        case 'launch_requested':
        case 'waiting':
        default:
            return 'projection_updated';
    }
}
function buildRunEventFromChecklistEvent(input) {
    return {
        version: 1,
        event_id: createRunEventId(input.eventIndex),
        run_id: input.run.run_id,
        kind: mapChecklistEventToRunEventKind(input.phase, input.event),
        recorded_at: input.event.recorded_at,
        actor: input.event.actor,
        phase_id: input.phase.phase_id,
        task_card_id: input.phase.task_card_id,
        source_ref: `checklist:${input.phase.phase_id}:${input.event.event_id}`,
        summary: input.event.summary,
        payload: {
            checklist_event_kind: input.event.kind,
            phase_name: input.phase.phase_name,
            phase_status: input.phase.status,
            proof_ref: input.event.proof_ref,
            execution_adapter: input.phase.execution_adapter,
            launch_proof: input.phase.launch_proof,
            execution_owner: input.phase.execution_owner,
            codex_ui_trace_owner: input.phase.codex_ui_trace_owner,
        },
    };
}
async function loadRunEventRecordsIfPresent(paths) {
    let content;
    try {
        content = await (0, promises_1.readFile)(paths.runEventsFile, 'utf8');
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
    return content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line))
        .filter((event) => event.version === 1);
}
async function appendRunEventRecords(paths, events) {
    if (events.length === 0) {
        return;
    }
    await (0, promises_1.appendFile)(paths.runEventsFile, `${events.map((event) => JSON.stringify(event)).join('\n')}\n`, 'utf8');
}
function decideNextActionFromRunState(input) {
    if (input.run.status === 'completed') {
        const notebookLmTarget = input.archiveTargets?.notebooklm ?? null;
        return notebookLmTarget?.enabled ? { type: 'export_archive', target: 'notebooklm' } : { type: 'settle_run' };
    }
    const activePhase = input.checklist.phases.find((phase) => phase.phase_id === input.checklist.active_phase_id) ??
        input.checklist.phases.find((phase) => phase.status === 'await_fan_in' || phase.status === 'in_progress') ??
        input.checklist.phases.find((phase) => phase.status === 'pending') ??
        null;
    if (!activePhase) {
        return null;
    }
    if (activePhase.status === 'await_fan_in') {
        return { type: 'wait_for_fan_in', phase_id: activePhase.phase_id };
    }
    if (activePhase.status === 'blocked') {
        return { type: 'request_captain_judgment', reason: `${activePhase.phase_name} phase is blocked.` };
    }
    if (input.orchestratorDecision?.next_step === 'await_verification') {
        return { type: 'manual_hold', reason: 'Verification outcome is waiting for explicit operator resolution.' };
    }
    if (input.orchestratorDecision?.next_step === 'await_repair_decision') {
        return { type: 'request_captain_judgment', reason: 'Repair decision is required before continuing.' };
    }
    if (activePhase.status === 'completed') {
        const nextPhase = input.checklist.phases.find((phase) => !isChecklistTerminalStatus(phase.status));
        return nextPhase ? { type: 'advance_phase', from_phase_id: activePhase.phase_id, to_phase_id: nextPhase.phase_id } : { type: 'settle_run' };
    }
    if (input.orchestratorDecision?.can_advance === false) {
        return { type: 'manual_hold', reason: input.orchestratorDecision.next_step };
    }
    const role = activePhase.owner_agent === 'arbiter'
        ? 'arbiter'
        : activePhase.owner_agent === 'raider'
            ? 'raider'
            : 'scout';
    return { type: 'launch_worker', phase_id: activePhase.phase_id, role };
}
function foldRunEventsToState(input) {
    const nextAction = decideNextActionFromRunState({
        run: input.run,
        checklist: input.checklist,
        orchestratorDecision: input.orchestratorDecision,
        archiveTargets: input.archiveTargets,
    });
    return {
        version: 1,
        run_id: input.run.run_id,
        updated_at: input.run.updated_at,
        event_count: input.events.length,
        last_event_id: input.events.at(-1)?.event_id ?? null,
        current_phase_id: input.checklist.active_phase_id,
        current_phase_name: input.checklist.active_phase_name,
        phases: input.checklist.phases.map((phase) => ({
            phase_id: phase.phase_id,
            phase_name: phase.phase_name,
            task_card_id: phase.task_card_id,
            status: phase.status,
            owner_agent: phase.owner_agent,
            updated_at: phase.updated_at,
        })),
        next_action: nextAction,
    };
}
async function loadRunStateProjectionIfPresent(paths) {
    let candidate;
    try {
        candidate = await readJsonDocument(paths.runStateFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
    if (!isRecord(candidate) || candidate.version !== 1 || typeof candidate.run_id !== 'string') {
        return null;
    }
    return candidate;
}
function normalizePlanningChecklistStatusForTask(input) {
    switch (input.taskCard.status) {
        case 'queued':
            return 'pending';
        case 'completed':
            return 'completed';
        case 'failed':
        case 'blocked':
            return 'blocked';
        case 'cancelled':
            return 'cancelled';
        case 'in_handoff':
        case 'active': {
            if (input.launchProof === null) {
                return input.run.status === 'blocked' ? 'blocked' : 'pending';
            }
            if (input.isActiveTask && input.orchestratorDecision?.next_step === 'await_fan_in') {
                return 'await_fan_in';
            }
            return input.run.status === 'blocked' ? 'blocked' : 'in_progress';
        }
        default:
            return 'pending';
    }
}
function deriveTaskChecklistExecutionState(input) {
    const taskLinkedDelegations = input.taskDelegations.filter((delegation) => delegation.task_card_id === input.taskCard.task_card_id);
    const hasWorkerLaunchEvidence = taskLinkedDelegations.some((delegation) => delegation.worker_launch_evidence !== null);
    const hasWorkerLifecycleLaunch = taskLinkedDelegations.some((delegation) => {
        const lifecycleState = delegation.worker_lifecycle?.state;
        return (lifecycleState === 'launching' ||
            lifecycleState === 'running' ||
            lifecycleState === 'returned' ||
            lifecycleState === 'failed' ||
            lifecycleState === 'cancelled' ||
            lifecycleState === 'stale' ||
            lifecycleState === 'timed_out');
    });
    const hasHostExecutionEvidence = input.taskCard.thread_ids.length > 0 ||
        input.taskCard.latest_model_launch !== null ||
        (input.run.active_task_card_id === input.taskCard.task_card_id && input.run.active_thread_id !== null);
    const ownershipState = input.taskCard.ownership_chain?.state ?? null;
    const readOnlyFallbackAllowed = isCaptainOwnedReadOnlyFallbackAllowedForChecklist(input.taskCard);
    const proofState = hasWorkerLaunchEvidence || hasWorkerLifecycleLaunch
        ? 'foreman_worker_visible'
        : hasHostExecutionEvidence
            ? ownershipState === 'captain_read_only_fallback' || readOnlyFallbackAllowed
                ? 'captain_read_only_fallback'
                : 'host_session_fallback'
            : 'planned_assignment_only';
    const launchProof = proofState === 'foreman_worker_visible'
        ? 'foreman_worker_visible'
        : proofState === 'planned_assignment_only'
            ? null
            : 'degraded_with_reason';
    const executionAdapter = proofState === 'foreman_worker_visible'
        ? 'foreman_mcp_worker'
        : proofState === 'planned_assignment_only'
            ? taskLinkedDelegations.length > 0
                ? 'foreman_mcp_worker'
                : 'codex_native_agent'
            : 'degraded_host_fallback';
    const executionOwner = proofState === 'foreman_worker_visible' ? 'foreman_worker' : hasHostExecutionEvidence ? 'host_session' : null;
    return {
        proofState,
        executionAdapter,
        launchProof,
        executionOwner,
        codexUiTraceOwner: executionOwner === null ? null : 'host_session',
        degradedSummary: proofState === 'captain_read_only_fallback'
            ? 'captain_read_only_fallback'
            : proofState === 'host_session_fallback'
                ? 'host_session_fallback'
                : null,
    };
}
function derivePhaseEvidenceLinks(taskCard, taskDelegations) {
    const threadLinks = taskCard.thread_ids.map((threadId) => `thread:${threadId}`);
    const delegationLinks = taskDelegations.flatMap((delegation) => delegation.worker_result?.evidence_paths ?? []);
    return dedupeLinks([...threadLinks, ...delegationLinks]);
}
function derivePhaseResultLinks(taskDelegations) {
    const resultLinks = taskDelegations.flatMap((delegation) => {
        const links = [];
        if (delegation.worker_result?.raw_events_file) {
            links.push(delegation.worker_result.raw_events_file);
        }
        if (delegation.worker_result?.thread_id) {
            links.push(`thread:${delegation.worker_result.thread_id}`);
        }
        return links;
    });
    return dedupeLinks(resultLinks);
}
function createInitialPlanningChecklist(run) {
    return {
        version: 1,
        run_id: run.run_id,
        requester_session_id: run.latest_entry_trace?.requester_session_id ?? null,
        lifecycle_state: run.status,
        created_at: run.created_at,
        updated_at: run.updated_at,
        settled_at: run.completed_at,
        checkpoint_id: createChecklistCheckpointId(run, run.active_task_card_id),
        active_phase_id: null,
        active_phase_name: null,
        phases: [],
    };
}
function normalizeLoadedPlanningChecklist(candidate, run) {
    if (!isRecord(candidate) || candidate.version !== 1) {
        return null;
    }
    if (typeof candidate.run_id !== 'string' ||
        !Array.isArray(candidate.phases) ||
        typeof candidate.created_at !== 'string' ||
        typeof candidate.updated_at !== 'string') {
        return null;
    }
    if (candidate.run_id !== run.run_id) {
        return null;
    }
    return candidate;
}
function createPlanningPlaceholderPhase(input) {
    const previous = input.previousPhase;
    const launchProof = previous?.launch_proof ?? null;
    const status = input.run.status === 'cancelled'
        ? 'cancelled'
        : input.run.status === 'failed' || input.run.status === 'blocked'
            ? 'blocked'
            : input.run.status === 'completed'
                ? 'completed'
                : launchProof === null
                    ? 'pending'
                    : 'in_progress';
    const phase = {
        phase_id: 'phase:planning',
        phase_name: 'plan',
        task_card_id: null,
        status,
        owner_agent: 'tactician',
        task_items: [
            {
                task_item_id: 'task-item:planning',
                task_card_id: null,
                title: 'Bounded planning checklist activation',
                status,
                owner_agent: 'tactician',
                execution_adapter: launchProof === null ? null : 'codex_native_agent',
                launch_proof: launchProof,
                execution_owner: launchProof === null ? null : 'host_session',
                codex_ui_trace_owner: launchProof === null ? null : 'host_session',
                evidence_links: [],
                result_links: [],
                updated_at: input.run.updated_at,
                started_at: previous?.started_at ?? (launchProof === null ? null : input.run.updated_at),
                finished_at: previous?.finished_at ??
                    (isChecklistTerminalStatus(status) ? input.run.updated_at : null),
            },
        ],
        evidence_links: [],
        result_links: [],
        checkpoint_id: input.checkpointId,
        updated_at: input.run.updated_at,
        started_at: previous?.started_at ?? (launchProof === null ? null : input.run.updated_at),
        finished_at: previous?.finished_at ?? (isChecklistTerminalStatus(status) ? input.run.updated_at : null),
        next_phase_candidates: [],
        execution_adapter: launchProof === null ? null : 'codex_native_agent',
        launch_proof: launchProof,
        execution_owner: launchProof === null ? null : 'host_session',
        codex_ui_trace_owner: launchProof === null ? null : 'host_session',
        phase_events: [...(previous?.phase_events ?? [])],
    };
    if (!phase.phase_events.some((event) => event.kind === 'phase_selected')) {
        appendChecklistPhaseEvent(phase, {
            kind: 'phase_selected',
            recorded_at: input.run.updated_at,
            actor: 'captain',
            summary: 'planning phase selected before task-card execution',
            proof_ref: null,
        });
    }
    if (launchProof === null && (status === 'pending' || status === 'in_progress')) {
        appendChecklistPhaseEvent(phase, {
            kind: 'launch_requested',
            recorded_at: input.run.updated_at,
            actor: 'captain',
            summary: 'planning assignment declared and waiting for durable launch proof',
            proof_ref: null,
        });
    }
    if (status === 'blocked') {
        appendChecklistPhaseEvent(phase, {
            kind: 'blocked',
            recorded_at: input.run.updated_at,
            actor: 'captain',
            summary: 'planning phase is blocked',
            proof_ref: null,
        });
    }
    if (status === 'completed') {
        appendChecklistPhaseEvent(phase, {
            kind: 'completed',
            recorded_at: input.run.updated_at,
            actor: 'captain',
            summary: 'planning phase completed',
            proof_ref: phase.launch_proof,
        });
    }
    if (status === 'cancelled') {
        appendChecklistPhaseEvent(phase, {
            kind: 'blocked',
            recorded_at: input.run.updated_at,
            actor: 'captain',
            summary: 'planning phase cancelled',
            proof_ref: null,
        });
    }
    return phase;
}
function createTaskChecklistPhase(input) {
    const executionState = deriveTaskChecklistExecutionState({
        run: input.run,
        taskCard: input.taskCard,
        taskDelegations: input.taskDelegations,
    });
    const status = normalizePlanningChecklistStatusForTask({
        run: input.run,
        taskCard: input.taskCard,
        launchProof: executionState.launchProof,
        orchestratorDecision: input.orchestratorDecision,
        isActiveTask: input.isActiveTask,
    });
    const evidenceLinks = derivePhaseEvidenceLinks(input.taskCard, input.taskDelegations);
    const resultLinks = derivePhaseResultLinks(input.taskDelegations);
    const ownerAgent = mapChecklistOwnerAgent(input.taskCard.owner_role, input.taskCard.assigned_agent_id);
    const updatedAt = input.taskCard.updated_at;
    const phase = {
        phase_id: `phase:${input.taskCard.task_card_id}`,
        phase_name: mapChecklistPhaseName(input.run, input.taskCard),
        task_card_id: input.taskCard.task_card_id,
        status,
        owner_agent: ownerAgent,
        task_items: [],
        evidence_links: evidenceLinks,
        result_links: resultLinks,
        checkpoint_id: input.checkpointId,
        updated_at: updatedAt,
        started_at: input.previousPhase?.started_at ?? (executionState.launchProof === null ? null : updatedAt),
        finished_at: input.previousPhase?.finished_at ??
            (isChecklistTerminalStatus(status) ? updatedAt : null),
        next_phase_candidates: input.nextPhaseCandidates,
        execution_adapter: executionState.launchProof === null ? null : executionState.executionAdapter,
        launch_proof: executionState.launchProof,
        execution_owner: executionState.executionOwner,
        codex_ui_trace_owner: executionState.codexUiTraceOwner,
        phase_events: [...(input.previousPhase?.phase_events ?? [])],
    };
    const taskItem = {
        task_item_id: `task-item:${input.taskCard.task_card_id}`,
        task_card_id: input.taskCard.task_card_id,
        title: input.taskCard.title,
        status,
        owner_agent: ownerAgent,
        execution_adapter: phase.execution_adapter,
        launch_proof: phase.launch_proof,
        execution_owner: phase.execution_owner,
        codex_ui_trace_owner: phase.codex_ui_trace_owner,
        evidence_links: evidenceLinks,
        result_links: resultLinks,
        updated_at: updatedAt,
        started_at: phase.started_at,
        finished_at: phase.finished_at,
    };
    phase.task_items = [taskItem];
    if (!phase.phase_events.some((event) => event.kind === 'phase_selected')) {
        appendChecklistPhaseEvent(phase, {
            kind: 'phase_selected',
            recorded_at: updatedAt,
            actor: 'captain',
            summary: `${phase.phase_name} phase selected for task_card_id=${input.taskCard.task_card_id}`,
            proof_ref: null,
        });
    }
    if (executionState.launchProof === null && (status === 'pending' || status === 'blocked')) {
        appendChecklistPhaseEvent(phase, {
            kind: 'launch_requested',
            recorded_at: updatedAt,
            actor: ownerAgent,
            summary: `launch requested for ${ownerAgent} but durable launch proof is not recorded yet`,
            proof_ref: null,
        });
    }
    if (executionState.launchProof === 'foreman_worker_visible') {
        appendChecklistPhaseEvent(phase, {
            kind: 'launch_confirmed',
            recorded_at: updatedAt,
            actor: ownerAgent,
            summary: 'launch proof confirmed via foreman_worker_visible',
            proof_ref: executionState.launchProof,
        });
    }
    if (executionState.launchProof === 'degraded_with_reason') {
        appendChecklistPhaseEvent(phase, {
            kind: 'degraded',
            recorded_at: updatedAt,
            actor: 'captain',
            summary: executionState.degradedSummary ?? 'degraded host fallback recorded',
            proof_ref: executionState.launchProof,
        });
    }
    if (status === 'in_progress') {
        appendChecklistPhaseEvent(phase, {
            kind: 'waiting',
            recorded_at: updatedAt,
            actor: ownerAgent,
            summary: `${ownerAgent} phase work remains in progress`,
            proof_ref: phase.launch_proof,
        });
    }
    if (status === 'await_fan_in') {
        appendChecklistPhaseEvent(phase, {
            kind: 'await_fan_in',
            recorded_at: updatedAt,
            actor: 'captain',
            summary: 'phase is waiting for delegated fan-in before continuation',
            proof_ref: phase.launch_proof,
        });
    }
    if (status === 'completed') {
        appendChecklistPhaseEvent(phase, {
            kind: 'completed',
            recorded_at: updatedAt,
            actor: ownerAgent,
            summary: `${ownerAgent} phase completed`,
            proof_ref: phase.launch_proof,
        });
    }
    if (status === 'blocked') {
        appendChecklistPhaseEvent(phase, {
            kind: 'blocked',
            recorded_at: updatedAt,
            actor: 'captain',
            summary: `${ownerAgent} phase blocked`,
            proof_ref: phase.launch_proof,
        });
    }
    if (status === 'cancelled') {
        appendChecklistPhaseEvent(phase, {
            kind: 'blocked',
            recorded_at: updatedAt,
            actor: 'captain',
            summary: `${ownerAgent} phase cancelled`,
            proof_ref: phase.launch_proof,
        });
    }
    return phase;
}
async function loadPlanningChecklistRecordIfPresent(paths) {
    let candidate;
    try {
        candidate = await readJsonDocument(paths.planningChecklistFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
    let run = null;
    try {
        run = await loadRunRecord(paths);
    }
    catch {
        run = null;
    }
    if (run === null) {
        return null;
    }
    return normalizeLoadedPlanningChecklist(candidate, run);
}
async function persistPlanningChecklistFromContext(paths, input) {
    const existingChecklist = await loadPlanningChecklistRecordIfPresent(paths);
    const checklist = existingChecklist ?? createInitialPlanningChecklist(input.run);
    const checkpointId = createChecklistCheckpointId(input.run, input.run.active_task_card_id);
    checklist.requester_session_id = input.run.latest_entry_trace?.requester_session_id ?? checklist.requester_session_id;
    checklist.lifecycle_state = input.run.status;
    checklist.updated_at = input.run.updated_at;
    checklist.settled_at = input.run.completed_at;
    checklist.checkpoint_id = checkpointId;
    const taskCards = input.taskCards ?? [];
    const taskCardLookup = new Map(taskCards.map((taskCard) => [taskCard.task_card_id, taskCard]));
    const existingPhaseByTaskCardId = new Map(checklist.phases
        .filter((phase) => phase.task_card_id !== null)
        .map((phase) => [phase.task_card_id, phase]));
    const existingPlanningPlaceholder = checklist.phases.find((phase) => phase.phase_id === 'phase:planning' && phase.task_card_id === null) ?? null;
    const taskDelegations = input.taskDelegations ?? [];
    const rebuiltPhases = [];
    if (taskCards.length === 0) {
        if (input.run.stage === 'planning' || existingPlanningPlaceholder !== null) {
            rebuiltPhases.push(createPlanningPlaceholderPhase({
                run: input.run,
                checkpointId,
                previousPhase: existingPlanningPlaceholder,
            }));
        }
        else {
            rebuiltPhases.push(...checklist.phases);
        }
    }
    else {
        if (existingPlanningPlaceholder !== null) {
            const finalizedPlanningPhase = createPlanningPlaceholderPhase({
                run: {
                    ...input.run,
                    status: input.run.status === 'active' ? 'completed' : input.run.status,
                    updated_at: input.run.updated_at,
                },
                checkpointId,
                previousPhase: {
                    ...existingPlanningPlaceholder,
                    launch_proof: existingPlanningPlaceholder.launch_proof ?? 'codex_native_spawned',
                },
            });
            rebuiltPhases.push(finalizedPlanningPhase);
        }
        for (let index = 0; index < input.run.task_card_ids.length; index += 1) {
            const taskCardId = input.run.task_card_ids[index];
            const taskCard = taskCardLookup.get(taskCardId);
            if (!taskCard) {
                continue;
            }
            const nextTaskCardId = input.run.task_card_ids[index + 1] ?? null;
            const nextTaskCard = nextTaskCardId ? taskCardLookup.get(nextTaskCardId) ?? null : null;
            const phase = createTaskChecklistPhase({
                run: input.run,
                taskCard,
                isActiveTask: input.run.active_task_card_id === taskCard.task_card_id,
                checkpointId,
                previousPhase: existingPhaseByTaskCardId.get(taskCard.task_card_id) ?? null,
                nextPhaseCandidates: nextTaskCard ? [mapChecklistPhaseName(input.run, nextTaskCard)] : [],
                orchestratorDecision: input.run.active_task_card_id === taskCard.task_card_id ? input.orchestratorDecision ?? null : null,
                taskDelegations,
            });
            rebuiltPhases.push(phase);
        }
    }
    checklist.phases = rebuiltPhases;
    const activePhase = checklist.phases.find((phase) => phase.task_card_id === input.run.active_task_card_id) ??
        checklist.phases.find((phase) => phase.status === 'in_progress' || phase.status === 'await_fan_in') ??
        checklist.phases.find((phase) => phase.status === 'pending') ??
        null;
    checklist.active_phase_id = activePhase?.phase_id ?? null;
    checklist.active_phase_name = activePhase?.phase_name ?? null;
    (0, validation_1.assertValidPlanningChecklistRecord)(checklist);
    await writeJsonDocument(paths.planningChecklistFile, checklist);
    const existingEvents = await loadRunEventRecordsIfPresent(paths);
    const existingSourceRefs = new Set(existingEvents.map((event) => event.source_ref).filter((ref) => ref !== null));
    const nextEvents = [];
    let eventIndex = existingEvents.length;
    for (const phase of checklist.phases) {
        for (const phaseEvent of phase.phase_events) {
            const sourceRef = `checklist:${phase.phase_id}:${phaseEvent.event_id}`;
            if (existingSourceRefs.has(sourceRef)) {
                continue;
            }
            nextEvents.push(buildRunEventFromChecklistEvent({
                run: input.run,
                phase,
                event: phaseEvent,
                eventIndex,
            }));
            eventIndex += 1;
        }
    }
    if (input.run.status === 'completed' &&
        !existingEvents.some((event) => event.kind === 'run_settled') &&
        !nextEvents.some((event) => event.kind === 'run_settled')) {
        nextEvents.push({
            version: 1,
            event_id: createRunEventId(eventIndex),
            run_id: input.run.run_id,
            kind: 'run_settled',
            recorded_at: input.run.completed_at ?? input.run.updated_at,
            actor: 'captain',
            phase_id: checklist.active_phase_id,
            task_card_id: input.run.active_task_card_id,
            source_ref: 'run:settled',
            summary: 'Run settled after all active work reached a terminal state.',
            payload: {
                status: input.run.status,
                stage: input.run.stage,
            },
        });
    }
    await appendRunEventRecords(paths, nextEvents);
    const allEvents = [...existingEvents, ...nextEvents];
    const foremanConfig = await loadForemanConfig(paths.workspaceDir).catch(() => null);
    const runState = foldRunEventsToState({
        run: input.run,
        checklist,
        events: allEvents,
        orchestratorDecision: input.orchestratorDecision ?? null,
        archiveTargets: foremanConfig?.archive_targets ?? null,
    });
    await writeJsonDocument(paths.runStateFile, runState);
}
function createForemanRunRef(runDirectory) {
    return `${FOREMAN_RUN_REF_PREFIX}${node_path_1.default.resolve(runDirectory)}`;
}
function resolveForemanRunDirectory(runDirectory) {
    if (!node_path_1.default.isAbsolute(runDirectory)) {
        throw new Error('run_dir must be an absolute path to .foreman/runs/<run-id>.');
    }
    const normalizedRunDirectory = node_path_1.default.resolve(runDirectory);
    const runId = node_path_1.default.basename(normalizedRunDirectory);
    const runsDirectory = node_path_1.default.dirname(normalizedRunDirectory);
    const foremanDirectory = node_path_1.default.dirname(runsDirectory);
    if (runId === '.' || runId === '..' || node_path_1.default.basename(runsDirectory) !== 'runs' || node_path_1.default.basename(foremanDirectory) !== '.foreman') {
        throw new Error('run_dir must point to an absolute .foreman/runs/<run-id> directory.');
    }
    return {
        cwd: node_path_1.default.dirname(foremanDirectory),
        runId,
        runDirectory: normalizedRunDirectory,
    };
}
function resolveForemanRunRef(runRef) {
    if (!runRef.startsWith(FOREMAN_RUN_REF_PREFIX)) {
        throw new Error(`run_ref must start with ${FOREMAN_RUN_REF_PREFIX} and point to an absolute .foreman/runs/<run-id> directory.`);
    }
    return resolveForemanRunDirectory(runRef.slice(FOREMAN_RUN_REF_PREFIX.length));
}
const DEFAULT_FOREMAN_AGENT_SETTINGS = {
    orchestrator: {
        name: constants_1.FOREMAN_AGENT_ROSTER.orchestrator,
        model: 'gpt-5.4',
        variant: 'high',
    },
    planner: {
        name: constants_1.FOREMAN_AGENT_ROSTER.planner,
        model: 'gpt-5.4',
        variant: 'medium',
    },
    explorer: {
        name: constants_1.FOREMAN_AGENT_ROSTER.explorer,
        model: 'gpt-5.4-mini',
        variant: 'medium',
    },
    'code specialist': {
        name: constants_1.FOREMAN_AGENT_ROSTER.codeSpecialist,
        model: 'gpt-5.3-codex',
        variant: 'high',
    },
    verifier: {
        name: constants_1.FOREMAN_AGENT_ROSTER.verifier,
        model: 'gpt-5.4',
        variant: 'medium',
    },
};
const DEFAULT_FOREMAN_COMPANION_AGENT_SETTINGS = {
    companion_reader: {
        name: 'companion_reader',
        model: 'gpt-5.4-mini',
        variant: 'medium',
    },
    companion_operator: {
        name: 'companion_operator',
        model: 'gpt-5.4-mini',
        variant: 'medium',
    },
};
function createEmptyRoleDefaults() {
    return {
        version: 1,
        role_defaults: {
            planner: {
                profile: null,
                config_entries: [],
            },
            explorer: {
                profile: null,
                config_entries: [],
            },
            'code specialist': {
                profile: null,
                config_entries: [],
            },
            verifier: {
                profile: null,
                config_entries: [],
            },
        },
    };
}
function createDefaultForemanAgentConfig(role) {
    const defaults = DEFAULT_FOREMAN_AGENT_SETTINGS[role];
    const configEntries = role === 'code specialist' ? ['approval_policy=never', 'sandbox_mode=workspace-write'] : [];
    return {
        name: defaults.name,
        profile: null,
        model: defaults.model,
        variant: defaults.variant,
        config_entries: configEntries,
    };
}
function createDefaultForemanCompanionAgentConfig(role) {
    const defaults = DEFAULT_FOREMAN_COMPANION_AGENT_SETTINGS[role];
    return {
        name: defaults.name,
        profile: null,
        model: defaults.model,
        variant: defaults.variant,
        config_entries: [],
    };
}
function createDefaultForemanEntryPolicy() {
    return {
        mode: 'codex_cli_foreman_first',
    };
}
function createDefaultForemanOutputConfig() {
    return {
        verbosity: 'default',
    };
}
function createDefaultForemanRuntimeConfig() {
    return {
        worker_poll_interval_ms: 90_000,
    };
}
function createDefaultForemanArchiveTargetsConfig() {
    return {
        notebooklm: {
            enabled: false,
            mode: 'repo_workspace',
            auth_mode: 'browser',
            repo_key: null,
            auto_create_notebook: false,
            local_archive_root: '.foreman/archive/notebooklm',
            notebook_url: null,
            notebook_id: null,
            secret_ref: null,
        },
    };
}
function createDefaultForemanConfig() {
    return {
        version: 1,
        entry_policy: createDefaultForemanEntryPolicy(),
        output: createDefaultForemanOutputConfig(),
        runtime: createDefaultForemanRuntimeConfig(),
        archive_targets: createDefaultForemanArchiveTargetsConfig(),
        tool_routing: (0, tool_routing_1.createDefaultForemanToolRoutingConfig)(),
        agents: {
            orchestrator: createDefaultForemanAgentConfig('orchestrator'),
            planner: createDefaultForemanAgentConfig('planner'),
            explorer: createDefaultForemanAgentConfig('explorer'),
            'code specialist': createDefaultForemanAgentConfig('code specialist'),
            verifier: createDefaultForemanAgentConfig('verifier'),
        },
        companion_agents: {
            companion_reader: createDefaultForemanCompanionAgentConfig('companion_reader'),
            companion_operator: createDefaultForemanCompanionAgentConfig('companion_operator'),
        },
    };
}
function normalizeAgentConfigEntries(model, variant, configEntries) {
    const filteredEntries = configEntries.filter((entry) => {
        if (model !== null && entry.startsWith('model=')) {
            return false;
        }
        if (variant !== null && entry.startsWith('model_reasoning_effort=')) {
            return false;
        }
        return true;
    });
    const normalizedEntries = [];
    if (model !== null) {
        normalizedEntries.push(`model=${model}`);
    }
    if (variant !== null) {
        normalizedEntries.push(`model_reasoning_effort=${variant}`);
    }
    normalizedEntries.push(...filteredEntries);
    return normalizedEntries;
}
function createRequestSettingsFromForemanAgentConfig(agentConfig) {
    return {
        profile: agentConfig.profile,
        config_entries: normalizeAgentConfigEntries(agentConfig.model, agentConfig.variant, agentConfig.config_entries),
    };
}
function getDefaultForemanAgentConfigForRole(role) {
    const defaults = createDefaultForemanConfig().agents;
    switch (role) {
        case 'orchestrator':
            return defaults.orchestrator;
        case 'planner':
            return defaults.planner;
        case 'explorer':
            return defaults.explorer ?? defaults.planner;
        case 'code specialist':
            return defaults['code specialist'];
        case 'verifier':
            return defaults.verifier;
    }
}
function getRunActiveAgentIdForRole(role) {
    switch (role) {
        case 'orchestrator':
            return constants_1.FOREMAN_AGENT_ROSTER.orchestrator;
        case 'planner':
            return constants_1.FOREMAN_PLANNER_AGENT_ID;
        case 'explorer':
            return constants_1.FOREMAN_EXPLORER_AGENT_ID;
        case 'code specialist':
            return constants_1.FOREMAN_CODE_SPECIALIST_AGENT_ID;
        case 'verifier':
            return constants_1.FOREMAN_VERIFIER_AGENT_ID;
        default:
            return null;
    }
}
function getForemanAgentConfigForRole(foremanConfig, role) {
    const applyRoleDefaults = (config) => {
        if (role !== 'code specialist') {
            return config;
        }
        const nextConfigEntries = [...config.config_entries];
        if (!nextConfigEntries.some((entry) => entry.startsWith('approval_policy='))) {
            nextConfigEntries.push('approval_policy=never');
        }
        if (!nextConfigEntries.some((entry) => entry.startsWith('sandbox=') || entry.startsWith('sandbox_mode='))) {
            nextConfigEntries.push('sandbox_mode=workspace-write');
        }
        if (nextConfigEntries.length === config.config_entries.length) {
            return config;
        }
        return {
            ...config,
            config_entries: nextConfigEntries,
        };
    };
    switch (role) {
        case 'orchestrator':
            return foremanConfig.agents.orchestrator;
        case 'planner':
            return foremanConfig.agents.planner;
        case 'explorer':
            return foremanConfig.agents.explorer ?? getDefaultForemanAgentConfigForRole('explorer');
        case 'code specialist':
            return applyRoleDefaults(foremanConfig.agents['code specialist']);
        case 'verifier':
            return foremanConfig.agents.verifier;
    }
}
function getAssignedRoleForTaskKind(taskKind) {
    switch (taskKind) {
        case 'plan':
            return 'planner';
        case 'explore':
            return 'explorer';
        case 'review':
            return 'verifier';
        case 'execution':
        default:
            return 'code specialist';
    }
}
function getAgentIdForRole(role) {
    switch (role) {
        case 'orchestrator':
            return constants_1.FOREMAN_AGENT_ROSTER.orchestrator;
        case 'planner':
            return constants_1.FOREMAN_PLANNER_AGENT_ID;
        case 'explorer':
            return constants_1.FOREMAN_EXPLORER_AGENT_ID;
        case 'code specialist':
            return constants_1.FOREMAN_CODE_SPECIALIST_AGENT_ID;
        case 'verifier':
            return constants_1.FOREMAN_VERIFIER_AGENT_ID;
    }
}
function createTaskRoleConfigSnapshot(role, foremanConfig = createDefaultForemanConfig()) {
    const agentConfig = getForemanAgentConfigForRole(foremanConfig, role);
    const requestSettings = createRequestSettingsFromForemanAgentConfig(agentConfig);
    return {
        source: 'shared_role_config',
        role,
        profile: requestSettings.profile,
        model: agentConfig.model,
        variant: agentConfig.variant,
        config_entries: [...requestSettings.config_entries],
    };
}
function deriveTaskModelTierIntent(roleConfigSnapshot) {
    const model = roleConfigSnapshot.model?.toLowerCase() ?? '';
    if (roleConfigSnapshot.role === 'orchestrator' ||
        roleConfigSnapshot.role === 'verifier' ||
        roleConfigSnapshot.variant === 'high' ||
        roleConfigSnapshot.variant === 'xhigh') {
        return 'high_tier';
    }
    if (roleConfigSnapshot.role === 'planner' || roleConfigSnapshot.role === 'explorer' || model.includes('mini')) {
        return 'low_cost';
    }
    return 'standard';
}
function deriveTaskChildAggregationContract(nodeKind) {
    return nodeKind === 'fan_in' ? 'explicit_fan_in_summary' : 'none';
}
function deriveTaskFanInBarrierSemantics(nodeKind, fanInFromTaskCardIds) {
    return nodeKind === 'fan_in' && fanInFromTaskCardIds.length > 0 ? 'explicit_wait_for_all_sources' : 'none';
}
function deriveTaskOrchestratorReviewGate(nodeKind, fanInFromTaskCardIds) {
    return nodeKind === 'fan_in' && fanInFromTaskCardIds.length > 0 ? 'after_child_completion' : 'none';
}
function extractDedicatedAgentSettings(configEntries) {
    let model = null;
    let variant = null;
    const passthroughEntries = [];
    for (const entry of configEntries) {
        if (entry.startsWith('model=')) {
            model = entry.slice('model='.length) || null;
            continue;
        }
        if (entry.startsWith('model_reasoning_effort=')) {
            const candidate = entry.slice('model_reasoning_effort='.length);
            if (candidate === 'low' || candidate === 'medium' || candidate === 'high' || candidate === 'xhigh') {
                variant = candidate;
                continue;
            }
        }
        passthroughEntries.push(entry);
    }
    return {
        model,
        variant,
        configEntries: passthroughEntries,
    };
}
function deriveRoleDefaultsFromForemanConfig(config) {
    return {
        version: 1,
        role_defaults: {
            planner: createRequestSettingsFromForemanAgentConfig(config.agents.planner),
            explorer: createRequestSettingsFromForemanAgentConfig(config.agents.explorer ?? createDefaultForemanConfig().agents.explorer),
            'code specialist': createRequestSettingsFromForemanAgentConfig(config.agents['code specialist']),
            verifier: createRequestSettingsFromForemanAgentConfig(config.agents.verifier),
        },
    };
}
function createForemanConfigFromRoleDefaults(roleDefaults) {
    const config = createDefaultForemanConfig();
    for (const role of ['planner', 'explorer', 'code specialist', 'verifier']) {
        const legacySettings = roleDefaults.role_defaults[role];
        if (!legacySettings) {
            continue;
        }
        const extractedSettings = extractDedicatedAgentSettings(legacySettings.config_entries);
        const baseAgentConfig = role === 'explorer'
            ? (config.agents.explorer ?? createDefaultForemanConfig().agents.explorer)
            : config.agents[role];
        config.agents[role] = {
            ...baseAgentConfig,
            profile: legacySettings.profile,
            model: extractedSettings.model,
            variant: extractedSettings.variant,
            config_entries: extractedSettings.configEntries,
        };
    }
    return config;
}
function normalizeForemanConfigCandidate(candidate) {
    if (!isRecord(candidate)) {
        return candidate;
    }
    const defaultConfig = createDefaultForemanConfig();
    const candidateAgents = isRecord(candidate.agents) ? candidate.agents : null;
    const candidateCodeSpecialist = candidateAgents && isRecord(candidateAgents['code specialist']) ? candidateAgents['code specialist'] : null;
    const shouldMigrateLegacyCodeSpecialistDefault = candidateCodeSpecialist &&
        candidateCodeSpecialist.model === 'gpt-5.4-mini' &&
        candidateCodeSpecialist.variant === 'medium' &&
        Array.isArray(candidateCodeSpecialist.config_entries) &&
        candidateCodeSpecialist.config_entries.every((entry) => entry === 'model=gpt-5.4-mini' ||
            entry === 'model_reasoning_effort=medium' ||
            entry === 'approval_policy=never');
    const output = isRecord(candidate.output) &&
        (candidate.output.verbosity === 'quiet' ||
            candidate.output.verbosity === 'default' ||
            candidate.output.verbosity === 'debug')
        ? candidate.output
        : createDefaultForemanOutputConfig();
    const runtime = isRecord(candidate.runtime) &&
        typeof candidate.runtime.worker_poll_interval_ms === 'number' &&
        Number.isFinite(candidate.runtime.worker_poll_interval_ms) &&
        candidate.runtime.worker_poll_interval_ms > 0
        ? {
            worker_poll_interval_ms: Math.trunc(candidate.runtime.worker_poll_interval_ms),
        }
        : createDefaultForemanRuntimeConfig();
    const candidateArchiveTargets = isRecord(candidate.archive_targets) ? candidate.archive_targets : null;
    const candidateNotebookLmArchiveTarget = candidateArchiveTargets && isRecord(candidateArchiveTargets.notebooklm) ? candidateArchiveTargets.notebooklm : null;
    const defaultArchiveTargets = createDefaultForemanArchiveTargetsConfig();
    const archiveTargets = {
        notebooklm: candidateNotebookLmArchiveTarget
            ? {
                enabled: typeof candidateNotebookLmArchiveTarget.enabled === 'boolean'
                    ? candidateNotebookLmArchiveTarget.enabled
                    : defaultArchiveTargets.notebooklm.enabled,
                mode: candidateNotebookLmArchiveTarget.mode === 'repo_workspace'
                    ? 'repo_workspace'
                    : defaultArchiveTargets.notebooklm.mode,
                auth_mode: candidateNotebookLmArchiveTarget.auth_mode === 'browser'
                    ? 'browser'
                    : defaultArchiveTargets.notebooklm.auth_mode,
                repo_key: typeof candidateNotebookLmArchiveTarget.repo_key === 'string' || candidateNotebookLmArchiveTarget.repo_key === null
                    ? candidateNotebookLmArchiveTarget.repo_key
                    : defaultArchiveTargets.notebooklm.repo_key,
                auto_create_notebook: typeof candidateNotebookLmArchiveTarget.auto_create_notebook === 'boolean'
                    ? candidateNotebookLmArchiveTarget.auto_create_notebook
                    : defaultArchiveTargets.notebooklm.auto_create_notebook,
                local_archive_root: typeof candidateNotebookLmArchiveTarget.local_archive_root === 'string' &&
                    candidateNotebookLmArchiveTarget.local_archive_root.trim().length > 0
                    ? candidateNotebookLmArchiveTarget.local_archive_root
                    : defaultArchiveTargets.notebooklm.local_archive_root,
                notebook_url: typeof candidateNotebookLmArchiveTarget.notebook_url === 'string' ||
                    candidateNotebookLmArchiveTarget.notebook_url === null
                    ? candidateNotebookLmArchiveTarget.notebook_url
                    : defaultArchiveTargets.notebooklm.notebook_url,
                notebook_id: typeof candidateNotebookLmArchiveTarget.notebook_id === 'string' ||
                    candidateNotebookLmArchiveTarget.notebook_id === null
                    ? candidateNotebookLmArchiveTarget.notebook_id
                    : defaultArchiveTargets.notebooklm.notebook_id,
                secret_ref: typeof candidateNotebookLmArchiveTarget.secret_ref === 'string' ||
                    candidateNotebookLmArchiveTarget.secret_ref === null
                    ? candidateNotebookLmArchiveTarget.secret_ref
                    : defaultArchiveTargets.notebooklm.secret_ref,
            }
            : defaultArchiveTargets.notebooklm,
    };
    return {
        ...candidate,
        entry_policy: isRecord(candidate.entry_policy) ? candidate.entry_policy : createDefaultForemanEntryPolicy(),
        output,
        runtime,
        archive_targets: archiveTargets,
        tool_routing: (0, tool_routing_1.normalizeForemanToolRoutingConfig)(candidate.tool_routing),
        agents: candidateAgents
            ? {
                ...candidateAgents,
                explorer: Object.prototype.hasOwnProperty.call(candidateAgents, 'explorer')
                    ? candidateAgents.explorer
                    : defaultConfig.agents.explorer,
                'code specialist': shouldMigrateLegacyCodeSpecialistDefault
                    ? defaultConfig.agents['code specialist']
                    : candidateAgents['code specialist'],
            }
            : candidate.agents,
        companion_agents: isRecord(candidate.companion_agents)
            ? {
                companion_reader: isRecord(candidate.companion_agents.companion_reader)
                    ? candidate.companion_agents.companion_reader
                    : defaultConfig.companion_agents?.companion_reader,
                companion_operator: isRecord(candidate.companion_agents.companion_operator)
                    ? candidate.companion_agents.companion_operator
                    : defaultConfig.companion_agents?.companion_operator,
            }
            : defaultConfig.companion_agents,
    };
}
async function loadWorkspaceForemanConfigIfPresent(baseDirectory) {
    const workspaceForemanConfigFile = node_path_1.default.join(baseDirectory, 'foreman-config.json');
    let configCandidate;
    try {
        configCandidate = await readJsonDocument(workspaceForemanConfigFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load workspace Foreman config from ${workspaceForemanConfigFile}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        const normalizedCandidate = normalizeForemanConfigCandidate(configCandidate);
        (0, validation_1.assertValidForemanConfigFile)(normalizedCandidate);
        return normalizedCandidate;
    }
    catch (error) {
        throw new Error(`Workspace Foreman config at ${workspaceForemanConfigFile} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
}
async function loadLegacyRoleDefaultsIfPresent(baseDirectory) {
    const roleDefaultsFile = node_path_1.default.join(baseDirectory, '.foreman', 'role-defaults.json');
    let roleDefaultsCandidate;
    try {
        roleDefaultsCandidate = await readJsonDocument(roleDefaultsFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load workspace role defaults from ${roleDefaultsFile}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        (0, validation_1.assertValidRoleDefaultsFile)(roleDefaultsCandidate);
    }
    catch (error) {
        throw new Error(`Workspace role defaults at ${roleDefaultsFile} are invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
    return roleDefaultsCandidate;
}
function createDefaultAlwaysOnModeRecord(runId) {
    return {
        version: 1,
        run_id: runId,
        status: 'disabled',
        enabled: false,
        updated_at: null,
        last_started_at: null,
        last_stopped_at: null,
        summary: 'Always-on companion mode is disabled. Use an explicit start action to opt in.',
        fallback_entrypoints: ['explicit_cli', 'explicit_mcp'],
        last_tick_at: null,
        last_companion_loop: null,
    };
}
async function loadAlwaysOnModeRecord(paths) {
    const runId = node_path_1.default.basename(paths.runDir);
    try {
        const candidate = await readJsonDocument(paths.alwaysOnModeFile);
        if (!isRecord(candidate) ||
            candidate.version !== 1 ||
            candidate.run_id !== runId ||
            (candidate.status !== 'enabled' && candidate.status !== 'disabled') ||
            typeof candidate.enabled !== 'boolean' ||
            !Array.isArray(candidate.fallback_entrypoints)) {
            throw new Error('invalid always-on mode record');
        }
        return {
            version: 1,
            run_id: runId,
            status: candidate.status,
            enabled: candidate.enabled,
            updated_at: typeof candidate.updated_at === 'string' ? candidate.updated_at : null,
            last_started_at: typeof candidate.last_started_at === 'string' ? candidate.last_started_at : null,
            last_stopped_at: typeof candidate.last_stopped_at === 'string' ? candidate.last_stopped_at : null,
            summary: typeof candidate.summary === 'string' ? candidate.summary : createDefaultAlwaysOnModeRecord(String(candidate.run_id)).summary,
            fallback_entrypoints: candidate.fallback_entrypoints[0] === 'explicit_cli' && candidate.fallback_entrypoints[1] === 'explicit_mcp'
                ? ['explicit_cli', 'explicit_mcp']
                : ['explicit_cli', 'explicit_mcp'],
            last_tick_at: typeof candidate.last_tick_at === 'string' ? candidate.last_tick_at : null,
            last_companion_loop: isRecord(candidate.last_companion_loop) &&
                typeof candidate.last_companion_loop.started_at === 'string' &&
                typeof candidate.last_companion_loop.completed_at === 'string' &&
                typeof candidate.last_companion_loop.iteration_count === 'number' &&
                typeof candidate.last_companion_loop.tick_count === 'number' &&
                typeof candidate.last_companion_loop.stop_reason === 'string' &&
                typeof candidate.last_companion_loop.summary === 'string'
                ? {
                    started_at: candidate.last_companion_loop.started_at,
                    completed_at: candidate.last_companion_loop.completed_at,
                    iteration_count: candidate.last_companion_loop.iteration_count,
                    tick_count: candidate.last_companion_loop.tick_count,
                    stop_reason: candidate.last_companion_loop.stop_reason,
                    summary: candidate.last_companion_loop.summary,
                }
                : null,
        };
    }
    catch {
        return createDefaultAlwaysOnModeRecord(runId);
    }
}
async function persistAlwaysOnModeRecord(paths, record) {
    await (0, promises_1.mkdir)(paths.sisyphusRunsDir, { recursive: true });
    await writeJsonDocument(paths.alwaysOnModeFile, record);
}
async function loadForemanConfig(baseDirectory) {
    const foremanConfigFile = resolveForemanConfigFilePath();
    let configCandidate;
    try {
        configCandidate = await readJsonDocument(foremanConfigFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return (await loadWorkspaceForemanConfigIfPresent(baseDirectory)) ?? createDefaultForemanConfig();
        }
        throw new Error(`Unable to load shared Foreman config from ${foremanConfigFile}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        const normalizedCandidate = normalizeForemanConfigCandidate(configCandidate);
        (0, validation_1.assertValidForemanConfigFile)(normalizedCandidate);
        return normalizedCandidate;
    }
    catch (error) {
        throw new Error(`Shared Foreman config at ${foremanConfigFile} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
}
async function ensureForemanConfig(baseDirectory) {
    const configPath = resolveForemanConfigFilePath();
    let configCandidate;
    try {
        configCandidate = await readJsonDocument(configPath);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            const workspaceForemanConfig = await loadWorkspaceForemanConfigIfPresent(baseDirectory);
            const legacyRoleDefaults = await loadLegacyRoleDefaultsIfPresent(baseDirectory);
            const config = workspaceForemanConfig ??
                (legacyRoleDefaults === null ? createDefaultForemanConfig() : createForemanConfigFromRoleDefaults(legacyRoleDefaults));
            await (0, promises_1.mkdir)(node_path_1.default.dirname(configPath), { recursive: true });
            await writeJsonDocument(configPath, config);
            return {
                configPath,
                configCreated: true,
                config,
            };
        }
        throw new Error(`Unable to load shared Foreman config from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        const normalizedCandidate = normalizeForemanConfigCandidate(configCandidate);
        (0, validation_1.assertValidForemanConfigFile)(normalizedCandidate);
        if (JSON.stringify(configCandidate) !== JSON.stringify(normalizedCandidate)) {
            await (0, promises_1.mkdir)(node_path_1.default.dirname(configPath), { recursive: true });
            await writeJsonDocument(configPath, normalizedCandidate);
        }
        return {
            configPath,
            configCreated: false,
            config: normalizedCandidate,
        };
    }
    catch (error) {
        throw new Error(`Shared Foreman config at ${configPath} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
}
async function loadRoleDefaults(baseDirectory) {
    const foremanConfigFile = resolveForemanConfigFilePath();
    try {
        const foremanConfigCandidate = await readJsonDocument(foremanConfigFile);
        try {
            const normalizedCandidate = normalizeForemanConfigCandidate(foremanConfigCandidate);
            (0, validation_1.assertValidForemanConfigFile)(normalizedCandidate);
            return deriveRoleDefaultsFromForemanConfig(normalizedCandidate);
        }
        catch (error) {
            throw new Error(`Shared Foreman config at ${foremanConfigFile} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
        }
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            const workspaceForemanConfig = await loadWorkspaceForemanConfigIfPresent(baseDirectory);
            if (workspaceForemanConfig !== null) {
                return deriveRoleDefaultsFromForemanConfig(workspaceForemanConfig);
            }
            // Fall back to the legacy role-defaults file when the shared config is absent.
        }
        else if (error instanceof Error && error.message.includes('Foreman config')) {
            throw error;
        }
        else if (error instanceof Error) {
            throw new Error(`Unable to load shared Foreman config from ${foremanConfigFile}: ${error.message}`);
        }
        else {
            throw new Error(`Unable to load shared Foreman config from ${foremanConfigFile}: Unknown error.`);
        }
    }
    return (await loadLegacyRoleDefaultsIfPresent(baseDirectory)) ?? createEmptyRoleDefaults();
}
async function ensureRunPaths(paths) {
    await (0, promises_1.mkdir)(paths.plannerDir, { recursive: true });
    await (0, promises_1.mkdir)(paths.plannerAttemptsDir, { recursive: true });
    await (0, promises_1.mkdir)(paths.exploreArtifactsDir, { recursive: true });
    await (0, promises_1.mkdir)(paths.taskCardsDir, { recursive: true });
    await (0, promises_1.mkdir)(paths.handoffsDir, { recursive: true });
    await (0, promises_1.mkdir)(paths.rawEventsDir, { recursive: true });
}
function createPlannerAttemptPaths(paths, attemptId) {
    const attemptDir = node_path_1.default.join(paths.plannerAttemptsDir, attemptId);
    return {
        attemptId,
        attemptDir,
        planningArtifactFile: node_path_1.default.join(attemptDir, 'planning.json'),
        planUpdateArtifactFile: node_path_1.default.join(attemptDir, 'plan-update.json'),
        planningStdoutFile: node_path_1.default.join(attemptDir, 'stdout.txt'),
        planningStderrFile: node_path_1.default.join(attemptDir, 'stderr.txt'),
    };
}
async function ensurePlannerAttemptPaths(paths) {
    await (0, promises_1.mkdir)(paths.attemptDir, { recursive: true });
}
async function allocateAttemptId(directory, entryPattern) {
    let entries = [];
    try {
        entries = await (0, promises_1.readdir)(directory);
    }
    catch {
        entries = [];
    }
    let maxAttemptNumber = 0;
    for (const entry of entries) {
        const match = entryPattern.exec(entry);
        if (!match) {
            continue;
        }
        const attemptValue = match[1];
        if (!attemptValue) {
            continue;
        }
        const attemptNumber = Number.parseInt(attemptValue, 10);
        if (Number.isNaN(attemptNumber)) {
            continue;
        }
        maxAttemptNumber = Math.max(maxAttemptNumber, attemptNumber);
    }
    return `attempt-${String(maxAttemptNumber + 1).padStart(4, '0')}`;
}
async function allocatePlannerAttemptId(paths) {
    return allocateAttemptId(paths.plannerAttemptsDir, /^attempt-(\d+)$/);
}
async function allocateDelegationId(paths) {
    const attemptId = await allocateAttemptId(paths.delegationsDir, /^delegation-(\d+)\.json$/);
    return attemptId.replace(/^attempt-/, 'delegation-');
}
async function allocateOrchestrationAttemptId(paths) {
    return allocateAttemptId(paths.orchestrationAttemptsDir, /^attempt-(\d+)\.json$/);
}
function createDelegationArtifactFilePath(paths, delegationId) {
    return node_path_1.default.join(paths.delegationsDir, `${delegationId}.json`);
}
function createDelegationWorkerResultFilePath(paths, delegationId) {
    return node_path_1.default.join(paths.delegationsDir, `${delegationId}.result.json`);
}
async function loadDelegationArtifact(paths, delegationId) {
    const candidate = await readJsonDocument(createDelegationArtifactFilePath(paths, delegationId));
    return normalizeLoadedDelegationRecord(candidate);
}
async function readDirectoryEntriesIfPresent(directoryPath) {
    try {
        return await (0, promises_1.readdir)(directoryPath);
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
}
function listArtifactIds(entries, pattern) {
    return entries
        .map((entry) => {
        const match = pattern.exec(entry);
        return match ? match[0].replace(/\.json$/, '') : null;
    })
        .filter((entry) => entry !== null)
        .sort((left, right) => left.localeCompare(right));
}
async function listDelegationArtifactIds(paths) {
    const delegationEntries = await readDirectoryEntriesIfPresent(paths.delegationsDir);
    return listArtifactIds(delegationEntries, /^delegation-(\d+)\.json$/);
}
async function loadDelegationArtifacts(paths) {
    const delegationIds = await listDelegationArtifactIds(paths);
    return Promise.all(delegationIds.map(async (delegationId) => loadDelegationArtifact(paths, delegationId)));
}
function countTaskDelegationsByStatus(delegations, status) {
    return delegations.filter((delegation) => delegation.child_agent.status === status).length;
}
function rebuildDelegationVisibilitySnapshots(delegations) {
    return delegations.reduce((snapshots, delegation) => ({
        child_agents: upsertChildAgentSnapshot(snapshots.child_agents, delegation.child_agent),
        specialist_executors: upsertSpecialistExecutorSnapshot(snapshots.specialist_executors, delegation.executor),
    }), {
        child_agents: [],
        specialist_executors: [],
    });
}
function summarizeTaskDelegations(taskCardId, delegations) {
    const taskDelegations = delegations.filter((delegation) => delegation.task_card_id === taskCardId);
    const queued = countTaskDelegationsByStatus(taskDelegations, 'queued');
    const running = countTaskDelegationsByStatus(taskDelegations, 'running');
    const active_delegations = taskDelegations.filter((delegation) => delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running');
    return {
        task_card_id: taskCardId,
        total: taskDelegations.length,
        active: active_delegations.length,
        queued,
        running,
        completed: countTaskDelegationsByStatus(taskDelegations, 'completed'),
        failed: countTaskDelegationsByStatus(taskDelegations, 'failed'),
        cancelled: countTaskDelegationsByStatus(taskDelegations, 'cancelled'),
        delegations: taskDelegations,
        active_delegations,
    };
}
async function loadTaskDelegationSummary(paths, taskCardId) {
    return summarizeTaskDelegations(taskCardId, await loadDelegationArtifacts(paths));
}
async function persistDelegationArtifact(paths, delegation) {
    assertDelegationExecutorIntegrity(delegation);
    (0, validation_1.assertValidDelegationRecord)(delegation);
    await (0, promises_1.mkdir)(paths.delegationsDir, { recursive: true });
    await writeJsonDocument(createDelegationArtifactFilePath(paths, delegation.delegation_id), delegation);
    if (delegation.worker_result !== null) {
        await writeJsonDocument(createDelegationWorkerResultFilePath(paths, delegation.delegation_id), {
            version: 1,
            run_id: delegation.run_id,
            task_card_id: delegation.task_card_id,
            delegation_id: delegation.delegation_id,
            child_agent_status: delegation.child_agent.status,
            executor_status: delegation.executor.status,
            result_summary: delegation.result_summary,
            latest_failure: delegation.latest_failure,
            worker_result: delegation.worker_result,
            recorded_at: delegation.worker_result.recorded_at ?? delegation.updated_at,
        });
    }
}
async function persistDelegationWithVisibilitySync(paths, delegation) {
    assertDelegationExecutorIntegrity(delegation);
    (0, validation_1.assertValidDelegationRecord)(delegation);
    const { run, taskCard, latestHandoff, orchestratorState } = await loadRunContext(paths);
    if (delegation.run_id !== run.run_id) {
        throw new Error(`Delegation integrity mismatch: delegation run_id ${delegation.run_id} does not match run.json run_id ${run.run_id}.`);
    }
    if (delegation.task_card_id !== taskCard.task_card_id) {
        throw new Error(`Delegation integrity mismatch: delegation task_card_id ${delegation.task_card_id} does not match active task-card ${taskCard.task_card_id}.`);
    }
    if (delegation.child_agent.task_card_id !== null && delegation.child_agent.task_card_id !== delegation.task_card_id) {
        throw new Error(`Delegation integrity mismatch: child_agent.task_card_id ${delegation.child_agent.task_card_id} does not match delegation task_card_id ${delegation.task_card_id}.`);
    }
    await persistDelegationArtifact(paths, delegation);
    const delegationArtifacts = await loadDelegationArtifacts(paths);
    const taskDelegationSummary = summarizeTaskDelegations(taskCard.task_card_id, delegationArtifacts);
    ({ child_agents: run.child_agents, specialist_executors: run.specialist_executors } =
        rebuildDelegationVisibilitySnapshots(delegationArtifacts));
    run.updated_at = delegation.updated_at;
    const nextDecision = (0, orchestrator_1.decideOrchestratorNextStep)(run, taskCard, {
        verificationRequestAvailable: orchestratorState.verification_request !== null,
        orchestrationPolicy: orchestratorState.orchestration_policy,
        activeTaskDelegationCounts: taskDelegationSummary,
    });
    setOrchestratorDecision(orchestratorState, nextDecision);
    (0, validation_1.assertValidRunRecord)(run);
    await Promise.all([
        persistRunRecord(paths, run),
        persistOrchestratorState(paths, orchestratorState),
        writeJsonDocument(paths.visibilityFile, createVisibilityProjection(run, taskCard, latestHandoff, nextDecision)),
    ]);
    await persistPlanningChecklistFromContext(paths, {
        run,
        taskCards: [taskCard],
        activeTaskCard: taskCard,
        orchestratorDecision: nextDecision,
        taskDelegations: delegationArtifacts,
    });
    await writeDerivedProgressDoc(paths);
}
async function updateDelegationWithVisibilitySync(paths, input) {
    const delegation = await loadDelegationArtifact(paths, input.delegationId);
    assertDelegationTransitionAllowed(delegation.child_agent.status, input.status);
    const timestamp = nowTimestamp();
    delegation.child_agent.status = input.status;
    delegation.executor.status = input.status;
    delegation.updated_at = timestamp;
    switch (input.status) {
        case 'running': {
            if (input.resultSummary || input.failureStage || input.failureReason || input.failureSummary) {
                throw new Error('Delegation status running does not accept result_summary or failure fields.');
            }
            delegation.result_summary = null;
            delegation.worker_launch_evidence = input.workerLaunchEvidence ?? delegation.worker_launch_evidence ?? null;
            delegation.worker_policy_decision = input.workerPolicyDecision ?? delegation.worker_policy_decision ?? null;
            delegation.worker_result = null;
            delegation.reviewer_outcome = null;
            delegation.latest_failure = null;
            delegation.completed_at = null;
            delegation.worker_lifecycle = {
                ...(delegation.worker_lifecycle ??
                    createDelegationWorkerLifecycleRecord({
                        createdAt: delegation.created_at,
                    })),
                state: 'running',
                reclaim_state: 'not_needed',
                launch_requested_at: delegation.worker_lifecycle?.launch_requested_at ?? delegation.updated_at,
                started_at: delegation.worker_lifecycle?.started_at ?? timestamp,
                last_progress_at: timestamp,
                stale_at: null,
                timed_out_at: null,
                returned_at: null,
                summary: summarizeWorkerLifecycleState('running'),
            };
            break;
        }
        case 'completed':
        case 'cancelled': {
            if (!input.resultSummary) {
                throw new Error(`Delegation status ${input.status} requires result_summary.`);
            }
            if (input.failureStage || input.failureReason || input.failureSummary) {
                throw new Error(`Delegation status ${input.status} does not accept failure fields.`);
            }
            if (input.reviewerOutcome && delegation.child_agent.role !== 'verifier') {
                throw new Error('Only verifier-role delegations may persist reviewer_outcome data.');
            }
            delegation.result_summary = input.resultSummary;
            delegation.worker_launch_evidence = input.workerLaunchEvidence ?? delegation.worker_launch_evidence ?? null;
            delegation.worker_policy_decision = input.workerPolicyDecision ?? delegation.worker_policy_decision ?? null;
            delegation.worker_result = input.workerResult ?? null;
            delegation.reviewer_outcome = input.status === 'completed' ? input.reviewerOutcome ?? null : null;
            delegation.latest_failure = null;
            delegation.completed_at = timestamp;
            delegation.worker_lifecycle = {
                ...(delegation.worker_lifecycle ??
                    createDelegationWorkerLifecycleRecord({
                        createdAt: delegation.created_at,
                    })),
                state: input.status === 'completed' ? 'returned' : 'cancelled',
                reclaim_state: input.status === 'completed' ? 'resumable' : 'not_needed',
                launch_requested_at: delegation.worker_lifecycle?.launch_requested_at ?? delegation.updated_at,
                started_at: delegation.worker_lifecycle?.started_at ?? delegation.updated_at,
                last_progress_at: timestamp,
                stale_at: null,
                timed_out_at: null,
                returned_at: timestamp,
                summary: summarizeWorkerLifecycleState(input.status === 'completed' ? 'returned' : 'cancelled'),
            };
            break;
        }
        case 'failed': {
            if (!input.resultSummary) {
                throw new Error('Delegation status failed requires result_summary.');
            }
            if (!input.failureStage || !input.failureReason || !input.failureSummary) {
                throw new Error('Delegation status failed requires failure_stage, failure_reason, and failure_summary.');
            }
            if (input.reviewerOutcome) {
                throw new Error('Delegation status failed does not accept reviewer_outcome.');
            }
            delegation.result_summary = input.resultSummary;
            delegation.worker_launch_evidence = input.workerLaunchEvidence ?? delegation.worker_launch_evidence ?? null;
            delegation.worker_policy_decision = input.workerPolicyDecision ?? delegation.worker_policy_decision ?? null;
            delegation.worker_result = input.workerResult ?? null;
            delegation.reviewer_outcome = null;
            delegation.latest_failure = {
                stage: input.failureStage,
                reason: input.failureReason,
                summary: input.failureSummary,
                recorded_at: timestamp,
            };
            delegation.completed_at = timestamp;
            delegation.worker_lifecycle = {
                ...(delegation.worker_lifecycle ??
                    createDelegationWorkerLifecycleRecord({
                        createdAt: delegation.created_at,
                    })),
                state: 'failed',
                reclaim_state: 'not_needed',
                launch_requested_at: delegation.worker_lifecycle?.launch_requested_at ?? delegation.updated_at,
                started_at: delegation.worker_lifecycle?.started_at ?? delegation.updated_at,
                last_progress_at: timestamp,
                stale_at: null,
                timed_out_at: null,
                returned_at: timestamp,
                summary: summarizeWorkerLifecycleState('failed'),
            };
            break;
        }
    }
    await persistDelegationWithVisibilitySync(paths, delegation);
    return delegation;
}
async function markDelegationLaunchingWithVisibilitySync(paths, input) {
    const delegation = await loadDelegationArtifact(paths, input.delegationId);
    if (delegation.child_agent.status !== 'queued') {
        throw new Error(`Only queued delegations may enter the launching checkpoint; current status is ${delegation.child_agent.status}.`);
    }
    const timestamp = nowTimestamp();
    delegation.updated_at = timestamp;
    delegation.worker_launch_evidence = input.workerLaunchEvidence ?? delegation.worker_launch_evidence ?? null;
    delegation.worker_policy_decision = input.workerPolicyDecision ?? delegation.worker_policy_decision ?? null;
    delegation.worker_lifecycle = {
        ...(delegation.worker_lifecycle ??
            createDelegationWorkerLifecycleRecord({
                createdAt: delegation.created_at,
            })),
        state: 'launching',
        reclaim_state: 'not_needed',
        launch_requested_at: timestamp,
        last_progress_at: timestamp,
        stale_at: null,
        timed_out_at: null,
        summary: summarizeWorkerLifecycleState('launching'),
    };
    await persistDelegationWithVisibilitySync(paths, delegation);
    return delegation;
}
async function updateDelegationPolicyDecisionWithVisibilitySync(paths, input) {
    const delegation = await loadDelegationArtifact(paths, input.delegationId);
    delegation.updated_at = nowTimestamp();
    delegation.worker_policy_decision = input.workerPolicyDecision ?? delegation.worker_policy_decision ?? null;
    delegation.worker_launch_evidence = input.workerLaunchEvidence ?? delegation.worker_launch_evidence ?? null;
    await persistDelegationWithVisibilitySync(paths, delegation);
    return delegation;
}
function createOrchestrationAttemptArtifactFilePath(paths, attemptId) {
    return node_path_1.default.join(paths.orchestrationAttemptsDir, `${attemptId}.json`);
}
async function loadOrchestrationAttemptArtifact(paths, attemptId) {
    const candidate = await readJsonDocument(createOrchestrationAttemptArtifactFilePath(paths, attemptId));
    return normalizeLoadedOrchestrationAttempt(candidate);
}
async function listOrchestrationAttemptIds(paths) {
    const attemptEntries = await readDirectoryEntriesIfPresent(paths.orchestrationAttemptsDir);
    return listArtifactIds(attemptEntries, /^attempt-(\d+)\.json$/);
}
async function loadLatestOrchestrationAttempt(paths) {
    const latestAttemptId = (await listOrchestrationAttemptIds(paths)).at(-1);
    if (!latestAttemptId) {
        return null;
    }
    return loadOrchestrationAttemptArtifact(paths, latestAttemptId);
}
async function persistOrchestrationAttemptArtifact(paths, attempt) {
    const normalizedAttempt = normalizeLoadedOrchestrationAttempt(attempt);
    await (0, promises_1.mkdir)(paths.orchestrationAttemptsDir, { recursive: true });
    await writeJsonDocument(createOrchestrationAttemptArtifactFilePath(paths, normalizedAttempt.attempt_id), normalizedAttempt);
}
async function persistRunRecord(paths, run) {
    const normalizedRun = await normalizeLoadedRunRecord(paths, run);
    (0, validation_1.assertValidRunRecord)(normalizedRun);
    await writeJsonDocument(paths.runFile, normalizedRun);
    await persistPlanningChecklistFromContext(paths, {
        run: normalizedRun,
        taskCards: null,
        activeTaskCard: null,
        orchestratorDecision: null,
        taskDelegations: null,
    });
}
function createInitialRunRecord(input) {
    const timestamp = input.createdAt ?? nowTimestamp();
    return {
        run_id: input.runId,
        goal: input.goal,
        status: 'active',
        stage: 'execution',
        active_role: 'code specialist',
        active_agent_id: constants_1.FOREMAN_CODE_SPECIALIST_AGENT_ID,
        active_task_card_id: input.taskCardId,
        active_thread_id: null,
        task_card_ids: [input.taskCardId],
        latest_handoff_id: null,
        child_agents: [],
        specialist_executors: [],
        latest_verified_checkpoint: null,
        latest_verification: null,
        latest_failure: null,
        latest_orchestrator_synthesis: null,
        latest_response: null,
        latest_entry_trace: null,
        planning_clarification_request: null,
        raw_thread_ids: [],
        created_at: timestamp,
        updated_at: timestamp,
        completed_at: null,
    };
}
function createInitialTaskCardRecord(input) {
    const timestamp = input.createdAt ?? nowTimestamp();
    const taskKind = input.taskKind ?? 'execution';
    const assignedRole = getAssignedRoleForTaskKind(taskKind);
    const ownerRole = input.ownerRole ?? assignedRole;
    const roleConfigSnapshot = input.roleConfigSnapshot ?? createTaskRoleConfigSnapshot(assignedRole);
    const modelTierIntent = deriveTaskModelTierIntent(roleConfigSnapshot);
    const childAggregationContract = deriveTaskChildAggregationContract('execution');
    const fanInBarrierSemantics = deriveTaskFanInBarrierSemantics('execution', []);
    const orchestratorReviewGate = deriveTaskOrchestratorReviewGate('execution', []);
    return {
        task_card_id: input.taskCardId,
        run_id: input.runId,
        title: input.title,
        intent: input.intent,
        scope: input.scope,
        execution_prompt: input.executionPrompt,
        planner_attempt_id: input.plannerAttemptId ?? null,
        workflow_skill_id: input.workflowSkillId ?? null,
        workflow_step_index: input.workflowStepIndex ?? null,
        workflow_step_skill_id: input.workflowStepSkillId ?? null,
        workflow_next_step_skill_id: input.workflowNextStepSkillId ?? null,
        task_kind: taskKind,
        acceptance_checks: [...(input.acceptanceChecks ?? [])],
        review_of_task_card_ids: [...(input.reviewOfTaskCardIds ?? [])],
        depends_on_task_card_ids: [],
        fan_in_from_task_card_ids: [],
        node_kind: 'execution',
        status: 'active',
        owner_role: ownerRole,
        assigned_role: assignedRole,
        assigned_agent_id: getAgentIdForRole(assignedRole),
        role_config_snapshot: roleConfigSnapshot,
        model_tier_intent: modelTierIntent,
        child_aggregation_contract: childAggregationContract,
        fan_in_barrier_semantics: fanInBarrierSemantics,
        orchestrator_review_gate: orchestratorReviewGate,
        acceptance: input.acceptance,
        input_handoff_id: null,
        output_handoff_id: null,
        verification_state: 'pending',
        review_pass_count: 0,
        latest_failure: null,
        latest_model_launch: null,
        ownership_chain: null,
        thread_ids: [],
        completed_by_agent_id: null,
        created_at: timestamp,
        updated_at: timestamp,
        completed_at: null,
    };
}
function createQueuedTaskCardRecord(input) {
    const taskCard = createInitialTaskCardRecord(input);
    taskCard.depends_on_task_card_ids = [...(input.dependsOnTaskCardIds ?? [])];
    taskCard.fan_in_from_task_card_ids = [...(input.fanInFromTaskCardIds ?? [])];
    taskCard.node_kind = input.nodeKind ?? (taskCard.fan_in_from_task_card_ids.length > 0 ? 'fan_in' : 'execution');
    taskCard.child_aggregation_contract = deriveTaskChildAggregationContract(taskCard.node_kind);
    taskCard.fan_in_barrier_semantics = deriveTaskFanInBarrierSemantics(taskCard.node_kind, taskCard.fan_in_from_task_card_ids);
    taskCard.orchestrator_review_gate = deriveTaskOrchestratorReviewGate(taskCard.node_kind, taskCard.fan_in_from_task_card_ids);
    taskCard.status = 'queued';
    taskCard.owner_role = 'planner';
    taskCard.assigned_agent_id = null;
    return taskCard;
}
function createPlanningRunRecord(input) {
    const timestamp = input.createdAt ?? nowTimestamp();
    return {
        run_id: input.runId,
        goal: input.goal,
        status: 'active',
        stage: 'planning',
        active_role: 'planner',
        active_agent_id: constants_1.FOREMAN_PLANNER_AGENT_ID,
        active_task_card_id: null,
        active_thread_id: null,
        task_card_ids: [],
        latest_handoff_id: null,
        child_agents: [],
        specialist_executors: [],
        latest_verified_checkpoint: null,
        latest_verification: null,
        latest_failure: null,
        latest_orchestrator_synthesis: null,
        latest_response: null,
        latest_entry_trace: null,
        planning_clarification_request: null,
        raw_thread_ids: [],
        created_at: timestamp,
        updated_at: timestamp,
        completed_at: null,
    };
}
function isPlanningClarificationHold(run) {
    return run.stage === 'planning' && run.status === 'blocked' && run.planning_clarification_request !== null;
}
function markPlanningRunClarificationHold(run, input) {
    const timestamp = nowTimestamp();
    run.status = 'blocked';
    run.stage = 'planning';
    run.active_role = 'planner';
    run.active_agent_id = null;
    run.active_task_card_id = null;
    run.active_thread_id = null;
    run.task_card_ids = [];
    run.latest_handoff_id = null;
    run.latest_verification = null;
    run.latest_failure = null;
    run.planning_clarification_request = {
        planner_attempt_id: input.plannerAttemptId,
        summary: input.summary,
        clarification_request: input.clarificationRequest,
        recorded_at: timestamp,
    };
    run.updated_at = timestamp;
    run.completed_at = null;
}
function createHandoffRecord(input) {
    return {
        handoff_id: input.handoffId,
        run_id: input.runId,
        task_card_id: input.taskCardId,
        from_role: input.fromRole,
        to_role: input.toRole,
        outcome: 'accepted',
        summary: input.summary,
        created_at: input.createdAt ?? nowTimestamp(),
    };
}
function createDefaultOrchestrationPolicy() {
    return {
        specialist_routing: {
            mode: 'advisory_only',
            route_preference: 'none',
        },
        parallelism: {
            mode: 'single_task_bounded_fan_out',
            max_active_tasks: 1,
            max_active_workers: constants_1.FOREMAN_ACTIVE_TASK_MAX_WORKERS,
        },
        review: {
            mode: 'explicit_only',
            max_review_passes: 1,
            max_active_reviewers: 2,
        },
        autonomous_research: {
            mode: 'disabled',
        },
        git_mutation: {
            mode: 'deny',
        },
        pr_mutation: {
            mode: 'deny',
        },
    };
}
function createOrchestratorState(input) {
    const timestamp = input.createdAt ?? nowTimestamp();
    return {
        run_id: input.runId,
        task_card_id: input.taskCardId,
        execution_request: input.executionRequest,
        verification_request: input.verificationRequest,
        orchestration_policy: input.orchestrationPolicy ?? createDefaultOrchestrationPolicy(),
        current_decision: (0, orchestrator_1.normalizeOrchestratorDecision)(input.decision),
        created_at: timestamp,
        updated_at: timestamp,
    };
}
function setOrchestratorDecision(state, decision) {
    const normalizedDecision = (0, orchestrator_1.normalizeOrchestratorDecision)(decision);
    (0, validation_1.assertValidOrchestratorDecision)(normalizedDecision);
    state.current_decision = normalizedDecision;
    state.updated_at = nowTimestamp();
}
function decisionsMatch(left, right) {
    return (left.next_step === right.next_step &&
        left.can_advance === right.can_advance &&
        left.summary === right.summary &&
        (0, orchestrator_1.getOrchestratorRouteSelection)(left).route_id === (0, orchestrator_1.getOrchestratorRouteSelection)(right).route_id);
}
function requestsMatch(left, right) {
    if (left === null || right === null) {
        return left === right;
    }
    return (left.prompt === right.prompt &&
        left.profile === right.profile &&
        left.config_entries.length === right.config_entries.length &&
        left.config_entries.every((entry, index) => entry === right.config_entries[index]));
}
function applyInitialTaskHandoff(run, taskCard, handoff) {
    run.latest_handoff_id = handoff.handoff_id;
    run.updated_at = handoff.created_at;
    taskCard.input_handoff_id = handoff.handoff_id;
    taskCard.updated_at = handoff.created_at;
}
function activatePlannedTask(run, taskCard, handoff) {
    const assignedRole = taskCard.assigned_role;
    const assignedAgentId = getRunActiveAgentIdForRole(assignedRole);
    run.status = 'active';
    run.stage = taskCard.task_kind === 'review' ? 'verification' : 'execution';
    run.active_role = assignedRole;
    run.active_agent_id = assignedAgentId;
    run.active_task_card_id = taskCard.task_card_id;
    run.active_thread_id = null;
    run.latest_handoff_id = handoff.handoff_id;
    run.latest_failure = null;
    run.latest_verification =
        taskCard.task_kind === 'review'
            ? {
                state: 'pending',
                summary: `Review task "${taskCard.title}" is ready for bounded verification.`,
                recorded_at: handoff.created_at,
            }
            : null;
    run.updated_at = handoff.created_at;
    run.completed_at = null;
    taskCard.status = 'active';
    taskCard.owner_role = assignedRole;
    taskCard.assigned_agent_id = assignedAgentId;
    taskCard.completed_by_agent_id = null;
    taskCard.verification_state = 'pending';
    taskCard.latest_failure = null;
    taskCard.latest_model_launch = null;
    taskCard.updated_at = handoff.created_at;
}
function reactivateBlockedTask(run, taskCard, handoff) {
    const timestamp = handoff.created_at;
    const assignedRole = taskCard.role_config_snapshot.role;
    const assignedAgentId = getRunActiveAgentIdForRole(assignedRole);
    run.status = 'active';
    run.stage = 'execution';
    run.active_role = assignedRole;
    run.active_agent_id = assignedAgentId;
    run.active_task_card_id = taskCard.task_card_id;
    run.active_thread_id = null;
    run.latest_handoff_id = handoff.handoff_id;
    run.latest_verification = null;
    run.latest_failure = null;
    run.updated_at = timestamp;
    run.completed_at = null;
    taskCard.status = 'active';
    taskCard.owner_role = assignedRole;
    taskCard.assigned_role = assignedRole;
    taskCard.assigned_agent_id = assignedAgentId;
    taskCard.input_handoff_id = handoff.handoff_id;
    taskCard.verification_state = 'pending';
    taskCard.latest_failure = null;
    taskCard.latest_model_launch = null;
    taskCard.completed_by_agent_id = null;
    taskCard.updated_at = timestamp;
    taskCard.completed_at = null;
}
function cancelQueuedTaskCard(taskCard, timestamp) {
    taskCard.status = 'cancelled';
    taskCard.owner_role = 'planner';
    taskCard.assigned_agent_id = null;
    taskCard.completed_by_agent_id = null;
    taskCard.updated_at = timestamp;
    taskCard.completed_at = timestamp;
}
function areReferencedTaskCardsCompleted(taskCardIds, taskCardLookup) {
    return taskCardIds.every((taskCardId) => taskCardLookup.get(taskCardId)?.status === 'completed');
}
function isQueuedTaskCardReady(taskCard, taskCardLookup) {
    if (taskCard.status !== 'queued') {
        return false;
    }
    if (!areReferencedTaskCardsCompleted(taskCard.depends_on_task_card_ids, taskCardLookup)) {
        return false;
    }
    if (taskCard.node_kind === 'fan_in' && !areReferencedTaskCardsCompleted(taskCard.fan_in_from_task_card_ids, taskCardLookup)) {
        return false;
    }
    return true;
}
function findNextQueuedTaskCard(run, taskCards) {
    const taskCardLookup = new Map(taskCards.map((taskCard) => [taskCard.task_card_id, taskCard]));
    for (const taskCardId of run.task_card_ids) {
        const nextTaskCard = taskCardLookup.get(taskCardId);
        if (nextTaskCard && isQueuedTaskCardReady(nextTaskCard, taskCardLookup)) {
            return nextTaskCard;
        }
    }
    return null;
}
function findReadyQueuedTaskCards(run, taskCards) {
    const taskCardLookup = new Map(taskCards.map((taskCard) => [taskCard.task_card_id, taskCard]));
    return run.task_card_ids
        .map((taskCardId) => taskCardLookup.get(taskCardId) ?? null)
        .filter((taskCard) => taskCard !== null && isQueuedTaskCardReady(taskCard, taskCardLookup));
}
function addUniqueValue(values, nextValue) {
    return values.includes(nextValue) ? values : [...values, nextValue];
}
function updateExecutionThread(run, taskCard, threadId) {
    const timestamp = nowTimestamp();
    run.active_thread_id = threadId;
    run.raw_thread_ids = addUniqueValue(run.raw_thread_ids, threadId);
    run.updated_at = timestamp;
    taskCard.thread_ids = addUniqueValue(taskCard.thread_ids, threadId);
    taskCard.updated_at = timestamp;
}
function createVerifiedCheckpointRecord(taskCard, summary, recordedAt) {
    return {
        task_card_id: taskCard.task_card_id,
        title: taskCard.title,
        summary,
        recorded_at: recordedAt,
    };
}
function markExecutionCompleted(run, taskCard, handoff) {
    const timestamp = handoff.created_at;
    const verifierAgentId = getRunActiveAgentIdForRole('verifier');
    run.status = 'active';
    run.stage = 'verification';
    run.active_role = 'verifier';
    run.active_agent_id = verifierAgentId;
    run.latest_handoff_id = handoff.handoff_id;
    run.latest_failure = null;
    run.latest_verification = {
        state: 'pending',
        summary: 'Codex execution completed. Verification is still pending.',
        recorded_at: timestamp,
    };
    run.updated_at = timestamp;
    taskCard.status = 'active';
    taskCard.owner_role = 'verifier';
    taskCard.assigned_role = 'verifier';
    taskCard.assigned_agent_id = verifierAgentId;
    taskCard.output_handoff_id = handoff.handoff_id;
    taskCard.verification_state = 'pending';
    taskCard.latest_failure = null;
    taskCard.updated_at = timestamp;
}
function assertVerificationResolutionAllowed(run, taskCard) {
    if (run.stage !== 'verification' || taskCard.verification_state !== 'pending') {
        throw new Error(`Verification resolution is only allowed when run.stage=verification and task-card verification_state=pending. Received stage=${run.stage} verification_state=${taskCard.verification_state}.`);
    }
}
function applyVerificationResolution(run, taskCard, input) {
    const timestamp = nowTimestamp();
    const verification = {
        state: input.outcome,
        summary: input.summary,
        recorded_at: timestamp,
    };
    run.stage = 'verification';
    run.active_role = null;
    run.active_agent_id = null;
    run.latest_verification = verification;
    run.updated_at = timestamp;
    taskCard.owner_role = 'verifier';
    taskCard.assigned_agent_id = null;
    taskCard.verification_state = input.outcome;
    taskCard.updated_at = timestamp;
    if (input.outcome === 'passed') {
        run.status = 'completed';
        run.latest_verified_checkpoint = createVerifiedCheckpointRecord(taskCard, input.summary, timestamp);
        run.latest_failure = null;
        run.completed_at = timestamp;
        taskCard.status = 'completed';
        taskCard.latest_failure = null;
        taskCard.completed_by_agent_id = getAgentIdForRole('verifier');
        taskCard.completed_at = timestamp;
        return;
    }
    run.status = 'blocked';
    run.completed_at = null;
    taskCard.status = 'blocked';
    taskCard.completed_by_agent_id = null;
    taskCard.completed_at = null;
    if (input.outcome === 'needs_work') {
        const failure = {
            stage: 'verification',
            reason: 'verification_failed',
            summary: input.summary,
            recorded_at: timestamp,
        };
        run.latest_failure = failure;
        taskCard.latest_failure = failure;
        return;
    }
    run.latest_failure = null;
    taskCard.latest_failure = null;
}
function promoteNextPlannedTask(run, completedTaskCard, nextTaskCard, verificationSummary, handoff) {
    const timestamp = handoff.created_at;
    const nextAssignedRole = nextTaskCard.assigned_role;
    const nextAssignedAgentId = getRunActiveAgentIdForRole(nextAssignedRole);
    run.status = 'active';
    run.stage = nextTaskCard.task_kind === 'review' ? 'verification' : 'execution';
    run.active_role = nextAssignedRole;
    run.active_agent_id = nextAssignedAgentId;
    run.active_task_card_id = nextTaskCard.task_card_id;
    run.active_thread_id = null;
    run.latest_handoff_id = handoff.handoff_id;
    run.latest_verified_checkpoint = createVerifiedCheckpointRecord(completedTaskCard, verificationSummary, timestamp);
    run.latest_verification =
        nextTaskCard.task_kind === 'review'
            ? {
                state: 'pending',
                summary: `Review task "${nextTaskCard.title}" is ready for bounded verification.`,
                recorded_at: timestamp,
            }
            : null;
    run.latest_failure = null;
    run.updated_at = timestamp;
    run.completed_at = null;
    completedTaskCard.status = 'completed';
    completedTaskCard.owner_role = 'verifier';
    completedTaskCard.assigned_agent_id = null;
    completedTaskCard.completed_by_agent_id = getAgentIdForRole('verifier');
    completedTaskCard.verification_state = 'passed';
    completedTaskCard.latest_failure = null;
    completedTaskCard.updated_at = timestamp;
    completedTaskCard.completed_at = timestamp;
    nextTaskCard.status = 'active';
    nextTaskCard.owner_role = nextAssignedRole;
    nextTaskCard.assigned_agent_id = nextAssignedAgentId;
    nextTaskCard.input_handoff_id = handoff.handoff_id;
    nextTaskCard.verification_state = 'pending';
    nextTaskCard.latest_failure = null;
    nextTaskCard.latest_model_launch = null;
    nextTaskCard.completed_by_agent_id = null;
    nextTaskCard.updated_at = timestamp;
    nextTaskCard.completed_at = null;
}
function markRunTerminalState(run, taskCard, input) {
    const timestamp = nowTimestamp();
    const failure = {
        stage: input.stage,
        reason: input.reason,
        summary: input.summary,
        recorded_at: timestamp,
    };
    run.status = input.status;
    run.stage = input.stage;
    run.active_role = input.ownerRole;
    run.active_agent_id = getRunActiveAgentIdForRole(input.ownerRole);
    run.latest_failure = failure;
    run.latest_verification = null;
    run.updated_at = timestamp;
    run.completed_at = timestamp;
    taskCard.status = input.status;
    taskCard.owner_role = input.ownerRole;
    taskCard.assigned_agent_id = null;
    taskCard.verification_state = input.verificationState;
    taskCard.latest_failure = failure;
    taskCard.completed_by_agent_id = null;
    taskCard.updated_at = timestamp;
    taskCard.completed_at = timestamp;
}
function markPlanningRunTerminalState(run, input) {
    const timestamp = nowTimestamp();
    run.status = input.status;
    run.stage = 'planning';
    run.active_role = 'planner';
    run.active_agent_id = constants_1.FOREMAN_PLANNER_AGENT_ID;
    run.planning_clarification_request = null;
    run.latest_failure = {
        stage: 'planning',
        reason: input.reason,
        summary: input.summary,
        recorded_at: timestamp,
    };
    run.latest_verification = null;
    run.updated_at = timestamp;
    run.completed_at = timestamp;
}
function createVisibilityProjection(run, taskCard, latestHandoff, orchestratorDecision) {
    return {
        run_id: run.run_id,
        goal: run.goal,
        status: run.status,
        stage: run.stage,
        active_role: run.active_role,
        active_agent_id: run.active_agent_id,
        active_thread_id: run.active_thread_id,
        child_agents: run.child_agents,
        specialist_executors: run.specialist_executors,
        current_task_card: {
            task_card_id: taskCard.task_card_id,
            title: taskCard.title,
            status: taskCard.status,
            owner_role: taskCard.owner_role,
            assigned_role: taskCard.assigned_role,
            assigned_agent_id: taskCard.assigned_agent_id,
            workflow_skill_id: taskCard.workflow_skill_id,
            workflow_step_index: taskCard.workflow_step_index,
            workflow_step_skill_id: taskCard.workflow_step_skill_id,
            workflow_next_step_skill_id: taskCard.workflow_next_step_skill_id,
            role_config_snapshot: taskCard.role_config_snapshot,
            model_tier_intent: taskCard.model_tier_intent,
            child_aggregation_contract: taskCard.child_aggregation_contract,
            fan_in_barrier_semantics: taskCard.fan_in_barrier_semantics,
            orchestrator_review_gate: taskCard.orchestrator_review_gate,
            acceptance: taskCard.acceptance,
            verification_state: taskCard.verification_state,
            completed_by_agent_id: taskCard.completed_by_agent_id,
            latest_model_launch: taskCard.latest_model_launch,
        },
        latest_handoff: latestHandoff,
        orchestrator: orchestratorDecision,
        latest_verification: run.latest_verification,
        latest_failure: run.latest_failure,
    };
}
async function persistHandoffRecord(paths, handoff) {
    (0, validation_1.assertValidHandoffRecord)(handoff);
    await writeJsonDocument(node_path_1.default.join(paths.handoffsDir, `${handoff.handoff_id}.json`), handoff);
}
async function persistPlannerEvidence(paths, evidence) {
    await ensurePlannerAttemptPaths(paths);
    await Promise.all([
        (0, promises_1.writeFile)(paths.planningStdoutFile, evidence.stdout, 'utf8'),
        (0, promises_1.writeFile)(paths.planningStderrFile, evidence.stderr, 'utf8'),
    ]);
}
async function persistPlanningArtifact(paths, planning) {
    await ensurePlannerAttemptPaths(paths);
    await writeJsonDocument(paths.planningArtifactFile, planning);
}
async function persistPlanUpdateArtifact(paths, planUpdate) {
    (0, validation_1.assertValidPlanUpdateArtifact)(planUpdate);
    await ensurePlannerAttemptPaths(paths);
    await writeJsonDocument(paths.planUpdateArtifactFile, planUpdate);
}
function createExploreArtifactFilePath(paths, taskCardId) {
    return node_path_1.default.join(paths.exploreArtifactsDir, `${taskCardId}.json`);
}
async function persistExploreArtifact(paths, artifact) {
    (0, validation_1.assertValidExploreArtifact)(artifact);
    await (0, promises_1.mkdir)(paths.exploreArtifactsDir, { recursive: true });
    await writeJsonDocument(createExploreArtifactFilePath(paths, artifact.task_card_id), artifact);
}
async function loadPlanUpdateArtifactIfPresent(paths) {
    try {
        const candidate = await readJsonDocument(paths.planUpdateArtifactFile);
        (0, validation_1.assertValidPlanUpdateArtifact)(candidate);
        return {
            artifact: candidate,
            filePath: paths.planUpdateArtifactFile,
        };
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return {
                artifact: null,
                filePath: null,
            };
        }
        throw error;
    }
}
async function loadExploreArtifactIfPresent(paths, taskCardId) {
    const artifactFile = createExploreArtifactFilePath(paths, taskCardId);
    try {
        const candidate = await readJsonDocument(artifactFile);
        (0, validation_1.assertValidExploreArtifact)(candidate);
        return {
            artifact: candidate,
            filePath: artifactFile,
        };
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return {
                artifact: null,
                filePath: null,
            };
        }
        throw error;
    }
}
async function persistOrchestratorState(paths, state) {
    (0, validation_1.assertValidOrchestratorState)(state);
    await writeJsonDocument(paths.orchestratorStateFile, state);
}
function normalizeLoadedOrchestratorState(candidate) {
    if (!isRecord(candidate)) {
        (0, validation_1.assertValidOrchestratorState)(candidate);
        return candidate;
    }
    const currentDecision = isRecord(candidate.current_decision) &&
        !Object.prototype.hasOwnProperty.call(candidate.current_decision, 'route_selection')
        ? {
            ...candidate.current_decision,
            route_selection: (0, orchestrator_1.createDefaultRouteSelection)(candidate.current_decision.next_step),
        }
        : candidate.current_decision;
    if (Object.prototype.hasOwnProperty.call(candidate, 'orchestration_policy') &&
        currentDecision === candidate.current_decision) {
        (0, validation_1.assertValidOrchestratorState)(candidate);
        return candidate;
    }
    const normalizedCandidate = {
        ...candidate,
        orchestration_policy: Object.prototype.hasOwnProperty.call(candidate, 'orchestration_policy')
            ? candidate.orchestration_policy
            : createDefaultOrchestrationPolicy(),
        current_decision: currentDecision,
    };
    (0, validation_1.assertValidOrchestratorState)(normalizedCandidate);
    return normalizedCandidate;
}
function createLegacyCompatibleAttemptRoutingMetadata(nextStep) {
    const defaultPolicy = createDefaultOrchestrationPolicy();
    const routeSelection = (0, orchestrator_1.createDefaultRouteSelection)(nextStep);
    const routeTargetRole = nextStep === 'execute_task' ? 'code specialist' : nextStep === 'verify_task' ? 'verifier' : null;
    const routeTargetStep = nextStep === 'execute_task' || nextStep === 'verify_task' ? nextStep : null;
    const routingPrefix = `Policy routing remains ${defaultPolicy.specialist_routing.mode} with ${defaultPolicy.parallelism.mode}.`;
    const neutralRecommendationSummary = 'Advisory visibility only surfaces neutral OmO recommendation values (category none; skills none).';
    const selectedRouteSummary = `Persisted route explicit_fallback keeps the explicit workflow because ${routeSelection.reason}.`;
    const budgetTrace = nextStep === 'execute_task'
        ? {
            workload_class: 'scoped_mutation',
            path_weight: 'medium',
            execution_path: 'local',
            model_tier_budget: 'standard',
            reasoning_effort_budget: 'medium',
            review_requirement: 'conditional',
            budget_reason: 'legacy attempt metadata defaults scoped execution work to a bounded medium budget until richer task-specific evidence is available',
        }
        : nextStep === 'verify_task'
            ? {
                workload_class: 'risky_review',
                path_weight: 'heavy',
                execution_path: 'delegated_plus_review',
                model_tier_budget: 'high_tier',
                reasoning_effort_budget: 'high',
                review_requirement: 'required',
                budget_reason: 'legacy attempt metadata defaults verification work to a heavy reviewed budget until richer task-specific evidence is available',
            }
            : nextStep === 'halt_completed' || nextStep === 'halt_failed' || nextStep === 'halt_cancelled'
                ? {
                    workload_class: 'terminal',
                    path_weight: 'light',
                    execution_path: 'terminal',
                    model_tier_budget: 'none',
                    reasoning_effort_budget: 'none',
                    review_requirement: 'none',
                    budget_reason: 'legacy attempt metadata marks terminal states as spending no new routing budget',
                }
                : {
                    workload_class: 'manual_boundary',
                    path_weight: 'medium',
                    execution_path: 'manual_boundary',
                    model_tier_budget: 'none',
                    reasoning_effort_budget: 'none',
                    review_requirement: 'required',
                    budget_reason: 'legacy attempt metadata marks explicit holds and repair states as manual boundaries',
                };
    const budgetSummary = `Budget path ${budgetTrace.execution_path} stays ${budgetTrace.path_weight} for ${budgetTrace.workload_class}; model tier ${budgetTrace.model_tier_budget}; reasoning effort ${budgetTrace.reasoning_effort_budget}; review ${budgetTrace.review_requirement} because ${budgetTrace.budget_reason}.`;
    const routingSummary = nextStep === 'execute_task'
        ? `${routingPrefix} Decision execute_task maps advisory specialist routing to canonical code specialist for execute_task. ${neutralRecommendationSummary} ${budgetSummary} ${selectedRouteSummary}`
        : nextStep === 'verify_task'
            ? `${routingPrefix} Decision verify_task maps advisory specialist routing to canonical verifier for verify_task. ${neutralRecommendationSummary} ${budgetSummary} ${selectedRouteSummary}`
            : nextStep === 'await_fan_in'
                ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because parent execution is explicitly paused until bounded child delegation fan-in completes. ${selectedRouteSummary}`
                : nextStep === 'await_verification'
                    ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because verification automation is unavailable and the run awaits an explicit operator resolution. ${selectedRouteSummary}`
                    : nextStep === 'await_repair_decision'
                        ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because the workflow is awaiting an explicit repair decision. ${selectedRouteSummary}`
                        : nextStep === 'await_operator'
                            ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because the workflow awaits manual operator action. ${selectedRouteSummary}`
                            : nextStep === 'halt_completed'
                                ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because the run is already completed. ${selectedRouteSummary}`
                                : nextStep === 'halt_failed'
                                    ? `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because the run has failed and requires review before any further action. ${selectedRouteSummary}`
                                    : `${routingPrefix} ${neutralRecommendationSummary} ${budgetSummary} No specialist handoff target is derived because the run is cancelled. ${selectedRouteSummary}`;
    const routeTargetRosterName = routeTargetRole === 'code specialist' ? 'raider' : routeTargetRole === 'verifier' ? 'arbiter' : null;
    return {
        routing_summary: routingSummary,
        routing_trace: {
            specialist_routing_mode: defaultPolicy.specialist_routing.mode,
            route_preference: defaultPolicy.specialist_routing.route_preference,
            parallelism_mode: defaultPolicy.parallelism.mode,
            route_target_role: routeTargetRole,
            route_target_roster_name: routeTargetRosterName,
            route_target_step: routeTargetStep,
            selected_route: routeSelection.route_id,
            selected_route_reason: routeSelection.reason,
            recommended_category: null,
            recommended_skills: [],
            workload_class: budgetTrace.workload_class,
            path_weight: budgetTrace.path_weight,
            execution_path: budgetTrace.execution_path,
            model_tier_budget: budgetTrace.model_tier_budget,
            reasoning_effort_budget: budgetTrace.reasoning_effort_budget,
            review_requirement: budgetTrace.review_requirement,
            budget_reason: budgetTrace.budget_reason,
            advisory_only: true,
            execution_unchanged: true,
        },
    };
}
function normalizeLoadedOrchestrationAttemptRoutingTrace(candidate) {
    if (!isRecord(candidate)) {
        return candidate;
    }
    const routeTargetRole = candidate.route_target_role === 'planner' ||
        candidate.route_target_role === 'explorer' ||
        candidate.route_target_role === 'code specialist' ||
        candidate.route_target_role === 'verifier' ||
        candidate.route_target_role === null
        ? candidate.route_target_role
        : null;
    const routeTargetStep = candidate.route_target_step === 'execute_task' ||
        candidate.route_target_step === 'verify_task' ||
        candidate.route_target_step === null
        ? candidate.route_target_step
        : null;
    const routeTargetRosterName = routeTargetRole === 'planner'
        ? 'tactician'
        : routeTargetRole === 'explorer'
            ? 'scout'
            : routeTargetRole === 'code specialist'
                ? 'raider'
                : routeTargetRole === 'verifier'
                    ? 'arbiter'
                    : null;
    return {
        ...candidate,
        route_target_role: routeTargetRole,
        route_target_roster_name: typeof candidate.route_target_roster_name === 'string' || candidate.route_target_roster_name === null
            ? candidate.route_target_roster_name
            : routeTargetRosterName,
        route_target_step: routeTargetStep,
        selected_route: Object.prototype.hasOwnProperty.call(candidate, 'selected_route')
            ? candidate.selected_route
            : 'explicit_fallback',
        selected_route_reason: Object.prototype.hasOwnProperty.call(candidate, 'selected_route_reason')
            ? candidate.selected_route_reason
            : (0, orchestrator_1.createDefaultRouteSelection)('await_operator').reason,
        recommended_category: Object.prototype.hasOwnProperty.call(candidate, 'recommended_category')
            ? candidate.recommended_category
            : null,
        recommended_skills: Object.prototype.hasOwnProperty.call(candidate, 'recommended_skills')
            ? candidate.recommended_skills
            : [],
        workload_class: Object.prototype.hasOwnProperty.call(candidate, 'workload_class')
            ? candidate.workload_class
            : 'manual_boundary',
        path_weight: Object.prototype.hasOwnProperty.call(candidate, 'path_weight') ? candidate.path_weight : 'medium',
        execution_path: Object.prototype.hasOwnProperty.call(candidate, 'execution_path')
            ? candidate.execution_path
            : 'manual_boundary',
        model_tier_budget: Object.prototype.hasOwnProperty.call(candidate, 'model_tier_budget')
            ? candidate.model_tier_budget
            : 'none',
        reasoning_effort_budget: Object.prototype.hasOwnProperty.call(candidate, 'reasoning_effort_budget')
            ? candidate.reasoning_effort_budget
            : 'none',
        review_requirement: Object.prototype.hasOwnProperty.call(candidate, 'review_requirement')
            ? candidate.review_requirement
            : 'required',
        budget_reason: Object.prototype.hasOwnProperty.call(candidate, 'budget_reason')
            ? candidate.budget_reason
            : 'legacy routing trace did not record a route budget explanation',
        advisory_only: Object.prototype.hasOwnProperty.call(candidate, 'advisory_only') ? candidate.advisory_only : true,
        execution_unchanged: Object.prototype.hasOwnProperty.call(candidate, 'execution_unchanged')
            ? candidate.execution_unchanged
            : true,
    };
}
function createLegacyCompatibleAttemptReviewMetadata(input) {
    const defaultPolicy = createDefaultOrchestrationPolicy();
    const reviewOutcome = input.verificationState === 'passed' || input.nextStep === 'halt_completed'
        ? 'pass'
        : input.nextStep === 'await_repair_decision'
            ? 'repair'
            : input.nextStep === 'await_verification' && input.verificationState !== 'pending'
                ? 'hold'
                : 'pending';
    const remainingReviewPasses = reviewOutcome === 'hold' ? 0 : defaultPolicy.review.max_review_passes;
    const reviewSummary = reviewOutcome === 'pass'
        ? `Policy review remains ${defaultPolicy.review.mode} with at most ${defaultPolicy.review.max_review_passes} bounded recheck for this task. Verification passed, so no additional review loop action is required.`
        : reviewOutcome === 'repair'
            ? `Policy review remains ${defaultPolicy.review.mode} with at most ${defaultPolicy.review.max_review_passes} bounded recheck for this task. Verification failed while bounded recheck capacity remained, so the workflow stayed on an explicit retry-or-replan repair decision.`
            : reviewOutcome === 'hold'
                ? `Policy review remains ${defaultPolicy.review.mode} with at most ${defaultPolicy.review.max_review_passes} bounded recheck for this task. Verification failed after the bounded recheck budget was exhausted, so the workflow moved to an explicit manual hold.`
                : `Policy review remains ${defaultPolicy.review.mode} with at most ${defaultPolicy.review.max_review_passes} bounded recheck for this task. Oracle-backed review remains advisory and read-only while the workflow continues.`;
    return {
        review_summary: reviewSummary,
        review_trace: {
            review_mode: defaultPolicy.review.mode,
            max_review_passes: defaultPolicy.review.max_review_passes,
            max_active_reviewers: defaultPolicy.review.max_active_reviewers,
            review_pass_count: 0,
            review_round: 0,
            remaining_review_passes: remainingReviewPasses,
            review_outcome: reviewOutcome,
            reviewer_count: 0,
            reviewer_swarm_state: 'not_requested',
            review_path: 'Oracle-backed advisory review is read-only; explicit operator control remains required.',
            explicit_operator_control: true,
            bounded_recheck_available: remainingReviewPasses > 0,
        },
    };
}
function normalizeLoadedOrchestrationAttemptSnapshot(candidate) {
    if (!isRecord(candidate)) {
        return candidate;
    }
    const { next_step: nextStep, verification_state: verificationState } = candidate;
    const nextStepIsKnown = nextStep === 'execute_task' ||
        nextStep === 'verify_task' ||
        nextStep === 'await_fan_in' ||
        nextStep === 'await_verification' ||
        nextStep === 'await_repair_decision' ||
        nextStep === 'await_operator' ||
        nextStep === 'halt_completed' ||
        nextStep === 'halt_failed' ||
        nextStep === 'halt_cancelled';
    const verificationStateIsKnown = verificationState === 'pending' ||
        verificationState === 'passed' ||
        verificationState === 'needs_work' ||
        verificationState === 'blocked';
    if (Object.prototype.hasOwnProperty.call(candidate, 'routing_summary') &&
        Object.prototype.hasOwnProperty.call(candidate, 'routing_trace') &&
        Object.prototype.hasOwnProperty.call(candidate, 'review_summary') &&
        Object.prototype.hasOwnProperty.call(candidate, 'review_trace')) {
        if (nextStepIsKnown && verificationStateIsKnown) {
            const routingMetadata = createLegacyCompatibleAttemptRoutingMetadata(nextStep);
            return {
                ...candidate,
                routing_trace: normalizeLoadedOrchestrationAttemptRoutingTrace({
                    ...routingMetadata.routing_trace,
                    ...(isRecord(candidate.routing_trace) ? candidate.routing_trace : {}),
                }),
            };
        }
        return {
            ...candidate,
            routing_trace: normalizeLoadedOrchestrationAttemptRoutingTrace(candidate.routing_trace),
        };
    }
    if (!nextStepIsKnown || !verificationStateIsKnown) {
        return candidate;
    }
    const routingMetadata = createLegacyCompatibleAttemptRoutingMetadata(nextStep);
    const reviewMetadata = createLegacyCompatibleAttemptReviewMetadata({
        nextStep,
        verificationState,
    });
    return {
        ...candidate,
        routing_summary: Object.prototype.hasOwnProperty.call(candidate, 'routing_summary')
            ? candidate.routing_summary
            : routingMetadata.routing_summary,
        routing_trace: Object.prototype.hasOwnProperty.call(candidate, 'routing_trace')
            ? normalizeLoadedOrchestrationAttemptRoutingTrace(candidate.routing_trace)
            : routingMetadata.routing_trace,
        review_summary: Object.prototype.hasOwnProperty.call(candidate, 'review_summary')
            ? candidate.review_summary
            : reviewMetadata.review_summary,
        review_trace: Object.prototype.hasOwnProperty.call(candidate, 'review_trace')
            ? candidate.review_trace
            : reviewMetadata.review_trace,
    };
}
function normalizeLoadedTaskCardRecord(candidate) {
    if (!isRecord(candidate) ||
        (Object.prototype.hasOwnProperty.call(candidate, 'review_pass_count') &&
            Object.prototype.hasOwnProperty.call(candidate, 'workflow_skill_id') &&
            Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_index') &&
            Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_skill_id') &&
            Object.prototype.hasOwnProperty.call(candidate, 'workflow_next_step_skill_id') &&
            Object.prototype.hasOwnProperty.call(candidate, 'depends_on_task_card_ids') &&
            Object.prototype.hasOwnProperty.call(candidate, 'fan_in_from_task_card_ids') &&
            Object.prototype.hasOwnProperty.call(candidate, 'node_kind') &&
            Object.prototype.hasOwnProperty.call(candidate, 'task_kind') &&
            Object.prototype.hasOwnProperty.call(candidate, 'acceptance_checks') &&
            Object.prototype.hasOwnProperty.call(candidate, 'review_of_task_card_ids') &&
            Object.prototype.hasOwnProperty.call(candidate, 'assigned_role') &&
            Object.prototype.hasOwnProperty.call(candidate, 'role_config_snapshot') &&
            Object.prototype.hasOwnProperty.call(candidate, 'model_tier_intent') &&
            Object.prototype.hasOwnProperty.call(candidate, 'child_aggregation_contract') &&
            Object.prototype.hasOwnProperty.call(candidate, 'fan_in_barrier_semantics') &&
            Object.prototype.hasOwnProperty.call(candidate, 'orchestrator_review_gate') &&
            Object.prototype.hasOwnProperty.call(candidate, 'latest_model_launch') &&
            Object.prototype.hasOwnProperty.call(candidate, 'completed_by_agent_id'))) {
        if (!isRecord(candidate)) {
            (0, validation_1.assertValidTaskCardRecord)(candidate);
            return candidate;
        }
        const normalizedCurrentCandidate = {
            ...candidate,
            latest_model_launch: normalizeLoadedRoleModelLaunchEvidence(candidate.latest_model_launch),
            ownership_chain: Object.prototype.hasOwnProperty.call(candidate, 'ownership_chain')
                ? normalizeLoadedOwnershipChain(candidate.ownership_chain)
                : null,
        };
        (0, validation_1.assertValidTaskCardRecord)(normalizedCurrentCandidate);
        return normalizedCurrentCandidate;
    }
    const taskKind = Object.prototype.hasOwnProperty.call(candidate, 'task_kind') ? candidate.task_kind : 'execution';
    const assignedRole = getAssignedRoleForTaskKind(taskKind);
    const nodeKind = Object.prototype.hasOwnProperty.call(candidate, 'node_kind') ? candidate.node_kind : 'execution';
    const fanInFromTaskCardIds = Object.prototype.hasOwnProperty.call(candidate, 'fan_in_from_task_card_ids')
        ? candidate.fan_in_from_task_card_ids
        : [];
    const roleConfigSnapshot = Object.prototype.hasOwnProperty.call(candidate, 'role_config_snapshot')
        ? candidate.role_config_snapshot
        : createTaskRoleConfigSnapshot(assignedRole);
    const normalizedCandidate = {
        ...candidate,
        review_pass_count: 0,
        workflow_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_skill_id') ? candidate.workflow_skill_id : null,
        workflow_step_index: Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_index') && typeof candidate.workflow_step_index === 'number'
            ? candidate.workflow_step_index
            : null,
        workflow_step_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_step_skill_id')
            ? candidate.workflow_step_skill_id
            : null,
        workflow_next_step_skill_id: Object.prototype.hasOwnProperty.call(candidate, 'workflow_next_step_skill_id')
            ? candidate.workflow_next_step_skill_id
            : null,
        task_kind: taskKind,
        acceptance_checks: Object.prototype.hasOwnProperty.call(candidate, 'acceptance_checks')
            ? candidate.acceptance_checks
            : [],
        review_of_task_card_ids: Object.prototype.hasOwnProperty.call(candidate, 'review_of_task_card_ids')
            ? candidate.review_of_task_card_ids
            : [],
        depends_on_task_card_ids: Object.prototype.hasOwnProperty.call(candidate, 'depends_on_task_card_ids')
            ? candidate.depends_on_task_card_ids
            : [],
        fan_in_from_task_card_ids: fanInFromTaskCardIds,
        node_kind: nodeKind,
        assigned_role: Object.prototype.hasOwnProperty.call(candidate, 'assigned_role') ? candidate.assigned_role : assignedRole,
        role_config_snapshot: roleConfigSnapshot,
        model_tier_intent: Object.prototype.hasOwnProperty.call(candidate, 'model_tier_intent')
            ? candidate.model_tier_intent
            : deriveTaskModelTierIntent(roleConfigSnapshot),
        child_aggregation_contract: Object.prototype.hasOwnProperty.call(candidate, 'child_aggregation_contract')
            ? candidate.child_aggregation_contract
            : deriveTaskChildAggregationContract(nodeKind),
        fan_in_barrier_semantics: Object.prototype.hasOwnProperty.call(candidate, 'fan_in_barrier_semantics')
            ? candidate.fan_in_barrier_semantics
            : deriveTaskFanInBarrierSemantics(nodeKind, fanInFromTaskCardIds),
        orchestrator_review_gate: Object.prototype.hasOwnProperty.call(candidate, 'orchestrator_review_gate')
            ? candidate.orchestrator_review_gate
            : deriveTaskOrchestratorReviewGate(nodeKind, fanInFromTaskCardIds),
        latest_model_launch: Object.prototype.hasOwnProperty.call(candidate, 'latest_model_launch')
            ? normalizeLoadedRoleModelLaunchEvidence(candidate.latest_model_launch)
            : null,
        ownership_chain: Object.prototype.hasOwnProperty.call(candidate, 'ownership_chain')
            ? normalizeLoadedOwnershipChain(candidate.ownership_chain)
            : null,
        completed_by_agent_id: Object.prototype.hasOwnProperty.call(candidate, 'completed_by_agent_id')
            ? candidate.completed_by_agent_id
            : null,
    };
    (0, validation_1.assertValidTaskCardRecord)(normalizedCandidate);
    return normalizedCandidate;
}
async function normalizeLoadedRunRecord(paths, candidate) {
    const normalizeLatestOrchestratorSynthesis = (value) => {
        if (!isRecord(value)) {
            return null;
        }
        return {
            task_card_id: typeof value.task_card_id === 'string' ? value.task_card_id : 'unknown-task',
            next_step: value.next_step === 'execute_task' ||
                value.next_step === 'verify_task' ||
                value.next_step === 'await_fan_in' ||
                value.next_step === 'await_verification' ||
                value.next_step === 'await_repair_decision' ||
                value.next_step === 'await_operator' ||
                value.next_step === 'halt_completed' ||
                value.next_step === 'halt_failed' ||
                value.next_step === 'halt_cancelled'
                ? value.next_step
                : 'await_operator',
            boundary: value.boundary === 'continue' || value.boundary === 'manual_hold' || value.boundary === 'terminal'
                ? value.boundary
                : 'manual_hold',
            provenance_header: typeof value.provenance_header === 'string' ? value.provenance_header : null,
            summary: typeof value.summary === 'string' ? value.summary : 'details recorded in persisted state.',
            user_message: typeof value.user_message === 'string' ? value.user_message : 'details recorded in persisted state.',
            recommended_action: value.recommended_action === 'advance' ||
                value.recommended_action === 'verify' ||
                value.recommended_action === 'resolve' ||
                value.recommended_action === 'retry' ||
                value.recommended_action === 'replan' ||
                value.recommended_action === 'escalate' ||
                value.recommended_action === 'none'
                ? value.recommended_action
                : 'none',
            decision_class: value.decision_class === 'continue_execute' ||
                value.decision_class === 'continue_verify' ||
                value.decision_class === 'continue_fan_in' ||
                value.decision_class === 'manual_resolve' ||
                value.decision_class === 'manual_retry' ||
                value.decision_class === 'manual_replan' ||
                value.decision_class === 'manual_escalate' ||
                value.decision_class === 'terminal_success' ||
                value.decision_class === 'terminal_failure' ||
                value.decision_class === 'terminal_cancelled'
                ? value.decision_class
                : 'manual_escalate',
            allowed_next_actions: Array.isArray(value.allowed_next_actions)
                ? value.allowed_next_actions.filter((action) => action === 'advance' ||
                    action === 'verify' ||
                    action === 'resolve' ||
                    action === 'retry' ||
                    action === 'replan' ||
                    action === 'escalate' ||
                    action === 'none')
                : [],
            decision_source: value.decision_source === 'orchestrator_policy' ? 'orchestrator_policy' : 'orchestrator_policy',
            worker_result_count: typeof value.worker_result_count === 'number' && Number.isInteger(value.worker_result_count) && value.worker_result_count >= 0
                ? value.worker_result_count
                : 0,
            review_outcome: value.review_outcome === 'pass' ||
                value.review_outcome === 'repair' ||
                value.review_outcome === 'hold' ||
                value.review_outcome === 'pending'
                ? value.review_outcome
                : null,
            recorded_at: typeof value.recorded_at === 'string' ? value.recorded_at : nowTimestamp(),
        };
    };
    const normalizeLatestResponse = (value) => {
        if (!isRecord(value)) {
            return null;
        }
        return {
            boundary: value.boundary === 'manual_hold' ? 'manual_hold' : 'terminal',
            provenance_header: typeof value.provenance_header === 'string' ? value.provenance_header : null,
            summary: typeof value.summary === 'string' ? value.summary : 'details recorded in persisted state.',
            user_message: typeof value.user_message === 'string' ? value.user_message : 'details recorded in persisted state.',
            recommended_action: value.recommended_action === 'advance' ||
                value.recommended_action === 'verify' ||
                value.recommended_action === 'resolve' ||
                value.recommended_action === 'retry' ||
                value.recommended_action === 'replan' ||
                value.recommended_action === 'escalate' ||
                value.recommended_action === 'none'
                ? value.recommended_action
                : 'none',
            decision_class: value.decision_class === 'continue_execute' ||
                value.decision_class === 'continue_verify' ||
                value.decision_class === 'continue_fan_in' ||
                value.decision_class === 'manual_resolve' ||
                value.decision_class === 'manual_retry' ||
                value.decision_class === 'manual_replan' ||
                value.decision_class === 'manual_escalate' ||
                value.decision_class === 'terminal_success' ||
                value.decision_class === 'terminal_failure' ||
                value.decision_class === 'terminal_cancelled'
                ? value.decision_class
                : 'manual_escalate',
            allowed_next_actions: Array.isArray(value.allowed_next_actions)
                ? value.allowed_next_actions.filter((action) => action === 'advance' ||
                    action === 'verify' ||
                    action === 'resolve' ||
                    action === 'retry' ||
                    action === 'replan' ||
                    action === 'escalate' ||
                    action === 'none')
                : [],
            decision_source: value.decision_source === 'orchestrator_policy' ? 'orchestrator_policy' : 'orchestrator_policy',
            worker_result_count: typeof value.worker_result_count === 'number' && Number.isInteger(value.worker_result_count) && value.worker_result_count >= 0
                ? value.worker_result_count
                : 0,
            review_outcome: value.review_outcome === 'pass' ||
                value.review_outcome === 'repair' ||
                value.review_outcome === 'hold' ||
                value.review_outcome === 'pending'
                ? value.review_outcome
                : null,
            recorded_at: typeof value.recorded_at === 'string' ? value.recorded_at : nowTimestamp(),
        };
    };
    const normalizeLatestEntryTrace = (value) => {
        if (!isRecord(value) || !isRecord(value.answer_trace)) {
            return null;
        }
        const answerTrace = value.answer_trace;
        const workflowVariantSelection = (() => {
            if (isRecord(answerTrace.workflow_variant_selection)) {
                const candidate = answerTrace.workflow_variant_selection;
                const workflowAgentRoute = Array.isArray(candidate.workflow_agent_route)
                    ? candidate.workflow_agent_route.filter((step) => step === 'captain' ||
                        step === 'tactician' ||
                        step === 'scout' ||
                        step === 'raider' ||
                        step === 'arbiter' ||
                        step === 'sentinel')
                    : [];
                if ((candidate.workflow_variant === 'investigate_only' ||
                    candidate.workflow_variant === 'investigate_then_document' ||
                    candidate.workflow_variant === 'diagnose_then_fix' ||
                    candidate.workflow_variant === 'fix_only' ||
                    candidate.workflow_variant === 'plan_then_implement' ||
                    candidate.workflow_variant === 'implement_then_review' ||
                    candidate.workflow_variant === 'verify_only' ||
                    candidate.workflow_variant === 'ownership_drift_check' ||
                    candidate.workflow_variant === 'parallel_fanout') &&
                    (candidate.workflow_skill_id === 'captain_investigate_only' ||
                        candidate.workflow_skill_id === 'captain_investigate_then_document' ||
                        candidate.workflow_skill_id === 'captain_diagnose_then_fix' ||
                        candidate.workflow_skill_id === 'captain_fix_only' ||
                        candidate.workflow_skill_id === 'captain_plan_then_implement' ||
                        candidate.workflow_skill_id === 'captain_implement_then_review' ||
                        candidate.workflow_skill_id === 'captain_verify_only' ||
                        candidate.workflow_skill_id === 'captain_ownership_drift_check' ||
                        candidate.workflow_skill_id === 'captain_parallel_fanout') &&
                    workflowAgentRoute.length > 0 &&
                    typeof candidate.workflow_summary === 'string') {
                    return {
                        workflow_variant: candidate.workflow_variant,
                        workflow_skill_id: candidate.workflow_skill_id,
                        workflow_agent_route: workflowAgentRoute,
                        workflow_summary: candidate.workflow_summary,
                        operator_visible: false,
                    };
                }
            }
            return (0, workflow_variants_1.deriveWorkflowVariantSelection)({
                request: typeof value.request === 'string' ? value.request : '',
                recommendation: {
                    request_shape: answerTrace.request_shape === 'existence_check' ||
                        answerTrace.request_shape === 'lookup' ||
                        answerTrace.request_shape === 'survey' ||
                        answerTrace.request_shape === 'diagnosis' ||
                        answerTrace.request_shape === 'planning' ||
                        answerTrace.request_shape === 'mutation' ||
                        answerTrace.request_shape === 'verification' ||
                        answerTrace.request_shape === 'synthesis'
                        ? answerTrace.request_shape
                        : 'synthesis',
                    mutation_intent: answerTrace.mutation_intent === 'none' || answerTrace.mutation_intent === 'explicit_or_strong'
                        ? answerTrace.mutation_intent
                        : 'none',
                    recommended_task_kind: answerTrace.selected_role === 'raider'
                        ? 'execution'
                        : answerTrace.selected_role === 'arbiter'
                            ? 'review'
                            : 'explore',
                },
            });
        })();
        const normalizedRequestShape = answerTrace.request_shape === 'existence_check' ||
            answerTrace.request_shape === 'lookup' ||
            answerTrace.request_shape === 'survey' ||
            answerTrace.request_shape === 'diagnosis' ||
            answerTrace.request_shape === 'planning' ||
            answerTrace.request_shape === 'mutation' ||
            answerTrace.request_shape === 'verification' ||
            answerTrace.request_shape === 'synthesis'
            ? answerTrace.request_shape
            : 'synthesis';
        const normalizedMutationIntent = answerTrace.mutation_intent === 'none' || answerTrace.mutation_intent === 'explicit_or_strong'
            ? answerTrace.mutation_intent
            : 'none';
        const normalizedSelectedRole = answerTrace.selected_role === 'captain' ||
            answerTrace.selected_role === 'tactician' ||
            answerTrace.selected_role === 'scout' ||
            answerTrace.selected_role === 'raider' ||
            answerTrace.selected_role === 'arbiter'
            ? answerTrace.selected_role
            : 'captain';
        const fallbackExecutionPlan = (0, execution_plan_1.composeForemanExecutionPlan)({
            request: typeof value.request === 'string' ? value.request : '',
            requestShape: normalizedRequestShape,
            mutationIntent: normalizedMutationIntent,
            recommendedTaskKind: normalizedSelectedRole === 'raider'
                ? 'execution'
                : normalizedSelectedRole === 'arbiter'
                    ? 'review'
                    : 'explore',
        });
        const executionPlan = (0, execution_plan_1.isForemanExecutionPlan)(answerTrace.execution_plan)
            ? answerTrace.execution_plan
            : fallbackExecutionPlan;
        return {
            request: typeof value.request === 'string' ? value.request : 'details recorded in persisted state.',
            run_selection: value.run_selection === 'new_run_created' ||
                value.run_selection === 'existing_run_reused' ||
                value.run_selection === 'no_run_created'
                ? value.run_selection
                : 'no_run_created',
            requester_session_id: typeof value.requester_session_id === 'string' ? value.requester_session_id : null,
            continuity_strategy: value.continuity_strategy === 'session_fresh_run_first' ||
                value.continuity_strategy === 'session_bound_first' ||
                value.continuity_strategy === 'workspace_run_search'
                ? value.continuity_strategy
                : 'workspace_run_search',
            continuity_summary: typeof value.continuity_summary === 'string'
                ? value.continuity_summary
                : 'details recorded in persisted state.',
            entry_boundary: value.entry_boundary === 'explicit_cli_or_mcp' ||
                value.entry_boundary === 'explicit_auto_entry' ||
                value.entry_boundary === 'session_instruction_plus_wrapper'
                ? value.entry_boundary
                : 'session_instruction_plus_wrapper',
            upstream_codex_binary_intercept_supported: false,
            run_decision_reason: typeof value.run_decision_reason === 'string' ? value.run_decision_reason : 'details recorded in persisted state.',
            summary: typeof value.summary === 'string' ? value.summary : 'details recorded in persisted state.',
            answer_trace: {
                request_shape: normalizedRequestShape,
                mutation_intent: normalizedMutationIntent,
                companion_tool_route_class: answerTrace.companion_tool_route_class === 'none' ||
                    answerTrace.companion_tool_route_class === 'workspace_inspection' ||
                    answerTrace.companion_tool_route_class === 'docs_lookup' ||
                    answerTrace.companion_tool_route_class === 'git_inspection' ||
                    answerTrace.companion_tool_route_class === 'git_mutation' ||
                    answerTrace.companion_tool_route_class === 'multi_source_evidence'
                    ? answerTrace.companion_tool_route_class
                    : 'none',
                companion_tool_names: Array.isArray(answerTrace.companion_tool_names)
                    ? answerTrace.companion_tool_names.filter((entry) => entry === 'filesystem' ||
                        entry === 'git' ||
                        entry === 'context7' ||
                        entry === 'fetch' ||
                        entry === 'openaiDeveloperDocs')
                    : [],
                companion_tool_operation: answerTrace.companion_tool_operation === 'none' ||
                    answerTrace.companion_tool_operation === 'read' ||
                    answerTrace.companion_tool_operation === 'mutation'
                    ? answerTrace.companion_tool_operation
                    : 'none',
                tool_owner_role: (0, role_roster_1.normalizePublicAgentName)(answerTrace.tool_owner_role),
                tool_owner_model: typeof answerTrace.tool_owner_model === 'string' || answerTrace.tool_owner_model === null
                    ? answerTrace.tool_owner_model
                    : null,
                tool_owner_variant: answerTrace.tool_owner_variant === 'low' ||
                    answerTrace.tool_owner_variant === 'medium' ||
                    answerTrace.tool_owner_variant === 'high' ||
                    answerTrace.tool_owner_variant === 'xhigh' ||
                    answerTrace.tool_owner_variant === null
                    ? answerTrace.tool_owner_variant
                    : null,
                tool_execution_state: answerTrace.tool_execution_state === 'not_applicable' ||
                    answerTrace.tool_execution_state === 'selected_policy_only' ||
                    answerTrace.tool_execution_state === 'route_backed_specialist_owned' ||
                    answerTrace.tool_execution_state === 'degraded_host_fallback'
                    ? answerTrace.tool_execution_state
                    : 'not_applicable',
                tool_execution_owner: (0, role_roster_1.normalizePublicAgentName)(answerTrace.tool_execution_owner),
                execution_plan: executionPlan,
                workflow_variant_selection: workflowVariantSelection,
                selected_role: normalizedSelectedRole,
                execution_path: answerTrace.execution_path === 'captain_local' ||
                    answerTrace.execution_path === 'run_reused' ||
                    answerTrace.execution_path === 'new_run'
                    ? answerTrace.execution_path
                    : 'captain_local',
                follow_proof: answerTrace.follow_proof === 'foreman_route_visible' ||
                    answerTrace.follow_proof === 'degraded_host_fallback' ||
                    answerTrace.follow_proof === 'captain_local_only'
                    ? answerTrace.follow_proof
                    : 'captain_local_only',
                completion_rule: answerTrace.completion_rule === 'continue_foreman' ||
                    answerTrace.completion_rule === 'answer_now' ||
                    answerTrace.completion_rule === 'degraded_boundary'
                    ? answerTrace.completion_rule
                    : 'answer_now',
                budget_class: answerTrace.budget_class === 'low_cost_read_only' ||
                    answerTrace.budget_class === 'low_cost_investigation' ||
                    answerTrace.budget_class === 'planning_budget' ||
                    answerTrace.budget_class === 'implementation_budget' ||
                    answerTrace.budget_class === 'verification_budget'
                    ? answerTrace.budget_class
                    : 'low_cost_read_only',
                review_requirement: answerTrace.review_requirement === 'none' ||
                    answerTrace.review_requirement === 'optional' ||
                    answerTrace.review_requirement === 'required'
                    ? answerTrace.review_requirement
                    : 'none',
                why_selected: typeof answerTrace.why_selected === 'string'
                    ? answerTrace.why_selected
                    : 'details recorded in persisted state.',
                why_not_local: typeof answerTrace.why_not_local === 'string'
                    ? answerTrace.why_not_local
                    : 'details recorded in persisted state.',
                why_not_heavier_role: typeof answerTrace.why_not_heavier_role === 'string'
                    ? answerTrace.why_not_heavier_role
                    : 'details recorded in persisted state.',
            },
            recorded_at: typeof value.recorded_at === 'string' ? value.recorded_at : nowTimestamp(),
        };
    };
    if (!isRecord(candidate) ||
        (Object.prototype.hasOwnProperty.call(candidate, 'specialist_executors') &&
            Object.prototype.hasOwnProperty.call(candidate, 'planning_clarification_request') &&
            Object.prototype.hasOwnProperty.call(candidate, 'latest_orchestrator_synthesis') &&
            Object.prototype.hasOwnProperty.call(candidate, 'latest_response'))) {
        const normalizedCandidate = isRecord(candidate)
            ? {
                ...candidate,
                latest_orchestrator_synthesis: Object.prototype.hasOwnProperty.call(candidate, 'latest_orchestrator_synthesis')
                    ? normalizeLatestOrchestratorSynthesis(candidate.latest_orchestrator_synthesis)
                    : null,
                latest_response: Object.prototype.hasOwnProperty.call(candidate, 'latest_response')
                    ? normalizeLatestResponse(candidate.latest_response)
                    : null,
                latest_entry_trace: Object.prototype.hasOwnProperty.call(candidate, 'latest_entry_trace')
                    ? normalizeLatestEntryTrace(candidate.latest_entry_trace)
                    : null,
            }
            : candidate;
        (0, validation_1.assertValidRunRecord)(normalizedCandidate);
        return normalizedCandidate;
    }
    const delegationArtifacts = await loadDelegationArtifacts(paths);
    const specialistExecutors = delegationArtifacts.reduce((executors, delegation) => upsertSpecialistExecutorSnapshot(executors, delegation.executor), []);
    const normalizedCandidate = {
        ...candidate,
        specialist_executors: specialistExecutors,
        latest_orchestrator_synthesis: Object.prototype.hasOwnProperty.call(candidate, 'latest_orchestrator_synthesis')
            ? normalizeLatestOrchestratorSynthesis(candidate.latest_orchestrator_synthesis)
            : null,
        latest_response: Object.prototype.hasOwnProperty.call(candidate, 'latest_response')
            ? normalizeLatestResponse(candidate.latest_response)
            : null,
        latest_entry_trace: Object.prototype.hasOwnProperty.call(candidate, 'latest_entry_trace')
            ? normalizeLatestEntryTrace(candidate.latest_entry_trace)
            : null,
        planning_clarification_request: Object.prototype.hasOwnProperty.call(candidate, 'planning_clarification_request')
            ? candidate.planning_clarification_request
            : null,
    };
    (0, validation_1.assertValidRunRecord)(normalizedCandidate);
    return normalizedCandidate;
}
async function loadRunRecord(paths) {
    return normalizeLoadedRunRecord(paths, await readJsonDocument(paths.runFile));
}
async function loadResumeCheckpointRecordIfPresent(paths) {
    let candidate;
    try {
        candidate = await readJsonDocument(paths.resumeCheckpointFile);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
    if (isRecord(candidate) &&
        Array.isArray(candidate.task_card_index)) {
        candidate = {
            ...candidate,
            task_card_index: candidate.task_card_index.map((taskCardIndexEntry) => {
                if (!isRecord(taskCardIndexEntry)) {
                    return taskCardIndexEntry;
                }
                const assignedRole = Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'assigned_role') &&
                    typeof taskCardIndexEntry.assigned_role === 'string'
                    ? taskCardIndexEntry.assigned_role
                    : 'code specialist';
                const roleSnapshot = createTaskRoleConfigSnapshot(assignedRole);
                const nodeKind = Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'node_kind') &&
                    typeof taskCardIndexEntry.node_kind === 'string'
                    ? taskCardIndexEntry.node_kind
                    : 'execution';
                const fanInFromTaskCardIds = Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'fan_in_from_task_card_ids') &&
                    Array.isArray(taskCardIndexEntry.fan_in_from_task_card_ids)
                    ? taskCardIndexEntry.fan_in_from_task_card_ids
                    : [];
                return {
                    ...taskCardIndexEntry,
                    model_tier_intent: Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'model_tier_intent')
                        ? taskCardIndexEntry.model_tier_intent
                        : deriveTaskModelTierIntent(roleSnapshot),
                    child_aggregation_contract: Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'child_aggregation_contract')
                        ? taskCardIndexEntry.child_aggregation_contract
                        : deriveTaskChildAggregationContract(nodeKind),
                    fan_in_barrier_semantics: Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'fan_in_barrier_semantics')
                        ? taskCardIndexEntry.fan_in_barrier_semantics
                        : deriveTaskFanInBarrierSemantics(nodeKind, fanInFromTaskCardIds),
                    orchestrator_review_gate: Object.prototype.hasOwnProperty.call(taskCardIndexEntry, 'orchestrator_review_gate')
                        ? taskCardIndexEntry.orchestrator_review_gate
                        : deriveTaskOrchestratorReviewGate(nodeKind, fanInFromTaskCardIds),
                };
            }),
        };
    }
    (0, validation_1.assertValidResumeCheckpointRecord)(candidate);
    return candidate;
}
function normalizeLoadedOrchestrationAttempt(candidate) {
    if (!isRecord(candidate)) {
        (0, validation_1.assertValidOrchestrationAttemptRecord)(candidate);
        return candidate;
    }
    const normalizedCandidate = {
        ...candidate,
        steps: Array.isArray(candidate.steps)
            ? candidate.steps.map((step) => isRecord(step)
                ? {
                    ...step,
                    before: normalizeLoadedOrchestrationAttemptSnapshot(step.before),
                    after: normalizeLoadedOrchestrationAttemptSnapshot(step.after),
                }
                : step)
            : candidate.steps,
        stop: isRecord(candidate.stop)
            ? {
                ...candidate.stop,
                snapshot: normalizeLoadedOrchestrationAttemptSnapshot(candidate.stop.snapshot),
            }
            : candidate.stop,
    };
    (0, validation_1.assertValidOrchestrationAttemptRecord)(normalizedCandidate);
    return normalizedCandidate;
}
async function loadRunContext(paths) {
    const runCandidate = await loadRunRecord(paths);
    if (isPlanningClarificationHold(runCandidate)) {
        throw new Error(`Run ${runCandidate.run_id} is paused awaiting planner clarification, so task-card and orchestrator-state surfaces are unavailable until that clarification is resolved.`);
    }
    const taskCardId = runCandidate.active_task_card_id ?? runCandidate.task_card_ids[0];
    if (!taskCardId) {
        throw new Error('Run context is missing an active or persisted task-card identifier.');
    }
    if (!runCandidate.task_card_ids.includes(taskCardId)) {
        throw new Error(`Run state integrity mismatch: active_task_card_id ${taskCardId} does not appear in run.json task_card_ids.`);
    }
    if ((runCandidate.stage === 'execution' || runCandidate.stage === 'verification') && !runCandidate.active_task_card_id) {
        throw new Error(`Run state integrity mismatch: run.json active_task_card_id must be set when run.stage=${runCandidate.stage}.`);
    }
    const taskCards = await loadPersistedTaskCardsForRun(paths, runCandidate);
    const activeTaskCards = taskCards.filter((taskCard) => taskCard.status === 'active');
    if (activeTaskCards.length > 1) {
        throw new Error('Task-card integrity mismatch: exactly one task-card may be active at a time.');
    }
    const taskCardCandidate = taskCards.find((candidate) => candidate.task_card_id === taskCardId);
    if (!taskCardCandidate) {
        throw new Error(`Run context is missing the active task-card file for ${taskCardId}.`);
    }
    if (runCandidate.status === 'active' &&
        (runCandidate.stage === 'execution' || runCandidate.stage === 'verification') &&
        activeTaskCards.length !== 1) {
        throw new Error(`Task-card integrity mismatch: exactly one task-card must be active when run.status=active and run.stage=${runCandidate.stage}.`);
    }
    if (runCandidate.status === 'active' && runCandidate.stage === 'execution' && taskCardCandidate.status !== 'active') {
        throw new Error(`Task-card integrity mismatch: active task-card ${taskCardCandidate.task_card_id} must have status=active when run.stage=execution.`);
    }
    const latestHandoff = await loadLatestHandoffForTask(paths, runCandidate, taskCardCandidate);
    const orchestratorState = normalizeLoadedOrchestratorState(await readJsonDocument(paths.orchestratorStateFile));
    return {
        run: runCandidate,
        taskCards,
        taskCard: taskCardCandidate,
        latestHandoff,
        orchestratorState,
    };
}
async function loadTaskCardRecordForRun(paths, run, taskCardId) {
    const taskCardCandidate = normalizeLoadedTaskCardRecord(await readJsonDocument(node_path_1.default.join(paths.taskCardsDir, `${taskCardId}.json`)));
    if (taskCardCandidate.task_card_id !== taskCardId) {
        throw new Error(`Task-card file integrity mismatch: expected task_card_id ${taskCardId} but found ${taskCardCandidate.task_card_id}.`);
    }
    if (taskCardCandidate.run_id !== run.run_id) {
        throw new Error(`Task-card integrity mismatch: task-card run_id ${taskCardCandidate.run_id} does not match run.json run_id ${run.run_id}.`);
    }
    if (taskCardCandidate.status === 'queued' && taskCardCandidate.thread_ids.length > 0) {
        throw new Error(`Task-card integrity mismatch: queued task-card ${taskCardCandidate.task_card_id} must not have execution thread_ids.`);
    }
    return taskCardCandidate;
}
async function loadPersistedTaskCardsForRun(paths, run) {
    const taskCards = [];
    for (const persistedTaskCardId of run.task_card_ids) {
        taskCards.push(await loadTaskCardRecordForRun(paths, run, persistedTaskCardId));
    }
    return taskCards;
}
async function loadMutableRunContext(paths) {
    const hotContext = await loadHotRunContext(paths);
    let cachedTaskCards = null;
    return {
        ...hotContext,
        hydrateTaskCards: async () => {
            if (cachedTaskCards === null) {
                if (hotContext.run.task_card_ids.length === 1 &&
                    hotContext.run.task_card_ids[0] === hotContext.taskCard.task_card_id) {
                    cachedTaskCards = [hotContext.taskCard];
                    return cachedTaskCards;
                }
                cachedTaskCards = await loadPersistedTaskCardsForRun(paths, hotContext.run);
                cachedTaskCards = cachedTaskCards.map((taskCard) => taskCard.task_card_id === hotContext.taskCard.task_card_id ? hotContext.taskCard : taskCard);
            }
            return cachedTaskCards;
        },
    };
}
async function loadTaskCardTitlesForRun(paths, run, taskCardIds) {
    const titles = new Map();
    for (const taskCardId of taskCardIds) {
        if (titles.has(taskCardId)) {
            continue;
        }
        const taskCard = await loadTaskCardRecordForRun(paths, run, taskCardId);
        titles.set(taskCardId, taskCard.title);
    }
    return titles;
}
async function loadLatestHandoffForTask(paths, run, taskCard) {
    if (run.latest_handoff_id === null) {
        return null;
    }
    const handoffCandidate = await readJsonDocument(node_path_1.default.join(paths.handoffsDir, `${run.latest_handoff_id}.json`));
    (0, validation_1.assertValidHandoffRecord)(handoffCandidate);
    if (handoffCandidate.run_id !== run.run_id) {
        throw new Error(`Handoff integrity mismatch: handoff run_id ${handoffCandidate.run_id} does not match run.json run_id ${run.run_id}.`);
    }
    if (handoffCandidate.task_card_id !== taskCard.task_card_id) {
        throw new Error(`Handoff integrity mismatch: handoff task_card_id ${handoffCandidate.task_card_id} does not match active task-card ${taskCard.task_card_id}.`);
    }
    return handoffCandidate;
}
async function loadHotRunContext(paths) {
    const run = await loadRunRecord(paths);
    if (isPlanningClarificationHold(run)) {
        throw new Error(`Run ${run.run_id} is paused awaiting planner clarification, so active task-card and orchestrator-state surfaces are unavailable until that clarification is resolved.`);
    }
    const taskCardId = run.active_task_card_id ?? run.task_card_ids[0];
    if (!taskCardId) {
        throw new Error('Run context is missing an active or persisted task-card identifier.');
    }
    if (!run.task_card_ids.includes(taskCardId)) {
        throw new Error(`Run state integrity mismatch: active_task_card_id ${taskCardId} does not appear in run.json task_card_ids.`);
    }
    if ((run.stage === 'execution' || run.stage === 'verification') && !run.active_task_card_id) {
        throw new Error(`Run state integrity mismatch: run.json active_task_card_id must be set when run.stage=${run.stage}.`);
    }
    const taskCard = await loadTaskCardRecordForRun(paths, run, taskCardId);
    if (run.status === 'active' && run.stage === 'execution' && taskCard.status !== 'active') {
        throw new Error(`Task-card integrity mismatch: active task-card ${taskCard.task_card_id} must have status=active when run.stage=execution.`);
    }
    if (run.status === 'active' && run.stage === 'verification' && taskCard.status !== 'active') {
        throw new Error(`Task-card integrity mismatch: active task-card ${taskCard.task_card_id} must have status=active when run.stage=verification.`);
    }
    const latestHandoff = await loadLatestHandoffForTask(paths, run, taskCard);
    const orchestratorState = normalizeLoadedOrchestratorState(await readJsonDocument(paths.orchestratorStateFile));
    return {
        run,
        taskCard,
        latestHandoff,
        orchestratorState,
    };
}
function canHydrateProgressFromResumeCheckpoint(run, taskCard, checkpoint) {
    return (checkpoint.run_id === run.run_id &&
        checkpoint.updated_at === run.updated_at &&
        checkpoint.status === run.status &&
        checkpoint.stage === run.stage &&
        checkpoint.active_task_card.task_card_id === taskCard.task_card_id &&
        checkpoint.active_task_card.title === taskCard.title &&
        checkpoint.active_task_card.owner_role === taskCard.owner_role &&
        checkpoint.active_task_card.assigned_role === taskCard.assigned_role &&
        checkpoint.active_task_card.verification_state === taskCard.verification_state);
}
function canHydrateProgressFromSingleTaskHotContext(run, taskCard) {
    return (run.task_card_ids.length === 1 &&
        run.task_card_ids[0] === taskCard.task_card_id &&
        run.active_task_card_id === taskCard.task_card_id &&
        (run.stage === 'execution' || run.stage === 'verification'));
}
function createSingleTaskHotTaskCardIndexEntry(taskCard) {
    return {
        task_card_id: taskCard.task_card_id,
        title: taskCard.title,
        status: taskCard.status,
        owner_role: taskCard.owner_role,
        assigned_role: taskCard.assigned_role,
        model_tier_intent: taskCard.model_tier_intent,
        child_aggregation_contract: taskCard.child_aggregation_contract,
        fan_in_barrier_semantics: taskCard.fan_in_barrier_semantics,
        orchestrator_review_gate: taskCard.orchestrator_review_gate,
        verification_state: taskCard.verification_state,
        task_kind: taskCard.task_kind,
        node_kind: taskCard.node_kind,
        depends_on_task_card_ids: [...taskCard.depends_on_task_card_ids],
        fan_in_from_task_card_ids: [...taskCard.fan_in_from_task_card_ids],
    };
}
async function loadSelectiveProgressProjection(paths, run, taskCard, orchestratorDecision) {
    const resumeCheckpoint = await loadResumeCheckpointRecordIfPresent(paths);
    if (resumeCheckpoint && canHydrateProgressFromResumeCheckpoint(run, taskCard, resumeCheckpoint)) {
        return {
            progress: {
                ...resumeCheckpoint.progress,
            },
            hydration: {
                mode: 'resume_checkpoint_hot',
                summary: 'Status and activity resumed progress from the hot resume checkpoint plus the active task context without reloading the full persisted task-card set.',
                checkpoint_updated_at: resumeCheckpoint.updated_at,
                hot_artifacts: resumeCheckpoint.hot_artifacts,
                on_demand_artifacts: resumeCheckpoint.on_demand_artifacts,
            },
        };
    }
    if (canHydrateProgressFromSingleTaskHotContext(run, taskCard)) {
        return {
            progress: createDerivedProgressProjection(run, [taskCard], taskCard, orchestratorDecision),
            hydration: {
                mode: 'single_task_hot',
                summary: 'Status and activity derived progress directly from the active single-task run context without reloading the full persisted task-card set.',
                checkpoint_updated_at: resumeCheckpoint?.updated_at ?? null,
                hot_artifacts: resumeCheckpoint?.hot_artifacts ?? null,
                on_demand_artifacts: resumeCheckpoint?.on_demand_artifacts ?? null,
            },
        };
    }
    const fullContext = await loadRunContext(paths);
    return {
        progress: createDerivedProgressProjection(fullContext.run, fullContext.taskCards, fullContext.taskCard, orchestratorDecision),
        hydration: {
            mode: 'full_context_fallback',
            summary: resumeCheckpoint === null
                ? 'Status and activity fell back to a full persisted task-card load because no resume checkpoint was available.'
                : 'Status and activity fell back to a full persisted task-card load because the resume checkpoint no longer matched the active persisted run state.',
            checkpoint_updated_at: resumeCheckpoint?.updated_at ?? null,
            hot_artifacts: resumeCheckpoint?.hot_artifacts ?? null,
            on_demand_artifacts: resumeCheckpoint?.on_demand_artifacts ?? null,
        },
    };
}
async function loadSelectiveTaskCardIndex(paths, run, taskCard) {
    const resumeCheckpoint = await loadResumeCheckpointRecordIfPresent(paths);
    if (resumeCheckpoint && resumeCheckpoint.task_card_index && canHydrateProgressFromResumeCheckpoint(run, taskCard, resumeCheckpoint)) {
        return resumeCheckpoint.task_card_index.map((taskCardIndexEntry) => ({
            ...taskCardIndexEntry,
            depends_on_task_card_ids: [...taskCardIndexEntry.depends_on_task_card_ids],
            fan_in_from_task_card_ids: [...taskCardIndexEntry.fan_in_from_task_card_ids],
        }));
    }
    if (canHydrateProgressFromSingleTaskHotContext(run, taskCard)) {
        return [createSingleTaskHotTaskCardIndexEntry(taskCard)];
    }
    const fullContext = await loadRunContext(paths);
    return fullContext.run.task_card_ids.map((taskCardId) => {
        const indexedTaskCard = fullContext.taskCards.find((candidate) => candidate.task_card_id === taskCardId);
        if (!indexedTaskCard) {
            throw new Error(`Task-card index projection could not find task-card ${taskCardId} in the loaded full run context.`);
        }
        return {
            task_card_id: indexedTaskCard.task_card_id,
            title: indexedTaskCard.title,
            status: indexedTaskCard.status,
            owner_role: indexedTaskCard.owner_role,
            assigned_role: indexedTaskCard.assigned_role,
            model_tier_intent: indexedTaskCard.model_tier_intent,
            child_aggregation_contract: indexedTaskCard.child_aggregation_contract,
            fan_in_barrier_semantics: indexedTaskCard.fan_in_barrier_semantics,
            orchestrator_review_gate: indexedTaskCard.orchestrator_review_gate,
            verification_state: indexedTaskCard.verification_state,
            task_kind: indexedTaskCard.task_kind,
            node_kind: indexedTaskCard.node_kind,
            depends_on_task_card_ids: [...indexedTaskCard.depends_on_task_card_ids],
            fan_in_from_task_card_ids: [...indexedTaskCard.fan_in_from_task_card_ids],
        };
    });
}
function assertRunContextIntegrity(input) {
    if (input.orchestratorState.run_id !== input.run.run_id) {
        throw new Error(`Orchestrator state integrity mismatch: orchestrator-state run_id ${input.orchestratorState.run_id} does not match run.json run_id ${input.run.run_id}.`);
    }
    if (input.orchestratorState.task_card_id !== input.taskCard.task_card_id) {
        throw new Error(`Orchestrator state integrity mismatch: orchestrator-state task_card_id ${input.orchestratorState.task_card_id} does not match active task-card ${input.taskCard.task_card_id}.`);
    }
    if (input.run.active_task_card_id && input.run.active_task_card_id !== input.taskCard.task_card_id) {
        throw new Error(`Run state integrity mismatch: run.json active_task_card_id ${input.run.active_task_card_id} does not match loaded task-card ${input.taskCard.task_card_id}.`);
    }
    if (!decisionsMatch(input.orchestratorState.current_decision, input.expectedDecision)) {
        throw new Error(`Orchestrator state integrity mismatch: persisted current_decision ${input.orchestratorState.current_decision.next_step} no longer matches recomputed decision ${input.expectedDecision.next_step}.`);
    }
    if (!requestsMatch(input.orchestratorState.execution_request, input.expectedExecutionRequest)) {
        throw new Error('Orchestrator state integrity mismatch: execution_request no longer matches the active task-card.');
    }
    if (!requestsMatch(input.orchestratorState.verification_request, input.expectedVerificationRequest)) {
        throw new Error('Orchestrator state integrity mismatch: verification_request no longer matches the active task-card.');
    }
}
async function persistRunArtifacts(paths, run, taskCards, taskCard, latestHandoff, orchestratorDecision) {
    (0, validation_1.assertValidRunRecord)(run);
    for (const persistedTaskCard of taskCards) {
        (0, validation_1.assertValidTaskCardRecord)(persistedTaskCard);
    }
    if (latestHandoff) {
        (0, validation_1.assertValidHandoffRecord)(latestHandoff);
    }
    await Promise.all([
        writeJsonDocument(paths.runFile, run),
        ...taskCards.map((persistedTaskCard) => writeJsonDocument(node_path_1.default.join(paths.taskCardsDir, `${persistedTaskCard.task_card_id}.json`), persistedTaskCard)),
        writeJsonDocument(paths.visibilityFile, createVisibilityProjection(run, taskCard, latestHandoff, orchestratorDecision)),
    ]);
    const taskDelegations = await loadDelegationArtifacts(paths);
    await persistPlanningChecklistFromContext(paths, {
        run,
        taskCards,
        activeTaskCard: taskCard,
        orchestratorDecision,
        taskDelegations,
    });
}
function formatTaskCardReference(taskCard) {
    return `${taskCard.title} (${taskCard.task_card_id})`;
}
function formatTaskCardList(taskCards, status) {
    const matchingTaskCards = taskCards.filter((taskCard) => taskCard.status === status);
    if (matchingTaskCards.length === 0) {
        return 'none';
    }
    return matchingTaskCards.map((taskCard) => formatTaskCardReference(taskCard)).join('; ');
}
function formatLatestVerifiedCheckpoint(checkpoint) {
    if (!checkpoint) {
        return 'none';
    }
    return `${checkpoint.title} (${checkpoint.task_card_id}) at ${checkpoint.recorded_at}: ${checkpoint.summary}`;
}
function formatInProgressValue(run, taskCard, orchestratorDecision) {
    if (run.status !== 'active' && run.status !== 'blocked') {
        return 'none';
    }
    const taskReference = formatTaskCardReference(taskCard);
    if (run.stage === 'execution') {
        if (orchestratorDecision.next_step === 'await_fan_in') {
            return orchestratorDecision.can_advance
                ? `Explicit fan-in ready for ${taskReference}`
                : `Awaiting delegated fan-in for ${taskReference}`;
        }
        return `Execution: ${taskReference}`;
    }
    if (run.stage === 'verification') {
        if (orchestratorDecision.next_step === 'await_fan_in') {
            return orchestratorDecision.can_advance
                ? `Explicit fan-in ready for ${taskReference}`
                : `Awaiting delegated fan-in for ${taskReference}`;
        }
        if (orchestratorDecision.next_step === 'await_verification' && taskCard.verification_state !== 'pending') {
            return `Manual review hold for ${taskReference}`;
        }
        if (taskCard.verification_state === 'needs_work') {
            return `Repair decision pending for ${taskReference}`;
        }
        if (taskCard.verification_state === 'blocked') {
            return `Blocked verification for ${taskReference}`;
        }
        return `Verification: ${taskReference}`;
    }
    return orchestratorDecision.summary;
}
function formatResumeFromValue(run, taskCard, orchestratorDecision) {
    const taskReference = formatTaskCardReference(taskCard);
    switch (orchestratorDecision.next_step) {
        case 'execute_task':
            return `Execute ${taskReference}.`;
        case 'verify_task':
            return `Verify ${taskReference}.`;
        case 'await_fan_in':
            return orchestratorDecision.can_advance
                ? `Advance ${taskReference} to perform explicit fan-in.`
                : `Wait for delegated workers to finish for ${taskReference}.`;
        case 'await_verification':
            if (taskCard.verification_state !== 'pending') {
                return run.latest_verification
                    ? `Resolve the manual review hold for ${taskReference}. Bounded recheck budget is exhausted. Latest verification: ${run.latest_verification.summary}`
                    : `Resolve the manual review hold for ${taskReference}. Bounded recheck budget is exhausted.`;
            }
            return `Resolve verification manually for ${taskReference}.`;
        case 'await_repair_decision':
            return run.latest_verification
                ? `Choose retry or replan for ${taskReference}. Latest verification: ${run.latest_verification.summary}`
                : `Choose retry or replan for ${taskReference}.`;
        case 'await_operator':
            return orchestratorDecision.summary;
        case 'halt_completed':
            return 'No action required. Run completed.';
        case 'halt_failed':
            return 'Inspect the recorded failure before resuming.';
        case 'halt_cancelled':
            return 'Restart or recreate the run after cancellation.';
    }
}
function buildSessionHandoffNotes(run, orchestratorDecision) {
    const routeSelection = (0, orchestrator_1.getOrchestratorRouteSelection)(orchestratorDecision);
    const notes = [
        `- Current decision: ${orchestratorDecision.summary}`,
        `- Route selection: ${routeSelection.route_id} — ${routeSelection.reason}`,
    ];
    if (run.latest_verification) {
        notes.push(`- Latest verification: ${run.latest_verification.state} — ${run.latest_verification.summary}`);
    }
    if (run.latest_failure) {
        notes.push(`- Latest failure: ${run.latest_failure.reason} — ${run.latest_failure.summary}`);
    }
    if (run.latest_verified_checkpoint) {
        notes.push(`- Latest verified checkpoint: ${run.latest_verified_checkpoint.title} (${run.latest_verified_checkpoint.task_card_id})`);
    }
    return notes;
}
function formatContinuityRecordedFlag(value) {
    return value ? 'yes' : 'no';
}
function formatContinuityPlannerAttemptId(plannerAttemptId) {
    return plannerAttemptId ?? 'none';
}
function formatContinuityCheckpointToken(checkpoint) {
    if (checkpoint === null) {
        return 'none';
    }
    return `${checkpoint.task_card_id}@${checkpoint.recorded_at}`;
}
function createSafeSessionHandoffNotes(input) {
    const routeSelection = (0, orchestrator_1.getOrchestratorRouteSelection)(input.orchestratorDecision);
    return [
        `next_step=${input.orchestratorDecision.next_step}`,
        `route_id=${routeSelection.route_id}`,
        `planner_attempt_id=${formatContinuityPlannerAttemptId(input.plannerAttemptId)}`,
        `review_pass_count=${input.reviewPassCount}`,
        `latest_handoff_recorded=${formatContinuityRecordedFlag(input.hasLatestHandoff)}`,
        `latest_verification_state=${input.run.latest_verification?.state ?? 'none'}`,
        `latest_failure_reason=${input.run.latest_failure?.reason ?? 'none'}`,
        `latest_verified_checkpoint=${formatContinuityCheckpointToken(input.run.latest_verified_checkpoint)}`,
        `resume_details_available=${formatContinuityRecordedFlag(input.resumeDetailsAvailable)}`,
        'continuity_details=recorded_in_persisted_state',
    ];
}
function createSafePlanningClarificationSessionHandoffNotes(run) {
    const clarificationRequest = run.planning_clarification_request;
    if (clarificationRequest === null) {
        return [];
    }
    return [
        'hold_state=planning_clarification_active',
        `planner_attempt_id=${clarificationRequest.planner_attempt_id}`,
        'review_pass_count=not_applicable',
        `latest_verified_checkpoint=${formatContinuityCheckpointToken(run.latest_verified_checkpoint)}`,
        'clarification_details=recorded_in_persisted_state',
        'resume_details=recorded_in_persisted_state',
    ];
}
const MAX_LATEST_HANDOFF_SUMMARY_LENGTH = 96;
function truncateLatestHandoffSummary(summary) {
    if (summary.length <= MAX_LATEST_HANDOFF_SUMMARY_LENGTH) {
        return summary;
    }
    return `${summary.slice(0, MAX_LATEST_HANDOFF_SUMMARY_LENGTH - 3).trimEnd()}...`;
}
function normalizeCompactText(value) {
    return value.replace(/\s+/g, ' ').trim();
}
function createSafeLatestHandoffSummary(latestHandoff, taskCard) {
    if (latestHandoff === null || latestHandoff === undefined) {
        return null;
    }
    const normalizedTaskTitle = taskCard && taskCard.task_card_id === latestHandoff.task_card_id ? normalizeCompactText(taskCard.title) : '';
    const taskLabel = normalizedTaskTitle.length > 0 ? normalizedTaskTitle : `task_card_id=${latestHandoff.task_card_id}`;
    const summary = `Latest handoff: ${latestHandoff.from_role} -> ${latestHandoff.to_role} for ${taskLabel}.`;
    if (summary.trim().length === 0) {
        return null;
    }
    return truncateLatestHandoffSummary(summary);
}
function createSafeLatestVerifiedCheckpointSummary(checkpoint) {
    if (checkpoint === null) {
        return null;
    }
    return `Verified checkpoint recorded for task_card_id=${checkpoint.task_card_id} at ${checkpoint.recorded_at}; details remain in persisted state.`;
}
function createContinuityProjection(input) {
    const latestVerifiedCheckpointSummary = createSafeLatestVerifiedCheckpointSummary(input.run.latest_verified_checkpoint);
    if (isPlanningClarificationHold(input.run)) {
        const clarificationRequest = input.run.planning_clarification_request;
        if (clarificationRequest === null) {
            throw new Error('Planning clarification continuity requires planning_clarification_request in run.json.');
        }
        const sessionHandoffNotes = createSafePlanningClarificationSessionHandoffNotes(input.run);
        return {
            summary: `planner_attempt_id=${clarificationRequest.planner_attempt_id}; clarification_hold=active; review_pass_count=not_applicable; ` +
                `latest_verified_checkpoint_recorded=${formatContinuityRecordedFlag(input.run.latest_verified_checkpoint !== null)}; ` +
                'clarification_details=recorded_in_persisted_state; resume_details=recorded_in_persisted_state',
            planner_attempt_id: clarificationRequest.planner_attempt_id,
            review_pass_count: null,
            latest_handoff_summary: null,
            latest_verified_checkpoint_summary: latestVerifiedCheckpointSummary,
            session_handoff_notes: sessionHandoffNotes,
        };
    }
    if (!input.taskCard || !input.orchestratorDecision || !input.progress) {
        throw new Error('Active continuity projection requires task-card, orchestrator decision, and derived progress inputs.');
    }
    const sessionHandoffNotes = createSafeSessionHandoffNotes({
        run: input.run,
        plannerAttemptId: input.taskCard.planner_attempt_id,
        reviewPassCount: input.taskCard.review_pass_count,
        hasLatestHandoff: input.latestHandoff !== null && input.latestHandoff !== undefined,
        orchestratorDecision: input.orchestratorDecision,
        resumeDetailsAvailable: input.progress.resume_from.trim().length > 0,
    });
    return {
        summary: `planner_attempt_id=${formatContinuityPlannerAttemptId(input.taskCard.planner_attempt_id)}; ` +
            `review_pass_count=${input.taskCard.review_pass_count}; ` +
            `latest_handoff_recorded=${formatContinuityRecordedFlag(input.latestHandoff !== null && input.latestHandoff !== undefined)}; ` +
            `latest_verified_checkpoint_recorded=${formatContinuityRecordedFlag(input.run.latest_verified_checkpoint !== null)}; ` +
            `resume_details_available=${formatContinuityRecordedFlag(input.progress.resume_from.trim().length > 0)}`,
        planner_attempt_id: input.taskCard.planner_attempt_id,
        review_pass_count: input.taskCard.review_pass_count,
        latest_handoff_summary: createSafeLatestHandoffSummary(input.latestHandoff, input.taskCard),
        latest_verified_checkpoint_summary: latestVerifiedCheckpointSummary,
        session_handoff_notes: sessionHandoffNotes,
    };
}
function createDerivedProgressProjection(run, taskCards, taskCard, orchestratorDecision) {
    return {
        completed: formatTaskCardList(taskCards, 'completed'),
        in_progress: formatInProgressValue(run, taskCard, orchestratorDecision),
        remaining: formatTaskCardList(taskCards, 'queued'),
        resume_from: formatResumeFromValue(run, taskCard, orchestratorDecision),
        latest_verified_checkpoint: formatLatestVerifiedCheckpoint(run.latest_verified_checkpoint),
    };
}
function assertTaskCardSetIntegrityForProgress(run, taskCards, taskCard) {
    const activeTaskCards = taskCards.filter((candidate) => candidate.status === 'active');
    if (activeTaskCards.length > 1) {
        throw new Error('Task-card integrity mismatch: exactly one task-card may be active at a time.');
    }
    if (run.status === 'active' &&
        (run.stage === 'execution' || run.stage === 'verification') &&
        activeTaskCards.length !== 1) {
        throw new Error(`Task-card integrity mismatch: exactly one task-card must be active when run.status=active and run.stage=${run.stage}.`);
    }
    if (!taskCards.some((candidate) => candidate.task_card_id === taskCard.task_card_id)) {
        throw new Error(`Run context is missing the active task-card file for ${taskCard.task_card_id}.`);
    }
}
function toWorkspaceRelativePath(paths, targetPath) {
    return node_path_1.default.relative(paths.workspaceDir, targetPath);
}
async function findLatestAttemptArtifactPath(paths) {
    let entries = [];
    try {
        entries = await (0, promises_1.readdir)(paths.orchestrationAttemptsDir);
    }
    catch {
        return null;
    }
    const latestAttemptFile = entries
        .filter((entry) => /^attempt-\d+\.json$/.test(entry))
        .sort((left, right) => left.localeCompare(right))
        .at(-1);
    if (!latestAttemptFile) {
        return null;
    }
    return toWorkspaceRelativePath(paths, node_path_1.default.join(paths.orchestrationAttemptsDir, latestAttemptFile));
}
function createResumeCheckpointRecord(input) {
    const taskCardLookup = new Map(input.taskCards.map((taskCard) => [taskCard.task_card_id, taskCard]));
    return {
        version: 1,
        run_id: input.run.run_id,
        updated_at: input.run.updated_at,
        status: input.run.status,
        stage: input.run.stage,
        active_task_card: {
            task_card_id: input.taskCard.task_card_id,
            title: input.taskCard.title,
            owner_role: input.taskCard.owner_role,
            assigned_role: input.taskCard.assigned_role,
            verification_state: input.taskCard.verification_state,
        },
        decision: {
            next_step: input.orchestratorDecision.next_step,
            can_advance: input.orchestratorDecision.can_advance,
            summary: input.orchestratorDecision.summary,
        },
        progress: {
            ...input.progress,
        },
        continuity: {
            summary: input.continuity.summary,
            planner_attempt_id: input.continuity.planner_attempt_id,
            review_pass_count: input.continuity.review_pass_count,
            latest_handoff_summary: input.continuity.latest_handoff_summary,
            latest_verified_checkpoint_summary: input.continuity.latest_verified_checkpoint_summary,
        },
        hot_artifacts: {
            run_file: toWorkspaceRelativePath(input.paths, input.paths.runFile),
            visibility_file: toWorkspaceRelativePath(input.paths, input.paths.visibilityFile),
            orchestrator_state_file: toWorkspaceRelativePath(input.paths, input.paths.orchestratorStateFile),
            active_task_card_file: toWorkspaceRelativePath(input.paths, node_path_1.default.join(input.paths.taskCardsDir, `${input.taskCard.task_card_id}.json`)),
            progress_markdown_file: toWorkspaceRelativePath(input.paths, input.paths.progressFile),
        },
        on_demand_artifacts: {
            latest_orchestration_attempt_file: input.latestOrchestrationAttemptFile,
            latest_planner_attempt_dir: input.latestPlannerAttemptDir,
            delegations_dir: toWorkspaceRelativePath(input.paths, input.paths.delegationsDir),
            raw_events_dir: toWorkspaceRelativePath(input.paths, input.paths.rawEventsDir),
        },
        task_card_index: input.run.task_card_ids.map((taskCardId) => {
            const taskCardRecord = taskCardLookup.get(taskCardId);
            if (!taskCardRecord) {
                throw new Error(`Resume checkpoint could not index task-card ${taskCardId} because it was missing from the loaded task-card set.`);
            }
            return {
                task_card_id: taskCardRecord.task_card_id,
                title: taskCardRecord.title,
                status: taskCardRecord.status,
                owner_role: taskCardRecord.owner_role,
                assigned_role: taskCardRecord.assigned_role,
                model_tier_intent: taskCardRecord.model_tier_intent,
                child_aggregation_contract: taskCardRecord.child_aggregation_contract,
                fan_in_barrier_semantics: taskCardRecord.fan_in_barrier_semantics,
                orchestrator_review_gate: taskCardRecord.orchestrator_review_gate,
                verification_state: taskCardRecord.verification_state,
                task_kind: taskCardRecord.task_kind,
                node_kind: taskCardRecord.node_kind,
                depends_on_task_card_ids: [...taskCardRecord.depends_on_task_card_ids],
                fan_in_from_task_card_ids: [...taskCardRecord.fan_in_from_task_card_ids],
            };
        }),
    };
}
function buildDerivedProgressDocument(run, progress, orchestratorDecision) {
    return [
        `# Run ${run.run_id}`,
        '',
        `- **status:** ${run.status}`,
        `- **completed:** ${progress.completed}`,
        `- **in_progress:** ${progress.in_progress}`,
        `- **remaining:** ${progress.remaining}`,
        `- **resume_from:** ${progress.resume_from}`,
        `- **latest_verified_checkpoint:** ${progress.latest_verified_checkpoint}`,
        `- **updated_at:** ${run.updated_at}`,
        '',
        '## Session Handoff Notes',
        '',
        ...buildSessionHandoffNotes(run, orchestratorDecision),
        '',
    ].join('\n');
}
async function writeDerivedProgressArtifacts(paths, input) {
    const { run, taskCards, taskCard, latestHandoff, orchestratorDecision } = input;
    assertTaskCardSetIntegrityForProgress(run, taskCards, taskCard);
    const progress = createDerivedProgressProjection(run, taskCards, taskCard, orchestratorDecision);
    const continuity = createContinuityProjection({
        run,
        taskCard,
        latestHandoff,
        orchestratorDecision,
        progress,
    });
    const progressDocument = buildDerivedProgressDocument(run, progress, orchestratorDecision);
    const latestPlannerAttemptDir = taskCard.planner_attempt_id === null
        ? null
        : toWorkspaceRelativePath(paths, createPlannerAttemptPaths(paths, taskCard.planner_attempt_id).attemptDir);
    const latestOrchestrationAttemptFile = await findLatestAttemptArtifactPath(paths);
    const resumeCheckpoint = createResumeCheckpointRecord({
        paths,
        run,
        taskCards,
        taskCard,
        orchestratorDecision,
        progress,
        continuity,
        latestPlannerAttemptDir,
        latestOrchestrationAttemptFile,
    });
    await (0, promises_1.mkdir)(paths.sisyphusRunsDir, { recursive: true });
    await Promise.all([
        (0, promises_1.writeFile)(paths.progressFile, progressDocument, 'utf8'),
        writeJsonDocument(paths.resumeCheckpointFile, resumeCheckpoint),
    ]);
}
async function writeDerivedProgressDocFromContext(paths, input) {
    await writeDerivedProgressArtifacts(paths, input);
}
async function writeDerivedProgressDoc(paths) {
    const hotContext = await loadHotRunContext(paths);
    const { run, taskCard, latestHandoff, orchestratorState } = hotContext;
    const taskCards = run.task_card_ids.length === 1 && run.task_card_ids[0] === taskCard.task_card_id
        ? [taskCard]
        : (await loadPersistedTaskCardsForRun(paths, run));
    await writeDerivedProgressArtifacts(paths, {
        run,
        taskCards,
        taskCard,
        latestHandoff,
        orchestratorDecision: orchestratorState.current_decision,
    });
}
//# sourceMappingURL=runtime.js.map