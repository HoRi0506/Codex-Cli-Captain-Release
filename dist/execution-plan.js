"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveForemanRequestTraits = deriveForemanRequestTraits;
exports.composeForemanExecutionPlan = composeForemanExecutionPlan;
exports.isForemanExecutionPlan = isForemanExecutionPlan;
exports.getFirstSpecialistAgentFromExecutionPlan = getFirstSpecialistAgentFromExecutionPlan;
const request_shape_1 = require("./request-shape");
const DOC_HINTS = ['readme', 'docs', 'documentation', 'release-work', 'release notes', '문서', '정리', '작성'];
const CODE_FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml', '.toml', '.css', '.html', '.py', '.go', '.rs', '.java', '.swift'];
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
const PARALLEL_HINTS = ['across', 'parallel', 'fan-out', 'fan out', '병렬', '여러', '다수'];
const PHASE_IDS = [
    'plan',
    'inspect',
    'gate',
    'ownership_check',
    'document',
    'mutate',
    'verify',
    'fan_in',
    'synthesize',
];
const OWNER_AGENTS = ['captain', 'tactician', 'scout', 'scribe', 'raider', 'arbiter', 'sentinel'];
const OUTPUT_KINDS = ['answer', 'docs', 'code', 'mixed'];
const MUTATION_MODES = ['none', 'conditional', 'required'];
const RISK_LEVELS = ['low', 'medium', 'high'];
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function includesAnyKeyword(normalizedRequest, keywords) {
    return keywords.some((keyword) => normalizedRequest.includes(keyword));
}
function extractFilePathMentions(request) {
    const matches = request.match(/\b[\w./-]+\.[A-Za-z0-9]+\b/g);
    return matches ? Array.from(new Set(matches)) : [];
}
function mentionsCodeMutationTarget(filePathMentions) {
    return filePathMentions.some((filePath) => {
        const normalizedFilePath = filePath.toLowerCase();
        return CODE_FILE_EXTENSIONS.some((extension) => normalizedFilePath.endsWith(extension)) && !normalizedFilePath.endsWith('.md');
    });
}
function inferOutputKind(normalizedRequest, requestShape, filePathMentions) {
    const hasDocHints = includesAnyKeyword(normalizedRequest, DOC_HINTS);
    const hasCodeTarget = mentionsCodeMutationTarget(filePathMentions);
    if (requestShape === 'mutation' && hasDocHints && hasCodeTarget) {
        return 'mixed';
    }
    if (hasDocHints) {
        return 'docs';
    }
    if (requestShape === 'mutation') {
        return 'code';
    }
    return 'answer';
}
function inferRisk(input) {
    if (input.parallel || input.filePathCount >= 4) {
        return 'high';
    }
    if (input.mutationIntent === 'explicit_or_strong' || input.requestShape === 'verification') {
        return 'medium';
    }
    return 'low';
}
function createPhase(phase) {
    switch (phase) {
        case 'plan':
            return {
                phase,
                owner_agent: 'tactician',
                requires_codex_exec: true,
                skill_contract: 'foreman-planner',
                preconditions: ['request is ambiguous, broad, multi-step, or high risk'],
                handoff_inputs: ['operator request', 'request traits', 'known blockers'],
            };
        case 'inspect':
            return {
                phase,
                owner_agent: 'scout',
                requires_codex_exec: true,
                skill_contract: 'foreman-explorer',
                preconditions: ['evidence is needed before answer, mutation, or verification'],
                handoff_inputs: ['operator request', 'bounded scope', 'read-only constraints'],
            };
        case 'ownership_check':
            return {
                phase,
                owner_agent: 'sentinel',
                requires_codex_exec: true,
                skill_contract: 'foreman-sentinel',
                preconditions: ['ownership, drift, fallback, or execution truth must be classified'],
                handoff_inputs: ['run state', 'proof state', 'role/model policy'],
            };
        case 'gate':
            return {
                phase,
                owner_agent: 'captain',
                requires_codex_exec: false,
                skill_contract: 'foreman-phase-gate',
                preconditions: ['conditional mutation requires evidence before implementation'],
                handoff_inputs: ['scout findings', 'mismatch candidates', 'acceptance checks'],
            };
        case 'document':
            return {
                phase,
                owner_agent: 'scribe',
                requires_codex_exec: true,
                skill_contract: 'foreman-documenter',
                preconditions: ['documentation or release-note authoring is required'],
                handoff_inputs: ['documentation scope', 'evidence checkpoint', 'acceptance checks'],
            };
        case 'mutate':
            return {
                phase,
                owner_agent: 'raider',
                requires_codex_exec: true,
                skill_contract: 'foreman-code-specialist',
                preconditions: ['mutation is required or gate found a concrete mismatch'],
                handoff_inputs: ['mutation scope', 'evidence checkpoint', 'acceptance checks'],
            };
        case 'verify':
            return {
                phase,
                owner_agent: 'arbiter',
                requires_codex_exec: true,
                skill_contract: 'foreman-verifier',
                preconditions: ['acceptance, regression, or repair judgment is required'],
                handoff_inputs: ['evidence checkpoint', 'worker result envelopes', 'command outcomes'],
            };
        case 'fan_in':
            return {
                phase,
                owner_agent: 'captain',
                requires_codex_exec: false,
                skill_contract: 'foreman-fan-in',
                preconditions: ['parallel phase workers must be collapsed before continuation'],
                handoff_inputs: ['worker results', 'evidence checkpoints', 'freshness state'],
            };
        case 'synthesize':
            return {
                phase,
                owner_agent: 'captain',
                requires_codex_exec: false,
                skill_contract: 'foreman-captain-synthesis',
                preconditions: ['phase chain reached terminal answer boundary'],
                handoff_inputs: ['execution plan', 'proof state', 'verification outcome'],
            };
    }
}
function deriveForemanRequestTraits(input) {
    const normalizedRequest = input.request.trim().toLowerCase();
    const filePathMentions = extractFilePathMentions(input.request);
    const filePathCount = filePathMentions.length;
    const parallel = includesAnyKeyword(normalizedRequest, PARALLEL_HINTS) || filePathCount >= 4;
    const investigationFirstMutation = input.mutationIntent === 'explicit_or_strong' && input.recommendedTaskKind === 'explore';
    const conditionalMutation = input.mutationIntent === 'explicit_or_strong' &&
        ((0, request_shape_1.looksLikeConditionalMutationRequest)(input.request) || investigationFirstMutation);
    const readOnly = (0, request_shape_1.isExplicitlyReadOnlyRequest)(input.request);
    const outputKind = inferOutputKind(normalizedRequest, input.requestShape, filePathMentions);
    const needsOwnershipCheck = includesAnyKeyword(normalizedRequest, DRIFT_HINTS);
    const needsMutation = input.mutationIntent === 'explicit_or_strong' && !readOnly;
    const needsPlanning = input.requestShape === 'planning' || parallel;
    const needsReview = input.requestShape === 'verification' || needsMutation;
    const needsInvestigation = input.requestShape === 'diagnosis' ||
        input.requestShape === 'lookup' ||
        input.requestShape === 'survey' ||
        input.requestShape === 'synthesis' ||
        input.requestShape === 'existence_check' ||
        investigationFirstMutation ||
        conditionalMutation ||
        outputKind === 'docs';
    return {
        needs_planning: needsPlanning,
        needs_investigation: needsInvestigation && !needsOwnershipCheck,
        needs_mutation: needsMutation,
        needs_review: needsReview,
        needs_ownership_check: needsOwnershipCheck,
        output_kind: outputKind,
        mutation_mode: needsMutation ? (conditionalMutation ? 'conditional' : 'required') : 'none',
        parallel,
        risk: inferRisk({
            requestShape: input.requestShape,
            mutationIntent: input.mutationIntent,
            filePathCount,
            parallel,
        }),
    };
}
function appendUniquePhase(phases, phase) {
    if (!phases.includes(phase)) {
        phases.push(phase);
    }
}
function composeForemanExecutionPlan(input) {
    const requestTraits = deriveForemanRequestTraits(input);
    const phaseIds = [];
    if (requestTraits.needs_planning) {
        appendUniquePhase(phaseIds, 'plan');
    }
    if (requestTraits.needs_ownership_check) {
        appendUniquePhase(phaseIds, 'ownership_check');
    }
    else if (requestTraits.needs_investigation) {
        appendUniquePhase(phaseIds, 'inspect');
    }
    if (requestTraits.mutation_mode === 'conditional') {
        appendUniquePhase(phaseIds, 'gate');
    }
    if (requestTraits.needs_mutation) {
        if (requestTraits.output_kind === 'docs') {
            appendUniquePhase(phaseIds, 'document');
        }
        else if (requestTraits.output_kind === 'mixed') {
            appendUniquePhase(phaseIds, 'mutate');
            appendUniquePhase(phaseIds, 'document');
        }
        else {
            appendUniquePhase(phaseIds, 'mutate');
        }
    }
    if (requestTraits.parallel && phaseIds.some((phase) => phase === 'inspect' || phase === 'document' || phase === 'mutate')) {
        appendUniquePhase(phaseIds, 'fan_in');
    }
    if (requestTraits.needs_review) {
        appendUniquePhase(phaseIds, 'verify');
    }
    appendUniquePhase(phaseIds, 'synthesize');
    const phases = phaseIds.map(createPhase);
    const modifiers = {
        output_kind: requestTraits.output_kind,
        mutation_mode: requestTraits.mutation_mode,
        review_required: requestTraits.needs_review,
        evidence_required: requestTraits.needs_investigation || requestTraits.needs_ownership_check,
        ownership_check: requestTraits.needs_ownership_check,
        parallel: requestTraits.parallel,
        fanout_cap: requestTraits.parallel ? 2 : 1,
    };
    return {
        version: 1,
        composition_owner: 'host_captain',
        foreman_mcp_role: 'capability_catalog_state_and_worker_launch',
        request_traits: requestTraits,
        phases,
        modifiers,
        current_phase: phases[0]?.phase ?? 'synthesize',
        next_phase: phases[1]?.phase ?? null,
        summary: `Host captain composes phases ${phaseIds.join(' -> ')} from request traits; Foreman MCP persists state and launches specialist codex exec workers.`,
    };
}
function isStringArray(value) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}
function isExecutionPlanPhase(value) {
    return (isRecord(value) &&
        PHASE_IDS.includes(value.phase) &&
        OWNER_AGENTS.includes(value.owner_agent) &&
        typeof value.requires_codex_exec === 'boolean' &&
        typeof value.skill_contract === 'string' &&
        value.skill_contract.trim().length > 0 &&
        isStringArray(value.preconditions) &&
        isStringArray(value.handoff_inputs));
}
function isRequestTraits(value) {
    return (isRecord(value) &&
        typeof value.needs_planning === 'boolean' &&
        typeof value.needs_investigation === 'boolean' &&
        typeof value.needs_mutation === 'boolean' &&
        typeof value.needs_review === 'boolean' &&
        typeof value.needs_ownership_check === 'boolean' &&
        OUTPUT_KINDS.includes(value.output_kind) &&
        MUTATION_MODES.includes(value.mutation_mode) &&
        typeof value.parallel === 'boolean' &&
        RISK_LEVELS.includes(value.risk));
}
function isExecutionPlanModifiers(value) {
    return (isRecord(value) &&
        OUTPUT_KINDS.includes(value.output_kind) &&
        MUTATION_MODES.includes(value.mutation_mode) &&
        typeof value.review_required === 'boolean' &&
        typeof value.evidence_required === 'boolean' &&
        typeof value.ownership_check === 'boolean' &&
        typeof value.parallel === 'boolean' &&
        typeof value.fanout_cap === 'number' &&
        Number.isInteger(value.fanout_cap) &&
        value.fanout_cap >= 1);
}
function isForemanExecutionPlan(value) {
    return (isRecord(value) &&
        value.version === 1 &&
        value.composition_owner === 'host_captain' &&
        value.foreman_mcp_role === 'capability_catalog_state_and_worker_launch' &&
        isRequestTraits(value.request_traits) &&
        Array.isArray(value.phases) &&
        value.phases.length > 0 &&
        value.phases.every(isExecutionPlanPhase) &&
        isExecutionPlanModifiers(value.modifiers) &&
        PHASE_IDS.includes(value.current_phase) &&
        (value.next_phase === null || PHASE_IDS.includes(value.next_phase)) &&
        typeof value.summary === 'string' &&
        value.summary.trim().length > 0);
}
function getFirstSpecialistAgentFromExecutionPlan(plan) {
    const firstSpecialist = plan.phases.find((phase) => phase.requires_codex_exec &&
        (phase.owner_agent === 'tactician' ||
            phase.owner_agent === 'scout' ||
            phase.owner_agent === 'scribe' ||
            phase.owner_agent === 'raider' ||
            phase.owner_agent === 'arbiter'));
    return firstSpecialist?.owner_agent === 'tactician' ||
        firstSpecialist?.owner_agent === 'scout' ||
        firstSpecialist?.owner_agent === 'scribe' ||
        firstSpecialist?.owner_agent === 'raider' ||
        firstSpecialist?.owner_agent === 'arbiter'
        ? firstSpecialist.owner_agent
        : 'captain';
}
//# sourceMappingURL=execution-plan.js.map