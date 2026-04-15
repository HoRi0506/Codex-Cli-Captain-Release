"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskAssignmentFraming = createTaskAssignmentFraming;
exports.buildFramedTaskPrompt = buildFramedTaskPrompt;
exports.createTaskOwnershipGuard = createTaskOwnershipGuard;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
const EMBEDDED_AGENT_ROLE_CATALOG = {
    version: 1,
    agents: {
        captain: {
            kind: 'primary',
            canonical_role: 'orchestrator',
            purpose: 'Own the run, decide the next role, and keep the workflow coherent.',
            strengths: ['routing', 'workflow supervision', 'final synthesis'],
            framing_seed: 'Keep the workflow bounded, inspectable, and aligned with the next best specialist move.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'high',
        },
        tactician: {
            kind: 'primary',
            canonical_role: 'planner',
            purpose: 'Shape the next bounded move and keep scope explicit.',
            strengths: ['task scoping', 'bounded planning', 'handoff clarity'],
            framing_seed: 'Act as a planning specialist who turns ambiguous work into the next bounded, inspectable move.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'medium',
        },
        scout: {
            kind: 'primary',
            canonical_role: 'explorer',
            purpose: 'Inspect state and gather only the evidence needed for the active task.',
            strengths: ['repository inspection', 'evidence gathering', 'surface mapping'],
            framing_seed: 'Act as an investigation specialist who gathers bounded evidence without drifting into implementation.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
        },
        raider: {
            kind: 'primary',
            canonical_role: 'code specialist',
            purpose: 'Execute the scoped implementation task.',
            strengths: ['implementation', 'patching', 'focused validation'],
            framing_seed: 'Act as an implementation specialist who delivers the scoped change without widening the task.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
        },
        arbiter: {
            kind: 'primary',
            canonical_role: 'verifier',
            purpose: 'Review the result and decide whether it is ready to move on.',
            strengths: ['verification', 'acceptance checking', 'repair signaling'],
            framing_seed: 'Act as a review specialist who checks the result against scope and acceptance before it returns upstream.',
            default_model: 'gpt-5.4',
            default_reasoning_effort: 'high',
        },
        framer: {
            kind: 'helper',
            canonical_role: null,
            purpose: 'Write compact expert framing for the specialist already chosen by captain.',
            strengths: ['handoff sharpening', 'role framing', 'scope emphasis'],
            framing_seed: 'Do not choose the role; sharpen the role that captain already selected.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
        },
        sentinel: {
            kind: 'helper',
            canonical_role: null,
            purpose: 'Classify whether Foreman-managed work has drifted back toward host-session execution visibility.',
            strengths: ['ownership drift detection', 'trace classification', 'operator warnings'],
            framing_seed: 'Do not reroute work; report whether the current ownership and trace picture still looks Foreman-managed.',
            default_model: 'gpt-5.4-mini',
            default_reasoning_effort: 'medium',
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
function normalizeAgentRoleCatalogEntry(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const candidate = value;
    const kind = candidate.kind === 'primary' || candidate.kind === 'helper' ? candidate.kind : null;
    const canonicalRole = candidate.canonical_role === null || isRole(candidate.canonical_role) ? candidate.canonical_role : undefined;
    const purpose = typeof candidate.purpose === 'string' ? candidate.purpose : null;
    const strengths = Array.isArray(candidate.strengths) && candidate.strengths.every((entry) => typeof entry === 'string')
        ? candidate.strengths
        : null;
    const framingSeed = typeof candidate.framing_seed === 'string' ? candidate.framing_seed : null;
    const defaultModel = typeof candidate.default_model === 'string' || candidate.default_model === null ? candidate.default_model : undefined;
    const defaultReasoningEffort = isReasoningVariant(candidate.default_reasoning_effort)
        ? candidate.default_reasoning_effort
        : undefined;
    if (kind === null ||
        canonicalRole === undefined ||
        purpose === null ||
        strengths === null ||
        framingSeed === null ||
        defaultModel === undefined ||
        defaultReasoningEffort === undefined) {
        return null;
    }
    return {
        kind,
        canonical_role: canonicalRole,
        purpose,
        strengths,
        framing_seed: framingSeed,
        default_model: defaultModel,
        default_reasoning_effort: defaultReasoningEffort,
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
function createTaskAssignmentFraming(taskCard) {
    const { source } = loadCatalog();
    const targetAgentId = deriveTargetAgentId(taskCard);
    const specialistEntry = getCatalogEntryForAgent(targetAgentId, taskCard.assigned_role);
    const framerEntry = getHelperEntry('framer');
    const focus = deriveTaskFocus(taskCard);
    const strengths = specialistEntry.strengths.slice(0, 2).join(' and ');
    const promptPrefix = [
        `You are ${targetAgentId ?? taskCard.assigned_role}, the ${taskCard.assigned_role} specialist for this Foreman task.`,
        specialistEntry.framing_seed,
        `Priority for this assignment: ${focus}.`,
        `Keep the bounded scope on: ${taskCard.scope}.`,
        `Acceptance target: ${taskCard.acceptance}.`,
    ].join('\n');
    return {
        helper_agent_id: 'framer',
        helper_model: framerEntry.default_model,
        helper_variant: framerEntry.default_reasoning_effort,
        catalog_source: source,
        target_role: taskCard.assigned_role,
        target_agent_id: targetAgentId,
        summary: `${targetAgentId ?? taskCard.assigned_role} framing emphasizes ${strengths} for "${taskCard.title}".`,
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
        ? 'Sentinel sees a Foreman-managed execution path.'
        : verdict === 'mixed_visibility'
            ? 'Sentinel sees Foreman-owned execution with host-session UI trace visibility still mixed in.'
            : verdict === 'host_session_fallback'
                ? 'Sentinel sees the task routed by Foreman but still carried by the host Codex session.'
                : 'Sentinel cannot prove a stable ownership picture for the current task.';
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
//# sourceMappingURL=helper-agents.js.map