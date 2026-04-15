import type { Readable, Writable } from 'node:stream';
import type { ContinuityProjection } from './runtime';
import type { AlwaysOnCompanionRequestSettingsSummary, AlwaysOnCompanionLoopStopReason, AutoEnterForemanResult, AlwaysOnModeRecord, AdvisorRecommendedNextAction, CheckCodexMcpInstallResult, ChildAgentSnapshot, ContextHydrationSummary, DelegationRecord, FailureRecord, FailureReason, ForemanOrchestratorScope, ForemanReasoningVariant, ForemanWorkflowPhase, OrchestrationAttemptRecord, OrchestrationStopReason, OrchestratorDecisionStep, OrchestratorState, PolicyAwareMutationGuardrailsTrace, PolicyAwareResearchTrace, PolicyAwareReviewTrace, PolicyAwareRoutingTrace, RecommendForemanEntryResult, ReviewerOutcomeRecord, Role, RoleModelLaunchEvidence, RunRecord, RunCommandResult, SpecialistExecutorSnapshot, TaskCardRecord, VerificationResolutionOutcome, VisibilityProjection, WorkflowStage } from './types';
export interface ForemanStatusArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    cwd?: string;
}
export interface ForemanActivityArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    cwd?: string;
}
export interface ForemanRecommendEntryArguments {
    request: string;
    cwd?: string;
}
export interface ForemanAutoEntryArguments {
    request: string;
    codex_bin?: string;
    cwd?: string;
}
export interface ForemanStartArguments {
    goal: string;
    title: string;
    intent: string;
    scope: string;
    acceptance: string;
    prompt: string;
    cwd?: string;
}
export interface ForemanRunArguments extends ForemanStartArguments {
    codex_bin: string;
}
export interface ForemanDelegationsArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    cwd?: string;
}
export interface ForemanDelegateArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    summary: string;
    child_agent_id: string;
    cwd?: string;
}
export interface ForemanUpdateDelegationArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    delegation_id: string;
    status: Exclude<ChildAgentSnapshot['status'], 'queued'>;
    result_summary?: string;
    failure_stage?: WorkflowStage;
    failure_reason?: FailureReason;
    failure_summary?: string;
    cwd?: string;
}
export interface ForemanOrchestrateArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    cwd?: string;
    codex_bin?: string;
    progression_step_count?: number;
    fast_mode?: boolean;
    repair_action?: 'retry' | 'replan';
    replan_prompt?: string;
    resolve_outcome?: VerificationResolutionOutcome;
    resolve_summary?: string;
}
export interface ForemanAlwaysOnTickArguments {
    run_id?: string;
    run_ref?: string;
    run_dir?: string;
    cwd?: string;
    codex_bin?: string;
    max_steps?: number;
}
export interface ForemanAlwaysOnLoopArguments extends ForemanAlwaysOnTickArguments {
    max_iterations?: number;
    backoff_ms?: number;
    max_backoff_ms?: number;
}
type ForemanMcpMutatingToolName = 'foreman_delegate' | 'foreman_update_delegation' | 'foreman_orchestrate' | 'foreman_always_on_tick' | 'foreman_always_on_loop' | 'advance' | 'continue' | 'verify' | 'retry' | 'replan' | 'resolve' | 'always_on_start' | 'always_on_stop' | 'always_on_tick' | 'always_on_loop';
interface McpSessionContext {
    session_id: string;
    process_id: number | null;
    started_at: string;
}
export interface ForemanMcpMutationLeaseView {
    current_session_id: string;
    current_process_id: number | null;
    current_session_started_at: string;
    state: 'unowned' | 'held_by_current_session' | 'held_by_other_session';
    owner_session_id: string | null;
    owner_process_id: number | null;
    owner_started_at: string | null;
    acquired_at: string | null;
    updated_at: string | null;
    expires_at: string | null;
    last_mutating_tool: ForemanMcpMutatingToolName | null;
    summary: string;
}
type ForemanNextStep = VisibilityProjection['orchestrator']['next_step'] | 'await_clarification';
export interface ForemanAgentConfigSummary {
    role: Role;
    roster_name: string;
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}
export interface ForemanResolvedRequestSettings {
    source: 'persisted_request' | 'role_config_fallback';
    request_kind: 'execution' | 'verification';
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}
export interface ForemanOrchestratorRequestSettingsPreview {
    source: 'shared_role_config';
    profile: string | null;
    model: string | null;
    variant: ForemanReasoningVariant | null;
    config_entries: string[];
}
export interface ForemanServerIdentityView {
    server_name: string;
    server_version: string;
    session_id: string;
    process_id: number | null;
    started_at: string;
    build_identity: string;
    entrypoint_path: string | null;
    shared_config_path: string;
}
export interface ForemanServerInstallCheckView extends CheckCodexMcpInstallResult {
    session_registration_match: 'matches_registered_target' | 'differs_from_registered_target' | 'unknown';
}
export interface ForemanServerIdentityResult {
    server_identity: ForemanServerIdentityView;
    install_check: ForemanServerInstallCheckView;
}
export interface ForemanTaskGraphSummary {
    total_task_cards: number;
    queued_task_cards: number;
    ready_execution_tasks: number;
    ready_low_cost_tasks: number;
    queued_review_tasks: number;
    queued_fan_in_tasks: number;
    low_cost_task_cards: number;
    standard_task_cards: number;
    high_tier_task_cards: number;
    child_aggregation_task_cards: number;
    fan_in_barrier_task_cards: number;
    orchestrator_review_gated_task_cards: number;
    assigned_role_counts: Record<Role, number>;
}
export type ForemanCurrentTaskCardView = VisibilityProjection['current_task_card'] & {
    agent_config_summary?: ForemanAgentConfigSummary | null;
    resolved_request_settings?: ForemanResolvedRequestSettings | null;
    execution_assignment_state?: 'planned' | 'actively_running' | 'completed_by' | 'blocked' | 'cancelled';
    execution_source?: 'codex_session' | 'foreman_worker';
    execution_owner?: 'host_session' | 'foreman_worker';
    codex_ui_trace_owner?: 'host_session';
    ownership_summary?: string;
    shared_config_drift?: {
        state: 'refreshable_pre_launch' | 'pending_future_boundary' | 'blocked_active_boundary';
        request_kind: 'execution' | 'verification';
        role: Role;
        persisted_profile: string | null;
        persisted_model: string | null;
        persisted_variant: ForemanReasoningVariant | null;
        current_profile: string | null;
        current_model: string | null;
        current_variant: ForemanReasoningVariant | null;
        summary: string;
    } | null;
    dispatched_model_launch?: RoleModelLaunchEvidence | null;
    actual_model_launch?: RoleModelLaunchEvidence | null;
    model_enforcement_state?: 'not_started' | RoleModelLaunchEvidence['match_state'];
    observed_model?: string | null;
    observed_variant?: RoleModelLaunchEvidence['observed_variant'];
    observed_source?: RoleModelLaunchEvidence['observed_source'];
    observed_confidence?: RoleModelLaunchEvidence['observed_confidence'];
    observed_capability?: RoleModelLaunchEvidence['observed_capability'] | null;
    observation_status?: RoleModelLaunchEvidence['observation_status'];
    observation_match_state?: RoleModelLaunchEvidence['observation_match_state'];
    observation_unavailable_reason?: RoleModelLaunchEvidence['observation_unavailable_reason'];
    observation_mismatch_summary?: RoleModelLaunchEvidence['observation_mismatch_summary'];
    concrete_worker_id?: string | null;
    worker_linkage?: {
        delegation_ids: string[];
        worker_run_ids: string[];
    } | null;
    run_mutation_lease?: ForemanMcpMutationLeaseView | null;
    task_kind?: TaskCardRecord['task_kind'];
    acceptance_checks?: TaskCardRecord['acceptance_checks'];
    review_of_task_card_ids?: TaskCardRecord['review_of_task_card_ids'];
    depends_on_task_card_ids?: TaskCardRecord['depends_on_task_card_ids'];
    fan_in_from_task_card_ids?: TaskCardRecord['fan_in_from_task_card_ids'];
    node_kind?: TaskCardRecord['node_kind'];
};
export interface ForemanStatusResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    goal: string;
    readable_context: ForemanReadableRunContext | null;
    orchestration_policy: OrchestratorState['orchestration_policy'] | null;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    completed: string | null;
    in_progress: string | null;
    remaining: string | null;
    resume_from: string | null;
    active_role: VisibilityProjection['active_role'];
    active_agent_id: VisibilityProjection['active_agent_id'];
    active_thread_id: VisibilityProjection['active_thread_id'];
    child_agents: VisibilityProjection['child_agents'];
    specialist_executors: VisibilityProjection['specialist_executors'];
    worker_visibility: ForemanWorkerVisibility | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    current_task_card: ForemanCurrentTaskCardView | null;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_handoff: VisibilityProjection['latest_handoff'];
    latest_verification: VisibilityProjection['latest_verification'];
    latest_failure: VisibilityProjection['latest_failure'];
    latest_verified_checkpoint: RunRecord['latest_verified_checkpoint'];
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    latest_response: RunRecord['latest_response'];
    hydration: ContextHydrationSummary | null;
    always_on_mode: AlwaysOnModeRecord;
    always_on_operator_state: ForemanAlwaysOnOperatorStateView;
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    mcp_mutation_lease: ForemanMcpMutationLeaseView;
    continuity: ContinuityProjection;
    planning_clarification_request: RunRecord['planning_clarification_request'];
    next_step: ForemanNextStep;
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    decision_summary: VisibilityProjection['orchestrator']['summary'] | null;
    mutation_guardrails_summary: string | null;
    mutation_guardrails_trace: PolicyAwareMutationGuardrailsTrace | null;
    routing_summary: string | null;
    routing_trace: PolicyAwareRoutingTrace | null;
    review_summary: string | null;
    review_trace: PolicyAwareReviewTrace | null;
    research_summary: string | null;
    research_trace: PolicyAwareResearchTrace | null;
    allowed_next_commands: AdvisorRecommendedNextAction[];
}
export interface ForemanStartResult {
    cwd: string;
    run_id: string;
    task_card_id: string;
    run_directory: string;
    run_ref: string;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    current_task_card: ForemanCurrentTaskCardView | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    next_step: VisibilityProjection['orchestrator']['next_step'];
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    allowed_next_commands: AdvisorRecommendedNextAction[];
}
export interface ForemanRunResult {
    cwd: string;
    run_id: string;
    task_card_id: string;
    run_directory: string;
    run_ref: string;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    current_task_card: ForemanCurrentTaskCardView | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    thread_id: RunCommandResult['threadId'];
    next_step: VisibilityProjection['orchestrator']['next_step'];
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    advanced: RunCommandResult['advanced'];
    routing_summary: RunCommandResult['routingSummary'];
    routing_trace: RunCommandResult['routingTrace'];
    allowed_next_commands: AdvisorRecommendedNextAction[];
}
export interface ForemanRecommendEntryResult extends RecommendForemanEntryResult {
}
interface ForemanActivityAttemptSnapshot {
    status: OrchestrationAttemptRecord['steps'][number]['before']['status'];
    stage: OrchestrationAttemptRecord['steps'][number]['before']['stage'];
    verification_state: OrchestrationAttemptRecord['steps'][number]['before']['verification_state'];
    next_step: OrchestrationAttemptRecord['steps'][number]['before']['next_step'];
    thread_id: OrchestrationAttemptRecord['steps'][number]['before']['thread_id'];
    routing_summary: OrchestrationAttemptRecord['steps'][number]['before']['routing_summary'];
    routing_trace: OrchestrationAttemptRecord['steps'][number]['before']['routing_trace'];
    review_summary: OrchestrationAttemptRecord['steps'][number]['before']['review_summary'];
    review_trace: OrchestrationAttemptRecord['steps'][number]['before']['review_trace'];
}
interface ForemanReadableAgentContext {
    role: Role;
    roster_name: string;
    agent_id: string | null;
    display_name: string;
}
interface ForemanReadableTaskContext {
    task_card_id: string;
    title: string;
    display_name: string;
}
interface ForemanReadableRunContext {
    captain: ForemanReadableAgentContext;
    task_owner: ForemanReadableAgentContext;
    task: ForemanReadableTaskContext;
    summary: string;
}
interface ForemanAlwaysOnOperatorStateView {
    phase: 'disabled' | 'ready' | 'idle' | 'manual_boundary' | 'terminal';
    summary: string;
    recommended_operator_action: 'always_on_start' | 'always_on_loop' | 'advance' | 'verify' | 'resolve' | 'retry' | 'replan' | 'none';
    last_tick_at: string | null;
    last_loop_stop_reason: AlwaysOnCompanionLoopStopReason | null;
}
interface ForemanWorkflowOperatorStateView {
    phase: ForemanWorkflowPhase;
    summary: string;
    recommended_operator_action: 'advance' | 'verify' | 'resolve' | 'retry' | 'replan' | 'none';
    explore_evidence_state: 'not_applicable' | 'pending' | 'recorded';
    latest_explore_artifact_file: string | null;
    plan_update_available: boolean;
    latest_plan_update_file: string | null;
}
interface ForemanReadableDelegationContext {
    captain: ForemanReadableAgentContext;
    delegator: ForemanReadableAgentContext;
    worker: ForemanReadableAgentContext;
    task: ForemanReadableTaskContext;
    summary: string;
}
interface ForemanReadableWorkerSnapshot extends ChildAgentSnapshot {
    roster_name: string;
    readable_name: string;
    scope: string | null;
    slice_label: string | null;
    partition_strategy: NonNullable<DelegationRecord['worker_request']>['partition_strategy'] | null;
    coverage_focus: NonNullable<DelegationRecord['worker_request']>['coverage_focus'];
    summary: string;
}
interface ForemanWorkerVisibility {
    task_card_id: string;
    total_worker_count: number;
    active_worker_count: number;
    queued_worker_count: number;
    running_worker_count: number;
    completed_worker_count: number;
    failed_worker_count: number;
    cancelled_worker_count: number;
    workers: ForemanReadableWorkerSnapshot[];
    active_workers: ForemanReadableWorkerSnapshot[];
    summary: string;
}
interface ForemanVisibleWorkerRequest {
    scope: string | null;
    slice_label: string | null;
    partition_strategy: NonNullable<DelegationRecord['worker_request']>['partition_strategy'] | null;
    coverage_focus: NonNullable<DelegationRecord['worker_request']>['coverage_focus'];
    coverage_rules: NonNullable<DelegationRecord['worker_request']>['coverage_rules'];
}
interface ForemanVisibleWorkerResult {
    scope: string | null;
    slice_label: string | null;
    partition_strategy: NonNullable<DelegationRecord['worker_result']>['partition_strategy'] | null;
    coverage_focus: NonNullable<DelegationRecord['worker_result']>['coverage_focus'];
    key_findings: NonNullable<DelegationRecord['worker_result']>['key_findings'];
    evidence_paths: string[];
    confidence: NonNullable<DelegationRecord['worker_result']>['confidence'];
    uncertainty_summary: string | null;
}
interface ForemanDelegationCounts {
    total: number;
    active: number;
    completed: number;
    failed: number;
    cancelled: number;
}
interface ForemanVisibleDelegation {
    delegation_id: string;
    task_card_id: string;
    source_task_card_id?: string | null;
    delegated_by_role: Role;
    review_round: number | null;
    summary: string;
    context: ForemanReadableDelegationContext;
    child_agent: ChildAgentSnapshot;
    child_agent_config_summary: ForemanAgentConfigSummary | null;
    worker_request: ForemanVisibleWorkerRequest | null;
    worker_role_config_snapshot?: DelegationRecord['worker_role_config_snapshot'];
    worker_result: ForemanVisibleWorkerResult | null;
    executor: SpecialistExecutorSnapshot;
    result_summary: string | null;
    reviewer_outcome: ReviewerOutcomeRecord | null;
    latest_failure: FailureRecord | null;
    updated_at: string;
    completed_at: string | null;
}
export interface ForemanActivityResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    goal: string;
    readable_context: ForemanReadableRunContext | null;
    orchestration_policy: OrchestratorState['orchestration_policy'] | null;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    completed: string | null;
    in_progress: string | null;
    remaining: string | null;
    resume_from: string | null;
    active_role: VisibilityProjection['active_role'];
    active_agent_id: VisibilityProjection['active_agent_id'];
    active_thread_id: VisibilityProjection['active_thread_id'];
    child_agents: VisibilityProjection['child_agents'];
    specialist_executors: VisibilityProjection['specialist_executors'];
    worker_visibility: ForemanWorkerVisibility | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    current_task_card: ForemanCurrentTaskCardView | null;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_handoff: VisibilityProjection['latest_handoff'];
    latest_verification: VisibilityProjection['latest_verification'];
    latest_failure: VisibilityProjection['latest_failure'];
    latest_verified_checkpoint: RunRecord['latest_verified_checkpoint'];
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    latest_response: RunRecord['latest_response'];
    hydration: ContextHydrationSummary | null;
    always_on_mode: AlwaysOnModeRecord;
    always_on_operator_state: ForemanAlwaysOnOperatorStateView;
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    mcp_mutation_lease: ForemanMcpMutationLeaseView;
    continuity: ContinuityProjection;
    planning_clarification_request: RunRecord['planning_clarification_request'];
    next_step: ForemanNextStep;
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    decision_summary: VisibilityProjection['orchestrator']['summary'] | null;
    mutation_guardrails_summary: string | null;
    mutation_guardrails_trace: PolicyAwareMutationGuardrailsTrace | null;
    routing_summary: string | null;
    routing_trace: PolicyAwareRoutingTrace | null;
    review_summary: string | null;
    review_trace: PolicyAwareReviewTrace | null;
    research_summary: string | null;
    research_trace: PolicyAwareResearchTrace | null;
    allowed_next_commands: AdvisorRecommendedNextAction[];
    latest_orchestration_attempt: {
        attempt_id: string;
        entrypoint: OrchestrationAttemptRecord['entrypoint'];
        started_at: string;
        completed_at: string | null;
        step_count: number;
        stop_reason: OrchestrationStopReason | null;
        summary: string;
        steps: Array<{
            step_number: number;
            command: OrchestrationAttemptRecord['steps'][number]['command'];
            before: ForemanActivityAttemptSnapshot;
            after: ForemanActivityAttemptSnapshot;
        }>;
    } | null;
    active_task_delegations: {
        task_card_id: string;
        total: number;
        queued: number;
        running: number;
        completed: number;
        failed: number;
        cancelled: number;
        active: Array<{
            delegation_id: string;
            delegated_by_role: Role;
            review_round: number | null;
            summary: string;
            context: ForemanReadableDelegationContext;
            child_agent: ChildAgentSnapshot;
            child_agent_config_summary: ForemanAgentConfigSummary | null;
            executor: SpecialistExecutorSnapshot;
            updated_at: string;
        }>;
    } | null;
    task_delegations: ForemanVisibleDelegation[];
}
export interface ForemanDelegationsResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    goal: string;
    readable_context: ForemanReadableRunContext | null;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    current_task_card: ForemanCurrentTaskCardView | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    hydration: ContextHydrationSummary | null;
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    mcp_mutation_lease: ForemanMcpMutationLeaseView;
    planning_clarification_request: RunRecord['planning_clarification_request'];
    next_step: ForemanNextStep;
    can_advance: boolean;
    allowed_next_commands: AdvisorRecommendedNextAction[];
    delegation_counts: ForemanDelegationCounts;
    delegations: ForemanVisibleDelegation[];
}
export interface ForemanDelegateResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    task_card_id: string;
    delegation_id: string;
    delegated_by_role: Role;
    review_round: number | null;
    summary: string;
    child_agent: ChildAgentSnapshot;
    executor: SpecialistExecutorSnapshot;
    created_at: string;
    updated_at: string;
}
export interface ForemanUpdateDelegationResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    delegation_id: string;
    task_card_id: string;
    delegated_by_role: Role;
    review_round: number | null;
    summary: string;
    child_agent: ChildAgentSnapshot;
    executor: SpecialistExecutorSnapshot;
    result_summary: string | null;
    reviewer_outcome: ReviewerOutcomeRecord | null;
    latest_failure: FailureRecord | null;
    updated_at: string;
    completed_at: string | null;
}
type ForemanOrchestrateDispatchedCommand = 'advance' | 'verify' | 'retry' | 'replan' | 'resolve';
type ForemanOrchestrateDispatchedHandler = 'advanceForemanRun' | 'verifyForemanRun' | 'retryForemanRun' | 'replanForemanRun' | 'resolveForemanRun';
export interface ForemanOrchestrateResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    task_card_id: string;
    readable_context: ForemanReadableRunContext | null;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    current_task_card: ForemanCurrentTaskCardView | null;
    worker_visibility: ForemanWorkerVisibility | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    hydration: ContextHydrationSummary | null;
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    mcp_mutation_lease: ForemanMcpMutationLeaseView;
    next_step: ForemanNextStep;
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    allowed_next_commands: AdvisorRecommendedNextAction[];
    decision_summary: string | null;
    orchestration_status: 'dispatched' | 'stopped';
    dispatched_command: ForemanOrchestrateDispatchedCommand | null;
    dispatched_via: ForemanOrchestrateDispatchedHandler | null;
    stop_reason: OrchestratorDecisionStep | null;
    orchestration_summary: string;
}
export interface ForemanAlwaysOnTickResult {
    cwd: string;
    run_id: string;
    run_directory: string;
    run_ref: string;
    task_card_id: string;
    status: VisibilityProjection['status'];
    stage: VisibilityProjection['stage'];
    current_task_card: ForemanCurrentTaskCardView | null;
    server_identity: ForemanServerIdentityView;
    task_graph_summary: ForemanTaskGraphSummary;
    orchestrator_agent_config_summary: ForemanAgentConfigSummary | null;
    orchestrator_request_settings_preview: ForemanOrchestratorRequestSettingsPreview | null;
    orchestrator_scope: ForemanOrchestratorScope;
    orchestrator_scope_summary: string;
    latest_orchestrator_synthesis: RunRecord['latest_orchestrator_synthesis'];
    mcp_mutation_lease: ForemanMcpMutationLeaseView;
    verification_state: TaskCardRecord['verification_state'] | null;
    next_step: ForemanNextStep;
    can_advance: VisibilityProjection['orchestrator']['can_advance'];
    always_on_mode: AlwaysOnModeRecord;
    always_on_operator_state: ForemanAlwaysOnOperatorStateView;
    workflow_operator_state?: ForemanWorkflowOperatorStateView;
    orchestration_status: 'dispatched' | 'stopped';
    steps_executed: number;
    stop_reason: OrchestrationStopReason;
    request_settings: AlwaysOnCompanionRequestSettingsSummary;
    orchestration_summary: string;
}
export interface ForemanAlwaysOnLoopResult extends ForemanAlwaysOnTickResult {
    tick_count: number;
    iteration_count: number;
    backoff_history_ms: number[];
}
interface JsonRpcSuccessResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    result: unknown;
}
interface JsonRpcErrorResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    error: {
        code: number;
        message: string;
    };
}
type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;
export type McpLifecycleState = 'awaiting_initialize' | 'awaiting_client_initialized' | 'ready';
export declare function getForemanStatus(input: ForemanStatusArguments, sessionContext?: McpSessionContext): Promise<ForemanStatusResult>;
export declare function getForemanActivity(input: ForemanActivityArguments, sessionContext?: McpSessionContext): Promise<ForemanActivityResult>;
export declare function recommendForemanEntryForMcp(input: ForemanRecommendEntryArguments): Promise<ForemanRecommendEntryResult>;
export declare function autoEnterForemanForMcp(input: ForemanAutoEntryArguments): Promise<AutoEnterForemanResult>;
export declare function getForemanDelegations(input: ForemanDelegationsArguments, sessionContext?: McpSessionContext): Promise<ForemanDelegationsResult>;
export declare function declareForemanDelegation(input: ForemanDelegateArguments, sessionContext?: McpSessionContext): Promise<ForemanDelegateResult>;
export declare function updateForemanDelegation(input: ForemanUpdateDelegationArguments, sessionContext?: McpSessionContext): Promise<ForemanUpdateDelegationResult>;
export declare function startForemanMcpRun(input: ForemanStartArguments, sessionContext?: McpSessionContext): Promise<ForemanStartResult>;
export declare function runForemanMcpRun(input: ForemanRunArguments, sessionContext?: McpSessionContext): Promise<ForemanRunResult>;
export declare function orchestrateForemanRun(input: ForemanOrchestrateArguments, sessionContext?: McpSessionContext): Promise<ForemanOrchestrateResult>;
export declare function tickForemanAlwaysOnCompanion(input: ForemanAlwaysOnTickArguments, sessionContext?: McpSessionContext): Promise<ForemanAlwaysOnTickResult>;
export declare function runForemanAlwaysOnLoop(input: ForemanAlwaysOnLoopArguments, sessionContext?: McpSessionContext): Promise<ForemanAlwaysOnLoopResult>;
export declare function handleMcpRequest(value: unknown, sessionContext?: McpSessionContext): Promise<JsonRpcResponse | null>;
export declare function createMcpSession(): {
    handleMessage(value: unknown): Promise<JsonRpcResponse | null>;
};
export declare function runForemanMcpServer(input?: Readable, output?: Writable, errorOutput?: Writable): void;
export {};
