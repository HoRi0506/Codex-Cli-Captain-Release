"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS = exports.SPECIALIST_ROLES = void 0;
exports.summarizeTaskOwnershipChain = summarizeTaskOwnershipChain;
exports.createTaskOwnershipChain = createTaskOwnershipChain;
exports.createOwnershipChainProvenanceHeader = createOwnershipChainProvenanceHeader;
exports.createTaskAssignmentFraming = createTaskAssignmentFraming;
exports.buildFramedTaskPrompt = buildFramedTaskPrompt;
exports.createTaskOwnershipGuard = createTaskOwnershipGuard;
exports.getSpecialistRolePlaybookContract = getSpecialistRolePlaybookContract;
exports.maybeGetSpecialistRolePlaybookContract = maybeGetSpecialistRolePlaybookContract;
exports.listSpecialistRolePlaybookContracts = listSpecialistRolePlaybookContracts;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
exports.SPECIALIST_ROLES = ['planner', 'explorer', 'code specialist', 'verifier'];
exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS = [
    'summary',
    'findings',
    'changed_files',
    'evidence_paths',
    'open_questions',
    'recommended_next_action',
    'acceptance_status',
];
function isCaptainOwnedReadOnlyFallbackAllowed(taskCard) {
    const modelTierIntent = taskCard.model_tier_intent ?? 'standard';
    if (taskCard.task_kind === 'review' || taskCard.assigned_role === 'verifier') {
        return false;
    }
    if (taskCard.task_kind === 'execution') {
        return taskCard.assigned_role === 'code specialist' && modelTierIntent === 'low_cost';
    }
    return taskCard.owner_role === 'orchestrator' && modelTierIntent === 'low_cost';
}
function pickLatestDelegation(delegations) {
    return delegations.slice().sort((left, right) => right.updated_at.localeCompare(left.updated_at)).at(0) ?? null;
}
function hasWorkerLaunchCheckpoint(delegation) {
    return (delegation.child_agent.status !== 'queued' ||
        delegation.worker_launch_evidence !== null ||
        delegation.worker_result !== null ||
        delegation.worker_lifecycle?.launch_requested_at !== null);
}
function describeOwnershipReviewer(reviewerAgentId, reviewerLinkState, reviewerCount) {
    if (reviewerAgentId === null) {
        return 'none';
    }
    const countPrefix = reviewerCount > 1 ? `${reviewerCount} reviewers; latest=` : '';
    if (reviewerLinkState === 'actual') {
        return `${countPrefix}${reviewerAgentId}`;
    }
    return `${countPrefix}${reviewerAgentId} (inferred)`;
}
function describeOwnershipObservation(input) {
    if (input.observedWorkerId !== null) {
        return input.observedWorkerId;
    }
    if (input.launchEvidence?.observation_status === 'observed') {
        return `${input.launchEvidence.observed_source ?? 'observed'}:${input.launchEvidence.observed_model ?? 'unknown'}`;
    }
    if (input.launchEvidence?.observation_status === 'unavailable') {
        return `missing(${input.launchEvidence.observation_unavailable_reason ?? 'unknown'})`;
    }
    return 'none';
}
function summarizeTaskOwnershipChain(chain) {
    const reviewerSummary = describeOwnershipReviewer(chain.reviewer_agent_id, chain.reviewer_link_state, chain.reviewer_count);
    if (chain.state === 'planned_only') {
        return `planned=${chain.assigned_agent_id ?? 'unassigned'} -> launch=not_started -> review=${reviewerSummary} -> ${chain.captain_agent_id} [awaiting_worker_launch]`;
    }
    if (chain.state === 'assigned_only') {
        return `assigned=${chain.assigned_agent_id ?? 'unassigned'} -> queued=${chain.worker_count} worker${chain.worker_count === 1 ? '' : 's'} -> launch=not_started -> review=${reviewerSummary} -> ${chain.captain_agent_id} [awaiting_worker_launch]`;
    }
    if (chain.state === 'captain_read_only_fallback') {
        return `planned=${chain.assigned_agent_id ?? 'unassigned'} -> captain read-only fallback (${chain.fallback_reason ?? 'allowed'}) -> review=${reviewerSummary} -> ${chain.captain_agent_id} [captain_read_only_fallback]`;
    }
    if (chain.execution_owner_mode === 'host_session_fallback') {
        return `assigned=${chain.assigned_agent_id ?? 'unassigned'} -> host_session fallback (${chain.fallback_reason ?? 'unknown'}) -> review=${reviewerSummary} -> ${chain.captain_agent_id} [downgraded:${chain.state}]`;
    }
    const launchedSummary = chain.worker_count > 1
        ? `${chain.worker_count} workers; latest=${chain.launched_worker_id ?? 'none'}`
        : chain.launched_worker_id ?? 'none';
    return `assigned=${chain.assigned_agent_id ?? 'unassigned'} -> launched=${launchedSummary} -> observed=${describeOwnershipObservation({
        observedWorkerId: chain.observed_worker_id,
        launchEvidence: {
            observation_status: chain.observed_evidence_state ?? 'not_started',
            observed_source: chain.observed_source,
            observed_model: chain.observed_model,
            observation_unavailable_reason: chain.fallback_reason,
        },
    })} -> review=${reviewerSummary} -> ${chain.captain_agent_id} [${chain.state}]`;
}
function createTaskOwnershipChain(input) {
    const taskLinkedDelegations = input.taskDelegations.filter((delegation) => delegation.task_card_id === input.taskCard.task_card_id);
    const workerDelegations = taskLinkedDelegations.filter((delegation) => delegation.child_agent.role !== 'verifier');
    const reviewerDelegations = taskLinkedDelegations.filter((delegation) => delegation.child_agent.role === 'verifier');
    const launchedWorkerDelegations = workerDelegations.filter((delegation) => hasWorkerLaunchCheckpoint(delegation));
    const latestWorkerDelegation = pickLatestDelegation(launchedWorkerDelegations);
    const latestReviewerDelegation = pickLatestDelegation(reviewerDelegations);
    const launchEvidence = latestWorkerDelegation?.worker_launch_evidence ?? input.taskCard.latest_model_launch ?? null;
    const workerObservedThreadIds = Array.from(new Set(workerDelegations
        .map((delegation) => delegation.worker_result?.thread_id ?? null)
        .filter((threadId) => typeof threadId === 'string' && threadId.length > 0)));
    const hostObservedThreadIds = Array.from(new Set(input.taskCard.thread_ids.filter((threadId) => typeof threadId === 'string' && threadId.length > 0)));
    const observedWorkerIds = [...workerObservedThreadIds, ...hostObservedThreadIds.filter((threadId) => !workerObservedThreadIds.includes(threadId))];
    const reviewerAgentIds = Array.from(new Set(reviewerDelegations
        .map((delegation) => delegation.child_agent.agent_id)
        .filter((agentId) => typeof agentId === 'string' && agentId.length > 0)));
    const stableAssignedAgentId = input.taskCard.owner_role === 'verifier' && input.taskCard.assigned_role !== 'verifier'
        ? (0, runtime_1.getAgentIdForRole)(input.taskCard.assigned_role) ?? input.taskCard.assigned_agent_id
        : input.taskCard.assigned_agent_id;
    const inferredReviewerAgentId = reviewerAgentIds.at(-1) ??
        ((input.taskCard.owner_role === 'verifier' ||
            input.taskCard.completed_by_agent_id === (0, runtime_1.getAgentIdForRole)('verifier') ||
            input.taskCard.verification_state !== 'pending')
            ? (0, runtime_1.getAgentIdForRole)('verifier')
            : null);
    const reviewerLinkState = reviewerAgentIds.length > 0 ? 'actual' : inferredReviewerAgentId !== null ? 'inferred' : 'missing';
    const executionOwnerMode = workerDelegations.length > 0 ? 'foreman_worker' : 'host_session_fallback';
    const hostSessionEvidenceVisible = input.taskCard.thread_ids.length > 0 || input.taskCard.latest_model_launch !== null;
    const readOnlyFallbackAllowed = isCaptainOwnedReadOnlyFallbackAllowed({
        owner_role: input.taskCard.owner_role,
        assigned_role: input.taskCard.assigned_role,
        task_kind: input.taskCard.task_kind ?? 'execution',
        model_tier_intent: input.taskCard.model_tier_intent ?? 'standard',
    });
    const fallbackReason = executionOwnerMode === 'foreman_worker'
        ? latestWorkerDelegation === null
            ? 'worker_queued'
            : launchEvidence?.observation_status === 'unavailable'
                ? launchEvidence.observation_unavailable_reason ?? 'observed_evidence_missing'
                : null
        : hostSessionEvidenceVisible
            ? readOnlyFallbackAllowed
                ? 'captain_read_only_fallback'
                : 'worker_launch_required'
            : stableAssignedAgentId !== null
                ? 'worker_not_launched'
                : 'missing_assignment';
    let state = 'missing';
    if (executionOwnerMode === 'host_session_fallback') {
        if (stableAssignedAgentId === null) {
            state = 'missing';
        }
        else if (hostSessionEvidenceVisible && readOnlyFallbackAllowed) {
            state = 'captain_read_only_fallback';
        }
        else if (hostSessionEvidenceVisible) {
            state = 'host_session_fallback';
        }
        else {
            state = 'planned_only';
        }
    }
    else if (reviewerLinkState === 'actual') {
        state = 'review_linked';
    }
    else if (observedWorkerIds.length > 0 || launchEvidence?.observation_status === 'observed') {
        state = 'observed';
    }
    else if (launchEvidence?.observation_status === 'unavailable') {
        state = 'partial';
    }
    else if (latestWorkerDelegation !== null) {
        state = 'launched';
    }
    else if (workerDelegations.length > 0) {
        state = 'assigned_only';
    }
    else if (stableAssignedAgentId !== null) {
        state = 'assigned_only';
    }
    const chain = {
        state,
        assigned_role: input.taskCard.assigned_role,
        assigned_agent_id: stableAssignedAgentId,
        selected_agent_id: stableAssignedAgentId,
        worker_count: workerDelegations.length,
        launched_worker_id: latestWorkerDelegation?.child_agent.agent_id ?? null,
        observed_worker_id: workerObservedThreadIds.at(-1) ?? hostObservedThreadIds.at(-1) ?? null,
        observed_evidence_state: launchEvidence?.observation_status ?? null,
        observed_model: launchEvidence?.observed_model ?? null,
        observed_variant: launchEvidence?.observed_variant ?? null,
        observed_source: launchEvidence?.observed_source ?? null,
        observed_confidence: launchEvidence?.observed_confidence ?? null,
        reviewer_count: reviewerAgentIds.length,
        reviewer_agent_id: inferredReviewerAgentId,
        reviewer_link_state: reviewerLinkState,
        captain_agent_id: (0, runtime_1.getAgentIdForRole)('orchestrator') ?? 'captain',
        execution_owner_mode: executionOwnerMode,
        fallback_reason: fallbackReason,
        summary: '',
        recorded_at: new Date().toISOString(),
    };
    chain.summary = summarizeTaskOwnershipChain(chain);
    return chain;
}
function createOwnershipChainProvenanceHeader(chain) {
    const executionOwner = chain.state === 'planned_only' || chain.state === 'assigned_only'
        ? 'planned'
        : chain.execution_owner_mode === 'host_session_fallback'
            ? 'host_session'
            : 'foreman_worker';
    const executionTarget = chain.state === 'planned_only' || chain.state === 'assigned_only'
        ? chain.assigned_agent_id ?? 'unassigned'
        : chain.state === 'captain_read_only_fallback'
            ? chain.captain_agent_id
            : chain.launched_worker_id ?? chain.assigned_agent_id ?? 'unassigned';
    const baseHeader = `[Foreman captain | assigned=${chain.assigned_agent_id ?? 'unassigned'} | execution=${executionOwner}:${executionTarget} | review=${chain.reviewer_agent_id ?? (0, runtime_1.getAgentIdForRole)('verifier') ?? 'arbiter'}]`;
    const observedSummary = chain.observed_worker_id ??
        (chain.observed_evidence_state === 'observed'
            ? `${chain.observed_source ?? 'observed'}:${chain.observed_model ?? 'unknown'}`
            : 'none');
    return `${baseHeader} [ownership=${chain.state}${chain.fallback_reason ? `:${chain.fallback_reason}` : ''} launched=${chain.launched_worker_id ?? 'none'} observed=${observedSummary} review_link=${chain.reviewer_link_state} captain=${chain.captain_agent_id}]`;
}
const EMBEDDED_AGENT_ROLE_CATALOG = {
    version: 1,
    agents: {
        captain: {
            kind: 'primary',
            canonical_role: 'orchestrator',
            codex_custom_agent: 'foreman_captain',
            purpose: 'Own the run, decide the next role, and keep the workflow coherent.',
            strengths: ['routing', 'workflow supervision', 'final synthesis'],
            framing_seed: 'Keep the workflow bounded, inspectable, and aligned with the next best specialist move.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'high',
            playbook_bundle: [],
            wrapper_doc_path: null,
            wrapper_summary: null,
            result_contract_fields: [],
            result_contract_summary: null,
        },
        tactician: {
            kind: 'primary',
            canonical_role: 'planner',
            codex_custom_agent: 'foreman_tactician',
            purpose: 'Shape the next bounded move and keep scope explicit.',
            strengths: ['task scoping', 'bounded planning', 'handoff clarity'],
            framing_seed: 'Act as a planning specialist who turns ambiguous work into the next bounded, inspectable move.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'medium',
            playbook_bundle: ['spec-driven-development', 'planning-and-task-breakdown'],
            wrapper_doc_path: 'skills/foreman-planner.md',
            wrapper_summary: 'Planner wrapper keeps ambiguous work inside one bounded scoping pass and returns the shared Foreman specialist result contract.',
            result_contract_fields: [...exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS],
            result_contract_summary: 'Return a bounded planning contract with summary, findings, evidence, open questions, and the next recommended action.',
        },
        scout: {
            kind: 'primary',
            canonical_role: 'explorer',
            codex_custom_agent: 'foreman_scout',
            purpose: 'Inspect state and gather only the evidence needed for the active task.',
            strengths: ['repository inspection', 'evidence gathering', 'surface mapping'],
            framing_seed: 'Act as an investigation specialist who gathers bounded evidence without drifting into implementation.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
            playbook_bundle: ['context-engineering', 'source-driven-development'],
            wrapper_doc_path: 'skills/foreman-explorer.md',
            wrapper_summary: 'Explorer wrapper keeps repository inspection read-heavy, bounded, and evidence-oriented before work returns to Codex.',
            result_contract_fields: [...exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS],
            result_contract_summary: 'Return repository findings, evidence paths, open questions, and a bounded recommendation instead of drifting into implementation.',
        },
        raider: {
            kind: 'primary',
            canonical_role: 'code specialist',
            codex_custom_agent: 'foreman_raider',
            purpose: 'Execute the scoped implementation task.',
            strengths: ['implementation', 'patching', 'focused validation'],
            framing_seed: 'Act as an implementation specialist who delivers the scoped change without widening the task.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
            playbook_bundle: ['incremental-implementation', 'test-driven-development', 'api-and-interface-design'],
            wrapper_doc_path: 'skills/foreman-code-specialist.md',
            wrapper_summary: 'Code-specialist wrapper keeps implementation incremental, scoped, and ready for verification with the shared Foreman result contract.',
            result_contract_fields: [...exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS],
            result_contract_summary: 'Return implementation findings, changed files, evidence, remaining questions, and a clear recommendation for verification or follow-up.',
        },
        arbiter: {
            kind: 'primary',
            canonical_role: 'verifier',
            codex_custom_agent: 'foreman_arbiter',
            purpose: 'Review the result and decide whether it is ready to move on.',
            strengths: ['verification', 'acceptance checking', 'repair signaling'],
            framing_seed: 'Act as a review specialist who checks the result against scope and acceptance before it returns upstream.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'high',
            playbook_bundle: ['debugging-and-error-recovery', 'code-review-and-quality', 'security-and-hardening'],
            wrapper_doc_path: 'skills/foreman-verifier.md',
            wrapper_summary: 'Verifier wrapper keeps review explicit, acceptance-oriented, and honest about pass, repair, or hold outcomes.',
            result_contract_fields: [...exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS],
            result_contract_summary: 'Return verification findings, supporting evidence, acceptance status, and the next recommended repair or completion action.',
        },
        framer: {
            kind: 'helper',
            canonical_role: null,
            codex_custom_agent: null,
            purpose: 'Write compact expert framing for the specialist already chosen by captain.',
            strengths: ['handoff sharpening', 'role framing', 'scope emphasis'],
            framing_seed: 'Do not choose the role; sharpen the role that captain already selected.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
            playbook_bundle: [],
            wrapper_doc_path: null,
            wrapper_summary: null,
            result_contract_fields: [],
            result_contract_summary: null,
        },
        sentinel: {
            kind: 'helper',
            canonical_role: null,
            codex_custom_agent: 'foreman_sentinel',
            purpose: 'Classify whether Foreman-managed work has drifted back toward host-session execution visibility.',
            strengths: ['ownership drift detection', 'trace classification', 'operator warnings'],
            framing_seed: 'Do not reroute work; report whether the current ownership and trace picture still looks Foreman-managed.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
            playbook_bundle: [],
            wrapper_doc_path: null,
            wrapper_summary: null,
            result_contract_fields: [],
            result_contract_summary: null,
        },
    },
};
let cachedCatalog = null;
function getCatalogPath() {
    return node_path_1.default.resolve(__dirname, '..', 'config', 'agent-role-catalog.json');
}
function isReasoningVariant(value) {
    return value === 'low' || value === 'medium' || value === 'high' || value === 'xhigh' || value === null;
}
function isRole(value) {
    return value === 'orchestrator' || value === 'planner' || value === 'explorer' || value === 'code specialist' || value === 'verifier';
}
function isSpecialistRole(value) {
    return value === 'planner' || value === 'explorer' || value === 'code specialist' || value === 'verifier';
}
function isResultContractField(value) {
    return typeof value === 'string' && exports.FOREMAN_SPECIALIST_RESULT_CONTRACT_FIELDS.includes(value);
}
function normalizeAgentRoleCatalogEntry(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const candidate = value;
    const kind = candidate.kind === 'primary' || candidate.kind === 'helper' ? candidate.kind : null;
    const canonicalRole = candidate.canonical_role === null || isRole(candidate.canonical_role) ? candidate.canonical_role : undefined;
    const codexCustomAgent = typeof candidate.codex_custom_agent === 'string' || candidate.codex_custom_agent === null ? candidate.codex_custom_agent : undefined;
    const purpose = typeof candidate.purpose === 'string' ? candidate.purpose : null;
    const strengths = Array.isArray(candidate.strengths) && candidate.strengths.every((entry) => typeof entry === 'string')
        ? candidate.strengths
        : null;
    const framingSeed = typeof candidate.framing_seed === 'string' ? candidate.framing_seed : null;
    const defaultModel = typeof candidate.default_model === 'string' || candidate.default_model === null ? candidate.default_model : undefined;
    const defaultReasoningEffort = isReasoningVariant(candidate.default_reasoning_effort)
        ? candidate.default_reasoning_effort
        : undefined;
    const playbookBundle = Array.isArray(candidate.playbook_bundle) && candidate.playbook_bundle.every((entry) => typeof entry === 'string')
        ? candidate.playbook_bundle
        : undefined;
    const wrapperDocPath = typeof candidate.wrapper_doc_path === 'string' || candidate.wrapper_doc_path === null ? candidate.wrapper_doc_path : undefined;
    const wrapperSummary = typeof candidate.wrapper_summary === 'string' || candidate.wrapper_summary === null ? candidate.wrapper_summary : undefined;
    const resultContractFields = Array.isArray(candidate.result_contract_fields) && candidate.result_contract_fields.every((entry) => isResultContractField(entry))
        ? candidate.result_contract_fields
        : undefined;
    const resultContractSummary = typeof candidate.result_contract_summary === 'string' || candidate.result_contract_summary === null
        ? candidate.result_contract_summary
        : undefined;
    if (kind === null ||
        canonicalRole === undefined ||
        codexCustomAgent === undefined ||
        purpose === null ||
        strengths === null ||
        framingSeed === null ||
        defaultModel === undefined ||
        defaultReasoningEffort === undefined ||
        playbookBundle === undefined ||
        wrapperDocPath === undefined ||
        wrapperSummary === undefined ||
        resultContractFields === undefined ||
        resultContractSummary === undefined) {
        return null;
    }
    return {
        kind,
        canonical_role: canonicalRole,
        codex_custom_agent: codexCustomAgent,
        purpose,
        strengths,
        framing_seed: framingSeed,
        default_model: defaultModel,
        default_reasoning_effort: defaultReasoningEffort,
        playbook_bundle: playbookBundle,
        wrapper_doc_path: wrapperDocPath,
        wrapper_summary: wrapperSummary,
        result_contract_fields: resultContractFields,
        result_contract_summary: resultContractSummary,
    };
}
function loadCatalog() {
    if (cachedCatalog !== null) {
        return cachedCatalog;
    }
    try {
        const parsed = JSON.parse((0, node_fs_1.readFileSync)(getCatalogPath(), 'utf8'));
        if (parsed.version !== 1 || !parsed.agents || typeof parsed.agents !== 'object') {
            throw new Error('invalid catalog');
        }
        const normalizedAgents = {};
        for (const [agentId, value] of Object.entries(parsed.agents)) {
            const normalized = normalizeAgentRoleCatalogEntry(value);
            if (normalized) {
                normalizedAgents[agentId] = normalized;
            }
        }
        if (Object.keys(normalizedAgents).length > 0) {
            cachedCatalog = {
                source: 'source_role_catalog',
                catalog: {
                    version: 1,
                    agents: normalizedAgents,
                },
            };
            return cachedCatalog;
        }
    }
    catch {
        // fall through to embedded defaults
    }
    cachedCatalog = {
        source: 'embedded_defaults',
        catalog: EMBEDDED_AGENT_ROLE_CATALOG,
    };
    return cachedCatalog;
}
function deriveTaskFocus(taskCard) {
    switch (taskCard.task_kind) {
        case 'plan':
            return `turn "${taskCard.title}" into the next bounded move while keeping scope explicit`;
        case 'explore':
            return `inspect only the evidence needed for "${taskCard.title}" without drifting into implementation`;
        case 'review':
            return `review "${taskCard.title}" against the stated acceptance criteria`;
        case 'execution':
        default:
            return `deliver the concrete work for "${taskCard.title}" while staying inside the stated scope and acceptance`;
    }
}
function deriveTargetAgentId(taskCard) {
    return taskCard.assigned_agent_id ?? (0, runtime_1.getAgentIdForRole)(taskCard.assigned_role);
}
function getCatalogEntryForAgent(agentId, role) {
    const { catalog } = loadCatalog();
    if (agentId && catalog.agents[agentId]) {
        return catalog.agents[agentId];
    }
    for (const [candidateAgentId, candidate] of Object.entries(catalog.agents)) {
        if (candidate.kind === 'primary' && candidate.canonical_role === role) {
            return catalog.agents[candidateAgentId];
        }
    }
    const fallbackAgentId = deriveTargetAgentId({ assigned_agent_id: null, assigned_role: role });
    if (fallbackAgentId && catalog.agents[fallbackAgentId]) {
        return catalog.agents[fallbackAgentId];
    }
    return EMBEDDED_AGENT_ROLE_CATALOG.agents.raider;
}
function getHelperEntry(helperAgentId) {
    const { catalog } = loadCatalog();
    return catalog.agents[helperAgentId] ?? EMBEDDED_AGENT_ROLE_CATALOG.agents[helperAgentId];
}
const FRAMING_SEED_MAX_CHARS = 180;
const FRAMING_FOCUS_MAX_CHARS = 180;
const FRAMING_SCOPE_MAX_CHARS = 220;
const FRAMING_ACCEPTANCE_MAX_CHARS = 220;
function compactPromptField(value, maxChars) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars) {
        return normalized;
    }
    return `${normalized.slice(0, maxChars - 3).trimEnd()}...`;
}
function createTaskAssignmentFraming(taskCard) {
    const { source } = loadCatalog();
    const targetAgentId = deriveTargetAgentId(taskCard);
    const specialistEntry = getCatalogEntryForAgent(targetAgentId, taskCard.assigned_role);
    const framerEntry = getHelperEntry('framer');
    const focus = deriveTaskFocus(taskCard);
    const strengths = specialistEntry.strengths.slice(0, 2).join(' and ');
    const promptPrefix = [
        `Role: ${targetAgentId ?? taskCard.assigned_role} (${taskCard.assigned_role}).`,
        `Mode: ${compactPromptField(specialistEntry.framing_seed, FRAMING_SEED_MAX_CHARS)}`,
        `Focus: ${compactPromptField(focus, FRAMING_FOCUS_MAX_CHARS)}`,
        `Scope: ${compactPromptField(taskCard.scope, FRAMING_SCOPE_MAX_CHARS)}`,
        `Acceptance: ${compactPromptField(taskCard.acceptance, FRAMING_ACCEPTANCE_MAX_CHARS)}`,
    ].join('\n');
    return {
        helper_agent_id: 'framer',
        helper_model: framerEntry.default_model,
        helper_variant: framerEntry.default_reasoning_effort,
        catalog_source: source,
        target_role: taskCard.assigned_role,
        target_agent_id: targetAgentId,
        summary: `Framer helper projection emphasizes ${strengths} for ${targetAgentId ?? taskCard.assigned_role} on "${taskCard.title}".`,
        prompt_prefix: promptPrefix,
    };
}
function buildFramedTaskPrompt(taskCard) {
    const framing = createTaskAssignmentFraming(taskCard);
    return `${framing.prompt_prefix}\n\n${taskCard.execution_prompt}`;
}
function createTaskOwnershipGuard(input) {
    const sentinelEntry = getHelperEntry('sentinel');
    const reasons = [];
    let verdict = 'ownership_unclear';
    if (input.executionOwner === 'foreman_worker') {
        reasons.push('execution_owner=foreman_worker');
        if (input.codexUiTraceOwner === 'host_session') {
            reasons.push('codex_ui_trace_owner=host_session');
            verdict = 'mixed_visibility';
        }
        else {
            verdict = 'foreman_managed';
        }
    }
    else {
        reasons.push('execution_owner=host_session');
        if (input.assignedAgentId !== null) {
            reasons.push(`assigned_agent_id=${input.assignedAgentId}`);
            verdict = 'host_session_fallback';
        }
    }
    if (input.provenanceHeader) {
        reasons.push('provenance_header=present');
    }
    else {
        reasons.push('provenance_header=missing');
    }
    if (input.concreteWorkerId) {
        reasons.push(`concrete_worker_id=${input.concreteWorkerId}`);
    }
    const summary = verdict === 'foreman_managed'
        ? 'Sentinel helper projection sees a Foreman-managed execution path.'
        : verdict === 'mixed_visibility'
            ? 'Sentinel helper projection sees Foreman-owned execution with host-session UI trace visibility still mixed in.'
            : verdict === 'host_session_fallback'
                ? 'Sentinel helper projection sees the task routed by Foreman but still carried by the host Codex session.'
                : 'Sentinel helper projection cannot prove a stable ownership picture for the current task.';
    return {
        helper_agent_id: 'sentinel',
        helper_model: sentinelEntry.default_model,
        helper_variant: sentinelEntry.default_reasoning_effort,
        source: 'status_projection',
        verdict,
        summary,
        reasons,
    };
}
function getSpecialistRolePlaybookContract(role, agentId) {
    const { source } = loadCatalog();
    const specialistEntry = getCatalogEntryForAgent(agentId ?? null, role);
    const rosterName = agentId ?? (0, runtime_1.getAgentIdForRole)(role) ?? role;
    return {
        catalog_source: source,
        role,
        roster_name: rosterName,
        codex_custom_agent: specialistEntry.codex_custom_agent,
        purpose: specialistEntry.purpose,
        strengths: [...specialistEntry.strengths],
        default_model: specialistEntry.default_model,
        default_reasoning_effort: specialistEntry.default_reasoning_effort,
        playbook_source: 'agent-skills',
        playbook_bundle: [...specialistEntry.playbook_bundle],
        wrapper_doc_path: specialistEntry.wrapper_doc_path,
        wrapper_summary: specialistEntry.wrapper_summary,
        result_contract_fields: [...specialistEntry.result_contract_fields],
        result_contract_summary: specialistEntry.result_contract_summary,
        adapter_layer: 'thin_foreman_wrapper',
        upstream_interception_claim: 'not_claimed',
    };
}
function maybeGetSpecialistRolePlaybookContract(role, agentId) {
    if (!isSpecialistRole(role)) {
        return null;
    }
    return getSpecialistRolePlaybookContract(role, agentId);
}
function listSpecialistRolePlaybookContracts() {
    return exports.SPECIALIST_ROLES.map((role) => getSpecialistRolePlaybookContract(role, (0, runtime_1.getAgentIdForRole)(role)));
}
//# sourceMappingURL=helper-agents.js.map