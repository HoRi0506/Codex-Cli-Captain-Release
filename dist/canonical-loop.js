"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveForemanLoopState = deriveForemanLoopState;
const CANONICAL_LOOP_PATH = [
    'intake',
    'scoped',
    'investigating',
    'implementing',
    'reviewing',
    'verifying_execution_truth',
    'synthesizing',
    'completed',
];
function createVariantPath(variant) {
    switch (variant) {
        case 'light':
            return ['intake', 'scoped', 'synthesizing', 'completed'];
        case 'investigate_only':
            return ['intake', 'scoped', 'investigating', 'synthesizing', 'completed'];
        case 'implementation':
            return ['intake', 'scoped', 'implementing', 'reviewing', 'synthesizing', 'completed'];
        case 'verify_only':
            return ['intake', 'reviewing', 'verifying_execution_truth', 'synthesizing', 'completed'];
        case 'blocked_manual':
            return ['intake', 'scoped', 'blocked'];
        case 'canonical':
        default:
            return [...CANONICAL_LOOP_PATH];
    }
}
function summarizeStage(stage, variant, ownerRole) {
    const owner = ownerRole ?? 'captain';
    switch (stage) {
        case 'intake':
            return `Captain is holding the request at intake and has not yet produced a bounded scoped task. path=${variant} owner=${owner}.`;
        case 'scoped':
            return `Captain is treating the run as scoped work and is choosing the next bounded stage before specialist execution. path=${variant} owner=${owner}.`;
        case 'investigating':
            return `Captain has routed the run into the investigation stage. Evidence gathering should stay bounded before synthesis or implementation. path=${variant} owner=${owner}.`;
        case 'implementing':
            return `Captain has routed the run into the implementation stage. Scoped mutation or execution is the current bounded responsibility. path=${variant} owner=${owner}.`;
        case 'reviewing':
            return `Captain has routed the run into the review stage. Arbiter-style acceptance checking is the current bounded responsibility. path=${variant} owner=${owner}.`;
        case 'verifying_execution_truth':
            return `Captain is holding the run at execution-truth verification. The next move depends on explicit verification or repair outcome. path=${variant} owner=${owner}.`;
        case 'synthesizing':
            return `Captain is synthesizing the current bounded result into the next explicit step or operator-facing answer. path=${variant} owner=${owner}.`;
        case 'blocked':
            return `Captain has reached a blocked or manual boundary. The run should not progress until the blocking condition is resolved. path=${variant} owner=${owner}.`;
        case 'degraded':
            return `Captain is reporting a degraded path. The run stayed bounded, but truth or policy evidence is incomplete. path=${variant} owner=${owner}.`;
        case 'completed':
            return `Captain has completed the bounded loop for this run. path=${variant} owner=${owner}.`;
    }
}
function deriveStage(input) {
    if (input.runStatus === 'completed') {
        return 'completed';
    }
    if (input.hasContractMismatch) {
        return 'degraded';
    }
    if (input.runStatus === 'blocked' ||
        input.runStatus === 'failed' ||
        input.runStatus === 'cancelled' ||
        input.hasPlanningClarification ||
        input.nextStep === 'await_operator' ||
        input.nextStep === 'await_repair_decision' ||
        input.nextStep === 'await_clarification') {
        return 'blocked';
    }
    if (input.nextStep === 'halt_completed') {
        return 'synthesizing';
    }
    if (input.taskCard === null) {
        return 'intake';
    }
    if (input.taskCard.task_kind === 'plan' ||
        input.workflowStage === 'planning' ||
        input.taskCard.owner_role === 'planner' ||
        input.taskCard.assigned_role === 'planner') {
        return 'scoped';
    }
    if (input.taskCard.task_kind === 'explore' ||
        input.taskCard.owner_role === 'explorer' ||
        input.taskCard.assigned_role === 'explorer') {
        return 'investigating';
    }
    if (input.taskCard.task_kind === 'review' ||
        input.taskCard.owner_role === 'verifier' ||
        input.taskCard.assigned_role === 'verifier' ||
        input.workflowStage === 'verification' ||
        input.nextStep === 'verify_task') {
        return input.nextStep === 'await_verification' ? 'verifying_execution_truth' : 'reviewing';
    }
    return 'implementing';
}
function deriveVariant(input) {
    if (input.currentStage === 'blocked' || input.currentStage === 'degraded') {
        return 'blocked_manual';
    }
    if (input.currentStage === 'investigating') {
        return 'investigate_only';
    }
    if (input.currentStage === 'reviewing' || input.currentStage === 'verifying_execution_truth') {
        return 'verify_only';
    }
    if (input.currentStage === 'completed' || input.currentStage === 'synthesizing' || input.currentStage === 'intake') {
        return 'canonical';
    }
    if (input.currentStage === 'scoped' && input.taskCard?.assigned_role === 'planner') {
        return 'light';
    }
    if (input.currentStage === 'implementing' ||
        input.taskCard?.assigned_role === 'code specialist' ||
        input.taskCard?.owner_role === 'code specialist') {
        return 'implementation';
    }
    return input.nextStep === 'execute_task' ? 'implementation' : 'canonical';
}
function deriveNextStages(currentStage) {
    switch (currentStage) {
        case 'intake':
            return ['scoped', 'blocked'];
        case 'scoped':
            return ['investigating', 'implementing', 'reviewing', 'blocked'];
        case 'investigating':
            return ['implementing', 'synthesizing', 'blocked'];
        case 'implementing':
            return ['reviewing', 'synthesizing', 'blocked'];
        case 'reviewing':
            return ['verifying_execution_truth', 'synthesizing', 'blocked'];
        case 'verifying_execution_truth':
            return ['implementing', 'synthesizing', 'blocked'];
        case 'synthesizing':
            return ['completed', 'scoped', 'blocked'];
        case 'degraded':
            return ['blocked', 'synthesizing'];
        case 'blocked':
            return ['scoped', 'implementing', 'reviewing'];
        case 'completed':
            return [];
    }
}
function deriveEntryCondition(stage) {
    switch (stage) {
        case 'intake':
            return 'A fresh request exists but no bounded scoped task has been selected yet.';
        case 'scoped':
            return 'Captain has a bounded request and is choosing the next loop stage or path variant.';
        case 'investigating':
            return 'The current bounded move requires evidence gathering before mutation or synthesis.';
        case 'implementing':
            return 'The current bounded move requires scoped execution or mutation work.';
        case 'reviewing':
            return 'The current bounded move requires explicit acceptance review.';
        case 'verifying_execution_truth':
            return 'The run is waiting on explicit verification or repair truth before moving on.';
        case 'synthesizing':
            return 'Captain has enough bounded evidence to choose the next explicit step or final answer.';
        case 'blocked':
            return 'A manual boundary, failed condition, or repair gate currently prevents progress.';
        case 'degraded':
            return 'The run stayed bounded but policy or truth evidence is incomplete.';
        case 'completed':
            return 'The bounded loop already reached a terminal completed state.';
    }
}
function deriveCompletionCondition(stage) {
    switch (stage) {
        case 'intake':
            return 'A bounded scoped task or explicit blocked state is recorded.';
        case 'scoped':
            return 'Captain selects investigation, implementation, review, or a blocked path.';
        case 'investigating':
            return 'Enough bounded evidence exists to synthesize or route the next move.';
        case 'implementing':
            return 'Scoped execution returns enough evidence for review or synthesis.';
        case 'reviewing':
            return 'Review emits pass, repair, hold, or next-step evidence.';
        case 'verifying_execution_truth':
            return 'Verification resolves to repair, synthesis, or explicit block.';
        case 'synthesizing':
            return 'Captain records the next explicit step or a terminal answer.';
        case 'blocked':
            return 'An explicit retry, replan, resolve, or clarifying operator action unblocks the run.';
        case 'degraded':
            return 'Truth evidence is restored or captain stops at an explicit boundary.';
        case 'completed':
            return 'No further completion condition applies.';
    }
}
function deriveStopCondition(currentStage, nextStep) {
    if (currentStage === 'blocked') {
        return 'Manual boundary or blocked state requires explicit operator or verifier action.';
    }
    if (currentStage === 'completed') {
        return 'The run is already completed.';
    }
    if (nextStep === 'halt_failed' || nextStep === 'halt_cancelled') {
        return 'The next persisted step is terminal failure or cancellation.';
    }
    return null;
}
function deriveForemanLoopState(input) {
    const currentStage = deriveStage(input);
    const pathVariant = deriveVariant({
        currentStage,
        taskCard: input.taskCard,
        nextStep: input.nextStep,
    });
    const currentOwnerRole = currentStage === 'blocked' || currentStage === 'completed'
        ? input.activeRole ?? input.taskCard?.owner_role ?? null
        : input.taskCard?.owner_role ?? input.activeRole ?? null;
    const activeSelectedRole = input.taskCard?.owner_role === 'verifier'
        ? 'verifier'
        : input.taskCard?.assigned_role && input.taskCard.assigned_role !== 'orchestrator'
            ? input.taskCard.assigned_role
            : null;
    const selectedSpecialistRole = activeSelectedRole;
    return {
        current_stage: currentStage,
        path_variant: pathVariant,
        current_owner_role: currentOwnerRole,
        selected_specialist_role: selectedSpecialistRole,
        canonical_path: [...CANONICAL_LOOP_PATH],
        variant_path: createVariantPath(pathVariant),
        next_stage_candidates: deriveNextStages(currentStage),
        entry_condition: deriveEntryCondition(currentStage),
        completion_condition: deriveCompletionCondition(currentStage),
        stop_condition: deriveStopCondition(currentStage, input.nextStep),
        summary: summarizeStage(currentStage, pathVariant, currentOwnerRole),
    };
}
//# sourceMappingURL=canonical-loop.js.map