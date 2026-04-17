"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendForemanEntry = recommendForemanEntry;
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const request_shape_1 = require("./request-shape");
const PLAN_KEYWORDS = ['plan', 'planner', 'roadmap', 'milestone', 'strategy', 'migration', 'phases', 'step-by-step'];
const START_KEYWORDS = [
    'fix',
    'update',
    'change',
    'rename',
    'implement',
    'add',
    'wire',
    'connect',
    'patch',
    'adjust',
    'narrow',
    'single file',
];
const REVIEW_KEYWORDS = ['review', 'verify', 'verification', 'validate', 'validation', 'check', 'regression'];
function countKeywordMatches(normalizedRequest, keywords) {
    let matchCount = 0;
    for (const keyword of keywords) {
        if (normalizedRequest.includes(keyword)) {
            matchCount += 1;
        }
    }
    return matchCount;
}
function extractFilePathMentions(request) {
    const matches = request.match(/\b[\w./-]+\.[A-Za-z0-9]+\b/g);
    if (!matches) {
        return [];
    }
    return Array.from(new Set(matches.map((match) => node_path_1.default.normalize(match))));
}
function createEntryPolicySummary(policy) {
    if (policy.mode === 'codex_cli_foreman_first') {
        return ('Entry policy prefers Foreman-first for ordinary Codex CLI requests through MCP session instructions: ' +
            'fresh requests should try the bounded auto-entry surface first, while existing-run work still stays on the explicit run-scoped surfaces.');
    }
    if (policy.mode === 'foreman_first_bounded') {
        return ('Entry policy is opt-in Foreman-first on the explicit auto-entry surface: ' +
            'Foreman can create a bounded start or plan run from a fresh request, but Codex CLI still does not silently intercept unrelated requests.');
    }
    return policy.mode === 'guided_explicit'
        ? 'Entry policy remains explicit, but the preferred operator flow is to ask Foreman for a recommendation before making the explicit start or plan call.'
        : 'Entry policy remains fully explicit: operators still choose start or plan directly, and Foreman does not auto-route requests.';
}
function createEntryBoundary(policy) {
    if (policy.mode === 'codex_cli_foreman_first') {
        return {
            entry_boundary: 'session_instruction_plus_wrapper',
            entry_boundary_summary: 'The supported Foreman-first boundary is bounded MCP session guidance plus the explicit launcher wrapper. The request may be routed through foreman_auto_entry first, but upstream Codex CLI is still not patched or intercepted directly.',
        };
    }
    if (policy.mode === 'foreman_first_bounded') {
        return {
            entry_boundary: 'explicit_auto_entry',
            entry_boundary_summary: 'The supported Foreman-first boundary is the explicit auto-entry surface only. Operators still invoke Foreman directly through codex-foreman auto-entry or foreman_auto_entry.',
        };
    }
    return {
        entry_boundary: 'explicit_cli_or_mcp',
        entry_boundary_summary: 'The supported entry boundary stays fully explicit: operators enter Foreman through explicit codex-foreman commands or explicit MCP tool calls.',
    };
}
function createOrchestratorScopeSummary() {
    return ('Orchestrator settings stay bounded to persisted synthesis/decision work plus one read-only advisory Codex pass and visibility surfaces. ' +
        'Today advise consumes them for one advisory Codex pass, while latest_orchestrator_synthesis and status/watch surfaces expose the bounded decision-and-response layer without turning the orchestrator into a generic execution worker or a general orchestration loop.');
}
function recommendForemanEntry(options, policy = { mode: 'guided_explicit' }, orchestratorConfig) {
    const normalizedRequest = options.request.trim().toLowerCase();
    const filePathMentions = extractFilePathMentions(options.request);
    const planKeywordMatches = countKeywordMatches(normalizedRequest, PLAN_KEYWORDS);
    const startKeywordMatches = countKeywordMatches(normalizedRequest, START_KEYWORDS);
    const requestClassification = (0, request_shape_1.classifyForemanRequest)({ request: options.request });
    const rationale = [];
    let recommendedEntrypoint = requestClassification.recommendedEntrypoint;
    let taskShape = requestClassification.taskShape;
    let confidence = 'medium';
    let recommendedTaskKind = requestClassification.recommendedTaskKind;
    let summary = 'Recommend `start` because the request reads like one bounded task that can be expressed directly as a single execution-ready task-card.';
    if (filePathMentions.length >= 4) {
        rationale.push(`The request already touches ${filePathMentions.length} distinct file paths, which usually means broader scoping or sequencing work.`);
    }
    else if (filePathMentions.length > 0) {
        rationale.push(`The request references ${filePathMentions.length} file path${filePathMentions.length === 1 ? '' : 's'}, which helps keep the task scoped.`);
    }
    if (planKeywordMatches > 0) {
        rationale.push(`The request contains ${planKeywordMatches} planning or investigation signal${planKeywordMatches === 1 ? '' : 's'}.`);
    }
    if (startKeywordMatches > 0) {
        rationale.push(`The request contains ${startKeywordMatches} implementation signal${startKeywordMatches === 1 ? '' : 's'}.`);
    }
    rationale.push(`Request shape classified as ${requestClassification.requestShape}.`);
    rationale.push(requestClassification.mutationIntent === 'explicit_or_strong'
        ? 'Mutation intent is explicit or strongly implied, so the bounded mutation path is allowed.'
        : 'Mutation intent is not explicit, so bounded read-only, explorer-first, or synthesis-first routing is preferred.');
    if (requestClassification.recommendedEntrypoint === 'plan') {
        confidence = planKeywordMatches >= 2 || filePathMentions.length >= 4 ? 'high' : 'medium';
        summary =
            'Recommend `plan` because the request looks multi-step, investigative, or not yet scoped enough for one execution-ready task-card.';
    }
    else if (startKeywordMatches > 0 || filePathMentions.length > 0) {
        confidence = startKeywordMatches > 1 || filePathMentions.length > 0 ? 'high' : 'medium';
    }
    if (recommendedEntrypoint === 'start') {
        if (recommendedTaskKind === 'explore') {
            summary =
                requestClassification.requestShape === 'synthesis'
                    ? 'Recommend `start` because the request looks like bounded answer-shaping work that captain can route through explorer evidence and captain synthesis first.'
                    : 'Recommend `start` because the request looks like one bounded read-heavy or investigation-first task that captain can route to the explorer path first.';
        }
        else if (recommendedTaskKind === 'review') {
            summary =
                'Recommend `start` because the request looks like one bounded verification or review task that captain can route to the verifier path first.';
        }
    }
    if (rationale.length === 0) {
        rationale.push('The request does not carry strong multi-step planning signals, so a single scoped task-card is the safer default.');
    }
    const resolvedOrchestratorConfig = orchestratorConfig ?? {
        name: constants_1.FOREMAN_AGENT_ROSTER.orchestrator,
        profile: null,
        model: null,
        variant: null,
        config_entries: [],
    };
    const entryBoundary = createEntryBoundary(policy);
    const suggestedMcpTool = recommendedEntrypoint === 'start' ? 'foreman_start' : null;
    return {
        cwd: options.cwd,
        request: options.request,
        policy_mode: policy.mode,
        policy_summary: createEntryPolicySummary(policy),
        automatic_entry_supported: policy.mode === 'foreman_first_bounded' || policy.mode === 'codex_cli_foreman_first',
        entry_boundary: entryBoundary.entry_boundary,
        entry_boundary_summary: entryBoundary.entry_boundary_summary,
        upstream_codex_binary_intercept_supported: false,
        upstream_codex_binary_intercept_summary: 'Hidden upstream Codex CLI binary interception is not a supported Foreman entry boundary. The current maximum supported boundary is bounded session guidance plus the explicit wrapper surface.',
        orchestrator_scope: 'bounded_synthesis_decision_and_read_only_advisory',
        orchestrator_scope_summary: createOrchestratorScopeSummary(),
        orchestrator_agent: {
            role: 'orchestrator',
            roster_name: resolvedOrchestratorConfig.name,
            profile: resolvedOrchestratorConfig.profile,
            model: resolvedOrchestratorConfig.model,
            variant: resolvedOrchestratorConfig.variant,
            config_entries: [...resolvedOrchestratorConfig.config_entries],
        },
        orchestrator_request_settings_preview: {
            source: 'shared_role_config',
            profile: resolvedOrchestratorConfig.profile,
            model: resolvedOrchestratorConfig.model,
            variant: resolvedOrchestratorConfig.variant,
            config_entries: [...resolvedOrchestratorConfig.config_entries],
        },
        recommended_entrypoint: recommendedEntrypoint,
        task_shape: taskShape,
        request_shape: requestClassification.requestShape,
        mutation_intent: requestClassification.mutationIntent,
        recommended_task_kind: recommendedEntrypoint === 'start' ? recommendedTaskKind : null,
        confidence,
        summary,
        rationale,
        suggested_cli_command: recommendedEntrypoint === 'start' ? 'codex-foreman start' : 'codex-foreman plan',
        suggested_mcp_tool: suggestedMcpTool,
    };
}
//# sourceMappingURL=entry-policy.js.map