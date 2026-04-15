"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveRoleModelObservationDefaults = deriveRoleModelObservationDefaults;
exports.nowTimestamp = nowTimestamp;
exports.resolveForemanConfigDirectory = resolveForemanConfigDirectory;
exports.resolveForemanConfigFilePath = resolveForemanConfigFilePath;
exports.createRunPaths = createRunPaths;
exports.createForemanRunRef = createForemanRunRef;
exports.resolveForemanRunDirectory = resolveForemanRunDirectory;
exports.resolveForemanRunRef = resolveForemanRunRef;
exports.createEmptyRoleDefaults = createEmptyRoleDefaults;
exports.createDefaultForemanEntryPolicy = createDefaultForemanEntryPolicy;
exports.createDefaultForemanOutputConfig = createDefaultForemanOutputConfig;
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
exports.loadDelegationArtifact = loadDelegationArtifact;
exports.listDelegationArtifactIds = listDelegationArtifactIds;
exports.loadDelegationArtifacts = loadDelegationArtifacts;
exports.summarizeTaskDelegations = summarizeTaskDelegations;
exports.loadTaskDelegationSummary = loadTaskDelegationSummary;
exports.persistDelegationArtifact = persistDelegationArtifact;
exports.persistDelegationWithVisibilitySync = persistDelegationWithVisibilitySync;
exports.updateDelegationWithVisibilitySync = updateDelegationWithVisibilitySync;
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
function normalizeLoadedRoleModelLaunchEvidence(candidate) {
    if (candidate === null || candidate === undefined) {
        return null;
    }
    if (!isRecord(candidate)) {
        return candidate;
    }
    const launchSource = Object.prototype.hasOwnProperty.call(candidate, 'launch_source') && candidate.launch_source === 'foreman_spawn'
        ? 'foreman_spawn'
        : null;
    const requestKind = Object.prototype.hasOwnProperty.call(candidate, 'request_kind') && typeof candidate.request_kind === 'string'
        ? candidate.request_kind
        : null;
    const observedDefaults = deriveRoleModelObservationDefaults({
        requestKind,
        launchSource,
    });
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
    return {
        ...candidate,
        dispatched_profile: dispatchedProfile ?? null,
        dispatched_model: dispatchedModel ?? null,
        dispatched_variant: dispatchedVariant ?? null,
        dispatched_config_entries: Array.isArray(dispatchedConfigEntries) ? dispatchedConfigEntries : [],
        actual_profile: Object.prototype.hasOwnProperty.call(candidate, 'actual_profile')
            ? candidate.actual_profile
            : dispatchedProfile ?? null,
        actual_model: Object.prototype.hasOwnProperty.call(candidate, 'actual_model')
            ? candidate.actual_model
            : dispatchedModel ?? null,
        actual_variant: Object.prototype.hasOwnProperty.call(candidate, 'actual_variant')
            ? candidate.actual_variant
            : dispatchedVariant ?? null,
        actual_config_entries: Array.isArray(candidate.actual_config_entries)
            ? candidate.actual_config_entries
            : Array.isArray(dispatchedConfigEntries)
                ? dispatchedConfigEntries
                : [],
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
function normalizeLoadedWorkerRequest(candidate) {
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
        ['queued', new Set(['running', 'cancelled'])],
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
        model: 'gpt-5.4-mini',
        variant: 'medium',
    },
    verifier: {
        name: constants_1.FOREMAN_AGENT_ROSTER.verifier,
        model: 'gpt-5.4',
        variant: 'high',
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
        mode: 'guided_explicit',
    };
}
function createDefaultForemanOutputConfig() {
    return {
        verbosity: 'default',
    };
}
function createDefaultForemanConfig() {
    return {
        version: 1,
        entry_policy: createDefaultForemanEntryPolicy(),
        output: createDefaultForemanOutputConfig(),
        agents: {
            orchestrator: createDefaultForemanAgentConfig('orchestrator'),
            planner: createDefaultForemanAgentConfig('planner'),
            explorer: createDefaultForemanAgentConfig('explorer'),
            'code specialist': createDefaultForemanAgentConfig('code specialist'),
            verifier: createDefaultForemanAgentConfig('verifier'),
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
        case 'planner':
            return constants_1.FOREMAN_PLANNER_AGENT_ID;
        case 'explorer':
            return constants_1.FOREMAN_EXPLORER_AGENT_ID;
        case 'code specialist':
            return constants_1.FOREMAN_CODE_SPECIALIST_AGENT_ID;
        case 'verifier':
            return constants_1.FOREMAN_VERIFIER_AGENT_ID;
        case 'orchestrator':
        default:
            return null;
    }
}
function getForemanAgentConfigForRole(foremanConfig, role) {
    switch (role) {
        case 'orchestrator':
            return foremanConfig.agents.orchestrator;
        case 'planner':
            return foremanConfig.agents.planner;
        case 'explorer':
            return foremanConfig.agents.explorer ?? getDefaultForemanAgentConfigForRole('explorer');
        case 'code specialist':
            return foremanConfig.agents['code specialist'];
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
    const output = isRecord(candidate.output) &&
        (candidate.output.verbosity === 'quiet' ||
            candidate.output.verbosity === 'default' ||
            candidate.output.verbosity === 'debug')
        ? candidate.output
        : createDefaultForemanOutputConfig();
    return {
        ...candidate,
        entry_policy: isRecord(candidate.entry_policy) ? candidate.entry_policy : createDefaultForemanEntryPolicy(),
        output,
        agents: isRecord(candidate.agents) && !Object.prototype.hasOwnProperty.call(candidate.agents, 'explorer')
            ? {
                ...candidate.agents,
                explorer: defaultConfig.agents.explorer,
            }
            : candidate.agents,
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
            delegation.worker_result = null;
            delegation.reviewer_outcome = null;
            delegation.latest_failure = null;
            delegation.completed_at = null;
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
            delegation.worker_result = input.workerResult ?? null;
            delegation.reviewer_outcome = input.status === 'completed' ? input.reviewerOutcome ?? null : null;
            delegation.latest_failure = null;
            delegation.completed_at = timestamp;
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
            delegation.worker_result = input.workerResult ?? null;
            delegation.reviewer_outcome = null;
            delegation.latest_failure = {
                stage: input.failureStage,
                reason: input.failureReason,
                summary: input.failureSummary,
                recorded_at: timestamp,
            };
            delegation.completed_at = timestamp;
            break;
        }
    }
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
    (0, validation_1.assertValidOrchestrationAttemptRecord)(attempt);
    await (0, promises_1.mkdir)(paths.orchestrationAttemptsDir, { recursive: true });
    await writeJsonDocument(createOrchestrationAttemptArtifactFilePath(paths, attempt.attempt_id), attempt);
}
async function persistRunRecord(paths, run) {
    (0, validation_1.assertValidRunRecord)(run);
    await writeJsonDocument(paths.runFile, run);
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
        task_kind: taskKind,
        acceptance_checks: [...(input.acceptanceChecks ?? [])],
        review_of_task_card_ids: [...(input.reviewOfTaskCardIds ?? [])],
        depends_on_task_card_ids: [],
        fan_in_from_task_card_ids: [],
        node_kind: 'execution',
        status: 'active',
        owner_role: assignedRole,
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
    const assignedRole = taskCard.assigned_role;
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
    const routingSummary = nextStep === 'execute_task'
        ? `${routingPrefix} Decision execute_task maps advisory specialist routing to canonical code specialist for execute_task. ${neutralRecommendationSummary} ${selectedRouteSummary}`
        : nextStep === 'verify_task'
            ? `${routingPrefix} Decision verify_task maps advisory specialist routing to canonical verifier for verify_task. ${neutralRecommendationSummary} ${selectedRouteSummary}`
            : nextStep === 'await_fan_in'
                ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because parent execution is explicitly paused until bounded child delegation fan-in completes. ${selectedRouteSummary}`
                : nextStep === 'await_verification'
                    ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because verification automation is unavailable and the run awaits an explicit operator resolution. ${selectedRouteSummary}`
                    : nextStep === 'await_repair_decision'
                        ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because the workflow is awaiting an explicit repair decision. ${selectedRouteSummary}`
                        : nextStep === 'await_operator'
                            ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because the workflow awaits manual operator action. ${selectedRouteSummary}`
                            : nextStep === 'halt_completed'
                                ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because the run is already completed. ${selectedRouteSummary}`
                                : nextStep === 'halt_failed'
                                    ? `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because the run has failed and requires review before any further action. ${selectedRouteSummary}`
                                    : `${routingPrefix} ${neutralRecommendationSummary} No specialist handoff target is derived because the run is cancelled. ${selectedRouteSummary}`;
    return {
        routing_summary: routingSummary,
        routing_trace: {
            specialist_routing_mode: defaultPolicy.specialist_routing.mode,
            route_preference: defaultPolicy.specialist_routing.route_preference,
            parallelism_mode: defaultPolicy.parallelism.mode,
            route_target_role: routeTargetRole,
            route_target_step: routeTargetStep,
            selected_route: routeSelection.route_id,
            selected_route_reason: routeSelection.reason,
            recommended_category: null,
            recommended_skills: [],
            advisory_only: true,
            execution_unchanged: true,
        },
    };
}
function normalizeLoadedOrchestrationAttemptRoutingTrace(candidate) {
    if (!isRecord(candidate)) {
        return candidate;
    }
    return {
        ...candidate,
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
    if (Object.prototype.hasOwnProperty.call(candidate, 'routing_summary') &&
        Object.prototype.hasOwnProperty.call(candidate, 'routing_trace') &&
        Object.prototype.hasOwnProperty.call(candidate, 'review_summary') &&
        Object.prototype.hasOwnProperty.call(candidate, 'review_trace')) {
        return {
            ...candidate,
            routing_trace: normalizeLoadedOrchestrationAttemptRoutingTrace(candidate.routing_trace),
        };
    }
    const { next_step: nextStep, verification_state: verificationState } = candidate;
    if (nextStep !== 'execute_task' &&
        nextStep !== 'verify_task' &&
        nextStep !== 'await_fan_in' &&
        nextStep !== 'await_verification' &&
        nextStep !== 'await_repair_decision' &&
        nextStep !== 'await_operator' &&
        nextStep !== 'halt_completed' &&
        nextStep !== 'halt_failed' &&
        nextStep !== 'halt_cancelled') {
        return candidate;
    }
    if (verificationState !== 'pending' &&
        verificationState !== 'passed' &&
        verificationState !== 'needs_work' &&
        verificationState !== 'blocked') {
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