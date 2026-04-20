"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultRouteSelection = createDefaultRouteSelection;
exports.getOrchestratorRouteSelection = getOrchestratorRouteSelection;
exports.normalizeOrchestratorDecision = normalizeOrchestratorDecision;
exports.createAwaitFanInDecision = createAwaitFanInDecision;
exports.derivePolicyAwareRoutingMetadata = derivePolicyAwareRoutingMetadata;
exports.derivePolicyAwareResearchMetadata = derivePolicyAwareResearchMetadata;
exports.derivePolicyAwareMutationGuardrailsMetadata = derivePolicyAwareMutationGuardrailsMetadata;
exports.derivePolicyAwareReviewMetadata = derivePolicyAwareReviewMetadata;
exports.classifyContinueStep = classifyContinueStep;
exports.getAllowedExplicitCommandsForDecision = getAllowedExplicitCommandsForDecision;
exports.decideOrchestratorNextStep = decideOrchestratorNextStep;
const constants_1 = require("./constants");
const workflow_variants_1 = require("./workflow-variants");
const DEFAULT_EXPLICIT_REVIEW_POLICY = {
    mode: 'explicit_only',
    max_review_passes: 1,
    max_active_reviewers: 1,
};
const READ_ONLY_ORACLE_REVIEW_PATH = 'Oracle-backed advisory review is read-only; explicit operator control remains required.';
function isExecutionOwnerRole(role) {
    return role === 'planner' || role === 'explorer' || role === 'code specialist' || role === 'documenter';
}
function createExplicitFallbackRouteSelection(reason) {
    return {
        route_id: 'explicit_fallback',
        reason,
    };
}
function createDelegatedExecuteRouteSelection(reason) {
    return {
        route_id: 'delegated_execute',
        reason,
    };
}
function createDefaultRouteSelection(nextStep) {
    switch (nextStep) {
        case 'execute_task':
            return createExplicitFallbackRouteSelection('no persisted delegated lower-tier route was recorded for this execution step');
        case 'verify_task':
            return createExplicitFallbackRouteSelection('verification stays on the explicit fallback by default');
        case 'await_fan_in':
            return createExplicitFallbackRouteSelection('explicit fan-in remains the neutral persisted default');
        case 'await_verification':
            return createExplicitFallbackRouteSelection('manual verification fallback remains the neutral persisted default');
        case 'await_repair_decision':
            return createExplicitFallbackRouteSelection('repair choices remain explicit by default');
        case 'await_operator':
            return createExplicitFallbackRouteSelection('manual operator control remains the neutral persisted default');
        case 'halt_completed':
            return createExplicitFallbackRouteSelection('the run is already completed');
        case 'halt_failed':
            return createExplicitFallbackRouteSelection('the run has already failed');
        case 'halt_cancelled':
            return createExplicitFallbackRouteSelection('the run is already cancelled');
    }
}
function getOrchestratorRouteSelection(decision) {
    return decision.route_selection ?? createDefaultRouteSelection(decision.next_step);
}
function normalizeOrchestratorDecision(decision) {
    return {
        ...decision,
        route_selection: getOrchestratorRouteSelection(decision),
    };
}
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function includesAnyKeyword(text, keywords) {
    return keywords.some((keyword) => {
        if (keyword.includes(' ')) {
            return text.includes(keyword);
        }
        return new RegExp(`\\b${escapeRegExp(keyword)}\\b`).test(text);
    });
}
function formatRecommendedSkills(skills) {
    return skills.length > 0 ? skills.join(', ') : 'none';
}
function buildRoutingRecommendationVisibilitySummary(input) {
    if (input.recommendedCategory === null && input.recommendedSkills.length === 0) {
        return 'Advisory visibility only surfaces neutral OmO recommendation values (category none; skills none).';
    }
    return `Advisory visibility only surfaces recommended OmO category ${input.recommendedCategory ?? 'none'} and skills ${formatRecommendedSkills(input.recommendedSkills)}.`;
}
function looksLikeDriftCheck(taskCard) {
    const combinedTaskText = [
        taskCard.title,
        taskCard.intent,
        taskCard.scope,
        taskCard.acceptance,
        taskCard.execution_prompt,
    ]
        .join('\n')
        .toLowerCase();
    return includesAnyKeyword(combinedTaskText, [
        'drift',
        'ownership',
        'execution truth',
        'route truth',
        'routing truth',
        'model policy',
        'config drift',
        'fallback honesty',
        'degraded',
        'sentinel',
    ]);
}
function deriveRoutingBudgetProfile(input) {
    const normalizedDecision = normalizeOrchestratorDecision(input.decision);
    switch (normalizedDecision.next_step) {
        case 'halt_completed':
        case 'halt_failed':
        case 'halt_cancelled':
            return {
                workloadClass: 'terminal',
                pathWeight: 'light',
                executionPath: 'terminal',
                modelTierBudget: 'none',
                reasoningEffortBudget: 'none',
                reviewRequirement: 'none',
                budgetReason: 'the run is already terminal, so no new routing budget should be spent',
            };
        case 'await_operator':
            return {
                workloadClass: 'manual_boundary',
                pathWeight: 'medium',
                executionPath: 'manual_boundary',
                modelTierBudget: 'none',
                reasoningEffortBudget: 'none',
                reviewRequirement: 'required',
                budgetReason: 'the workflow is waiting at an explicit manual boundary instead of spending more routed work automatically',
            };
        case 'await_fan_in':
        case 'await_verification':
        case 'await_repair_decision':
            return {
                workloadClass: 'manual_boundary',
                pathWeight: 'heavy',
                executionPath: 'manual_boundary',
                modelTierBudget: 'none',
                reasoningEffortBudget: 'none',
                reviewRequirement: 'required',
                budgetReason: 'the workflow is inside an explicit verification or repair boundary, so additional work stays paused until that boundary is resolved',
            };
        case 'verify_task':
            return {
                workloadClass: looksLikeDriftCheck(input.taskCard) ? 'drift_check' : 'risky_review',
                pathWeight: 'heavy',
                executionPath: 'delegated_plus_review',
                modelTierBudget: 'high_tier',
                reasoningEffortBudget: 'high',
                reviewRequirement: 'required',
                budgetReason: looksLikeDriftCheck(input.taskCard)
                    ? 'captain is prioritizing execution-truth or drift evidence, so the review lane stays heavy and explicit'
                    : 'captain is entering the verifier lane, so the path stays high-tier and review-required',
            };
        case 'execute_task':
            break;
    }
    if (looksLikeDriftCheck(input.taskCard)) {
        return {
            workloadClass: 'drift_check',
            pathWeight: 'medium',
            executionPath: normalizedDecision.route_selection?.route_id === 'delegated_execute' ? 'delegated' : 'local',
            modelTierBudget: 'standard',
            reasoningEffortBudget: 'medium',
            reviewRequirement: 'conditional',
            budgetReason: 'captain is checking ownership or execution truth, so the routing budget stays bounded and evidence-oriented',
        };
    }
    if (input.taskCard.task_kind === 'plan') {
        return {
            workloadClass: 'scoped_planning',
            pathWeight: 'light',
            executionPath: 'local',
            modelTierBudget: 'standard',
            reasoningEffortBudget: 'medium',
            reviewRequirement: 'none',
            budgetReason: 'scope-shaping work should stay lightweight until a concrete bounded next move exists',
        };
    }
    if (input.taskCard.task_kind === 'explore') {
        return {
            workloadClass: 'bounded_survey',
            pathWeight: input.taskCard.model_tier_intent === 'high_tier' ? 'heavy' : 'medium',
            executionPath: normalizedDecision.route_selection?.route_id === 'delegated_execute' ? 'delegated' : 'local',
            modelTierBudget: input.taskCard.model_tier_intent === 'high_tier' ? 'high_tier' : 'low_cost',
            reasoningEffortBudget: input.taskCard.model_tier_intent === 'high_tier' ? 'high' : 'medium',
            reviewRequirement: 'none',
            budgetReason: 'bounded survey work should bias toward cheaper evidence gathering before heavier mutation or review',
        };
    }
    if (input.taskCard.task_kind === 'review') {
        return {
            workloadClass: 'risky_review',
            pathWeight: 'heavy',
            executionPath: 'delegated_plus_review',
            modelTierBudget: 'high_tier',
            reasoningEffortBudget: 'high',
            reviewRequirement: 'required',
            budgetReason: 'review tasks are verification-sensitive, so captain keeps them on a heavy reviewed path',
        };
    }
    if (input.taskCard.task_kind === 'execution') {
        if (input.taskCard.model_tier_intent === 'low_cost') {
            return {
                workloadClass: 'scoped_mutation',
                pathWeight: 'light',
                executionPath: normalizedDecision.route_selection?.route_id === 'delegated_execute' ? 'delegated' : 'local',
                modelTierBudget: 'low_cost',
                reasoningEffortBudget: 'medium',
                reviewRequirement: 'conditional',
                budgetReason: 'simple scoped mutation should avoid heavyweight routing and only escalate when the bounded path proves it is needed',
            };
        }
        if (input.taskCard.model_tier_intent === 'high_tier') {
            return {
                workloadClass: 'scoped_mutation',
                pathWeight: 'heavy',
                executionPath: normalizedDecision.route_selection?.route_id === 'delegated_execute' ? 'delegated_plus_review' : 'delegated',
                modelTierBudget: 'high_tier',
                reasoningEffortBudget: 'high',
                reviewRequirement: 'conditional',
                budgetReason: 'complex mutation needs more model budget and usually benefits from an explicit review lane',
            };
        }
        return {
            workloadClass: 'scoped_mutation',
            pathWeight: 'medium',
            executionPath: normalizedDecision.route_selection?.route_id === 'delegated_execute' ? 'delegated' : 'local',
            modelTierBudget: 'standard',
            reasoningEffortBudget: 'medium',
            reviewRequirement: 'conditional',
            budgetReason: 'standard mutation work should stay role-shaped and bounded without paying a heavy review cost by default',
        };
    }
    return {
        workloadClass: 'trivial_local',
        pathWeight: 'light',
        executionPath: 'local',
        modelTierBudget: 'low_cost',
        reasoningEffortBudget: 'low',
        reviewRequirement: 'none',
        budgetReason: 'the task is small enough that captain should prefer the local lightweight path',
    };
}
function deriveRecommendedCategory(input) {
    const combinedTaskText = [
        input.taskCard.title,
        input.taskCard.intent,
        input.taskCard.scope,
        input.taskCard.acceptance,
        input.taskCard.execution_prompt,
    ]
        .join('\n')
        .toLowerCase();
    if (includesAnyKeyword(combinedTaskText, [
        'frontend',
        'front-end',
        'front end',
        'ui',
        'ux',
        'visual',
        'design',
        'layout',
        'css',
        'responsive',
        'component styling',
        'design system',
    ])) {
        return 'visual-engineering';
    }
    if (includesAnyKeyword(combinedTaskText, [
        'docs',
        'documentation',
        'readme',
        'guide',
        'content',
        'copy',
        'blog',
        'changelog',
        'release notes',
    ])) {
        return 'writing';
    }
    return null;
}
function deriveRecommendedSkills(input) {
    const combinedTaskText = [
        input.taskCard.title,
        input.taskCard.intent,
        input.taskCard.scope,
        input.taskCard.acceptance,
        input.taskCard.execution_prompt,
    ]
        .join('\n')
        .toLowerCase();
    const recommendedSkills = [];
    const hasBrowserSignals = includesAnyKeyword(combinedTaskText, [
        'browser',
        'playwright',
        'e2e',
        'end-to-end',
        'end to end',
        'screenshot',
        'page',
        'click',
        'form',
        'url',
        'web app',
    ]);
    if (input.recommendedCategory === 'visual-engineering') {
        recommendedSkills.push('frontend-ui-ux');
    }
    if (hasBrowserSignals ||
        (input.run.stage === 'verification' &&
            input.decision.next_step === 'verify_task' &&
            includesAnyKeyword(combinedTaskText, ['frontend', 'ui', 'visual', 'web']))) {
        recommendedSkills.push('playwright');
    }
    return recommendedSkills;
}
function deriveOmORecommendations(input) {
    if (input.decision.next_step !== 'execute_task' && input.decision.next_step !== 'verify_task') {
        return {
            recommendedCategory: null,
            recommendedSkills: [],
        };
    }
    const recommendedCategory = deriveRecommendedCategory({
        taskCard: input.taskCard,
    });
    return {
        recommendedCategory,
        recommendedSkills: deriveRecommendedSkills({
            run: input.run,
            taskCard: input.taskCard,
            decision: input.decision,
            recommendedCategory,
        }),
    };
}
function supportsDelegatedLowerTierExecution(recommendedCategory) {
    return recommendedCategory === 'writing';
}
function buildPolicyAwareMutationGuardrailsSummary(input) {
    return `Policy mutation guardrails keep git and PR mutation ${input.policy.git_mutation.mode}-only, so current decision ${input.decision.next_step} remains outside any git or PR automation path. Only explicit operator action may perform repository or PR mutations, and execution and delegation remain unchanged.`;
}
function derivePolicyAwareResearchTargetStep(policy, decision) {
    if (policy.autonomous_research.mode !== 'advisory_visibility_only') {
        return null;
    }
    return decision.next_step === 'execute_task' || decision.next_step === 'verify_task' ? decision.next_step : null;
}
function buildPolicyAwareResearchSummary(input) {
    if (input.policy.autonomous_research.mode === 'disabled') {
        return 'Policy research routing is disabled, so no read-only research visibility target is active for the current workflow state.';
    }
    if (input.researchTargetStep) {
        return `Policy research routing remains ${input.policy.autonomous_research.mode}. Read-only research visibility may inform ${input.researchTargetStep} while execution and review authority remain unchanged.`;
    }
    switch (input.decision.next_step) {
        case 'await_fan_in':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the parent task is explicitly waiting for bounded child delegation fan-in.`;
        case 'await_verification':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the workflow awaits an explicit verification resolution.`;
        case 'await_repair_decision':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because blocked verification requires an explicit retry-or-replan decision.`;
        case 'await_operator':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the persisted state awaits manual operator action.`;
        case 'halt_completed':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the run is already completed.`;
        case 'halt_failed':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the run has failed and requires review before any further action.`;
        case 'halt_cancelled':
            return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active because the run is cancelled.`;
    }
    return `Policy research routing remains ${input.policy.autonomous_research.mode}. No read-only research visibility target is active for the current workflow state.`;
}
function getEffectiveReviewPolicy(policy) {
    return policy?.review ?? DEFAULT_EXPLICIT_REVIEW_POLICY;
}
function getRemainingReviewPasses(taskCard, reviewPolicy) {
    return Math.max(0, reviewPolicy.max_review_passes - taskCard.review_pass_count);
}
function derivePolicyAwareReviewOutcome(taskCard, decision) {
    if (taskCard.verification_state === 'passed' || decision.next_step === 'halt_completed') {
        return 'pass';
    }
    if (decision.next_step === 'await_repair_decision') {
        return 'repair';
    }
    if (decision.next_step === 'await_verification' && taskCard.verification_state !== 'pending') {
        return 'hold';
    }
    return 'pending';
}
function buildPolicyAwareReviewSummary(input) {
    const basePolicySummary = `Policy review remains ${input.reviewPolicy.mode} with at most ${input.reviewPolicy.max_review_passes} bounded recheck${input.reviewPolicy.max_review_passes === 1 ? '' : 's'} for this task` +
        ` and a bounded reviewer swarm cap of ${input.reviewPolicy.max_active_reviewers}.`;
    const reviewerSwarmSummary = input.reviewerCount > 0
        ? ` Current review round ${input.taskCard.review_pass_count} has ${input.reviewerCount} persisted verifier delegation${input.reviewerCount === 1 ? '' : 's'} with aggregate state ${input.reviewerSwarmState}.`
        : ` Current review round ${input.taskCard.review_pass_count} has no persisted verifier delegations yet and remains ${input.reviewerSwarmState}.`;
    switch (input.reviewOutcome) {
        case 'pass':
            return `${basePolicySummary}${reviewerSwarmSummary} Verification passed, so no additional review loop action is required for task "${input.taskCard.title}".`;
        case 'repair':
            return `${basePolicySummary}${reviewerSwarmSummary} Verification failed for task "${input.taskCard.title}" while ${input.remainingReviewPasses} bounded recheck${input.remainingReviewPasses === 1 ? '' : 'es'} ${input.remainingReviewPasses === 1 ? 'remains' : 'remain'}, so the next move stays on an explicit retry-or-replan repair decision.`;
        case 'hold':
            return `${basePolicySummary}${reviewerSwarmSummary} Verification failed for task "${input.taskCard.title}" after the bounded recheck budget was exhausted, so the workflow is now on an explicit manual hold that reuses the existing resolve path.`;
        case 'pending':
            if (input.decision.next_step === 'await_fan_in') {
                return `${basePolicySummary}${reviewerSwarmSummary} Oracle-backed review remains advisory and read-only while task "${input.taskCard.title}" waits at explicit bounded child fan-in before parent execution or verification resumes.`;
            }
            return `${basePolicySummary}${reviewerSwarmSummary} Oracle-backed review remains advisory and read-only while task "${input.taskCard.title}" continues through the current explicit execution or verification flow.`;
    }
}
function deriveReviewerSwarmState(input) {
    const currentReviewDelegations = input.taskDelegations.filter((delegation) => delegation.task_card_id === input.taskCard.task_card_id &&
        delegation.child_agent.role === 'verifier' &&
        delegation.review_round === input.taskCard.review_pass_count);
    if (currentReviewDelegations.length === 0) {
        if (input.run.stage === 'verification' &&
            input.taskCard.verification_state === 'pending' &&
            input.decision.next_step === 'await_verification' &&
            input.run.latest_failure?.stage === 'verification') {
            return {
                reviewerCount: 0,
                reviewerSwarmState: 'manual_hold',
            };
        }
        if (input.taskCard.verification_state === 'passed') {
            return {
                reviewerCount: 0,
                reviewerSwarmState: 'passed',
            };
        }
        if (input.taskCard.verification_state === 'needs_work') {
            return {
                reviewerCount: 0,
                reviewerSwarmState: 'needs_work',
            };
        }
        if (input.taskCard.verification_state === 'blocked') {
            return {
                reviewerCount: 0,
                reviewerSwarmState: 'blocked',
            };
        }
        return {
            reviewerCount: 0,
            reviewerSwarmState: 'not_requested',
        };
    }
    if (currentReviewDelegations.some((delegation) => delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running')) {
        return {
            reviewerCount: currentReviewDelegations.length,
            reviewerSwarmState: 'pending',
        };
    }
    if (currentReviewDelegations.some((delegation) => delegation.child_agent.status === 'failed' ||
        delegation.child_agent.status === 'cancelled' ||
        (delegation.child_agent.status === 'completed' && delegation.reviewer_outcome === null))) {
        return {
            reviewerCount: currentReviewDelegations.length,
            reviewerSwarmState: 'manual_hold',
        };
    }
    if (currentReviewDelegations.some((delegation) => delegation.reviewer_outcome?.outcome === 'blocked')) {
        return {
            reviewerCount: currentReviewDelegations.length,
            reviewerSwarmState: 'blocked',
        };
    }
    if (currentReviewDelegations.some((delegation) => delegation.reviewer_outcome?.outcome === 'needs_work')) {
        return {
            reviewerCount: currentReviewDelegations.length,
            reviewerSwarmState: 'needs_work',
        };
    }
    return {
        reviewerCount: currentReviewDelegations.length,
        reviewerSwarmState: 'passed',
    };
}
function buildPolicyAwareRoutingSummary(input) {
    const basePolicySummary = `Policy routing remains ${input.policy.specialist_routing.mode} with ${input.policy.parallelism.mode}.`;
    const recommendationVisibilitySummary = buildRoutingRecommendationVisibilitySummary({
        recommendedCategory: input.recommendedCategory,
        recommendedSkills: input.recommendedSkills,
    });
    const budgetSummary = `Budget path ${input.executionPath} stays ${input.pathWeight} for ${input.workloadClass}; model tier ${input.modelTierBudget}; reasoning effort ${input.reasoningEffortBudget}; review ${input.reviewRequirement} because ${input.budgetReason}.`;
    const routeSelection = getOrchestratorRouteSelection(input.decision);
    const selectedRouteSummary = routeSelection.route_id === 'delegated_execute'
        ? `Persisted route delegated_execute reuses delegated lower-tier execution because ${routeSelection.reason}.`
        : `Persisted route explicit_fallback keeps the explicit workflow because ${routeSelection.reason}.`;
    if (input.routeTargetRole && input.routeTargetStep) {
        const routeTargetLabel = input.routeTargetRosterName
            ? `${input.routeTargetRosterName} (${input.routeTargetRole})`
            : input.routeTargetRole;
        return `${basePolicySummary} Decision ${input.decision.next_step} maps advisory specialist routing to canonical ${routeTargetLabel} for ${input.routeTargetStep}. ${recommendationVisibilitySummary} ${budgetSummary} ${selectedRouteSummary}`;
    }
    switch (input.decision.next_step) {
        case 'await_fan_in':
            return input.run.stage === 'verification'
                ? `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because verification is explicitly paused until the bounded verifier delegation fan-in completes for task "${input.taskCard.title}". ${selectedRouteSummary}`
                : `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because parent execution is explicitly paused until the bounded child delegation fan-in completes for task "${input.taskCard.title}". ${selectedRouteSummary}`;
        case 'await_verification':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because verification automation is unavailable and the run awaits an explicit operator resolution. ${selectedRouteSummary}`;
        case 'await_repair_decision':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because verification blocked task "${input.taskCard.title}" and the next move must be an explicit retry or replan decision. ${selectedRouteSummary}`;
        case 'await_operator':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because the current persisted state for run ${input.run.run_id} awaits manual operator action. ${selectedRouteSummary}`;
        case 'halt_completed':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because the run is already completed. ${selectedRouteSummary}`;
        case 'halt_failed':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because the run has failed and requires review before any further action. ${selectedRouteSummary}`;
        case 'halt_cancelled':
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived because the run is cancelled. ${selectedRouteSummary}`;
        default:
            return `${basePolicySummary} ${recommendationVisibilitySummary} ${budgetSummary} No specialist handoff target is derived for the current workflow state. ${selectedRouteSummary}`;
    }
}
function deriveRouteSelection(input) {
    const counts = input.activeTaskDelegationCounts;
    if (input.decision.next_step === 'execute_task' && input.decision.can_advance) {
        const { recommendedCategory } = deriveOmORecommendations({
            run: input.run,
            taskCard: input.taskCard,
            decision: input.decision,
        });
        const isPlannedFanInChildSet = input.taskCard.node_kind === 'fan_in' && !!counts && counts.total > 0;
        const isPartitionedInvestigationSet = input.taskCard.task_kind === 'explore' && !!counts && counts.total > 0;
        const isPrimaryWorkerLaunchCandidate = input.taskCard.task_kind === 'execution' &&
            input.taskCard.assigned_role === 'code specialist' &&
            input.taskCard.model_tier_intent !== 'low_cost' &&
            recommendedCategory !== 'writing';
        const isWorkflowEntryLaunchCandidate = (0, workflow_variants_1.doesWorkflowRouteRequireDelegatedEntryLaunch)({
            selection: input.run.latest_entry_trace?.answer_trace.workflow_variant_selection ?? null,
            taskKind: input.taskCard.task_kind,
            assignedRole: input.taskCard.assigned_role,
            ownerRole: input.taskCard.owner_role,
        });
        if (!isPlannedFanInChildSet &&
            !isPartitionedInvestigationSet &&
            !isPrimaryWorkerLaunchCandidate &&
            !isWorkflowEntryLaunchCandidate &&
            !supportsDelegatedLowerTierExecution(recommendedCategory)) {
            return createExplicitFallbackRouteSelection('delegated lower-tier execution currently supports only clearly documentation or writing-shaped tasks');
        }
        if (!counts || counts.total === 0) {
            return createExplicitFallbackRouteSelection('no queued bounded worker set is available for delegated execution');
        }
        if (counts.total !== counts.queued) {
            return createExplicitFallbackRouteSelection('the current child set is already frozen for explicit fan-in and cannot start delegated lower-tier execution');
        }
        if (counts.total > input.policy.parallelism.max_active_workers) {
            return createExplicitFallbackRouteSelection(`the queued bounded child set exceeds the worker cap of ${input.policy.parallelism.max_active_workers}`);
        }
        return createDelegatedExecuteRouteSelection(isPlannedFanInChildSet
            ? `fan-in task "${input.taskCard.title}" has ${counts.total} queued planned graph child delegation${counts.total === 1 ? '' : 's'} within the worker cap of ${input.policy.parallelism.max_active_workers}`
            : isPartitionedInvestigationSet
                ? `explore task "${input.taskCard.title}" has ${counts.total} queued bounded investigation worker slice${counts.total === 1 ? '' : 's'} within the worker cap of ${input.policy.parallelism.max_active_workers}`
                : isPrimaryWorkerLaunchCandidate
                    ? `captain selected a bounded worker launch for task "${input.taskCard.title}" because it is a non-low-cost code-specialist execution task`
                    : isWorkflowEntryLaunchCandidate
                        ? `captain selected a route-contract worker launch for task "${input.taskCard.title}" because the hidden workflow entry step requires a real specialist pass`
                        : `task "${input.taskCard.title}" has ${counts.total} queued bounded child delegation${counts.total === 1 ? '' : 's'} within the worker cap of ${input.policy.parallelism.max_active_workers}`);
    }
    switch (input.decision.next_step) {
        case 'verify_task':
            return createExplicitFallbackRouteSelection('delegated lower-tier routing is execution-only in this slice');
        case 'await_fan_in':
            return createExplicitFallbackRouteSelection(input.run.stage === 'verification'
                ? 'bounded reviewer fan-in remains explicit until the current delegated set is collapsed'
                : 'bounded child fan-in remains explicit until the current delegated set is collapsed');
        case 'await_verification':
            return createExplicitFallbackRouteSelection('verification continues through the explicit fallback when verifier automation is unavailable or exhausted');
        case 'await_repair_decision':
            return createExplicitFallbackRouteSelection('retry versus replan remains an explicit repair boundary');
        case 'await_operator':
            return createExplicitFallbackRouteSelection('this workflow state stays on explicit operator fallback');
        case 'halt_completed':
            return createExplicitFallbackRouteSelection('the run is already completed');
        case 'halt_failed':
            return createExplicitFallbackRouteSelection('the run has failed and requires explicit review');
        case 'halt_cancelled':
            return createExplicitFallbackRouteSelection('the run is cancelled');
    }
    return createDefaultRouteSelection(input.decision.next_step);
}
function withDerivedRouteSelection(input) {
    return {
        ...input.decision,
        route_selection: deriveRouteSelection(input),
    };
}
function createAwaitFanInDecision(taskCard, counts, phase = 'execution') {
    const childSetIsFrozen = counts.total > counts.queued;
    const delegationLabel = phase === 'verification' ? 'reviewer delegation' : 'child delegation';
    const completionSummaryTarget = phase === 'verification'
        ? 'collapse the bounded reviewer swarm into the existing verification outcome path.'
        : 'collapse the bounded child set and hand the parent task to verification.';
    const failureSummaryTarget = phase === 'verification'
        ? 'collapse into an explicit manual verification hold.'
        : 'collapse into an operator-facing hold.';
    if (childSetIsFrozen && counts.active === 0) {
        const failedOrCancelledCount = counts.failed + counts.cancelled;
        if (failedOrCancelledCount > 0) {
            const failurePhrase = failedOrCancelledCount === 1 ? 'failed or was cancelled' : 'failed or were cancelled';
            return {
                next_step: 'await_fan_in',
                can_advance: true,
                summary: `All frozen ${delegationLabel}s are terminal for task "${taskCard.title}", but ${failedOrCancelledCount} ${delegationLabel}${failedOrCancelledCount === 1 ? '' : 's'} ${failurePhrase}. Run explicit fan-in to ${failureSummaryTarget}`,
            };
        }
        return {
            next_step: 'await_fan_in',
            can_advance: true,
            summary: `All frozen ${delegationLabel}s completed for task "${taskCard.title}". Run explicit fan-in to ${completionSummaryTarget}`,
        };
    }
    const queuedSummary = counts.queued > 0 ? `${counts.queued} queued` : null;
    const runningSummary = counts.running > 0 ? `${counts.running} running` : null;
    const activeBreakdown = [queuedSummary, runningSummary].filter((value) => value !== null).join(', ');
    return {
        next_step: 'await_fan_in',
        can_advance: false,
        summary: `The parent task is paused at explicit fan-in for task "${taskCard.title}" until ${counts.active} frozen ${delegationLabel}${counts.active === 1 ? '' : 's'} ${counts.active === 1 ? 'becomes' : 'become'} terminal${activeBreakdown.length > 0 ? ` (${activeBreakdown})` : ''}.`,
    };
}
function derivePolicyAwareRoutingMetadata(run, taskCard, policy, decision) {
    const isRoutingTargetRole = (role) => role === 'planner' || role === 'explorer' || role === 'code specialist' || role === 'documenter' || role === 'verifier';
    const normalizedDecision = normalizeOrchestratorDecision(decision);
    const { recommendedCategory, recommendedSkills } = deriveOmORecommendations({
        run,
        taskCard,
        decision: normalizedDecision,
    });
    const routeTargetRole = normalizedDecision.next_step === 'execute_task'
        ? isRoutingTargetRole(taskCard.assigned_role)
            ? taskCard.assigned_role
            : isRoutingTargetRole(taskCard.owner_role)
                ? taskCard.owner_role
                : 'code specialist'
        : normalizedDecision.next_step === 'verify_task'
            ? 'verifier'
            : null;
    const routeTargetStep = normalizedDecision.next_step === 'execute_task' || normalizedDecision.next_step === 'verify_task'
        ? normalizedDecision.next_step
        : null;
    const defaultRouteTargetRosterName = routeTargetRole === 'planner'
        ? 'tactician'
        : routeTargetRole === 'explorer'
            ? 'scout'
            : routeTargetRole === 'code specialist'
                ? 'raider'
                : routeTargetRole === 'documenter'
                    ? 'scribe'
                    : routeTargetRole === 'verifier'
                        ? 'arbiter'
                        : null;
    const routeTargetRosterName = routeTargetRole === null
        ? null
        : taskCard.assigned_agent_id ?? defaultRouteTargetRosterName;
    const routeSelection = getOrchestratorRouteSelection(normalizedDecision);
    const budgetProfile = deriveRoutingBudgetProfile({
        taskCard,
        decision: normalizedDecision,
    });
    return {
        routing_summary: buildPolicyAwareRoutingSummary({
            run,
            taskCard,
            policy,
            decision: normalizedDecision,
            routeTargetRole,
            routeTargetRosterName,
            routeTargetStep,
            recommendedCategory,
            recommendedSkills,
            workloadClass: budgetProfile.workloadClass,
            pathWeight: budgetProfile.pathWeight,
            executionPath: budgetProfile.executionPath,
            modelTierBudget: budgetProfile.modelTierBudget,
            reasoningEffortBudget: budgetProfile.reasoningEffortBudget,
            reviewRequirement: budgetProfile.reviewRequirement,
            budgetReason: budgetProfile.budgetReason,
        }),
        routing_trace: {
            specialist_routing_mode: policy.specialist_routing.mode,
            route_preference: policy.specialist_routing.route_preference,
            parallelism_mode: policy.parallelism.mode,
            route_target_role: routeTargetRole,
            route_target_roster_name: routeTargetRosterName,
            route_target_step: routeTargetStep,
            selected_route: routeSelection.route_id,
            selected_route_reason: routeSelection.reason,
            recommended_category: recommendedCategory,
            recommended_skills: recommendedSkills,
            workload_class: budgetProfile.workloadClass,
            path_weight: budgetProfile.pathWeight,
            execution_path: budgetProfile.executionPath,
            model_tier_budget: budgetProfile.modelTierBudget,
            reasoning_effort_budget: budgetProfile.reasoningEffortBudget,
            review_requirement: budgetProfile.reviewRequirement,
            budget_reason: budgetProfile.budgetReason,
            advisory_only: routeSelection.route_id === 'explicit_fallback',
            execution_unchanged: routeSelection.route_id === 'explicit_fallback',
        },
    };
}
function derivePolicyAwareResearchMetadata(policy, decision) {
    const researchTargetStep = derivePolicyAwareResearchTargetStep(policy, decision);
    return {
        research_summary: buildPolicyAwareResearchSummary({
            policy,
            decision,
            researchTargetStep,
        }),
        research_trace: {
            research_mode: policy.autonomous_research.mode,
            research_target_step: researchTargetStep,
            advisory_only: true,
            execution_unchanged: true,
            review_authority_unchanged: true,
        },
    };
}
function derivePolicyAwareMutationGuardrailsMetadata(policy, decision) {
    return {
        mutation_guardrails_summary: buildPolicyAwareMutationGuardrailsSummary({
            policy,
            decision,
        }),
        mutation_guardrails_trace: {
            git_guardrail: {
                mode: policy.git_mutation.mode,
                operator_only: true,
                execution_unchanged: true,
                delegation_unchanged: true,
            },
            pr_guardrail: {
                mode: policy.pr_mutation.mode,
                operator_only: true,
                execution_unchanged: true,
                delegation_unchanged: true,
            },
        },
    };
}
function derivePolicyAwareReviewMetadata(run, taskCard, policy, decision, taskDelegations = []) {
    const reviewPolicy = getEffectiveReviewPolicy(policy);
    const remainingReviewPasses = getRemainingReviewPasses(taskCard, reviewPolicy);
    const reviewOutcome = derivePolicyAwareReviewOutcome(taskCard, decision);
    const { reviewerCount, reviewerSwarmState } = deriveReviewerSwarmState({
        run,
        taskCard,
        decision,
        taskDelegations,
    });
    return {
        review_summary: buildPolicyAwareReviewSummary({
            taskCard,
            decision,
            remainingReviewPasses,
            reviewOutcome,
            reviewPolicy,
            reviewerCount,
            reviewerSwarmState,
        }),
        review_trace: {
            review_mode: reviewPolicy.mode,
            max_review_passes: reviewPolicy.max_review_passes,
            max_active_reviewers: reviewPolicy.max_active_reviewers,
            review_pass_count: taskCard.review_pass_count,
            review_round: taskCard.review_pass_count,
            remaining_review_passes: remainingReviewPasses,
            review_outcome: reviewOutcome,
            reviewer_count: reviewerCount,
            reviewer_swarm_state: reviewerSwarmState,
            review_path: READ_ONLY_ORACLE_REVIEW_PATH,
            explicit_operator_control: true,
            bounded_recheck_available: remainingReviewPasses > 0,
        },
    };
}
function classifyContinueStep(decisionOrNextStep) {
    const nextStep = typeof decisionOrNextStep === 'string' ? decisionOrNextStep : decisionOrNextStep.next_step;
    const canAdvance = typeof decisionOrNextStep === 'string' ? false : decisionOrNextStep.can_advance;
    switch (nextStep) {
        case 'execute_task':
            return {
                command: 'advance',
                stopReason: null,
            };
        case 'verify_task':
            return {
                command: 'verify',
                stopReason: null,
            };
        case 'await_fan_in':
            return canAdvance
                ? {
                    command: 'advance',
                    stopReason: null,
                }
                : {
                    command: null,
                    stopReason: 'await_fan_in',
                };
        case 'await_verification':
        case 'await_repair_decision':
        case 'await_operator':
        case 'halt_completed':
        case 'halt_failed':
        case 'halt_cancelled':
            return {
                command: null,
                stopReason: nextStep,
            };
    }
}
function getAllowedExplicitCommandsForDecision(decision) {
    switch (decision.next_step) {
        case 'execute_task':
            return ['advance'];
        case 'verify_task':
            return ['verify'];
        case 'await_fan_in':
            return decision.can_advance ? ['advance'] : [];
        case 'await_verification':
            return ['resolve'];
        case 'await_repair_decision':
            return ['retry', 'replan'];
        case 'await_operator':
        case 'halt_completed':
        case 'halt_failed':
        case 'halt_cancelled':
            return [];
    }
}
function decideOrchestratorNextStep(run, taskCard, options = {}) {
    const effectivePolicy = options.orchestrationPolicy ?? {
        specialist_routing: {
            mode: 'advisory_only',
            route_preference: 'none',
        },
        parallelism: {
            mode: 'single_task_bounded_fan_out',
            max_active_tasks: 1,
            max_active_workers: constants_1.FOREMAN_ACTIVE_TASK_MAX_WORKERS,
        },
        review: DEFAULT_EXPLICIT_REVIEW_POLICY,
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
    if (run.status === 'completed' || taskCard.status === 'completed') {
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts: options.activeTaskDelegationCounts,
            decision: {
                next_step: 'halt_completed',
                can_advance: false,
                summary: 'The run is completed. No further automatic action is available in the current harness boundary.',
            },
        });
    }
    if (run.status === 'cancelled' || taskCard.status === 'cancelled') {
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts: options.activeTaskDelegationCounts,
            decision: {
                next_step: 'halt_cancelled',
                can_advance: false,
                summary: 'The run is cancelled. No further automatic action is available in the current harness boundary.',
            },
        });
    }
    if (run.status === 'failed' || taskCard.status === 'failed') {
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts: options.activeTaskDelegationCounts,
            decision: {
                next_step: 'halt_failed',
                can_advance: false,
                summary: 'The run has failed. Review the latest failure before deciding on a manual next step.',
            },
        });
    }
    if ((run.status === 'blocked' || taskCard.status === 'blocked') &&
        run.stage === 'verification' &&
        (taskCard.verification_state === 'needs_work' || taskCard.verification_state === 'blocked')) {
        const reviewPolicy = getEffectiveReviewPolicy(options.orchestrationPolicy);
        const remainingReviewPasses = getRemainingReviewPasses(taskCard, reviewPolicy);
        if (remainingReviewPasses === 0) {
            return withDerivedRouteSelection({
                run,
                taskCard,
                policy: effectivePolicy,
                activeTaskDelegationCounts: options.activeTaskDelegationCounts,
                decision: {
                    next_step: 'await_verification',
                    can_advance: false,
                    summary: 'Verification blocked this task after the bounded explicit review budget was exhausted. The workflow is now on manual hold and awaits an explicit resolve decision before any further action.',
                },
            });
        }
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts: options.activeTaskDelegationCounts,
            decision: {
                next_step: 'await_repair_decision',
                can_advance: false,
                summary: 'Verification blocked this task. Choose an explicit repair path by retrying the same task or replanning from the blocked context.',
            },
        });
    }
    if (run.status === 'blocked' || taskCard.status === 'blocked') {
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts: options.activeTaskDelegationCounts,
            decision: {
                next_step: 'await_operator',
                can_advance: false,
                summary: 'The run is blocked and awaits operator or manual workflow action in the current harness boundary.',
            },
        });
    }
    const activeTaskDelegationCounts = options.activeTaskDelegationCounts;
    const isOrchestratorExecutionReadyState = run.status === 'active' &&
        run.stage === 'execution' &&
        run.active_role === 'orchestrator' &&
        taskCard.status === 'active' &&
        taskCard.owner_role === 'orchestrator';
    if (isOrchestratorExecutionReadyState) {
        if (activeTaskDelegationCounts && activeTaskDelegationCounts.total > activeTaskDelegationCounts.queued) {
            return withDerivedRouteSelection({
                run,
                taskCard,
                policy: effectivePolicy,
                activeTaskDelegationCounts,
                decision: createAwaitFanInDecision(taskCard, activeTaskDelegationCounts, 'execution'),
            });
        }
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts,
            decision: {
                next_step: 'execute_task',
                can_advance: true,
                summary: 'The orchestrator can advance this run by handing the active task to the assigned specialist and executing it through Codex.',
            },
        });
    }
    const isExecutionOwnerState = run.status === 'active' &&
        run.stage === 'execution' &&
        isExecutionOwnerRole(run.active_role) &&
        taskCard.status === 'active' &&
        isExecutionOwnerRole(taskCard.owner_role);
    if (isExecutionOwnerState) {
        if (activeTaskDelegationCounts && activeTaskDelegationCounts.total > activeTaskDelegationCounts.queued) {
            return withDerivedRouteSelection({
                run,
                taskCard,
                policy: effectivePolicy,
                activeTaskDelegationCounts,
                decision: createAwaitFanInDecision(taskCard, activeTaskDelegationCounts, 'execution'),
            });
        }
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts,
            decision: {
                next_step: 'execute_task',
                can_advance: true,
                summary: 'The orchestrator can advance this run by executing the active task through Codex.',
            },
        });
    }
    if (run.status === 'active' &&
        run.stage === 'verification' &&
        run.active_role === 'verifier' &&
        taskCard.status === 'active' &&
        taskCard.owner_role === 'verifier' &&
        taskCard.verification_state === 'pending') {
        if (activeTaskDelegationCounts &&
            activeTaskDelegationCounts.total > 0 &&
            (options.verificationRequestAvailable || activeTaskDelegationCounts.active > 0)) {
            return withDerivedRouteSelection({
                run,
                taskCard,
                policy: effectivePolicy,
                activeTaskDelegationCounts,
                decision: createAwaitFanInDecision(taskCard, activeTaskDelegationCounts, 'verification'),
            });
        }
        if (options.verificationRequestAvailable) {
            return withDerivedRouteSelection({
                run,
                taskCard,
                policy: effectivePolicy,
                activeTaskDelegationCounts,
                decision: {
                    next_step: 'verify_task',
                    can_advance: true,
                    summary: 'Execution has finished. Verification input is available through the explicit verifier automation path.',
                },
            });
        }
        return withDerivedRouteSelection({
            run,
            taskCard,
            policy: effectivePolicy,
            activeTaskDelegationCounts,
            decision: {
                next_step: 'await_verification',
                can_advance: false,
                summary: 'Execution has finished. Verification is still pending and awaits the explicit manual fallback path.',
            },
        });
    }
    return withDerivedRouteSelection({
        run,
        taskCard,
        policy: effectivePolicy,
        activeTaskDelegationCounts: options.activeTaskDelegationCounts,
        decision: {
            next_step: 'await_operator',
            can_advance: false,
            summary: 'The persisted run state does not match a supported automatic next step for the current MVP.',
        },
    });
}
//# sourceMappingURL=orchestrator.js.map