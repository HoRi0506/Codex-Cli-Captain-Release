import type { CHILD_AGENT_STATUSES, FAILURE_REASONS, HANDOFF_OUTCOMES, ORCHESTRATOR_DECISION_STEPS, PERSISTED_RUN_ACTIVE_AGENT_IDS, ROLE_DEFAULT_ROLES, PERSISTED_TASK_CARD_ASSIGNED_AGENT_IDS, ROLES, RUN_STATUSES, TASK_CARD_STATUSES, VERIFICATION_STATES, WORKFLOW_STAGES } from './constants';
export type RunStatus = (typeof RUN_STATUSES)[number];
export type TaskCardStatus = (typeof TASK_CARD_STATUSES)[number];
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];
export type FailureReason = (typeof FAILURE_REASONS)[number];
export type Role = (typeof ROLES)[number];
export type RoleDefaultRole = (typeof ROLE_DEFAULT_ROLES)[number];
export type VerificationState = (typeof VERIFICATION_STATES)[number];
export type ChildAgentStatus = (typeof CHILD_AGENT_STATUSES)[number];
export type HandoffOutcome = (typeof HANDOFF_OUTCOMES)[number];
export type OrchestratorDecisionStep = (typeof ORCHESTRATOR_DECISION_STEPS)[number];
export type PersistedRunActiveAgentId = (typeof PERSISTED_RUN_ACTIVE_AGENT_IDS)[number];
export type PersistedTaskCardAssignedAgentId = (typeof PERSISTED_TASK_CARD_ASSIGNED_AGENT_IDS)[number];
export type VerificationResolutionOutcome = Exclude<VerificationState, 'pending'>;
export type ForemanReasoningVariant = 'low' | 'medium' | 'high' | 'xhigh';
export type ForemanTaskKind = 'execution' | 'review' | 'explore' | 'plan';
export type ForemanWorkflowPhase = 'explore' | 'plan' | 'execute' | 'review';
export type ExploreOperationKind = 'search' | 'read' | 'grep';
export type ForemanOutputVerbosity = 'quiet' | 'default' | 'debug';
export type InvestigationPartitionStrategy = 'directory' | 'role_surface' | 'artifact_type' | 'code_doc_test_split';
export type InvestigationCoverageFocus = 'file_candidates' | 'code_structure' | 'recent_changes' | 'tests' | 'schema' | 'docs';
export type ForemanEntryPolicyMode = 'explicit_only' | 'guided_explicit' | 'foreman_first_bounded' | 'codex_cli_foreman_first';
export type ForemanOrchestratorScope = 'bounded_synthesis_decision_and_read_only_advisory';
export interface FailureRecord {
    stage: WorkflowStage;
    reason: FailureReason;
    summary: string;
    recorded_at: string;
}
export interface VerificationRecord {
    state: VerificationState;
    summary: string;
    recorded_at: string;
}
export interface ReviewerOutcomeRecord {
    outcome: VerificationResolutionOutcome;
    summary: string;
    recorded_at: string;
}
export interface WorkerRequestContract {
    prompt: string;
    acceptance: string;
    scope?: string | null;
    slice_label?: string | null;
    partition_strategy?: InvestigationPartitionStrategy | null;
    coverage_focus?: InvestigationCoverageFocus[];
    coverage_rules?: string[];
}
export interface WorkerResultArtifact {
    thread_id: string | null;
    raw_events_file: string | null;
    scope: string | null;
    slice_label?: string | null;
    partition_strategy?: InvestigationPartitionStrategy | null;
    coverage_focus?: InvestigationCoverageFocus[];
    key_findings?: string[];
    evidence_paths: string[];
    confidence: 'low' | 'medium' | 'high' | null;
    uncertainty_summary: string | null;
    summary: string;
    recorded_at: string;
}
export type ForemanLaunchRequestKind = 'execution' | 'verification' | 'planning' | 'advisory';
export type RoleModelLaunchMatchState = 'verified_match' | 'mismatch';
export type RoleModelObservationCapability = 'thread_observable' | 'launch_request_only' | 'unsupported';
export type RoleModelObservationStatus = 'not_started' | 'observed' | 'unavailable';
export type RoleModelObservationMatchState = 'not_started' | 'matched' | 'mismatch' | 'unavailable';
export type RoleModelObservationSource = 'codex_state_db' | 'provider_surface' | null;
export type RoleModelObservationConfidence = 'best_effort_local' | 'provider_confirmed' | null;
export type RoleModelObservationUnavailableReason = 'unsupported' | 'no_thread_id' | 'temporary_probe_failure' | 'environment_limited' | 'surface_mismatch' | null;
export interface RoleModelLaunchEvidence {
    role: Role;
    request_kind: ForemanLaunchRequestKind;
    launch_source: 'foreman_spawn';
    codex_path: string;
    configured_profile: string | null;
    configured_model: string | null;
    configured_variant: ForemanReasoningVariant | null;
    dispatched_profile: string | null;
    dispatched_model: string | null;
    dispatched_variant: ForemanReasoningVariant | null;
    dispatched_config_entries: string[];
    actual_profile: string | null;
    actual_model: string | null;
    actual_variant: ForemanReasoningVariant | null;
    actual_config_entries: string[];
    observed_profile: string | null;
    observed_model: string | null;
    observed_variant: ForemanReasoningVariant | null;
    observed_source: RoleModelObservationSource;
    observed_confidence: RoleModelObservationConfidence;
    observed_capability: RoleModelObservationCapability;
    observation_status: RoleModelObservationStatus;
    observation_match_state: RoleModelObservationMatchState;
    observation_unavailable_reason: RoleModelObservationUnavailableReason;
    observation_mismatch_summary: string | null;
    match_state: RoleModelLaunchMatchState;
    mismatch_summary: string | null;
    recorded_at: string;
}
export type SynthesizedRunResponseRecommendedAction = AdvisorRecommendedNextAction | 'escalate' | 'none';
export type OrchestratorDecisionClass = 'continue_execute' | 'continue_verify' | 'continue_fan_in' | 'manual_resolve' | 'manual_retry' | 'manual_replan' | 'manual_escalate' | 'terminal_success' | 'terminal_failure' | 'terminal_cancelled';
export interface SynthesizedRunResponse {
    boundary: 'manual_hold' | 'terminal';
    summary: string;
    user_message: string;
    recommended_action: SynthesizedRunResponseRecommendedAction;
    decision_class: OrchestratorDecisionClass;
    allowed_next_actions: SynthesizedRunResponseRecommendedAction[];
    decision_source: 'orchestrator_policy';
    worker_result_count: number;
    review_outcome: 'pass' | 'repair' | 'hold' | 'pending' | null;
    recorded_at: string;
}
export interface OrchestratorSynthesisRecord {
    task_card_id: string;
    next_step: OrchestratorDecisionStep;
    boundary: 'continue' | 'manual_hold' | 'terminal';
    summary: string;
    user_message: string;
    recommended_action: SynthesizedRunResponseRecommendedAction;
    decision_class: OrchestratorDecisionClass;
    allowed_next_actions: SynthesizedRunResponseRecommendedAction[];
    decision_source: 'orchestrator_policy';
    worker_result_count: number;
    review_outcome: 'pass' | 'repair' | 'hold' | 'pending' | null;
    recorded_at: string;
}
export interface VerifiedCheckpointRecord {
    task_card_id: string;
    title: string;
    summary: string;
    recorded_at: string;
}
export interface ChildAgentSnapshot {
    agent_id: string;
    parent_agent_id: string | null;
    role: Role;
    status: ChildAgentStatus;
    task_card_id: string | null;
}
export interface SpecialistExecutorSnapshot {
    executor_id: string;
    status: ChildAgentStatus;
    task_card_id: string;
    delegation_id: string;
    child_agent_id: string;
}
export interface DelegationRecord {
    delegation_id: string;
    run_id: string;
    task_card_id: string;
    source_task_card_id?: string | null;
    delegated_by_role: Role;
    review_round: number | null;
    summary: string;
    child_agent: ChildAgentSnapshot;
    executor: SpecialistExecutorSnapshot;
    worker_request: WorkerRequestContract | null;
    worker_role_config_snapshot?: TaskRoleConfigSnapshot | null;
    worker_launch_evidence?: RoleModelLaunchEvidence | null;
    worker_result: WorkerResultArtifact | null;
    result_summary: string | null;
    reviewer_outcome: ReviewerOutcomeRecord | null;
    latest_failure: FailureRecord | null;
    fan_in_collapsed_at?: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface HandoffRecord {
    handoff_id: string;
    run_id: string;
    task_card_id: string;
    from_role: Role;
    to_role: Role;
    outcome: HandoffOutcome;
    summary: string;
    created_at: string;
}
export interface OrchestratorDecision {
    next_step: OrchestratorDecisionStep;
    can_advance: boolean;
    summary: string;
    route_selection?: OrchestratorRouteSelection;
}
export type OrchestratorRouteId = 'explicit_fallback' | 'delegated_execute';
export interface OrchestratorRouteSelection {
    route_id: OrchestratorRouteId;
    reason: string;
}
export interface TaskDelegationCounts {
    task_card_id: string;
    total: number;
    active: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
}
export type OmORecommendedCategory = 'quick' | 'deep' | 'visual-engineering' | 'writing' | 'unspecified-low' | 'unspecified-high';
export type OmORecommendedSkill = 'frontend-ui-ux' | 'playwright';
export interface PolicyAwareRoutingTrace {
    specialist_routing_mode: OrchestrationSpecialistRoutingMode;
    route_preference: OrchestrationSpecialistRoutePreference;
    parallelism_mode: OrchestrationParallelismMode;
    route_target_role: Extract<Role, 'planner' | 'explorer' | 'code specialist' | 'verifier'> | null;
    route_target_step: Extract<OrchestratorDecisionStep, 'execute_task' | 'verify_task'> | null;
    selected_route: OrchestratorRouteId;
    selected_route_reason: string;
    recommended_category: OmORecommendedCategory | null;
    recommended_skills: OmORecommendedSkill[];
    advisory_only: boolean;
    execution_unchanged: boolean;
}
export interface PolicyAwareRoutingMetadata {
    routing_summary: string;
    routing_trace: PolicyAwareRoutingTrace;
}
export type PolicyAwareReviewOutcome = 'pass' | 'repair' | 'hold' | 'pending';
export type ReviewerSwarmState = 'not_requested' | 'pending' | 'passed' | 'needs_work' | 'blocked' | 'manual_hold';
export interface PolicyAwareReviewTrace {
    review_mode: OrchestrationReviewMode;
    max_review_passes: number;
    max_active_reviewers: number;
    review_pass_count: number;
    review_round: number;
    remaining_review_passes: number;
    review_outcome: PolicyAwareReviewOutcome;
    reviewer_count: number;
    reviewer_swarm_state: ReviewerSwarmState;
    review_path: string;
    explicit_operator_control: true;
    bounded_recheck_available: boolean;
}
export interface PolicyAwareReviewMetadata {
    review_summary: string;
    review_trace: PolicyAwareReviewTrace;
}
export interface PolicyAwareResearchTrace {
    research_mode: OrchestrationAutonomousResearchMode;
    research_target_step: Extract<OrchestratorDecisionStep, 'execute_task' | 'verify_task'> | null;
    advisory_only: true;
    execution_unchanged: true;
    review_authority_unchanged: true;
}
export interface PolicyAwareResearchMetadata {
    research_summary: string;
    research_trace: PolicyAwareResearchTrace;
}
export interface PolicyAwareMutationGuardrailTrace {
    mode: OrchestrationMutationGuardrailMode;
    operator_only: true;
    execution_unchanged: true;
    delegation_unchanged: true;
}
export interface PolicyAwareMutationGuardrailsTrace {
    git_guardrail: PolicyAwareMutationGuardrailTrace;
    pr_guardrail: PolicyAwareMutationGuardrailTrace;
}
export interface PolicyAwareMutationGuardrailsMetadata {
    mutation_guardrails_summary: string;
    mutation_guardrails_trace: PolicyAwareMutationGuardrailsTrace;
}
export type OrchestrationSpecialistRoutingMode = 'advisory_only';
export type OrchestrationSpecialistRoutePreference = 'none';
export type OrchestrationParallelismMode = 'single_task_bounded_fan_out';
export type OrchestrationReviewMode = 'explicit_only';
export type OrchestrationAutonomousResearchMode = 'disabled' | 'advisory_visibility_only';
export type OrchestrationMutationGuardrailMode = 'deny';
export interface OrchestrationPolicy {
    specialist_routing: {
        mode: OrchestrationSpecialistRoutingMode;
        route_preference: OrchestrationSpecialistRoutePreference;
    };
    parallelism: {
        mode: OrchestrationParallelismMode;
        max_active_tasks: 1;
        max_active_workers: number;
    };
    review: {
        mode: OrchestrationReviewMode;
        max_review_passes: 1;
        max_active_reviewers: number;
    };
    autonomous_research: {
        mode: OrchestrationAutonomousResearchMode;
    };
    git_mutation: {
        mode: OrchestrationMutationGuardrailMode;
    };
    pr_mutation: {
        mode: OrchestrationMutationGuardrailMode;
    };
}
export interface ExecutionRequest {
    prompt: string;
    profile: string | null;
    config_entries: string[];
}
export interface VerificationRequest {
    prompt: string;
    profile: string | null;
    config_entries: string[];
}
export interface VerificationAutomationOutput {
    outcome: VerificationResolutionOutcome;
    summary: string;
}
export type AdvisorRecommendedNextAction = 'advance' | 'verify' | 'resolve' | 'retry' | 'replan';
export interface AdvisorOutput {
    summary: string;
    recommended_next_action: AdvisorRecommendedNextAction;
}
export interface PlannedTaskCardDefinition {
    title: string;
    intent: string;
    scope: string;
    acceptance: string;
    execution_prompt: string;
    task_kind?: ForemanTaskKind;
    acceptance_checks?: string[];
    auto_review_after?: boolean;
    depends_on_indexes?: number[];
    fan_in_from_indexes?: number[];
    node_kind?: 'execution' | 'fan_in';
}
export interface PlannedPlanningOutput {
    summary: string;
    task_cards: [PlannedTaskCardDefinition, ...PlannedTaskCardDefinition[]];
}
export interface ClarificationPlanningOutput {
    summary: string;
    clarification_request: string;
}
export type PlanningOutput = PlannedPlanningOutput | ClarificationPlanningOutput;
export interface PlanningClarificationRequestRecord {
    planner_attempt_id: string;
    summary: string;
    clarification_request: string;
    recorded_at: string;
}
export interface PlanUpdateArtifact {
    version: 1;
    run_id: string;
    planner_attempt_id: string;
    source: 'planner' | 'replan';
    summary: string;
    planning_mode: 'task_cards' | 'clarification_request';
    clarification_request: string | null;
    task_card_count: number;
    task_kind_counts: Record<ForemanTaskKind, number>;
    task_cards: Array<{
        index: number;
        title: string;
        task_kind: ForemanTaskKind;
        node_kind: 'execution' | 'fan_in';
        auto_review_after: boolean;
        depends_on_indexes: number[];
        fan_in_from_indexes: number[];
    }>;
    recorded_at: string;
}
export interface ExploreRequestContract {
    goal: string;
    task_title: string;
    task_kind: Extract<ForemanTaskKind, 'explore' | 'plan'>;
    scope: string;
    acceptance: string;
    bounded_operations: ExploreOperationKind[];
    evidence_limits: {
        max_files: number;
        max_bytes: number;
    };
    handoff_to_plan: {
        next_phase: 'plan' | 'execute' | 'review';
        summary: string;
    };
}
export interface ExploreArtifact {
    version: 1;
    run_id: string;
    task_card_id: string;
    task_kind: Extract<ForemanTaskKind, 'explore' | 'plan'>;
    status: 'recorded';
    request: ExploreRequestContract;
    evidence: Array<{
        kind: 'raw_events_file';
        file: string | null;
        thread_id: string | null;
        summary: string;
    }>;
    output_summary: string;
    recorded_at: string;
}
export type AlwaysOnModeStatus = 'disabled' | 'enabled';
export type AlwaysOnModeAction = 'start' | 'stop' | 'status' | 'tick' | 'loop';
export type AlwaysOnCompanionLoopStopReason = 'always_on_disabled' | 'await_verification' | 'await_repair_decision' | 'await_operator' | 'halt_completed' | 'halt_failed' | 'halt_cancelled' | 'max_iterations_reached';
export interface AlwaysOnModeRecord {
    version: 1;
    run_id: string;
    status: AlwaysOnModeStatus;
    enabled: boolean;
    updated_at: string | null;
    last_started_at: string | null;
    last_stopped_at: string | null;
    summary: string;
    fallback_entrypoints: ['explicit_cli', 'explicit_mcp'];
    last_tick_at?: string | null;
    last_companion_loop?: {
        started_at: string;
        completed_at: string;
        iteration_count: number;
        tick_count: number;
        stop_reason: AlwaysOnCompanionLoopStopReason;
        summary: string;
    } | null;
}
export interface RoleDefaultSettings {
    profile: string | null;
    config_entries: string[];
}
export interface RoleDefaultsFile {
    version: 1;
    role_defaults: {
        planner: RoleDefaultSettings;
        explorer?: RoleDefaultSettings;
        'code specialist': RoleDefaultSettings;
        verifier: RoleDefaultSettings;
    };
}
export interface ForemanAgentConfig {
    name: string;
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}
export interface ForemanEntryPolicyConfig {
    mode: ForemanEntryPolicyMode;
}
export interface ForemanOutputConfig {
    verbosity: ForemanOutputVerbosity;
}
export interface ForemanConfigFile {
    version: 1;
    entry_policy: ForemanEntryPolicyConfig;
    output: ForemanOutputConfig;
    agents: {
        orchestrator: ForemanAgentConfig;
        planner: ForemanAgentConfig;
        explorer?: ForemanAgentConfig;
        'code specialist': ForemanAgentConfig;
        verifier: ForemanAgentConfig;
    };
}
export interface TaskRoleConfigSnapshot {
    source: 'shared_role_config';
    role: Role;
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}
export type TaskModelTierIntent = 'low_cost' | 'standard' | 'high_tier';
export type TaskChildAggregationContract = 'none' | 'explicit_fan_in_summary';
export type TaskFanInBarrierSemantics = 'none' | 'explicit_wait_for_all_sources';
export type TaskOrchestratorReviewGate = 'none' | 'after_child_completion';
export interface OrchestratorState {
    run_id: string;
    task_card_id: string;
    execution_request: ExecutionRequest;
    verification_request: VerificationRequest | null;
    orchestration_policy: OrchestrationPolicy;
    current_decision: OrchestratorDecision;
    created_at: string;
    updated_at: string;
}
export interface RunRecord {
    run_id: string;
    goal: string;
    status: RunStatus;
    stage: WorkflowStage;
    active_role: Role | null;
    active_agent_id: PersistedRunActiveAgentId | null;
    active_task_card_id: string | null;
    active_thread_id: string | null;
    task_card_ids: string[];
    latest_handoff_id: string | null;
    child_agents: ChildAgentSnapshot[];
    specialist_executors: SpecialistExecutorSnapshot[];
    latest_verified_checkpoint: VerifiedCheckpointRecord | null;
    latest_verification: VerificationRecord | null;
    latest_failure: FailureRecord | null;
    latest_orchestrator_synthesis: OrchestratorSynthesisRecord | null;
    latest_response: SynthesizedRunResponse | null;
    planning_clarification_request: PlanningClarificationRequestRecord | null;
    raw_thread_ids: string[];
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface TaskCardRecord {
    task_card_id: string;
    run_id: string;
    title: string;
    intent: string;
    scope: string;
    execution_prompt: string;
    planner_attempt_id: string | null;
    task_kind: ForemanTaskKind;
    acceptance_checks: string[];
    review_of_task_card_ids: string[];
    depends_on_task_card_ids: string[];
    fan_in_from_task_card_ids: string[];
    node_kind: 'execution' | 'fan_in';
    status: TaskCardStatus;
    owner_role: Role;
    assigned_role: Role;
    assigned_agent_id: PersistedTaskCardAssignedAgentId | null;
    role_config_snapshot: TaskRoleConfigSnapshot;
    model_tier_intent: TaskModelTierIntent;
    child_aggregation_contract: TaskChildAggregationContract;
    fan_in_barrier_semantics: TaskFanInBarrierSemantics;
    orchestrator_review_gate: TaskOrchestratorReviewGate;
    acceptance: string;
    input_handoff_id: string | null;
    output_handoff_id: string | null;
    verification_state: VerificationState;
    review_pass_count: number;
    latest_failure: FailureRecord | null;
    latest_model_launch: RoleModelLaunchEvidence | null;
    thread_ids: string[];
    completed_by_agent_id: PersistedTaskCardAssignedAgentId | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface VisibilityProjection {
    run_id: string;
    goal: string;
    status: RunStatus;
    stage: WorkflowStage;
    active_role: Role | null;
    active_agent_id: PersistedRunActiveAgentId | null;
    active_thread_id: string | null;
    child_agents: ChildAgentSnapshot[];
    specialist_executors: SpecialistExecutorSnapshot[];
    current_task_card: {
        task_card_id: string;
        title: string;
        status: TaskCardStatus;
        owner_role: Role;
        assigned_role: Role;
        assigned_agent_id: PersistedTaskCardAssignedAgentId | null;
        role_config_snapshot: TaskRoleConfigSnapshot;
        model_tier_intent: TaskModelTierIntent;
        child_aggregation_contract: TaskChildAggregationContract;
        fan_in_barrier_semantics: TaskFanInBarrierSemantics;
        orchestrator_review_gate: TaskOrchestratorReviewGate;
        acceptance: string;
        verification_state: VerificationState;
        completed_by_agent_id: PersistedTaskCardAssignedAgentId | null;
        latest_model_launch: RoleModelLaunchEvidence | null;
    };
    latest_handoff: HandoffRecord | null;
    orchestrator: OrchestratorDecision;
    latest_verification: VerificationRecord | null;
    latest_failure: FailureRecord | null;
}
export interface ResumeCheckpointRecord {
    version: 1;
    run_id: string;
    updated_at: string;
    status: RunStatus;
    stage: WorkflowStage;
    active_task_card: {
        task_card_id: string;
        title: string;
        owner_role: Role;
        assigned_role: Role;
        verification_state: VerificationState;
    };
    decision: {
        next_step: OrchestratorDecisionStep;
        can_advance: boolean;
        summary: string;
    };
    progress: {
        completed: string;
        in_progress: string;
        remaining: string;
        resume_from: string;
        latest_verified_checkpoint: string;
    };
    continuity: {
        summary: string;
        planner_attempt_id: string | null;
        review_pass_count: number | null;
        latest_handoff_summary: string | null;
        latest_verified_checkpoint_summary: string | null;
    };
    hot_artifacts: {
        run_file: string;
        visibility_file: string;
        orchestrator_state_file: string;
        active_task_card_file: string;
        progress_markdown_file: string;
    };
    on_demand_artifacts: {
        latest_orchestration_attempt_file: string | null;
        latest_planner_attempt_dir: string | null;
        delegations_dir: string;
        raw_events_dir: string;
    };
    task_card_index?: Array<{
        task_card_id: string;
        title: string;
        status: TaskCardStatus;
        owner_role: Role;
        assigned_role: Role;
        model_tier_intent: TaskModelTierIntent;
        child_aggregation_contract: TaskChildAggregationContract;
        fan_in_barrier_semantics: TaskFanInBarrierSemantics;
        orchestrator_review_gate: TaskOrchestratorReviewGate;
        verification_state: VerificationState;
        task_kind: TaskCardRecord['task_kind'];
        node_kind: TaskCardRecord['node_kind'];
        depends_on_task_card_ids: string[];
        fan_in_from_task_card_ids: string[];
    }>;
}
export type ContextHydrationMode = 'resume_checkpoint_hot' | 'full_context_fallback';
export interface ContextHydrationSummary {
    mode: ContextHydrationMode;
    summary: string;
    checkpoint_updated_at: string | null;
    hot_artifacts: ResumeCheckpointRecord['hot_artifacts'] | null;
    on_demand_artifacts: ResumeCheckpointRecord['on_demand_artifacts'] | null;
}
export interface RunPaths {
    workspaceDir: string;
    foremanDir: string;
    foremanConfigFile: string;
    roleDefaultsFile: string;
    sisyphusDir: string;
    sisyphusRunsDir: string;
    runsDir: string;
    runDir: string;
    runFile: string;
    progressFile: string;
    resumeCheckpointFile: string;
    alwaysOnModeFile: string;
    visibilityFile: string;
    orchestratorStateFile: string;
    delegationsDir: string;
    orchestrationDir: string;
    orchestrationAttemptsDir: string;
    plannerDir: string;
    plannerAttemptsDir: string;
    exploreArtifactsDir: string;
    taskCardsDir: string;
    handoffsDir: string;
    rawEventsDir: string;
}
export interface PlannerAttemptPaths {
    attemptId: string;
    attemptDir: string;
    planningArtifactFile: string;
    planUpdateArtifactFile: string;
    planningStdoutFile: string;
    planningStderrFile: string;
}
export interface PlanRunOptions {
    cwd: string;
    goal: string;
    prompt: string;
    codexPath: string;
    profile?: string;
    configEntries?: string[];
}
export interface StartRunOptions {
    cwd: string;
    goal: string;
    title: string;
    intent: string;
    scope: string;
    acceptance: string;
    prompt: string;
    profile?: string;
    configEntries?: string[];
}
export interface AdvanceRunOptions {
    cwd: string;
    runId: string;
    codexPath?: string;
    delegationExecutionMode?: 'auto_single_active_task_queued';
}
export interface AdviseRunOptions {
    cwd: string;
    runId: string;
    codexPath: string;
    profile?: string;
    configEntries?: string[];
}
export interface VerifyRunOptions {
    cwd: string;
    runId: string;
    codexPath: string;
}
export interface ContinueRunOptions {
    cwd: string;
    runId: string;
    codexPath: string;
    maxSteps?: number;
}
export interface WatchStatusOptions {
    cwd: string;
    runId: string;
    intervalMs: number;
    iterations?: number;
    showActivity?: boolean;
    changesOnly?: boolean;
    showChanges?: boolean;
    quiet?: boolean;
    debug?: boolean;
}
export interface AlwaysOnModeOptions {
    cwd: string;
    runId: string;
    action: AlwaysOnModeAction;
    codexPath?: string;
    maxSteps?: number;
    maxIterations?: number;
    backoffMs?: number;
    maxBackoffMs?: number;
}
export interface RetryRunOptions {
    cwd: string;
    runId: string;
}
export interface ReplanRunOptions {
    cwd: string;
    runId: string;
    prompt: string;
    codexPath: string;
    profile?: string;
    configEntries?: string[];
}
export interface ResolveRunOptions {
    cwd: string;
    runId: string;
    outcome: VerificationResolutionOutcome;
    summary: string;
}
export interface SetupCodexMcpOptions {
    cwd: string;
    codexPath: string;
    serverName: string;
}
export interface SetupCodexMcpResult {
    status: 'registered' | 'already_registered';
    serverName: string;
    launchCommand: string;
    launchArgs: string[];
    configPath: string;
    configCreated: boolean;
}
export type CodexMcpRegistrationStatus = 'matching_registration' | 'missing_registration' | 'conflicting_registration' | 'unreadable_registration';
export type CodexMcpRegistryInspectionStatus = 'listed' | 'unavailable';
export type ForemanCompanionMcpCompatibility = 'recommended_companion' | 'generic_companion';
export interface CheckCodexMcpInstallOptions {
    cwd: string;
    codexPath: string;
    serverName: string;
}
export interface CodexCompanionMcpServerSummary {
    name: string;
    enabled: boolean;
    disabledReason: string | null;
    transportType: string | null;
    command: string | null;
    args: string[];
    authStatus: string | null;
    compatibility: ForemanCompanionMcpCompatibility;
    usageHint: string;
}
export interface CheckCodexMcpInstallResult {
    status: 'ok' | 'warning';
    serverName: string;
    expectedLaunchCommand: string;
    expectedLaunchArgs: string[];
    expectedEntrypointPath: string | null;
    registrationStatus: CodexMcpRegistrationStatus;
    registrationSummary: string;
    registeredLaunchCommand: string | null;
    registeredLaunchArgs: string[];
    registeredEntrypointPath: string | null;
    configPath: string;
    configExists: boolean;
    registryInspectionStatus: CodexMcpRegistryInspectionStatus;
    registryInspectionSummary: string;
    otherInstalledMcpServers: CodexCompanionMcpServerSummary[];
    companionMcpUsageSummary: string;
}
export type ForemanEntryEntrypoint = 'start' | 'plan';
export type ForemanEntryTaskShape = 'single_scoped_task' | 'multi_step_or_unclear';
export type ForemanEntryConfidence = 'high' | 'medium';
export type ForemanEntryBoundary = 'explicit_cli_or_mcp' | 'explicit_auto_entry' | 'session_instruction_plus_wrapper';
export interface RecommendForemanEntryOptions {
    cwd: string;
    request: string;
}
export interface RecommendForemanEntryResult {
    cwd: string;
    request: string;
    policy_mode: ForemanEntryPolicyMode;
    policy_summary: string;
    automatic_entry_supported: boolean;
    entry_boundary: ForemanEntryBoundary;
    entry_boundary_summary: string;
    upstream_codex_binary_intercept_supported: false;
    upstream_codex_binary_intercept_summary: string;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    orchestrator_agent: {
        role: 'orchestrator';
        roster_name: string;
        profile: string | null;
        model: string | null;
        variant: ForemanReasoningVariant | null;
        config_entries: string[];
    };
    orchestrator_request_settings_preview: {
        source: 'shared_role_config';
        profile: string | null;
        model: string | null;
        variant: ForemanReasoningVariant | null;
        config_entries: string[];
    };
    recommended_entrypoint: ForemanEntryEntrypoint;
    task_shape: ForemanEntryTaskShape;
    confidence: ForemanEntryConfidence;
    summary: string;
    rationale: string[];
    suggested_cli_command: 'codex-foreman start' | 'codex-foreman plan';
    suggested_mcp_tool: 'foreman_start' | null;
}
export interface AutoEnterForemanOptions {
    cwd: string;
    request: string;
    codexPath: string;
}
export type AutoEntryScopingSource = 'bounded_request_defaults' | 'planner_scoping' | null;
export interface AutoEnterForemanResult {
    cwd: string;
    request: string;
    policy_mode: ForemanEntryPolicyMode;
    automatic_entry_supported: boolean;
    entry_boundary: ForemanEntryBoundary;
    entry_boundary_summary: string;
    upstream_codex_binary_intercept_supported: false;
    upstream_codex_binary_intercept_summary: string;
    created: boolean;
    entrypoint_used: ForemanEntryEntrypoint | null;
    scoping_source: AutoEntryScopingSource;
    run_id: string | null;
    task_card_id: string | null;
    run_directory: string | null;
    status: RunStatus | null;
    stage: WorkflowStage | null;
    next_step: OrchestratorDecisionStep | 'await_clarification' | null;
    can_advance: boolean | null;
    summary: string;
    recommendation: RecommendForemanEntryResult;
}
export type ContinueStopReason = 'await_fan_in' | 'await_verification' | 'await_repair_decision' | 'await_operator' | 'halt_completed' | 'halt_failed' | 'halt_cancelled' | 'task_boundary_reached' | 'max_steps_reached';
export type OrchestrationEntrypoint = 'continue' | 'foreman_orchestrate' | 'always_on_companion';
export type OrchestrationCommand = 'advance' | 'verify' | 'retry' | 'replan' | 'resolve';
export type OrchestrationStopReason = ContinueStopReason;
export interface OrchestrationAttemptSnapshot {
    task_card_id: string;
    status: RunStatus;
    stage: WorkflowStage;
    verification_state: VerificationState;
    next_step: OrchestratorDecisionStep;
    can_advance: boolean;
    thread_id: string | null;
    routing_summary: string;
    routing_trace: PolicyAwareRoutingTrace;
    review_summary: string;
    review_trace: PolicyAwareReviewTrace;
}
export interface OrchestrationAttemptStep {
    step_number: number;
    command: OrchestrationCommand;
    before: OrchestrationAttemptSnapshot;
    after: OrchestrationAttemptSnapshot;
}
export interface OrchestrationAttemptStop {
    reason: OrchestrationStopReason;
    snapshot: OrchestrationAttemptSnapshot;
}
export interface OrchestrationAttemptRecord {
    run_id: string;
    attempt_id: string;
    entrypoint: OrchestrationEntrypoint;
    started_at: string;
    completed_at: string | null;
    steps: OrchestrationAttemptStep[];
    stop: OrchestrationAttemptStop | null;
}
export interface StartRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
}
export interface PlanRunResult {
    runId: string;
    taskCardId: string | null;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    nextStep: OrchestratorDecisionStep | 'await_clarification';
    canAdvance: boolean;
    clarificationRequest: string | null;
}
export interface AdvanceRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    threadId: string | null;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    advanced: boolean;
    routingSummary: string;
    routingTrace: PolicyAwareRoutingTrace;
}
export interface AdviseRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    verificationState: VerificationState;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    advice: AdvisorOutput;
}
export interface ResolveRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    verificationState: VerificationState;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
}
export interface VerifyRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    verificationState: VerificationState;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    verified: boolean;
}
export interface ContinueRunStep {
    stepNumber: number;
    command: 'advance' | 'verify';
    taskCardIdBefore: string;
    taskCardIdAfter: string;
    statusBefore: RunStatus;
    statusAfter: RunStatus;
    stageBefore: WorkflowStage;
    stageAfter: WorkflowStage;
    verificationStateBefore: VerificationState | null;
    verificationStateAfter: VerificationState | null;
    nextStepBefore: OrchestratorDecisionStep;
    nextStepAfter: OrchestratorDecisionStep;
    canAdvanceAfter: boolean;
    advanced: boolean | null;
    verified: boolean | null;
    threadIdBefore: string | null;
    threadIdAfter: string | null;
}
export interface ContinueRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    verificationState: VerificationState | null;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    continued: boolean;
    stepsExecuted: number;
    stopReason: ContinueStopReason;
    latestResponse?: SynthesizedRunResponse | null;
    latestOrchestratorSynthesis?: OrchestratorSynthesisRecord | null;
    steps: ContinueRunStep[];
}
export interface AlwaysOnCompanionRequestSettings {
    profile: string | null;
    config_entries: string[];
}
export interface AlwaysOnCompanionRequestSettingsSummary {
    execution_request: AlwaysOnCompanionRequestSettings;
    verification_request: AlwaysOnCompanionRequestSettings | null;
}
export interface AlwaysOnCompanionExecutionResult {
    taskCardId: string;
    status: RunStatus;
    stage: WorkflowStage;
    verificationState: VerificationState | null;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    continued: boolean;
    stepsExecuted: number;
    stopReason: OrchestrationStopReason;
    requestSettings: AlwaysOnCompanionRequestSettingsSummary;
    summary: string;
}
export interface AlwaysOnCompanionLoopResult {
    iterationCount: number;
    tickCount: number;
    stopReason: AlwaysOnCompanionLoopStopReason;
    backoffHistoryMs: number[];
    finalTick: AlwaysOnCompanionExecutionResult | null;
    summary: string;
}
export interface AlwaysOnModeResult {
    runId: string;
    runDirectory: string;
    alwaysOnMode: AlwaysOnModeRecord;
    companionExecution: AlwaysOnCompanionExecutionResult | null;
    companionLoop: AlwaysOnCompanionLoopResult | null;
}
export interface RetryRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
}
export interface ReplanRunResult {
    runId: string;
    taskCardId: string;
    runDirectory: string;
    status: RunStatus;
    stage: WorkflowStage;
    nextStep: OrchestratorDecisionStep;
    canAdvance: boolean;
    replanned: boolean;
}
export interface RunCommandOptions extends StartRunOptions {
    codexPath: string;
}
export type RunCommandResult = AdvanceRunResult;
