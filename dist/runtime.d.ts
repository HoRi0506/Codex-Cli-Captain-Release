import type { AlwaysOnModeRecord, ChildAgentSnapshot, ContextHydrationSummary, DelegationRecord, ExecutionRequest, ExploreArtifact, FailureReason, ForemanAgentConfig, ForemanConfigFile, ForemanReasoningVariant, HandoffRecord, OrchestrationAttemptRecord, OrchestratorDecision, OrchestrationPolicy, PlanUpdateArtifact, OrchestratorState, PlannerAttemptPaths, PlanningOutput, ResumeCheckpointRecord, ReviewerOutcomeRecord, Role, RoleDefaultsFile, RunPaths, RunRecord, RoleModelLaunchEvidence, TaskDelegationCounts, TaskCardRecord, TaskRoleConfigSnapshot, VerificationRequest, VerificationResolutionOutcome, VerificationState, VisibilityProjection, WorkflowStage } from './types';
export declare function deriveRoleModelObservationDefaults(input: {
    requestKind: RoleModelLaunchEvidence['request_kind'] | null | undefined;
    launchSource: RoleModelLaunchEvidence['launch_source'] | null | undefined;
}): Pick<RoleModelLaunchEvidence, 'observed_capability' | 'observation_status' | 'observation_match_state' | 'observation_unavailable_reason'>;
export interface UpdateDelegationWithVisibilitySyncInput {
    delegationId: string;
    status: Exclude<ChildAgentSnapshot['status'], 'queued'>;
    resultSummary?: string;
    reviewerOutcome?: ReviewerOutcomeRecord;
    workerLaunchEvidence?: DelegationRecord['worker_launch_evidence'];
    workerResult?: DelegationRecord['worker_result'];
    failureStage?: WorkflowStage;
    failureReason?: FailureReason;
    failureSummary?: string;
}
export interface DerivedProgressProjection {
    completed: string;
    in_progress: string;
    remaining: string;
    resume_from: string;
    latest_verified_checkpoint: string;
}
export interface ContinuityProjection {
    summary: string;
    planner_attempt_id: string | null;
    review_pass_count: number | null;
    latest_handoff_summary: string | null;
    latest_verified_checkpoint_summary: string | null;
    session_handoff_notes: string[];
}
export interface TaskDelegationSummary extends TaskDelegationCounts {
    delegations: DelegationRecord[];
    active_delegations: DelegationRecord[];
}
export interface HotRunContext {
    run: RunRecord;
    taskCard: TaskCardRecord;
    latestHandoff: HandoffRecord | null;
    orchestratorState: OrchestratorState;
}
export declare function nowTimestamp(): string;
export declare function resolveForemanConfigDirectory(env?: NodeJS.ProcessEnv): string;
export declare function resolveForemanConfigFilePath(env?: NodeJS.ProcessEnv): string;
export declare function createRunPaths(baseDirectory: string, runId: string): RunPaths;
export declare function createForemanRunRef(runDirectory: string): string;
export declare function resolveForemanRunDirectory(runDirectory: string): {
    cwd: string;
    runId: string;
    runDirectory: string;
};
export declare function resolveForemanRunRef(runRef: string): {
    cwd: string;
    runId: string;
    runDirectory: string;
};
export declare function createEmptyRoleDefaults(): RoleDefaultsFile;
export declare function createDefaultForemanEntryPolicy(): ForemanConfigFile['entry_policy'];
export declare function createDefaultForemanOutputConfig(): ForemanConfigFile['output'];
export declare function createDefaultForemanConfig(): ForemanConfigFile;
export declare function createRequestSettingsFromForemanAgentConfig(agentConfig: {
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}): {
    profile: string | null;
    config_entries: string[];
};
export declare function getDefaultForemanAgentConfigForRole(role: Exclude<Role, 'orchestrator'> | 'orchestrator'): ForemanConfigFile['agents'][keyof ForemanConfigFile['agents']];
export declare function getRunActiveAgentIdForRole(role: Role): RunRecord['active_agent_id'];
export declare function getForemanAgentConfigForRole(foremanConfig: ForemanConfigFile, role: Exclude<Role, 'orchestrator'> | 'orchestrator'): ForemanAgentConfig;
export declare function getAssignedRoleForTaskKind(taskKind: TaskCardRecord['task_kind']): Role;
export declare function getAgentIdForRole(role: Role): string | null;
export declare function createTaskRoleConfigSnapshot(role: Role, foremanConfig?: ForemanConfigFile): TaskRoleConfigSnapshot;
export declare function deriveTaskModelTierIntent(roleConfigSnapshot: Pick<TaskRoleConfigSnapshot, 'role' | 'model' | 'variant'>): TaskCardRecord['model_tier_intent'];
export declare function deriveTaskChildAggregationContract(nodeKind: TaskCardRecord['node_kind']): TaskCardRecord['child_aggregation_contract'];
export declare function deriveTaskFanInBarrierSemantics(nodeKind: TaskCardRecord['node_kind'], fanInFromTaskCardIds: string[]): TaskCardRecord['fan_in_barrier_semantics'];
export declare function deriveTaskOrchestratorReviewGate(nodeKind: TaskCardRecord['node_kind'], fanInFromTaskCardIds: string[]): TaskCardRecord['orchestrator_review_gate'];
export declare function createDefaultAlwaysOnModeRecord(runId: string): AlwaysOnModeRecord;
export declare function loadAlwaysOnModeRecord(paths: RunPaths): Promise<AlwaysOnModeRecord>;
export declare function persistAlwaysOnModeRecord(paths: RunPaths, record: AlwaysOnModeRecord): Promise<void>;
export declare function loadForemanConfig(baseDirectory: string): Promise<ForemanConfigFile>;
export declare function ensureForemanConfig(baseDirectory: string): Promise<{
    configPath: string;
    configCreated: boolean;
    config: ForemanConfigFile;
}>;
export declare function loadRoleDefaults(baseDirectory: string): Promise<RoleDefaultsFile>;
export declare function ensureRunPaths(paths: RunPaths): Promise<void>;
export declare function createPlannerAttemptPaths(paths: RunPaths, attemptId: string): PlannerAttemptPaths;
export declare function ensurePlannerAttemptPaths(paths: PlannerAttemptPaths): Promise<void>;
export declare function allocatePlannerAttemptId(paths: RunPaths): Promise<string>;
export declare function allocateDelegationId(paths: RunPaths): Promise<string>;
export declare function allocateOrchestrationAttemptId(paths: RunPaths): Promise<string>;
export declare function createDelegationArtifactFilePath(paths: RunPaths, delegationId: string): string;
export declare function loadDelegationArtifact(paths: RunPaths, delegationId: string): Promise<DelegationRecord>;
export declare function listDelegationArtifactIds(paths: RunPaths): Promise<string[]>;
export declare function loadDelegationArtifacts(paths: RunPaths): Promise<DelegationRecord[]>;
export declare function summarizeTaskDelegations(taskCardId: string, delegations: DelegationRecord[]): TaskDelegationSummary;
export declare function loadTaskDelegationSummary(paths: RunPaths, taskCardId: string): Promise<TaskDelegationSummary>;
export declare function persistDelegationArtifact(paths: RunPaths, delegation: DelegationRecord): Promise<void>;
export declare function persistDelegationWithVisibilitySync(paths: RunPaths, delegation: DelegationRecord): Promise<void>;
export declare function updateDelegationWithVisibilitySync(paths: RunPaths, input: UpdateDelegationWithVisibilitySyncInput): Promise<DelegationRecord>;
export declare function createOrchestrationAttemptArtifactFilePath(paths: RunPaths, attemptId: string): string;
export declare function loadOrchestrationAttemptArtifact(paths: RunPaths, attemptId: string): Promise<OrchestrationAttemptRecord>;
export declare function listOrchestrationAttemptIds(paths: RunPaths): Promise<string[]>;
export declare function loadLatestOrchestrationAttempt(paths: RunPaths): Promise<OrchestrationAttemptRecord | null>;
export declare function persistOrchestrationAttemptArtifact(paths: RunPaths, attempt: OrchestrationAttemptRecord): Promise<void>;
export declare function persistRunRecord(paths: RunPaths, run: RunRecord): Promise<void>;
export declare function createInitialRunRecord(input: {
    runId: string;
    goal: string;
    taskCardId: string;
    createdAt?: string;
}): RunRecord;
export declare function createInitialTaskCardRecord(input: {
    taskCardId: string;
    runId: string;
    title: string;
    intent: string;
    scope: string;
    acceptance: string;
    executionPrompt: string;
    plannerAttemptId?: string | null;
    taskKind?: TaskCardRecord['task_kind'];
    acceptanceChecks?: string[];
    reviewOfTaskCardIds?: string[];
    roleConfigSnapshot?: TaskRoleConfigSnapshot;
    createdAt?: string;
}): TaskCardRecord;
export declare function createQueuedTaskCardRecord(input: {
    taskCardId: string;
    runId: string;
    title: string;
    intent: string;
    scope: string;
    acceptance: string;
    executionPrompt: string;
    plannerAttemptId?: string | null;
    taskKind?: TaskCardRecord['task_kind'];
    acceptanceChecks?: string[];
    reviewOfTaskCardIds?: string[];
    roleConfigSnapshot?: TaskRoleConfigSnapshot;
    dependsOnTaskCardIds?: string[];
    fanInFromTaskCardIds?: string[];
    nodeKind?: TaskCardRecord['node_kind'];
    createdAt?: string;
}): TaskCardRecord;
export declare function createPlanningRunRecord(input: {
    runId: string;
    goal: string;
    createdAt?: string;
}): RunRecord;
export declare function isPlanningClarificationHold(run: Pick<RunRecord, 'status' | 'stage' | 'planning_clarification_request'>): boolean;
export declare function markPlanningRunClarificationHold(run: RunRecord, input: {
    plannerAttemptId: string;
    summary: string;
    clarificationRequest: string;
}): void;
export declare function createHandoffRecord(input: {
    handoffId: string;
    runId: string;
    taskCardId: string;
    fromRole: Role;
    toRole: Role;
    summary: string;
    createdAt?: string;
}): HandoffRecord;
export declare function createDefaultOrchestrationPolicy(): OrchestrationPolicy;
export declare function createOrchestratorState(input: {
    runId: string;
    taskCardId: string;
    executionRequest: ExecutionRequest;
    verificationRequest: VerificationRequest | null;
    orchestrationPolicy?: OrchestrationPolicy;
    decision: OrchestratorDecision;
    createdAt?: string;
}): OrchestratorState;
export declare function setOrchestratorDecision(state: OrchestratorState, decision: OrchestratorDecision): void;
export declare function applyInitialTaskHandoff(run: RunRecord, taskCard: TaskCardRecord, handoff: HandoffRecord): void;
export declare function activatePlannedTask(run: RunRecord, taskCard: TaskCardRecord, handoff: HandoffRecord): void;
export declare function reactivateBlockedTask(run: RunRecord, taskCard: TaskCardRecord, handoff: HandoffRecord): void;
export declare function cancelQueuedTaskCard(taskCard: TaskCardRecord, timestamp: string): void;
export declare function findNextQueuedTaskCard(run: RunRecord, taskCards: TaskCardRecord[]): TaskCardRecord | null;
export declare function findReadyQueuedTaskCards(run: RunRecord, taskCards: TaskCardRecord[]): TaskCardRecord[];
export declare function addUniqueValue(values: string[], nextValue: string): string[];
export declare function updateExecutionThread(run: RunRecord, taskCard: TaskCardRecord, threadId: string): void;
export declare function markExecutionCompleted(run: RunRecord, taskCard: TaskCardRecord, handoff: HandoffRecord): void;
export declare function assertVerificationResolutionAllowed(run: RunRecord, taskCard: TaskCardRecord): void;
export declare function applyVerificationResolution(run: RunRecord, taskCard: TaskCardRecord, input: {
    outcome: VerificationResolutionOutcome;
    summary: string;
}): void;
export declare function promoteNextPlannedTask(run: RunRecord, completedTaskCard: TaskCardRecord, nextTaskCard: TaskCardRecord, verificationSummary: string, handoff: HandoffRecord): void;
export declare function markRunTerminalState(run: RunRecord, taskCard: TaskCardRecord, input: {
    status: 'failed' | 'cancelled';
    stage: WorkflowStage;
    reason: FailureReason;
    summary: string;
    ownerRole: Role;
    verificationState: VerificationState;
}): void;
export declare function markPlanningRunTerminalState(run: RunRecord, input: {
    status: 'failed' | 'cancelled';
    reason: FailureReason;
    summary: string;
}): void;
export declare function createVisibilityProjection(run: RunRecord, taskCard: TaskCardRecord, latestHandoff: HandoffRecord | null, orchestratorDecision: OrchestratorDecision): VisibilityProjection;
export declare function persistHandoffRecord(paths: RunPaths, handoff: HandoffRecord): Promise<void>;
export declare function persistPlannerEvidence(paths: PlannerAttemptPaths, evidence: {
    stdout: string;
    stderr: string;
}): Promise<void>;
export declare function persistPlanningArtifact(paths: PlannerAttemptPaths, planning: PlanningOutput): Promise<void>;
export declare function persistPlanUpdateArtifact(paths: PlannerAttemptPaths, planUpdate: PlanUpdateArtifact): Promise<void>;
export declare function createExploreArtifactFilePath(paths: RunPaths, taskCardId: string): string;
export declare function persistExploreArtifact(paths: RunPaths, artifact: ExploreArtifact): Promise<void>;
export declare function loadPlanUpdateArtifactIfPresent(paths: PlannerAttemptPaths): Promise<{
    artifact: PlanUpdateArtifact | null;
    filePath: string | null;
}>;
export declare function loadExploreArtifactIfPresent(paths: RunPaths, taskCardId: string): Promise<{
    artifact: ExploreArtifact | null;
    filePath: string | null;
}>;
export declare function persistOrchestratorState(paths: RunPaths, state: OrchestratorState): Promise<void>;
export declare function loadRunRecord(paths: RunPaths): Promise<RunRecord>;
export declare function loadResumeCheckpointRecordIfPresent(paths: RunPaths): Promise<ResumeCheckpointRecord | null>;
export declare function loadRunContext(paths: RunPaths): Promise<{
    run: RunRecord;
    taskCards: TaskCardRecord[];
    taskCard: TaskCardRecord;
    latestHandoff: HandoffRecord | null;
    orchestratorState: OrchestratorState;
}>;
export declare function loadPersistedTaskCardsForRun(paths: RunPaths, run: RunRecord): Promise<TaskCardRecord[]>;
export declare function loadMutableRunContext(paths: RunPaths): Promise<{
    run: RunRecord;
    taskCard: TaskCardRecord;
    latestHandoff: HandoffRecord | null;
    orchestratorState: OrchestratorState;
    hydrateTaskCards: () => Promise<TaskCardRecord[]>;
}>;
export declare function loadTaskCardTitlesForRun(paths: RunPaths, run: RunRecord, taskCardIds: readonly string[]): Promise<Map<string, string>>;
export declare function loadHotRunContext(paths: RunPaths): Promise<HotRunContext>;
export declare function loadSelectiveProgressProjection(paths: RunPaths, run: RunRecord, taskCard: TaskCardRecord, orchestratorDecision: OrchestratorDecision): Promise<{
    progress: DerivedProgressProjection;
    hydration: ContextHydrationSummary;
}>;
export declare function loadSelectiveTaskCardIndex(paths: RunPaths, run: RunRecord, taskCard: TaskCardRecord): Promise<NonNullable<ResumeCheckpointRecord['task_card_index']>>;
export declare function assertRunContextIntegrity(input: {
    run: RunRecord;
    taskCard: TaskCardRecord;
    orchestratorState: OrchestratorState;
    expectedDecision: OrchestratorDecision;
    expectedExecutionRequest: ExecutionRequest;
    expectedVerificationRequest: VerificationRequest | null;
}): void;
export declare function persistRunArtifacts(paths: RunPaths, run: RunRecord, taskCards: TaskCardRecord[], taskCard: TaskCardRecord, latestHandoff: HandoffRecord | null, orchestratorDecision: OrchestratorDecision): Promise<void>;
export declare function createContinuityProjection(input: {
    run: RunRecord;
    taskCard?: Pick<TaskCardRecord, 'task_card_id' | 'title' | 'planner_attempt_id' | 'review_pass_count'>;
    latestHandoff?: Pick<HandoffRecord, 'from_role' | 'to_role' | 'task_card_id'> | null;
    orchestratorDecision?: OrchestratorDecision;
    progress?: Pick<DerivedProgressProjection, 'resume_from'>;
}): ContinuityProjection;
export declare function createDerivedProgressProjection(run: RunRecord, taskCards: TaskCardRecord[], taskCard: TaskCardRecord, orchestratorDecision: OrchestratorDecision): DerivedProgressProjection;
export declare function writeDerivedProgressDocFromContext(paths: RunPaths, input: {
    run: RunRecord;
    taskCards: TaskCardRecord[];
    taskCard: TaskCardRecord;
    latestHandoff: HandoffRecord | null;
    orchestratorDecision: OrchestratorDecision;
}): Promise<void>;
export declare function writeDerivedProgressDoc(paths: RunPaths): Promise<void>;
