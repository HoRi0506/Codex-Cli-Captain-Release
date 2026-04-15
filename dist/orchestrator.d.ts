import type { AdvisorRecommendedNextAction, ContinueStopReason, DelegationRecord, OrchestratorDecision, OrchestratorDecisionStep, OrchestratorRouteSelection, PolicyAwareMutationGuardrailsMetadata, OrchestrationPolicy, PolicyAwareResearchMetadata, PolicyAwareReviewMetadata, PolicyAwareRoutingMetadata, RunRecord, TaskDelegationCounts, TaskCardRecord } from './types';
export declare function createDefaultRouteSelection(nextStep: OrchestratorDecisionStep): OrchestratorRouteSelection;
export declare function getOrchestratorRouteSelection(decision: Pick<OrchestratorDecision, 'next_step' | 'route_selection'>): OrchestratorRouteSelection;
export declare function normalizeOrchestratorDecision(decision: OrchestratorDecision): OrchestratorDecision;
export declare function createAwaitFanInDecision(taskCard: Pick<TaskCardRecord, 'title'>, counts: Pick<TaskDelegationCounts, 'total' | 'active' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'>, phase?: 'execution' | 'verification'): OrchestratorDecision;
export declare function derivePolicyAwareRoutingMetadata(run: RunRecord, taskCard: TaskCardRecord, policy: OrchestrationPolicy, decision: OrchestratorDecision): PolicyAwareRoutingMetadata;
export declare function derivePolicyAwareResearchMetadata(policy: OrchestrationPolicy, decision: OrchestratorDecision): PolicyAwareResearchMetadata;
export declare function derivePolicyAwareMutationGuardrailsMetadata(policy: OrchestrationPolicy, decision: OrchestratorDecision): PolicyAwareMutationGuardrailsMetadata;
export declare function derivePolicyAwareReviewMetadata(run: RunRecord, taskCard: TaskCardRecord, policy: OrchestrationPolicy, decision: OrchestratorDecision, taskDelegations?: DelegationRecord[]): PolicyAwareReviewMetadata;
export declare function classifyContinueStep(decisionOrNextStep: OrchestratorDecisionStep | Pick<OrchestratorDecision, 'next_step' | 'can_advance'>): {
    command: 'advance' | 'verify';
    stopReason: null;
} | {
    command: null;
    stopReason: Exclude<ContinueStopReason, 'max_steps_reached'>;
};
export declare function getAllowedExplicitCommandsForDecision(decision: OrchestratorDecision): AdvisorRecommendedNextAction[];
export declare function decideOrchestratorNextStep(run: RunRecord, taskCard: TaskCardRecord, options?: {
    verificationRequestAvailable?: boolean;
    orchestrationPolicy?: OrchestrationPolicy;
    activeTaskDelegationCounts?: TaskDelegationCounts;
}): OrchestratorDecision;
