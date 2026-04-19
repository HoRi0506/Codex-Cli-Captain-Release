"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkflowRouteContract = getWorkflowRouteContract;
exports.getWorkflowRouteEntryTaskKind = getWorkflowRouteEntryTaskKind;
exports.getWorkflowRouteFirstSpecialistStep = getWorkflowRouteFirstSpecialistStep;
exports.getWorkflowRouteNextStep = getWorkflowRouteNextStep;
exports.getWorkflowPublicLabel = getWorkflowPublicLabel;
exports.doesWorkflowRouteRequireDelegatedEntryLaunch = doesWorkflowRouteRequireDelegatedEntryLaunch;
exports.deriveWorkflowVariantSelection = deriveWorkflowVariantSelection;
const request_shape_1 = require("./request-shape");
const workflow_route_catalog_1 = require("./workflow-route-catalog");
const DOC_HINTS = ['readme', 'docs', 'documentation', 'release-work', 'release notes', '문서', '정리', '작성'];
const DRIFT_HINTS = [
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
    '소유',
    '드리프트',
    '실행 진실',
];
const DIAGNOSIS_HINTS = ['why', 'cause', 'root cause', 'failure', 'error', 'bug', 'issue', 'problem', '왜', '원인', '오류', '문제'];
const PARALLEL_HINTS = ['across', 'parallel', 'fan-out', 'fan out', '병렬', '여러', '다수'];
const DOC_FIX_HINTS = [
    'fix',
    'repair',
    'resolve',
    'patch',
    'regression',
    'gap',
    'contract gap',
    'route gap',
    'route contract',
    'harden',
    'correct',
    '수정',
    '해결',
    '보완',
    '갭',
    '격차',
];
function includesAnyKeyword(normalizedRequest, keywords) {
    return keywords.some((keyword) => normalizedRequest.includes(keyword));
}
function extractFilePathMentions(request) {
    const matches = request.match(/\b[\w./-]+\.[A-Za-z0-9]+\b/g);
    if (!matches) {
        return [];
    }
    return Array.from(new Set(matches));
}
function createSelection(input) {
    return {
        workflow_variant: input.workflowVariant,
        workflow_skill_id: input.workflowSkillId,
        workflow_agent_route: [...input.workflowAgentRoute],
        workflow_summary: input.workflowSummary,
        operator_visible: false,
    };
}
function isDocShapedMutation(requestShape, normalizedRequest) {
    return requestShape === 'mutation' && includesAnyKeyword(normalizedRequest, DOC_HINTS);
}
function mapRoleToInternalRouteStep(role) {
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
            return null;
    }
}
function getWorkflowRouteContract(selection) {
    if (!selection) {
        return null;
    }
    const baseContract = workflow_route_catalog_1.WORKFLOW_ROUTE_CONTRACTS.find((contract) => contract.workflow_variant === selection.workflow_variant && contract.workflow_skill_id === selection.workflow_skill_id) ?? null;
    if (!baseContract) {
        return null;
    }
    return {
        ...baseContract,
        workflow_agent_route: selection.workflow_agent_route && selection.workflow_agent_route.length > 0
            ? [...selection.workflow_agent_route]
            : [...baseContract.workflow_agent_route],
    };
}
function getWorkflowRouteEntryTaskKind(selection, fallbackTaskKind) {
    const contract = getWorkflowRouteContract(selection);
    if (!contract) {
        return fallbackTaskKind;
    }
    if (contract.workflow_skill_id === 'captain_parallel_fanout') {
        return fallbackTaskKind;
    }
    if (contract.entry_task_kind === 'plan' && fallbackTaskKind !== 'plan') {
        return fallbackTaskKind;
    }
    return contract.entry_task_kind ?? fallbackTaskKind;
}
function getWorkflowRouteFirstSpecialistStep(selection) {
    const contract = getWorkflowRouteContract(selection);
    if (!contract) {
        return null;
    }
    return contract.workflow_agent_route.find((step) => step !== 'captain') ?? null;
}
function getWorkflowRouteNextStep(selection, currentStep) {
    const contract = getWorkflowRouteContract(selection);
    if (!contract || !currentStep) {
        return null;
    }
    const currentIndex = contract.workflow_agent_route.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= contract.workflow_agent_route.length - 1) {
        return null;
    }
    return contract.workflow_agent_route[currentIndex + 1] ?? null;
}
function getWorkflowPublicLabel(selection) {
    if (!selection || selection.workflow_variant === 'none' || selection.workflow_skill_id === 'none') {
        return 'none';
    }
    switch (selection.workflow_variant) {
        case 'investigate_only':
            return 'bounded_investigation';
        case 'investigate_then_document':
            return 'evidence_then_document';
        case 'diagnose_then_fix':
            return 'diagnose_then_fix';
        case 'fix_only':
            return 'direct_fix_with_review';
        case 'plan_then_implement':
            return 'plan_then_implement';
        case 'implement_then_review':
            return 'implementation_with_review';
        case 'verify_only':
            return 'verification_only';
        case 'ownership_drift_check':
            return 'ownership_or_drift_check';
        case 'parallel_fanout':
            return 'bounded_parallel_work';
    }
}
function doesWorkflowRouteRequireDelegatedEntryLaunch(input) {
    const contract = getWorkflowRouteContract(input.selection);
    if (!contract) {
        return false;
    }
    const firstStep = getWorkflowRouteFirstSpecialistStep(input.selection);
    const assignedStep = mapRoleToInternalRouteStep(input.assignedRole);
    const entryTaskKind = getWorkflowRouteEntryTaskKind(input.selection, input.taskKind);
    return (firstStep !== null &&
        assignedStep === firstStep &&
        entryTaskKind === input.taskKind &&
        input.ownerRole !== 'verifier');
}
function deriveWorkflowVariantSelection(input) {
    const normalizedRequest = input.request.trim().toLowerCase();
    const filePathMentions = extractFilePathMentions(input.request);
    const hasDriftHints = includesAnyKeyword(normalizedRequest, DRIFT_HINTS);
    const hasDiagnosisHints = includesAnyKeyword(normalizedRequest, DIAGNOSIS_HINTS);
    const hasParallelHints = includesAnyKeyword(normalizedRequest, PARALLEL_HINTS) || filePathMentions.length >= 4;
    const docShapedMutation = isDocShapedMutation(input.recommendation.request_shape, normalizedRequest);
    const hasDocFixHints = includesAnyKeyword(normalizedRequest, DOC_FIX_HINTS);
    const hasConditionalMutationGate = (0, request_shape_1.looksLikeConditionalMutationRequest)(input.request);
    if (hasDriftHints) {
        return createSelection({
            workflowVariant: 'ownership_drift_check',
            workflowSkillId: 'captain_ownership_drift_check',
            workflowAgentRoute: ['captain', 'scout', 'arbiter', 'captain'],
            workflowSummary: 'Captain should keep this request on the hidden ownership/drift-check route so bounded evidence and review truth come back before any operator-facing conclusion.',
        });
    }
    if (input.recommendation.request_shape === 'verification') {
        return createSelection({
            workflowVariant: 'verify_only',
            workflowSkillId: 'captain_verify_only',
            workflowAgentRoute: ['captain', 'arbiter', 'captain'],
            workflowSummary: 'Captain should keep this request on the hidden verify-only route because the next bounded move is acceptance or regression judgment rather than mutation.',
        });
    }
    if (input.recommendation.request_shape === 'planning') {
        return createSelection({
            workflowVariant: hasParallelHints ? 'parallel_fanout' : 'plan_then_implement',
            workflowSkillId: hasParallelHints ? 'captain_parallel_fanout' : 'captain_plan_then_implement',
            workflowAgentRoute: hasParallelHints
                ? ['captain', 'tactician', 'scout', 'raider', 'arbiter', 'captain']
                : ['captain', 'tactician', 'raider', 'arbiter', 'captain'],
            workflowSummary: hasParallelHints
                ? 'Captain should use the hidden bounded parallel fan-out route so planning can shape multiple bounded slices before implementation and review.'
                : 'Captain should use the hidden plan-then-implement route so tactician scopes the next bounded move before implementation and review.',
        });
    }
    if (input.recommendation.mutation_intent === 'explicit_or_strong') {
        if (docShapedMutation && (hasDiagnosisHints || hasDocFixHints)) {
            return createSelection({
                workflowVariant: 'diagnose_then_fix',
                workflowSkillId: 'captain_diagnose_then_fix',
                workflowAgentRoute: ['captain', 'scout', 'raider', 'arbiter', 'captain'],
                workflowSummary: hasConditionalMutationGate
                    ? 'Captain should use the hidden diagnose-then-fix route as a compound skeleton: scout gathers evidence first, raider mutates only if the evidence proves a mismatch, and arbiter reviews the final result.'
                    : 'Captain should use the hidden diagnose-then-fix route so bounded evidence, implementation, and review intent remain preserved for this document-and-fix request.',
            });
        }
        if (hasDiagnosisHints) {
            return createSelection({
                workflowVariant: 'diagnose_then_fix',
                workflowSkillId: 'captain_diagnose_then_fix',
                workflowAgentRoute: ['captain', 'scout', 'raider', 'arbiter', 'captain'],
                workflowSummary: hasConditionalMutationGate
                    ? 'Captain should use the hidden diagnose-then-fix route as a compound skeleton: scout gathers evidence first, raider mutates only if the evidence proves a concrete repair is needed, and arbiter reviews.'
                    : 'Captain should use the hidden diagnose-then-fix route so scout gathers bounded evidence before raider mutates and arbiter reviews.',
            });
        }
        if (docShapedMutation) {
            return createSelection({
                workflowVariant: 'investigate_then_document',
                workflowSkillId: 'captain_investigate_then_document',
                workflowAgentRoute: ['captain', 'scout', 'raider', 'captain'],
                workflowSummary: 'Captain should use the hidden investigate-then-document route because the request needs bounded repository evidence followed by document authoring.',
            });
        }
        if (filePathMentions.length <= 1) {
            return createSelection({
                workflowVariant: 'fix_only',
                workflowSkillId: 'captain_fix_only',
                workflowAgentRoute: ['captain', 'raider', 'arbiter', 'captain'],
                workflowSummary: 'Captain should use the hidden fix-only route because the request already looks scoped enough for direct implementation followed by review.',
            });
        }
        return createSelection({
            workflowVariant: 'implement_then_review',
            workflowSkillId: 'captain_implement_then_review',
            workflowAgentRoute: ['captain', 'raider', 'arbiter', 'captain'],
            workflowSummary: 'Captain should use the hidden implement-then-review route because explicit mutation intent still needs bounded implementation and acceptance review.',
        });
    }
    if (hasParallelHints && input.recommendation.recommended_task_kind === 'explore') {
        return createSelection({
            workflowVariant: 'parallel_fanout',
            workflowSkillId: 'captain_parallel_fanout',
            workflowAgentRoute: ['captain', 'scout', 'tactician', 'captain'],
            workflowSummary: 'Captain should use the hidden bounded parallel fan-out route so exploration can split into parallel evidence passes and one bounded synthesis handoff before the final answer.',
        });
    }
    return createSelection({
        workflowVariant: 'investigate_only',
        workflowSkillId: 'captain_investigate_only',
        workflowAgentRoute: ['captain', 'scout', 'captain'],
        workflowSummary: 'Captain should use the hidden investigate-only route because the request is read-heavy and should stay on bounded evidence gathering before synthesis.',
    });
}
//# sourceMappingURL=workflow-variants.js.map