"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForemanStatus = getForemanStatus;
exports.getForemanActivity = getForemanActivity;
exports.recommendForemanEntryForMcp = recommendForemanEntryForMcp;
exports.autoEnterForemanForMcp = autoEnterForemanForMcp;
exports.getForemanDelegations = getForemanDelegations;
exports.declareForemanDelegation = declareForemanDelegation;
exports.updateForemanDelegation = updateForemanDelegation;
exports.startForemanMcpRun = startForemanMcpRun;
exports.runForemanMcpRun = runForemanMcpRun;
exports.orchestrateForemanRun = orchestrateForemanRun;
exports.tickForemanAlwaysOnCompanion = tickForemanAlwaysOnCompanion;
exports.runForemanAlwaysOnLoop = runForemanAlwaysOnLoop;
exports.handleMcpRequest = handleMcpRequest;
exports.createMcpSession = createMcpSession;
exports.runForemanMcpServer = runForemanMcpServer;
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const canonical_loop_1 = require("./canonical-loop");
const constants_1 = require("./constants");
const entry_policy_1 = require("./entry-policy");
const helper_agents_1 = require("./helper-agents");
const navigation_aids_1 = require("./navigation-aids");
const package_metadata_1 = require("./package-metadata");
const orchestration_loop_1 = require("./orchestration-loop");
const run_lifecycle_1 = require("./run-lifecycle");
const orchestrator_1 = require("./orchestrator");
const run_command_1 = require("./run-command");
const setup_codex_mcp_1 = require("./setup-codex-mcp");
const runtime_1 = require("./runtime");
const JSON_RPC_VERSION = '2.0';
const MCP_PROTOCOL_VERSION = '2025-03-26';
const SUPPORTED_MCP_PROTOCOL_VERSIONS = new Set([MCP_PROTOCOL_VERSION]);
const MCP_SERVER_INFO = {
    name: 'codex-foreman-mcp',
    version: package_metadata_1.FOREMAN_PACKAGE_VERSION,
};
const FOREMAN_TOOL_TIMEOUT_BUDGET_MS = 10_000;
const MCP_INSTRUCTIONS_BASE = 'Use foreman_status for compact persisted run visibility, foreman_activity for one consolidated read-only activity view over persisted status, orchestration attempts, and active-task delegations, foreman_server_identity for attached build/session confirmation plus install and companion-MCP diagnostics, foreman_recommend_entry for read-only guidance on whether a new request should enter Foreman through start or plan, foreman_auto_entry for the explicit opt-in bounded Foreman-first entry surface, foreman_delegations to inspect persisted delegation summaries for one run without mutating state, foreman_delegate to declare one queued delegation for the active run context without starting child execution, foreman_update_delegation to advance one existing delegation through the bounded child lifecycle without execution, foreman_start to create a new local Foreman bootstrap run without invoking Codex, foreman_run to create a new local Foreman run and immediately advance it through the existing bounded start+advance flow with codex_bin, foreman_orchestrate to dispatch one matching explicit Foreman workflow command and optionally continue one additional bounded step only for the straight-line execute_task -> verify_task slice while still stopping at manual, task, and terminal boundaries, foreman_always_on_tick to run one bounded companion executor tick only when the persisted always-on mode has already been enabled explicitly, or foreman_always_on_loop to run an explicit bounded external companion loop over that same tick surface.';
function createMcpEntryPolicyInstructions(policyMode) {
    switch (policyMode) {
        case 'codex_cli_foreman_first':
            return ('Session entry policy is codex_cli_foreman_first. ' +
                'For a fresh operator request that is not already about an existing run_id or an explicit Foreman command, call foreman_auto_entry first before answering directly. ' +
                'This is bounded MCP session guidance plus the explicit launcher wrapper surface, not upstream Codex CLI binary interception. ' +
                'If auto-entry does not create a run, continue from its recommendation or the normal explicit workflow surface.');
        case 'foreman_first_bounded':
            return ('Session entry policy enables bounded Foreman-first entry on demand. ' +
                'When Foreman is the right workflow for a fresh request, prefer foreman_auto_entry over manually splitting between start and plan.');
        case 'guided_explicit':
            return ('Session entry policy is guided_explicit. ' +
                'Use foreman_recommend_entry for fresh requests when Foreman is already in scope, then continue through explicit start, plan, or auto-entry.');
        case 'explicit_only':
        default:
            return ('Session entry policy is explicit_only. ' +
                'Do not assume fresh requests should enter Foreman unless the operator explicitly asks for the Foreman workflow.');
    }
}
function createTimeoutDiagnosis(toolName, stage, budgetMs) {
    return {
        tool_name: toolName,
        stage,
        budget_ms: budgetMs,
        elapsed_ms: budgetMs,
        summary: `${toolName} exceeded the bounded ${budgetMs}ms budget during ${stage}. Returning a visible degraded result instead of hanging.`,
        recorded_at: new Date().toISOString(),
    };
}
async function withBoundedToolBudget(input) {
    const budgetMs = input.budgetMs ?? FOREMAN_TOOL_TIMEOUT_BUDGET_MS;
    return await new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(input.onTimeout(createTimeoutDiagnosis(input.toolName, input.stage, budgetMs)));
        }, budgetMs);
        void input
            .work()
            .then((result) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            resolve(result);
        })
            .catch((error) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            reject(error);
        });
    });
}
async function createMcpInitializeInstructions(cwd) {
    let policyMode = 'codex_cli_foreman_first';
    try {
        policyMode = (await (0, runtime_1.loadForemanConfig)(cwd)).entry_policy.mode;
    }
    catch {
        policyMode = 'codex_cli_foreman_first';
    }
    return `${createMcpEntryPolicyInstructions(policyMode)} ${MCP_INSTRUCTIONS_BASE}`;
}
const EMPTY_TASK_GRAPH_SUMMARY = {
    total_task_cards: 0,
    queued_task_cards: 0,
    ready_execution_tasks: 0,
    ready_low_cost_tasks: 0,
    queued_review_tasks: 0,
    queued_fan_in_tasks: 0,
    low_cost_task_cards: 0,
    standard_task_cards: 0,
    high_tier_task_cards: 0,
    child_aggregation_task_cards: 0,
    fan_in_barrier_task_cards: 0,
    orchestrator_review_gated_task_cards: 0,
    assigned_role_counts: {
        orchestrator: 0,
        planner: 0,
        explorer: 0,
        'code specialist': 0,
        verifier: 0,
    },
};
const ORCHESTRATOR_SCOPE = 'bounded_synthesis_decision_and_read_only_advisory';
const ORCHESTRATOR_SCOPE_SUMMARY = 'Orchestrator settings stay bounded to persisted synthesis/decision work plus one read-only advisory Codex pass and visibility surfaces. Today advise consumes them for one advisory Codex pass, while latest_orchestrator_synthesis and status/watch surfaces expose the bounded decision-and-response layer without turning the orchestrator into a generic execution worker or a general orchestration loop.';
function roleConfigSnapshotsMatch(left, right) {
    return (left.role === right.role &&
        left.profile === right.profile &&
        left.model === right.model &&
        left.variant === right.variant &&
        left.config_entries.length === right.config_entries.length &&
        left.config_entries.every((entry, index) => entry === right.config_entries[index]));
}
function requestSettingsMatch(left, right) {
    return (left.profile === right.profile &&
        left.config_entries.length === right.config_entries.length &&
        left.config_entries.every((entry, index) => entry === right.config_entries[index]));
}
function extractModelSelectionFromConfigEntries(configEntries) {
    let model = null;
    let variant = null;
    for (const entry of configEntries) {
        if (entry.startsWith('model=')) {
            model = entry.slice('model='.length) || null;
            continue;
        }
        if (!entry.startsWith('model_reasoning_effort=')) {
            continue;
        }
        const candidate = entry.slice('model_reasoning_effort='.length);
        if (candidate === 'low' || candidate === 'medium' || candidate === 'high' || candidate === 'xhigh') {
            variant = candidate;
        }
    }
    return {
        model,
        variant,
    };
}
function createCurrentTaskSharedConfigDrift(input) {
    const currentExecutionSnapshot = (0, runtime_1.createTaskRoleConfigSnapshot)(input.taskCard.assigned_role, input.foremanConfig);
    const executionDrift = !roleConfigSnapshotsMatch(input.taskCard.role_config_snapshot, currentExecutionSnapshot);
    const currentVerificationSettings = (0, runtime_1.createRequestSettingsFromForemanAgentConfig)((0, runtime_1.getForemanAgentConfigForRole)(input.foremanConfig, 'verifier'));
    const verificationDrift = input.orchestratorState.verification_request !== null &&
        !requestSettingsMatch(input.orchestratorState.verification_request, currentVerificationSettings);
    const verificationLaunchStarted = input.taskCard.latest_model_launch?.request_kind === 'verification' && input.run.active_thread_id !== null;
    if (input.decision.next_step === 'execute_task' && executionDrift) {
        return {
            state: input.decision.can_advance && input.run.active_thread_id === null ? 'refreshable_pre_launch' : 'blocked_active_boundary',
            request_kind: 'execution',
            role: input.taskCard.assigned_role,
            persisted_profile: input.taskCard.role_config_snapshot.profile,
            persisted_model: input.taskCard.role_config_snapshot.model,
            persisted_variant: input.taskCard.role_config_snapshot.variant,
            current_profile: currentExecutionSnapshot.profile,
            current_model: currentExecutionSnapshot.model,
            current_variant: currentExecutionSnapshot.variant,
            summary: input.decision.can_advance && input.run.active_thread_id === null
                ? `Shared config drift detected for ${input.taskCard.assigned_role}. The pending execution request can be refreshed from current shared config before launch.`
                : `Shared config drift detected for ${input.taskCard.assigned_role}, but the execution boundary is no longer safe to rebind automatically.`,
        };
    }
    if (input.decision.next_step === 'verify_task' && verificationDrift) {
        return {
            state: input.decision.can_advance && !verificationLaunchStarted ? 'refreshable_pre_launch' : 'blocked_active_boundary',
            request_kind: 'verification',
            role: 'verifier',
            persisted_profile: input.orchestratorState.verification_request?.profile ?? null,
            persisted_model: input.orchestratorState.verification_request
                ? extractModelSelectionFromConfigEntries(input.orchestratorState.verification_request.config_entries).model
                : null,
            persisted_variant: input.orchestratorState.verification_request
                ? extractModelSelectionFromConfigEntries(input.orchestratorState.verification_request.config_entries).variant
                : null,
            current_profile: currentVerificationSettings.profile,
            current_model: extractModelSelectionFromConfigEntries(currentVerificationSettings.config_entries).model,
            current_variant: extractModelSelectionFromConfigEntries(currentVerificationSettings.config_entries).variant,
            summary: input.decision.can_advance && !verificationLaunchStarted
                ? 'Shared verifier config drift detected. The pending verification request can be refreshed from current shared config before launch.'
                : 'Shared verifier config drift detected, but the verification boundary is no longer safe to rebind automatically.',
        };
    }
    if (executionDrift) {
        return {
            state: input.run.active_thread_id === null ? 'pending_future_boundary' : 'blocked_active_boundary',
            request_kind: 'execution',
            role: input.taskCard.assigned_role,
            persisted_profile: input.taskCard.role_config_snapshot.profile,
            persisted_model: input.taskCard.role_config_snapshot.model,
            persisted_variant: input.taskCard.role_config_snapshot.variant,
            current_profile: currentExecutionSnapshot.profile,
            current_model: currentExecutionSnapshot.model,
            current_variant: currentExecutionSnapshot.variant,
            summary: input.run.active_thread_id === null
                ? `Shared config drift is already visible for ${input.taskCard.assigned_role}, but the current decision is not at the execution launch boundary yet.`
                : `Shared config drift is visible for ${input.taskCard.assigned_role}, and an active thread means Foreman will not silently rewrite the in-flight execution snapshot.`,
        };
    }
    if (verificationDrift) {
        return {
            state: verificationLaunchStarted ? 'blocked_active_boundary' : 'pending_future_boundary',
            request_kind: 'verification',
            role: 'verifier',
            persisted_profile: input.orchestratorState.verification_request?.profile ?? null,
            persisted_model: input.orchestratorState.verification_request
                ? extractModelSelectionFromConfigEntries(input.orchestratorState.verification_request.config_entries).model
                : null,
            persisted_variant: input.orchestratorState.verification_request
                ? extractModelSelectionFromConfigEntries(input.orchestratorState.verification_request.config_entries).variant
                : null,
            current_profile: currentVerificationSettings.profile,
            current_model: extractModelSelectionFromConfigEntries(currentVerificationSettings.config_entries).model,
            current_variant: extractModelSelectionFromConfigEntries(currentVerificationSettings.config_entries).variant,
            summary: verificationLaunchStarted
                ? 'Shared verifier config drift is visible, and Foreman will not silently rewrite the in-flight verification launch.'
                : 'Shared verifier config drift is visible, but the current decision is not at the verification launch boundary yet.',
        };
    }
    return null;
}
const FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES = {
    run_id: {
        type: 'string',
        minLength: 1,
        description: 'Explicit Foreman run identifier to inspect. Legacy locator that still resolves against cwd.',
    },
    run_ref: {
        type: 'string',
        minLength: 1,
        description: 'Opaque run locator returned by Foreman MCP structured content. Preferred follow-up locator.',
    },
    run_dir: {
        type: 'string',
        minLength: 1,
        description: 'Absolute path to the persisted .foreman/runs/<run-id> directory for this run.',
    },
    cwd: {
        type: 'string',
        minLength: 1,
        description: 'Optional working directory whose .foreman state should be inspected. Used with legacy run_id lookup and must match any supplied run_ref or run_dir.',
    },
};
const FOREMAN_STATUS_TOOL = {
    name: 'foreman_status',
    description: 'Read-only Foreman run visibility for an explicit run locator using persisted Foreman state only. Does not invoke Codex or mutate workflow state.',
    inputSchema: {
        type: 'object',
        properties: FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
        additionalProperties: false,
    },
};
const FOREMAN_ACTIVITY_TOOL = {
    name: 'foreman_activity',
    description: 'Read-only consolidated Foreman activity view for an explicit run locator using persisted status, orchestration attempt, and delegation artifacts only. Does not invoke Codex or mutate workflow state.',
    inputSchema: {
        type: 'object',
        properties: FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
        additionalProperties: false,
    },
};
const FOREMAN_SERVER_IDENTITY_TOOL = {
    name: 'foreman_server_identity',
    description: 'Read-only MCP session identity surface for the currently attached Foreman server process. Returns the active session, build, entrypoint, and shared config path so operators can confirm which rebuilt MCP instance Codex CLI is currently attached to.',
    inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
    },
};
const FOREMAN_RECOMMEND_ENTRY_TOOL = {
    name: 'foreman_recommend_entry',
    description: 'Read-only recommendation for whether a new request should enter Foreman through start or plan. Does not invoke Codex and does not create a run.',
    inputSchema: {
        type: 'object',
        properties: {
            request: {
                type: 'string',
                minLength: 1,
                description: 'Operator request text to classify into a bounded Foreman entry recommendation.',
            },
            cwd: {
                type: 'string',
                minLength: 1,
                description: 'Optional working directory whose path should be reflected in the recommendation. Defaults to the MCP server process cwd.',
            },
        },
        required: ['request'],
        additionalProperties: false,
    },
};
const FOREMAN_AUTO_ENTRY_TOOL = {
    name: 'foreman_auto_entry',
    description: 'Opt-in bounded Foreman-first entry for a fresh request. Reads shared entry policy, recommends start or plan, and creates a run only when the current policy mode allows automatic entry on this explicit surface.',
    inputSchema: {
        type: 'object',
        properties: {
            request: {
                type: 'string',
                minLength: 1,
                description: 'Operator request text to route through the bounded Foreman-first auto-entry surface.',
            },
            codex_bin: {
                type: 'string',
                minLength: 1,
                description: 'Optional Codex executable path. Defaults to codex and is only used if the planner branch is selected.',
            },
            cwd: {
                type: 'string',
                minLength: 1,
                description: 'Optional working directory whose path should be used for the new run. Defaults to the MCP server process cwd.',
            },
        },
        required: ['request'],
        additionalProperties: false,
    },
};
const FOREMAN_START_TOOL = {
    name: 'foreman_start',
    description: 'Mutating local Foreman bootstrap for a new run using operator-supplied scoped task inputs only. Persists Foreman state locally and does not invoke Codex.',
    inputSchema: {
        type: 'object',
        properties: {
            goal: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied goal for the new Foreman run.',
            },
            title: {
                type: 'string',
                minLength: 1,
                description: 'Scoped task-card title for the initial execution-ready task.',
            },
            intent: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied intent for the initial task-card.',
            },
            scope: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied scope for the initial task-card.',
            },
            acceptance: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied acceptance criteria for the initial task-card.',
            },
            prompt: {
                type: 'string',
                minLength: 1,
                description: 'Execution prompt to persist for a later explicit advance or run step.',
            },
            cwd: {
                type: 'string',
                minLength: 1,
                description: 'Optional working directory where Foreman should persist the new .foreman run state. Defaults to the MCP server process cwd.',
            },
        },
        required: ['goal', 'title', 'intent', 'scope', 'acceptance', 'prompt'],
        additionalProperties: false,
    },
};
const FOREMAN_RUN_TOOL = {
    name: 'foreman_run',
    description: 'Single-call MCP front door for a new Foreman run using operator-supplied scoped task inputs plus codex_bin. Creates the run and immediately advances it through the existing bounded start+advance flow.',
    inputSchema: {
        type: 'object',
        properties: {
            goal: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied goal for the new Foreman run.',
            },
            title: {
                type: 'string',
                minLength: 1,
                description: 'Scoped task-card title for the initial execution-ready task.',
            },
            intent: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied intent for the initial task-card.',
            },
            scope: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied scope for the initial task-card.',
            },
            acceptance: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied acceptance criteria for the initial task-card.',
            },
            prompt: {
                type: 'string',
                minLength: 1,
                description: 'Execution prompt that will be created and advanced in one bounded call.',
            },
            codex_bin: {
                type: 'string',
                minLength: 1,
                description: 'Explicit Codex executable path required for the bounded start+advance flow.',
            },
            cwd: {
                type: 'string',
                minLength: 1,
                description: 'Optional working directory where Foreman should persist the new .foreman run state. Defaults to the MCP server process cwd.',
            },
        },
        required: ['goal', 'title', 'intent', 'scope', 'acceptance', 'prompt', 'codex_bin'],
        additionalProperties: false,
    },
};
const FOREMAN_DELEGATIONS_TOOL = {
    name: 'foreman_delegations',
    description: 'Read-only detailed delegation inspection for an explicit Foreman run locator using persisted delegation artifacts only. Does not invoke Codex or mutate workflow state.',
    inputSchema: {
        type: 'object',
        properties: FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
        additionalProperties: false,
    },
};
const FOREMAN_DELEGATE_TOOL = {
    name: 'foreman_delegate',
    description: 'Declaration-only delegation boundary for an existing Foreman run. Persists one queued delegation plus parent visibility sync without starting child execution.',
    inputSchema: {
        type: 'object',
        properties: {
            ...FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
            summary: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied delegation summary to persist with the declaration.',
            },
            child_agent_id: {
                type: 'string',
                minLength: 1,
                description: 'Child agent identifier to declare for this queued delegation.',
            },
        },
        required: ['summary', 'child_agent_id'],
        additionalProperties: false,
    },
};
const FOREMAN_UPDATE_DELEGATION_TOOL = {
    name: 'foreman_update_delegation',
    description: 'Bounded lifecycle update for an existing delegation artifact. Updates one existing child delegation status and syncs parent visibility without starting child execution.',
    inputSchema: {
        type: 'object',
        properties: {
            ...FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
            delegation_id: {
                type: 'string',
                minLength: 1,
                description: 'Existing delegation artifact identifier to update.',
            },
            status: {
                type: 'string',
                enum: ['running', 'completed', 'failed', 'cancelled'],
                description: 'Target child delegation lifecycle status for this bounded checkpoint.',
            },
            result_summary: {
                type: 'string',
                minLength: 1,
                description: 'Required for completed, failed, and cancelled transitions.',
            },
            failure_stage: {
                type: 'string',
                enum: constants_1.WORKFLOW_STAGES,
                description: 'Required only for failed transitions.',
            },
            failure_reason: {
                type: 'string',
                enum: constants_1.FAILURE_REASONS,
                description: 'Required only for failed transitions.',
            },
            failure_summary: {
                type: 'string',
                minLength: 1,
                description: 'Required only for failed transitions.',
            },
        },
        required: ['delegation_id', 'status'],
        additionalProperties: false,
    },
};
const FOREMAN_ORCHESTRATE_TOOL = {
    name: 'foreman_orchestrate',
    description: 'Thin MCP front door for an existing Foreman run locator. Reads the persisted orchestrator decision, dispatches the matching existing workflow command, and can optionally continue one additional bounded step only for the straight-line execute_task -> verify_task slice while still stopping at manual, task, or terminal boundaries.',
    inputSchema: {
        type: 'object',
        properties: {
            ...FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
            codex_bin: {
                type: 'string',
                minLength: 1,
                description: 'Explicit Codex executable path for routed Codex-backed commands only: execute_task, verify_task, or replan.',
            },
            progression_step_count: {
                type: 'integer',
                minimum: 1,
                maximum: 2,
                description: 'Optional bounded progression step count for this Milestone 5 slice. Omit to preserve the current single-step foreman_orchestrate behavior; set to 2 only for the straight-line execute_task -> verify_task slice to allow at most one additional bounded step on the same task.',
            },
            fast_mode: {
                type: 'boolean',
                description: 'Optional request-time alias for the existing bounded progression slice only. Set fast_mode=true to request the same effective two-step execute_task -> verify_task progression as progression_step_count=2, or fast_mode=false to keep the single-step behavior.',
            },
            repair_action: {
                type: 'string',
                enum: ['retry', 'replan'],
                description: 'Explicit repair choice required only when the persisted decision is await_repair_decision.',
            },
            replan_prompt: {
                type: 'string',
                minLength: 1,
                description: 'Operator-supplied repair planning prompt required only when repair_action is replan.',
            },
            resolve_outcome: {
                type: 'string',
                enum: ['passed', 'needs_work', 'blocked'],
                description: 'Explicit verification outcome required only when the persisted decision is await_verification.',
            },
            resolve_summary: {
                type: 'string',
                minLength: 1,
                description: 'Explicit verification summary required only when the persisted decision is await_verification.',
            },
        },
        additionalProperties: false,
    },
};
const FOREMAN_ALWAYS_ON_TICK_TOOL = {
    name: 'foreman_always_on_tick',
    description: 'Bounded MCP front door for the persisted always-on companion executor. Requires the run locator to have opt-in always-on mode enabled, then inspects persisted state and dispatches only the next bounded explicit step slice.',
    inputSchema: {
        type: 'object',
        properties: {
            ...FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
            codex_bin: {
                type: 'string',
                minLength: 1,
                description: 'Explicit Codex executable path required only when the bounded companion tick dispatches Codex-backed work.',
            },
            max_steps: {
                type: 'integer',
                minimum: 1,
                maximum: 4,
                description: 'Optional bounded step count for one companion tick. Omit to preserve the current default of 2.',
            },
        },
        additionalProperties: false,
    },
};
const FOREMAN_ALWAYS_ON_LOOP_TOOL = {
    name: 'foreman_always_on_loop',
    description: 'Explicit bounded external companion loop over the persisted always-on tick. Requires a run locator with opt-in always-on mode, repeatedly invokes the bounded tick with backoff, and stops at manual, terminal, disable, or explicit iteration-cap boundaries.',
    inputSchema: {
        type: 'object',
        properties: {
            ...FOREMAN_RUN_LOCATOR_SCHEMA_PROPERTIES,
            codex_bin: {
                type: 'string',
                minLength: 1,
                description: 'Explicit Codex executable path required only when bounded loop ticks dispatch Codex-backed work.',
            },
            max_steps: {
                type: 'integer',
                minimum: 1,
                maximum: 4,
                description: 'Optional bounded step count for each companion tick. Omit to preserve the current default of 2.',
            },
            max_iterations: {
                type: 'integer',
                minimum: 1,
                maximum: 32,
                description: 'Optional explicit iteration cap for one loop invocation.',
            },
            backoff_ms: {
                type: 'integer',
                minimum: 250,
                maximum: 30000,
                description: 'Optional base backoff in milliseconds between loop iterations.',
            },
            max_backoff_ms: {
                type: 'integer',
                minimum: 250,
                maximum: 30000,
                description: 'Optional backoff ceiling in milliseconds for idle loop retries.',
            },
        },
        additionalProperties: false,
    },
};
const FOREMAN_TOOLS = [
    FOREMAN_SERVER_IDENTITY_TOOL,
    FOREMAN_STATUS_TOOL,
    FOREMAN_ACTIVITY_TOOL,
    FOREMAN_RECOMMEND_ENTRY_TOOL,
    FOREMAN_AUTO_ENTRY_TOOL,
    FOREMAN_START_TOOL,
    FOREMAN_RUN_TOOL,
    FOREMAN_DELEGATIONS_TOOL,
    FOREMAN_DELEGATE_TOOL,
    FOREMAN_UPDATE_DELEGATION_TOOL,
    FOREMAN_ORCHESTRATE_TOOL,
    FOREMAN_ALWAYS_ON_TICK_TOOL,
    FOREMAN_ALWAYS_ON_LOOP_TOOL,
];
const MCP_SERVER_NOT_READY_ERROR = -32002;
const MCP_MUTATION_LEASE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MCP_SESSION_CONTEXT = {
    session_id: `mcp-session-${(0, node_crypto_1.randomUUID)()}`,
    process_id: typeof process.pid === 'number' && Number.isInteger(process.pid) && process.pid > 0 ? process.pid : null,
    started_at: (0, runtime_1.nowTimestamp)(),
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function createMcpSessionContext() {
    return {
        session_id: `mcp-session-${(0, node_crypto_1.randomUUID)()}`,
        process_id: typeof process.pid === 'number' && Number.isInteger(process.pid) && process.pid > 0 ? process.pid : null,
        started_at: (0, runtime_1.nowTimestamp)(),
    };
}
function createMcpMutationLeaseFilePath(cwd, runId) {
    return node_path_1.default.join((0, runtime_1.createRunPaths)(cwd, runId).runDir, 'mcp-mutation-lease.json');
}
async function readJsonFile(filePath) {
    const content = await (0, promises_1.readFile)(filePath, 'utf8');
    return JSON.parse(content);
}
async function writeJsonFile(filePath, value) {
    await (0, promises_1.writeFile)(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function parseFiniteInteger(value) {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}
function isExpiredIsoTimestamp(timestamp, nowIsoTimestamp) {
    const expiresAtMs = Date.parse(timestamp);
    const nowMs = Date.parse(nowIsoTimestamp);
    if (Number.isNaN(expiresAtMs) || Number.isNaN(nowMs)) {
        return true;
    }
    return expiresAtMs <= nowMs;
}
function createForemanMcpMutationLeaseRecord(input) {
    return {
        version: 1,
        run_id: input.runId,
        owner_session_id: input.sessionContext.session_id,
        owner_process_id: input.sessionContext.process_id,
        owner_started_at: input.sessionContext.started_at,
        acquired_at: input.timestamp,
        updated_at: input.timestamp,
        expires_at: new Date(Date.parse(input.timestamp) + MCP_MUTATION_LEASE_TTL_MS).toISOString(),
        last_mutating_tool: input.toolName,
    };
}
function assertValidForemanMcpMutationLeaseRecord(value) {
    if (!isRecord(value) ||
        value.version !== 1 ||
        typeof value.run_id !== 'string' ||
        value.run_id.trim().length === 0 ||
        typeof value.owner_session_id !== 'string' ||
        value.owner_session_id.trim().length === 0 ||
        (value.owner_process_id !== null && parseFiniteInteger(value.owner_process_id) === null) ||
        typeof value.owner_started_at !== 'string' ||
        typeof value.acquired_at !== 'string' ||
        typeof value.updated_at !== 'string' ||
        typeof value.expires_at !== 'string' ||
        ![
            'foreman_delegate',
            'foreman_update_delegation',
            'foreman_orchestrate',
            'foreman_always_on_tick',
            'foreman_always_on_loop',
            'advance',
            'continue',
            'verify',
            'retry',
            'replan',
            'resolve',
            'always_on_start',
            'always_on_stop',
            'always_on_tick',
            'always_on_loop',
        ].includes(String(value.last_mutating_tool))) {
        throw new Error('Foreman MCP mutation lease record is invalid.');
    }
}
async function loadForemanMcpMutationLeaseRecord(cwd, runId) {
    const leaseFilePath = createMcpMutationLeaseFilePath(cwd, runId);
    let candidate;
    try {
        candidate = await readJsonFile(leaseFilePath);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return null;
        }
        throw new Error(`Unable to load Foreman MCP mutation lease from ${leaseFilePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
    try {
        assertValidForemanMcpMutationLeaseRecord(candidate);
    }
    catch (error) {
        throw new Error(`Foreman MCP mutation lease at ${leaseFilePath} is invalid: ${error instanceof Error ? error.message : 'Unknown validation error.'}`);
    }
    if (candidate.run_id !== runId) {
        throw new Error(`Foreman MCP mutation lease at ${leaseFilePath} belongs to run ${candidate.run_id}, not ${runId}.`);
    }
    return candidate;
}
async function createForemanMcpMutationLeaseRecordIfAbsent(cwd, runId, record) {
    const leaseFilePath = createMcpMutationLeaseFilePath(cwd, runId);
    try {
        const handle = await (0, promises_1.open)(leaseFilePath, 'wx');
        try {
            await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
        }
        finally {
            await handle.close();
        }
        return true;
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'EEXIST') {
            return false;
        }
        throw new Error(`Unable to create Foreman MCP mutation lease at ${leaseFilePath}: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    }
}
async function persistForemanMcpMutationLeaseRecord(cwd, runId, record) {
    await writeJsonFile(createMcpMutationLeaseFilePath(cwd, runId), record);
}
function describeForemanMcpMutationLeaseConflict(record, runId) {
    const ownerProcess = record.owner_process_id === null ? 'unknown pid' : `pid ${record.owner_process_id}`;
    return (`Run ${runId} is currently bound to MCP session ${record.owner_session_id} (${ownerProcess}) ` +
        `through ${record.last_mutating_tool} until ${record.expires_at}. ` +
        'Retry from the same Codex CLI session or wait for that lease to expire before mutating this run.');
}
function isActiveOwnerProcessId(processId) {
    if (processId === null || !Number.isInteger(processId) || processId <= 0) {
        return null;
    }
    try {
        process.kill(processId, 0);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ESRCH') {
            return false;
        }
        return true;
    }
}
async function acquireForemanMcpMutationLease(input) {
    const timestamp = (0, runtime_1.nowTimestamp)();
    const requestedRecord = createForemanMcpMutationLeaseRecord({
        runId: input.runId,
        sessionContext: input.sessionContext,
        toolName: input.toolName,
        timestamp,
    });
    const currentRecord = await loadForemanMcpMutationLeaseRecord(input.cwd, input.runId);
    if (currentRecord === null) {
        const created = await createForemanMcpMutationLeaseRecordIfAbsent(input.cwd, input.runId, requestedRecord);
        if (created) {
            return requestedRecord;
        }
        const racedRecord = await loadForemanMcpMutationLeaseRecord(input.cwd, input.runId);
        if (racedRecord === null) {
            throw new Error(`Foreman MCP mutation lease for run ${input.runId} vanished during acquisition.`);
        }
        if (racedRecord.owner_session_id !== input.sessionContext.session_id && !isExpiredIsoTimestamp(racedRecord.expires_at, timestamp)) {
            throw new Error(describeForemanMcpMutationLeaseConflict(racedRecord, input.runId));
        }
        await persistForemanMcpMutationLeaseRecord(input.cwd, input.runId, requestedRecord);
        return requestedRecord;
    }
    if (currentRecord.owner_session_id === input.sessionContext.session_id) {
        const refreshedRecord = {
            ...currentRecord,
            owner_process_id: input.sessionContext.process_id,
            owner_started_at: input.sessionContext.started_at,
            updated_at: timestamp,
            expires_at: requestedRecord.expires_at,
            last_mutating_tool: input.toolName,
        };
        await persistForemanMcpMutationLeaseRecord(input.cwd, input.runId, refreshedRecord);
        return refreshedRecord;
    }
    const ownerProcessActive = isActiveOwnerProcessId(currentRecord.owner_process_id);
    if (ownerProcessActive !== false && !isExpiredIsoTimestamp(currentRecord.expires_at, timestamp)) {
        throw new Error(describeForemanMcpMutationLeaseConflict(currentRecord, input.runId));
    }
    await persistForemanMcpMutationLeaseRecord(input.cwd, input.runId, requestedRecord);
    return requestedRecord;
}
function createForemanMcpMutationLeaseView(sessionContext, leaseRecord) {
    if (leaseRecord === null) {
        return {
            current_session_id: sessionContext.session_id,
            current_process_id: sessionContext.process_id,
            current_session_started_at: sessionContext.started_at,
            state: 'unowned',
            owner_session_id: null,
            owner_process_id: null,
            owner_started_at: null,
            acquired_at: null,
            updated_at: null,
            expires_at: null,
            last_mutating_tool: null,
            summary: 'No MCP session currently holds the run mutation lease.',
        };
    }
    const state = leaseRecord.owner_session_id === sessionContext.session_id ? 'held_by_current_session' : 'held_by_other_session';
    const ownerProcess = leaseRecord.owner_process_id === null ? 'unknown pid' : `pid ${leaseRecord.owner_process_id}`;
    const ownerLead = state === 'held_by_current_session' ? 'This MCP session currently holds' : `Another MCP session currently holds`;
    return {
        current_session_id: sessionContext.session_id,
        current_process_id: sessionContext.process_id,
        current_session_started_at: sessionContext.started_at,
        state,
        owner_session_id: leaseRecord.owner_session_id,
        owner_process_id: leaseRecord.owner_process_id,
        owner_started_at: leaseRecord.owner_started_at,
        acquired_at: leaseRecord.acquired_at,
        updated_at: leaseRecord.updated_at,
        expires_at: leaseRecord.expires_at,
        last_mutating_tool: leaseRecord.last_mutating_tool,
        summary: `${ownerLead} the run mutation lease as ${leaseRecord.owner_session_id} (${ownerProcess}) ` +
            `through ${leaseRecord.last_mutating_tool} until ${leaseRecord.expires_at}.`,
    };
}
function hasRequestId(request) {
    return 'id' in request;
}
function createSuccessResponse(id, result) {
    return {
        jsonrpc: JSON_RPC_VERSION,
        id,
        result,
    };
}
function createErrorResponse(id, code, message) {
    return {
        jsonrpc: JSON_RPC_VERSION,
        id,
        error: {
            code,
            message,
        },
    };
}
function isSuccessResponse(response) {
    return 'result' in response;
}
function assertJsonRpcRequest(value) {
    if (!isRecord(value) || value.jsonrpc !== JSON_RPC_VERSION || typeof value.method !== 'string') {
        throw new Error('Received an invalid JSON-RPC request envelope.');
    }
}
function readRequiredString(record, key) {
    const value = record[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Expected ${key} to be a non-empty string.`);
    }
    return value;
}
function readOptionalString(record, key) {
    const value = record[key];
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Expected ${key} to be a non-empty string when provided.`);
    }
    return value;
}
function readOptionalEnum(record, key, allowedValues) {
    const value = record[key];
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || !allowedValues.includes(value)) {
        throw new Error(`Expected ${key} to be one of: ${allowedValues.join(', ')}.`);
    }
    return value;
}
function readOptionalIntegerInRange(record, key, minimum, maximum) {
    const value = record[key];
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`Expected ${key} to be an integer between ${minimum} and ${maximum}.`);
    }
    return value;
}
function readOptionalBoolean(record, key) {
    const value = record[key];
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'boolean') {
        throw new Error(`Expected ${key} to be a boolean when provided.`);
    }
    return value;
}
function resolveCwd(cwd) {
    return node_path_1.default.resolve(cwd ?? process.cwd());
}
function readOptionalRunLocatorString(value, key) {
    return readOptionalString(value, key);
}
function parseRunLocatorArguments(value, toolName) {
    const runId = readOptionalRunLocatorString(value, 'run_id');
    const runRef = readOptionalRunLocatorString(value, 'run_ref');
    const runDir = readOptionalRunLocatorString(value, 'run_dir');
    const cwd = readOptionalString(value, 'cwd');
    if (!runId && !runRef && !runDir) {
        throw new Error(`${toolName} requires one of run_id, run_ref, or run_dir.`);
    }
    return {
        run_id: runId,
        run_ref: runRef,
        run_dir: runDir,
        cwd,
    };
}
function parseForemanStatusArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_status arguments must be an object.');
    }
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_status argument: ${key}.`);
        }
    }
    return parseRunLocatorArguments(value, 'foreman_status');
}
function parseForemanActivityArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_activity arguments must be an object.');
    }
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_activity argument: ${key}.`);
        }
    }
    return parseRunLocatorArguments(value, 'foreman_activity');
}
function parseForemanRecommendEntryArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_recommend_entry arguments must be an object.');
    }
    const request = readRequiredString(value, 'request');
    const cwd = readOptionalString(value, 'cwd');
    for (const key of Object.keys(value)) {
        if (key !== 'request' && key !== 'cwd') {
            throw new Error(`Unexpected foreman_recommend_entry argument: ${key}.`);
        }
    }
    return {
        request,
        cwd,
    };
}
function parseForemanAutoEntryArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_auto_entry arguments must be an object.');
    }
    const request = readRequiredString(value, 'request');
    const codexBin = readOptionalString(value, 'codex_bin');
    const cwd = readOptionalString(value, 'cwd');
    for (const key of Object.keys(value)) {
        if (key !== 'request' && key !== 'codex_bin' && key !== 'cwd') {
            throw new Error(`Unexpected foreman_auto_entry argument: ${key}.`);
        }
    }
    return {
        request,
        codex_bin: codexBin,
        cwd,
    };
}
function parseForemanStartArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_start arguments must be an object.');
    }
    const goal = readRequiredString(value, 'goal');
    const title = readRequiredString(value, 'title');
    const intent = readRequiredString(value, 'intent');
    const scope = readRequiredString(value, 'scope');
    const acceptance = readRequiredString(value, 'acceptance');
    const prompt = readRequiredString(value, 'prompt');
    const cwd = readOptionalString(value, 'cwd');
    for (const key of Object.keys(value)) {
        if (!['goal', 'title', 'intent', 'scope', 'acceptance', 'prompt', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_start argument: ${key}.`);
        }
    }
    return {
        goal,
        title,
        intent,
        scope,
        acceptance,
        prompt,
        cwd,
    };
}
function parseForemanRunArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_run arguments must be an object.');
    }
    const goal = readRequiredString(value, 'goal');
    const title = readRequiredString(value, 'title');
    const intent = readRequiredString(value, 'intent');
    const scope = readRequiredString(value, 'scope');
    const acceptance = readRequiredString(value, 'acceptance');
    const prompt = readRequiredString(value, 'prompt');
    const codexBin = readRequiredString(value, 'codex_bin');
    const cwd = readOptionalString(value, 'cwd');
    for (const key of Object.keys(value)) {
        if (!['goal', 'title', 'intent', 'scope', 'acceptance', 'prompt', 'codex_bin', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_run argument: ${key}.`);
        }
    }
    return {
        goal,
        title,
        intent,
        scope,
        acceptance,
        prompt,
        codex_bin: codexBin,
        cwd,
    };
}
function parseForemanDelegationsArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_delegations arguments must be an object.');
    }
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_delegations argument: ${key}.`);
        }
    }
    return parseRunLocatorArguments(value, 'foreman_delegations');
}
function parseForemanDelegateArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_delegate arguments must be an object.');
    }
    const summary = readRequiredString(value, 'summary');
    const childAgentId = readRequiredString(value, 'child_agent_id');
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'summary', 'child_agent_id', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_delegate argument: ${key}.`);
        }
    }
    return {
        ...parseRunLocatorArguments(value, 'foreman_delegate'),
        summary,
        child_agent_id: childAgentId,
    };
}
function parseForemanUpdateDelegationArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_update_delegation arguments must be an object.');
    }
    const delegationId = readRequiredString(value, 'delegation_id');
    const status = readOptionalEnum(value, 'status', constants_1.CHILD_AGENT_STATUSES.filter((candidate) => candidate !== 'queued'));
    const resultSummary = readOptionalString(value, 'result_summary');
    const failureStage = readOptionalEnum(value, 'failure_stage', constants_1.WORKFLOW_STAGES);
    const failureReason = readOptionalEnum(value, 'failure_reason', constants_1.FAILURE_REASONS);
    const failureSummary = readOptionalString(value, 'failure_summary');
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'delegation_id', 'status', 'result_summary', 'failure_stage', 'failure_reason', 'failure_summary', 'cwd'].includes(key)) {
            throw new Error(`Unexpected foreman_update_delegation argument: ${key}.`);
        }
    }
    if (!status) {
        throw new Error('Expected status to be one of: running, completed, failed, cancelled.');
    }
    return {
        ...parseRunLocatorArguments(value, 'foreman_update_delegation'),
        delegation_id: delegationId,
        status,
        result_summary: resultSummary,
        failure_stage: failureStage,
        failure_reason: failureReason,
        failure_summary: failureSummary,
    };
}
function parseForemanOrchestrateArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_orchestrate arguments must be an object.');
    }
    const codexBin = readOptionalString(value, 'codex_bin');
    const progressionStepCount = readOptionalIntegerInRange(value, 'progression_step_count', 1, 2);
    const fastMode = readOptionalBoolean(value, 'fast_mode');
    const repairAction = readOptionalEnum(value, 'repair_action', ['retry', 'replan']);
    const replanPrompt = readOptionalString(value, 'replan_prompt');
    const resolveOutcome = readOptionalEnum(value, 'resolve_outcome', ['passed', 'needs_work', 'blocked']);
    const resolveSummary = readOptionalString(value, 'resolve_summary');
    for (const key of Object.keys(value)) {
        if (![
            'run_id',
            'run_ref',
            'run_dir',
            'cwd',
            'codex_bin',
            'progression_step_count',
            'fast_mode',
            'repair_action',
            'replan_prompt',
            'resolve_outcome',
            'resolve_summary',
        ].includes(key)) {
            throw new Error(`Unexpected foreman_orchestrate argument: ${key}.`);
        }
    }
    return {
        ...parseRunLocatorArguments(value, 'foreman_orchestrate'),
        codex_bin: codexBin,
        progression_step_count: progressionStepCount,
        fast_mode: fastMode,
        repair_action: repairAction,
        replan_prompt: replanPrompt,
        resolve_outcome: resolveOutcome,
        resolve_summary: resolveSummary,
    };
}
function parseForemanAlwaysOnTickArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_always_on_tick arguments must be an object.');
    }
    const codexBin = readOptionalString(value, 'codex_bin');
    const maxSteps = readOptionalIntegerInRange(value, 'max_steps', 1, 4);
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'cwd', 'codex_bin', 'max_steps'].includes(key)) {
            throw new Error(`Unexpected foreman_always_on_tick argument: ${key}.`);
        }
    }
    return {
        ...parseRunLocatorArguments(value, 'foreman_always_on_tick'),
        codex_bin: codexBin,
        max_steps: maxSteps,
    };
}
function parseForemanAlwaysOnLoopArguments(value) {
    if (!isRecord(value)) {
        throw new Error('foreman_always_on_loop arguments must be an object.');
    }
    const codexBin = readOptionalString(value, 'codex_bin');
    const maxSteps = readOptionalIntegerInRange(value, 'max_steps', 1, 4);
    const maxIterations = readOptionalIntegerInRange(value, 'max_iterations', 1, 32);
    const backoffMs = readOptionalIntegerInRange(value, 'backoff_ms', 250, 30000);
    const maxBackoffMs = readOptionalIntegerInRange(value, 'max_backoff_ms', 250, 30000);
    for (const key of Object.keys(value)) {
        if (!['run_id', 'run_ref', 'run_dir', 'cwd', 'codex_bin', 'max_steps', 'max_iterations', 'backoff_ms', 'max_backoff_ms'].includes(key)) {
            throw new Error(`Unexpected foreman_always_on_loop argument: ${key}.`);
        }
    }
    return {
        ...parseRunLocatorArguments(value, 'foreman_always_on_loop'),
        codex_bin: codexBin,
        max_steps: maxSteps,
        max_iterations: maxIterations,
        backoff_ms: backoffMs,
        max_backoff_ms: maxBackoffMs,
    };
}
function negotiateProtocolVersion(value) {
    if (typeof value === 'string' && SUPPORTED_MCP_PROTOCOL_VERSIONS.has(value)) {
        return value;
    }
    return MCP_PROTOCOL_VERSION;
}
function assertConfinedRunId(runId) {
    if (runId === '.' ||
        runId === '..' ||
        node_path_1.default.posix.isAbsolute(runId) ||
        node_path_1.default.win32.isAbsolute(runId) ||
        runId.includes(node_path_1.default.posix.sep) ||
        runId.includes(node_path_1.default.win32.sep)) {
        throw new Error('run_id must be a single confined path segment under .foreman/runs/.');
    }
}
function createResolvedForemanRunLocator(cwd, runId) {
    const runPaths = (0, runtime_1.createRunPaths)(cwd, runId);
    return {
        cwd,
        run_id: runId,
        run_directory: runPaths.runDir,
        run_ref: (0, runtime_1.createForemanRunRef)(runPaths.runDir),
        run_paths: runPaths,
    };
}
function assertMatchingRunLocator(previous, next, sourceLabel) {
    if (previous.cwd !== next.cwd ||
        previous.run_id !== next.run_id ||
        previous.run_directory !== next.run_directory) {
        throw new Error(`Run locator mismatch: ${sourceLabel} resolves to ${next.run_directory} but the earlier locator resolves to ${previous.run_directory}.`);
    }
}
function resolveForemanRunLocator(input) {
    let resolved = null;
    if (input.run_id) {
        assertConfinedRunId(input.run_id);
        resolved = createResolvedForemanRunLocator(resolveCwd(input.cwd), input.run_id);
    }
    if (input.run_dir) {
        const runDirectoryLocator = (0, runtime_1.resolveForemanRunDirectory)(input.run_dir);
        assertConfinedRunId(runDirectoryLocator.runId);
        const candidate = createResolvedForemanRunLocator(runDirectoryLocator.cwd, runDirectoryLocator.runId);
        if (resolved === null) {
            resolved = candidate;
        }
        else {
            assertMatchingRunLocator(resolved, candidate, 'run_dir');
        }
    }
    if (input.run_ref) {
        const runRefLocator = (0, runtime_1.resolveForemanRunRef)(input.run_ref);
        assertConfinedRunId(runRefLocator.runId);
        const candidate = createResolvedForemanRunLocator(runRefLocator.cwd, runRefLocator.runId);
        if (resolved === null) {
            resolved = candidate;
        }
        else {
            assertMatchingRunLocator(resolved, candidate, 'run_ref');
        }
    }
    if (resolved === null) {
        throw new Error('Expected one of run_id, run_ref, or run_dir.');
    }
    if (!input.run_id && input.cwd) {
        const hintedCwd = resolveCwd(input.cwd);
        if (hintedCwd !== resolved.cwd) {
            throw new Error(`Run locator mismatch: cwd ${hintedCwd} does not match the resolved run workspace ${resolved.cwd}.`);
        }
    }
    return resolved;
}
function getRosterNameForRole(role, foremanConfig) {
    if (foremanConfig) {
        return (0, runtime_1.getForemanAgentConfigForRole)(foremanConfig, role).name;
    }
    switch (role) {
        case 'orchestrator':
            return constants_1.FOREMAN_AGENT_ROSTER.orchestrator;
        case 'planner':
            return constants_1.FOREMAN_AGENT_ROSTER.planner;
        case 'explorer':
            return constants_1.FOREMAN_AGENT_ROSTER.explorer;
        case 'code specialist':
            return constants_1.FOREMAN_AGENT_ROSTER.codeSpecialist;
        case 'verifier':
            return constants_1.FOREMAN_AGENT_ROSTER.verifier;
    }
}
function createReadableAgentContext(role, agentId, foremanConfig) {
    const rosterName = getRosterNameForRole(role, foremanConfig);
    return {
        role,
        roster_name: rosterName,
        agent_id: agentId,
        display_name: agentId === null || agentId === rosterName ? rosterName : `${rosterName} ${agentId}`,
    };
}
function createReadableTaskContext(taskCard) {
    return {
        task_card_id: taskCard.task_card_id,
        title: taskCard.title,
        display_name: taskCard.title,
    };
}
function extractResolvedRequestSettings(configEntries) {
    let model = null;
    let variant = null;
    const passthroughEntries = [];
    for (const entry of configEntries) {
        if (entry.startsWith('model=')) {
            model = entry.slice('model='.length) || null;
            continue;
        }
        if (entry.startsWith('model_reasoning_effort=')) {
            const candidate = entry.slice('model_reasoning_effort='.length);
            if (candidate === 'low' || candidate === 'medium' || candidate === 'high' || candidate === 'xhigh') {
                variant = candidate;
                continue;
            }
        }
        passthroughEntries.push(entry);
    }
    return {
        model,
        variant,
        config_entries: passthroughEntries,
    };
}
function createTaskCardAgentConfigSummary(role, foremanConfig) {
    const agentConfig = (0, runtime_1.getForemanAgentConfigForRole)(foremanConfig, role);
    return {
        role,
        roster_name: agentConfig.name,
        profile: agentConfig.profile,
        model: agentConfig.model,
        variant: agentConfig.variant,
        config_entries: [...agentConfig.config_entries],
    };
}
function createRolePlaybookContractView(role, agentConfigSummary, preferredAgentId) {
    const contract = (0, helper_agents_1.maybeGetSpecialistRolePlaybookContract)(role, preferredAgentId ?? agentConfigSummary?.roster_name ?? null);
    if (contract === null) {
        return null;
    }
    return {
        catalog_source: contract.catalog_source,
        contract_source: contract.contract_source,
        role: contract.role,
        roster_name: agentConfigSummary?.roster_name ?? contract.roster_name,
        configured_model: agentConfigSummary?.model ?? contract.default_model,
        configured_variant: agentConfigSummary?.variant ?? contract.default_reasoning_effort,
        codex_custom_agent: contract.codex_custom_agent,
        purpose: contract.purpose,
        strengths: [...contract.strengths],
        playbook_source: contract.playbook_source,
        playbook_bundle: [...contract.playbook_bundle],
        wrapper_doc_path: contract.wrapper_doc_path,
        wrapper_summary: contract.wrapper_summary,
        result_contract_fields: [...contract.result_contract_fields],
        result_contract_summary: contract.result_contract_summary,
        input_task_kinds: [...contract.input_task_kinds],
        input_required_fields: [...contract.input_required_fields],
        prompt_contract_sections: [...contract.prompt_contract_sections],
        acceptance_status_values: [...contract.acceptance_status_values],
        contract_summary: contract.contract_summary,
        contract_validation_state: contract.contract_validation_state,
        contract_validation_summary: contract.contract_validation_summary,
        adapter_layer: contract.adapter_layer,
        upstream_interception_claim: contract.upstream_interception_claim,
    };
}
function createSpecialistRoleRosterView(foremanConfig) {
    return (0, helper_agents_1.listSpecialistRolePlaybookContracts)().map((contract) => createRolePlaybookContractView(contract.role, createTaskCardAgentConfigSummary(contract.role, foremanConfig), contract.roster_name)).filter((entry) => entry !== null);
}
function createSpecialistContractSummary(input) {
    const contract = input.taskCard.owner_role === 'verifier' ? input.ownerRolePlaybook ?? input.assignedRolePlaybook : input.assignedRolePlaybook;
    if (contract === null) {
        return null;
    }
    const playbooks = contract.playbook_bundle.length > 0 ? contract.playbook_bundle.join(', ') : 'none';
    const reviewState = input.taskCard.owner_role === 'verifier' ? input.taskCard.verification_state : 'pending_or_not_started';
    return `role=${contract.role} roster=${contract.roster_name} model=${contract.configured_model ?? 'none'}/${contract.configured_variant ?? 'none'} playbooks=${playbooks} execution=${input.executionProof.proof_state} review=${reviewState} adapter=${contract.adapter_layer} contract_source=${contract.contract_source} contract_state=${contract.contract_validation_state}`;
}
function describeOperatorExecutionMode(currentTaskCard) {
    const proofState = resolveOperatorDisplayProofState(currentTaskCard);
    if (proofState === 'foreman_worker_visible') {
        return 'delegated_worker';
    }
    if (proofState === 'captain_read_only_fallback') {
        return 'captain_read_only_fallback';
    }
    if (proofState === 'host_session_fallback') {
        return 'local_host_fallback';
    }
    return 'planned_assignment_only';
}
function createOperatorSummary(currentTaskCard, guidanceSource) {
    if (currentTaskCard === null) {
        return null;
    }
    const role = resolveOperatorDisplayRole(currentTaskCard);
    const agent = resolveOperatorDisplayAgentName(currentTaskCard);
    const model = resolveCurrentTaskModel(currentTaskCard);
    const variant = resolveCurrentTaskVariant(currentTaskCard);
    const playbookBundle = currentTaskCard.assigned_role_playbook?.playbook_bundle.length
        ? currentTaskCard.assigned_role_playbook.playbook_bundle
        : currentTaskCard.owner_role_playbook?.playbook_bundle ?? [];
    const playbooks = playbookBundle.length > 0 ? playbookBundle.join(', ') : 'none';
    const review = describeOperatorReviewState(currentTaskCard, guidanceSource);
    return `acting=${agent} role=${role} model=${model}/${variant} execution=${describeOperatorExecutionMode(currentTaskCard)} playbooks=${playbooks} review=${review}`;
}
function createOrchestratorRequestSettingsPreview(foremanConfig) {
    const agentConfig = foremanConfig.agents.orchestrator;
    const requestSettings = (0, runtime_1.createRequestSettingsFromForemanAgentConfig)(agentConfig);
    const extracted = extractResolvedRequestSettings(requestSettings.config_entries);
    return {
        source: 'shared_role_config',
        profile: requestSettings.profile,
        model: extracted.model ?? agentConfig.model ?? null,
        variant: extracted.variant ?? agentConfig.variant ?? null,
        config_entries: extracted.config_entries,
    };
}
function createTaskCardResolvedRequestSettings(taskCard, orchestratorState, foremanConfig) {
    const activeRole = taskCard.owner_role;
    const agentConfigSummary = createTaskCardAgentConfigSummary(activeRole, foremanConfig);
    if (activeRole === taskCard.assigned_role) {
        const extracted = extractResolvedRequestSettings(taskCard.role_config_snapshot.config_entries);
        return {
            source: 'role_config_fallback',
            request_kind: 'execution',
            profile: taskCard.role_config_snapshot.profile,
            model: extracted.model ?? taskCard.role_config_snapshot.model ?? agentConfigSummary?.model ?? null,
            variant: extracted.variant ?? taskCard.role_config_snapshot.variant ?? agentConfigSummary?.variant ?? null,
            config_entries: extracted.config_entries,
        };
    }
    if (activeRole === 'code specialist' || activeRole === 'explorer' || activeRole === 'planner') {
        const extracted = extractResolvedRequestSettings(orchestratorState.execution_request.config_entries);
        return {
            source: 'persisted_request',
            request_kind: 'execution',
            profile: orchestratorState.execution_request.profile,
            model: extracted.model ?? agentConfigSummary?.model ?? null,
            variant: extracted.variant ?? agentConfigSummary?.variant ?? null,
            config_entries: extracted.config_entries,
        };
    }
    if (activeRole === 'verifier' && orchestratorState.verification_request !== null) {
        const extracted = extractResolvedRequestSettings(orchestratorState.verification_request.config_entries);
        return {
            source: 'persisted_request',
            request_kind: 'verification',
            profile: orchestratorState.verification_request.profile,
            model: extracted.model ?? agentConfigSummary?.model ?? null,
            variant: extracted.variant ?? agentConfigSummary?.variant ?? null,
            config_entries: extracted.config_entries,
        };
    }
    if (activeRole === 'verifier' && agentConfigSummary !== null) {
        return {
            source: 'role_config_fallback',
            request_kind: 'verification',
            profile: agentConfigSummary.profile,
            model: agentConfigSummary.model,
            variant: agentConfigSummary.variant,
            config_entries: [...agentConfigSummary.config_entries],
        };
    }
    return null;
}
function createCurrentTaskWorkerLinkage(taskCard, taskDelegations) {
    const taskLinkedDelegations = taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id);
    if (taskLinkedDelegations.length === 0) {
        return null;
    }
    const delegationIds = taskLinkedDelegations.map((delegation) => delegation.delegation_id);
    const workerRunIds = Array.from(new Set(taskLinkedDelegations
        .map((delegation) => delegation.worker_result?.thread_id ?? null)
        .filter((threadId) => threadId !== null)));
    return {
        delegation_ids: delegationIds,
        worker_run_ids: workerRunIds,
    };
}
function createCurrentTaskExecutionAssignmentState(taskCard, ownershipChain) {
    switch (taskCard.status) {
        case 'queued':
            return 'planned';
        case 'active':
        case 'in_handoff':
            return ownershipChain?.state === 'planned_only' || ownershipChain?.state === 'assigned_only'
                ? 'planned'
                : 'actively_running';
        case 'completed':
            return 'completed_by';
        case 'blocked':
        case 'failed':
            return 'blocked';
        case 'cancelled':
            return 'cancelled';
        default:
            return 'planned';
    }
}
function selectCurrentTaskModelLaunchEvidence(taskCard, taskDelegations) {
    const taskLinkedDelegationEvidence = taskDelegations
        .filter((delegation) => delegation.task_card_id === taskCard.task_card_id && delegation.worker_launch_evidence)
        .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
        .map((delegation) => delegation.worker_launch_evidence ?? null)
        .find((evidence) => evidence !== null);
    return taskLinkedDelegationEvidence ?? taskCard.latest_model_launch;
}
function createCurrentTaskExecutionProof(input) {
    const model = input.actualModelLaunch?.actual_model ??
        input.actualModelLaunch?.dispatched_model ??
        input.resolvedRequestSettings?.model ??
        input.taskCard.role_config_snapshot.model ??
        input.agentConfigSummary?.model ??
        null;
    const variant = input.actualModelLaunch?.actual_variant ??
        input.actualModelLaunch?.dispatched_variant ??
        input.resolvedRequestSettings?.variant ??
        input.taskCard.role_config_snapshot.variant ??
        input.agentConfigSummary?.variant ??
        null;
    const actualAgentId = input.executionOwner === 'foreman_worker'
        ? input.concreteWorkerId ?? input.taskCard.assigned_agent_id ?? null
        : null;
    const modelSummary = `${model ?? 'none'} / ${variant ?? 'none'}`;
    const proofState = input.ownershipChain?.state === 'planned_only' || input.ownershipChain?.state === 'assigned_only'
        ? 'planned_assignment_only'
        : input.ownershipChain?.state === 'captain_read_only_fallback'
            ? 'captain_read_only_fallback'
            : input.executionOwner === 'foreman_worker'
                ? 'foreman_worker_visible'
                : input.hostExecutionEvidenceVisible
                    ? input.readOnlyFallbackAllowed
                        ? 'captain_read_only_fallback'
                        : 'host_session_fallback'
                    : 'planned_assignment_only';
    return {
        proof_state: proofState,
        assigned_agent_id: input.taskCard.assigned_agent_id,
        actual_agent_id: proofState === 'foreman_worker_visible' ? actualAgentId : null,
        model,
        variant,
        summary: proofState === 'foreman_worker_visible'
            ? `foreman_worker via ${actualAgentId ?? 'assigned worker'} using ${modelSummary}`
            : proofState === 'captain_read_only_fallback'
                ? `captain read-only fallback with ${input.taskCard.assigned_agent_id ?? 'unassigned'} still recorded as planned specialist using ${modelSummary}`
                : proofState === 'host_session_fallback'
                    ? `host_session execution was visible, but ${input.taskCard.assigned_agent_id ?? 'unassigned'} still has no accepted worker launch proof using ${modelSummary}`
                    : input.ownershipChain?.state === 'assigned_only'
                        ? `queued worker set for specialist ${input.taskCard.assigned_agent_id ?? 'unassigned'} has no accepted worker launch proof yet`
                        : `planned specialist ${input.taskCard.assigned_agent_id ?? 'unassigned'} has no worker launch proof yet`,
    };
}
function isCaptainOwnedReadOnlyFallbackAllowed(taskCard) {
    if (taskCard.task_kind === 'review' || taskCard.assigned_role === 'verifier') {
        return false;
    }
    if (taskCard.task_kind === 'execution') {
        return taskCard.assigned_role === 'code specialist' && taskCard.model_tier_intent === 'low_cost';
    }
    return taskCard.owner_role === 'orchestrator' && taskCard.model_tier_intent === 'low_cost';
}
function createCurrentTaskCardView(cwd, run, taskCard, decision, orchestratorState, mcpMutationLease, taskDelegations, foremanConfig) {
    const taskLinkedDelegations = taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id);
    const activeDelegation = taskLinkedDelegations.find((delegation) => (delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running'));
    const latestTaskDelegation = taskLinkedDelegations
        .slice()
        .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
        .at(0) ?? null;
    const actualModelLaunch = selectCurrentTaskModelLaunchEvidence(taskCard, taskDelegations);
    const ownerAgentConfigSummary = createTaskCardAgentConfigSummary(taskCard.owner_role, foremanConfig);
    const assignedAgentConfigSummary = createTaskCardAgentConfigSummary(taskCard.assigned_role ?? taskCard.owner_role, foremanConfig);
    const ownerRolePlaybook = createRolePlaybookContractView(taskCard.owner_role, ownerAgentConfigSummary, taskCard.assigned_agent_id);
    const assignedRolePlaybook = createRolePlaybookContractView(taskCard.assigned_role ?? taskCard.owner_role, assignedAgentConfigSummary, taskCard.assigned_agent_id);
    const resolvedRequestSettings = createTaskCardResolvedRequestSettings(taskCard, orchestratorState, foremanConfig);
    const taskNavigationHint = taskCard.task_kind === 'explore' || taskCard.task_kind === 'plan'
        ? (0, navigation_aids_1.resolveNavigationBundleHint)({
            cwd,
            taskTexts: [taskCard.title, taskCard.scope, taskCard.acceptance, taskCard.execution_prompt],
        })
        : null;
    const assignmentFraming = (0, helper_agents_1.createTaskAssignmentFraming)(taskCard.owner_role === 'verifier'
        ? {
            assigned_role: 'verifier',
            assigned_agent_id: (0, runtime_1.getAgentIdForRole)('verifier'),
            task_kind: 'review',
            title: taskCard.title,
            scope: taskCard.scope,
            acceptance: taskCard.acceptance,
        }
        : taskCard, {
        navigationHint: taskNavigationHint,
    });
    const ownershipChain = (0, helper_agents_1.createTaskOwnershipChain)({
        taskCard,
        taskDelegations,
    });
    const hasConcreteWorkerProof = ownershipChain.execution_owner_mode === 'foreman_worker' &&
        ownershipChain.state !== 'planned_only' &&
        ownershipChain.state !== 'assigned_only';
    const executionOwner = hasConcreteWorkerProof ? 'foreman_worker' : 'host_session';
    const concreteWorkerId = hasConcreteWorkerProof
        ? activeDelegation?.child_agent.agent_id ?? latestTaskDelegation?.child_agent.agent_id ?? null
        : null;
    const ownershipGuard = (0, helper_agents_1.createTaskOwnershipGuard)({
        assignedAgentId: assignmentFraming.target_agent_id,
        executionOwner,
        codexUiTraceOwner: 'host_session',
        provenanceHeader: run.latest_orchestrator_synthesis?.provenance_header ?? run.latest_response?.provenance_header ?? null,
        concreteWorkerId,
    });
    const readOnlyFallbackAllowed = isCaptainOwnedReadOnlyFallbackAllowed(taskCard);
    const hostExecutionEvidenceVisible = taskCard.thread_ids.length > 0 || actualModelLaunch !== null;
    const executionProof = createCurrentTaskExecutionProof({
        taskCard,
        ownershipChain,
        executionOwner,
        concreteWorkerId,
        actualModelLaunch,
        agentConfigSummary: assignedAgentConfigSummary ?? ownerAgentConfigSummary,
        resolvedRequestSettings,
        readOnlyFallbackAllowed,
        hostExecutionEvidenceVisible,
    });
    const specialistContractSummary = createSpecialistContractSummary({
        taskCard,
        ownerRolePlaybook,
        assignedRolePlaybook,
        executionProof,
    });
    return {
        task_card_id: taskCard.task_card_id,
        title: taskCard.title,
        status: taskCard.status,
        owner_role: taskCard.owner_role,
        assigned_role: taskCard.assigned_role,
        assigned_agent_id: taskCard.assigned_agent_id,
        role_config_snapshot: taskCard.role_config_snapshot,
        model_tier_intent: taskCard.model_tier_intent,
        child_aggregation_contract: taskCard.child_aggregation_contract,
        fan_in_barrier_semantics: taskCard.fan_in_barrier_semantics,
        orchestrator_review_gate: taskCard.orchestrator_review_gate,
        acceptance: taskCard.acceptance,
        verification_state: taskCard.verification_state,
        completed_by_agent_id: taskCard.completed_by_agent_id,
        latest_model_launch: taskCard.latest_model_launch,
        agent_config_summary: ownerAgentConfigSummary,
        owner_agent_config_summary: ownerAgentConfigSummary,
        assigned_agent_config_summary: assignedAgentConfigSummary,
        owner_role_playbook: ownerRolePlaybook,
        assigned_role_playbook: assignedRolePlaybook,
        specialist_contract_summary: specialistContractSummary,
        resolved_request_settings: resolvedRequestSettings,
        execution_proof: executionProof,
        ownership_chain: ownershipChain,
        execution_assignment_state: createCurrentTaskExecutionAssignmentState(taskCard, ownershipChain),
        execution_source: executionOwner === 'foreman_worker' ? 'foreman_worker' : 'codex_session',
        execution_owner: executionOwner,
        codex_ui_trace_owner: 'host_session',
        ownership_summary: ownershipChain.state === 'planned_only' || ownershipChain.state === 'assigned_only'
            ? 'Foreman has a planned specialist assignment, but no accepted worker launch proof is recorded yet.'
            : executionOwner === 'foreman_worker'
                ? 'Execution is Foreman-owned, but Codex CLI Explored/Called trace remains host-session UI and is not rewritten by Foreman.'
                : 'Work is currently being carried by the attached host Codex session, and Codex CLI Explored/Called trace belongs to that host session rather than a Foreman worker.',
        assignment_framing: assignmentFraming,
        ownership_guard: ownershipGuard,
        shared_config_drift: createCurrentTaskSharedConfigDrift({
            run,
            taskCard,
            orchestratorState,
            decision,
            foremanConfig,
        }),
        dispatched_model_launch: actualModelLaunch,
        actual_model_launch: actualModelLaunch,
        model_enforcement_state: actualModelLaunch?.match_state ?? 'not_started',
        observed_model: actualModelLaunch?.observed_model ?? null,
        observed_variant: actualModelLaunch?.observed_variant ?? null,
        observed_source: actualModelLaunch?.observed_source ?? null,
        observed_confidence: actualModelLaunch?.observed_confidence ?? null,
        observed_capability: actualModelLaunch?.observed_capability ?? null,
        observation_status: actualModelLaunch?.observation_status ?? 'not_started',
        observation_match_state: actualModelLaunch?.observation_match_state ?? 'not_started',
        observation_unavailable_reason: actualModelLaunch?.observation_unavailable_reason ?? null,
        observation_mismatch_summary: actualModelLaunch?.observation_mismatch_summary ?? null,
        concrete_worker_id: concreteWorkerId,
        worker_linkage: createCurrentTaskWorkerLinkage(taskCard, taskDelegations),
        run_mutation_lease: mcpMutationLease,
        task_kind: taskCard.task_kind,
        acceptance_checks: [...taskCard.acceptance_checks],
        review_pass_count: taskCard.review_pass_count,
        review_of_task_card_ids: [...taskCard.review_of_task_card_ids],
        depends_on_task_card_ids: [...taskCard.depends_on_task_card_ids],
        fan_in_from_task_card_ids: [...taskCard.fan_in_from_task_card_ids],
        node_kind: taskCard.node_kind,
    };
}
function createReadableRunContext(input) {
    const captain = createReadableAgentContext('orchestrator', constants_1.FOREMAN_AGENT_ROSTER.orchestrator, input.foremanConfig);
    const taskOwner = createReadableAgentContext(input.ownerRole, input.ownerRole === 'orchestrator' ? constants_1.FOREMAN_AGENT_ROSTER.orchestrator : input.assignedAgentId, input.foremanConfig);
    const task = createReadableTaskContext(input.taskCard);
    const designatedAssignee = input.ownerRole !== input.assignedRole
        ? createReadableAgentContext(input.assignedRole, input.assignedAgentId, input.foremanConfig)
        : null;
    return {
        captain,
        task_owner: taskOwner,
        task,
        summary: designatedAssignee === null
            ? `${captain.display_name} is tracking ${taskOwner.display_name} on task "${task.title}".`
            : `${captain.display_name} is preparing task "${task.title}" for ${designatedAssignee.display_name}.`,
    };
}
function isActiveDelegatedWorkerStatus(status) {
    return status === 'queued' || status === 'running';
}
function summarizeVisibleWorkerLifecycleState(state) {
    switch (state) {
        case 'queued':
            return 'queued and waiting for captain launch';
        case 'launching':
            return 'launch requested and waiting for running checkpoint';
        case 'running':
            return 'running under captain supervision';
        case 'returned':
            return 'returned to captain';
        case 'failed':
            return 'failed and needs captain follow-up';
        case 'cancelled':
            return 'cancelled under captain control';
        case 'stale':
            return 'stale and needs bounded reclaim';
        case 'timed_out':
            return 'timed out and needs bounded reclaim';
    }
}
function createWorkerLifecycleView(delegation) {
    const lifecycle = delegation.worker_lifecycle;
    if (lifecycle === null || lifecycle === undefined) {
        return null;
    }
    const progressTimestamp = Date.parse(lifecycle.last_progress_at);
    const elapsedSinceProgressMs = Number.isFinite(progressTimestamp) ? Math.max(0, Date.now() - progressTimestamp) : null;
    let state = lifecycle.state;
    let reclaimState = lifecycle.reclaim_state;
    let staleAt = lifecycle.stale_at;
    let timedOutAt = lifecycle.timed_out_at;
    if (delegation.child_agent.status === 'running' && elapsedSinceProgressMs !== null) {
        if (elapsedSinceProgressMs >= lifecycle.timeout_after_ms) {
            state = 'timed_out';
            reclaimState = 'reclaim_needed';
            timedOutAt = timedOutAt ?? lifecycle.last_progress_at;
        }
        else if (elapsedSinceProgressMs >= lifecycle.stale_after_ms) {
            state = 'stale';
            reclaimState = 'reclaim_needed';
            staleAt = staleAt ?? lifecycle.last_progress_at;
        }
        else if (lifecycle.launch_requested_at !== null && lifecycle.started_at === null) {
            state = 'launching';
        }
        else {
            state = 'running';
        }
    }
    else if (delegation.child_agent.status === 'completed') {
        state = 'returned';
        reclaimState = lifecycle.reclaim_state === 'reclaimed' ? 'reclaimed' : 'resumable';
    }
    else if (delegation.child_agent.status === 'failed') {
        state = 'failed';
        reclaimState = 'not_needed';
    }
    else if (delegation.child_agent.status === 'cancelled') {
        state = 'cancelled';
        reclaimState = 'not_needed';
    }
    else if (delegation.child_agent.status === 'queued' && lifecycle.launch_requested_at !== null) {
        state = 'launching';
    }
    else {
        state = 'queued';
    }
    return {
        state,
        reclaim_state: reclaimState,
        queued_at: lifecycle.queued_at,
        launch_requested_at: lifecycle.launch_requested_at,
        started_at: lifecycle.started_at,
        last_progress_at: lifecycle.last_progress_at,
        returned_at: lifecycle.returned_at,
        stale_at: staleAt,
        timed_out_at: timedOutAt,
        stale_after_ms: lifecycle.stale_after_ms,
        timeout_after_ms: lifecycle.timeout_after_ms,
        elapsed_since_progress_ms: elapsedSinceProgressMs,
        summary: summarizeVisibleWorkerLifecycleState(state),
    };
}
function createReadableWorkerSnapshot(delegation, foremanConfig) {
    const readableWorker = createReadableAgentContext(delegation.child_agent.role, delegation.child_agent.agent_id, foremanConfig);
    const sliceLabel = delegation.worker_request?.slice_label ?? delegation.worker_result?.slice_label ?? null;
    const scope = delegation.worker_request?.scope ?? delegation.worker_result?.scope ?? null;
    const sliceSummary = sliceLabel ?? delegation.summary;
    const workerLifecycle = createWorkerLifecycleView(delegation);
    return {
        ...delegation.child_agent,
        roster_name: readableWorker.roster_name,
        readable_name: readableWorker.display_name,
        scope,
        slice_label: sliceLabel,
        partition_strategy: delegation.worker_request?.partition_strategy ?? delegation.worker_result?.partition_strategy ?? null,
        coverage_focus: [...(delegation.worker_request?.coverage_focus ?? delegation.worker_result?.coverage_focus ?? [])],
        worker_policy_decision: delegation.worker_policy_decision ?? null,
        worker_lifecycle: workerLifecycle ?? {
            state: 'queued',
            reclaim_state: 'not_needed',
            queued_at: delegation.created_at,
            launch_requested_at: null,
            started_at: null,
            last_progress_at: delegation.updated_at,
            returned_at: delegation.completed_at,
            stale_at: null,
            timed_out_at: null,
            stale_after_ms: 0,
            timeout_after_ms: 0,
            elapsed_since_progress_ms: null,
            summary: 'queued and waiting for captain launch',
        },
        summary: `${scope ? `${sliceSummary}: ${scope}` : sliceSummary} (lifecycle=${workerLifecycle?.state ?? 'queued'}` +
            `${delegation.worker_policy_decision ? `, policy=${delegation.worker_policy_decision.outcome}` : ''})`,
    };
}
function selectCurrentStageDelegations(run, taskCard, taskDelegations) {
    if (run.stage === 'execution' && taskCard.owner_role !== 'verifier') {
        return taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id &&
            (delegation.source_task_card_id !== null && delegation.source_task_card_id !== undefined
                ? delegation.fan_in_collapsed_at === null
                : delegation.child_agent.role === taskCard.assigned_role));
    }
    if (run.stage === 'verification' && taskCard.owner_role === 'verifier' && taskCard.verification_state === 'pending') {
        return taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id &&
            delegation.child_agent.role === 'verifier' &&
            delegation.review_round === taskCard.review_pass_count);
    }
    return [];
}
function createWorkerVisibility(input) {
    const allWorkers = input.task_delegations.map((delegation) => createReadableWorkerSnapshot(delegation, input.foremanConfig));
    const activeWorkers = allWorkers.filter((worker) => isActiveDelegatedWorkerStatus(worker.status) ||
        worker.worker_lifecycle?.state === 'stale' ||
        worker.worker_lifecycle?.state === 'timed_out');
    const queuedWorkerCount = input.task_delegations.filter((delegation) => delegation.child_agent.status === 'queued').length;
    const runningWorkerCount = input.task_delegations.filter((delegation) => delegation.child_agent.status === 'running').length;
    const completedWorkerCount = input.task_delegations.filter((delegation) => delegation.child_agent.status === 'completed').length;
    const failedWorkerCount = input.task_delegations.filter((delegation) => delegation.child_agent.status === 'failed').length;
    const cancelledWorkerCount = input.task_delegations.filter((delegation) => delegation.child_agent.status === 'cancelled').length;
    const launchingWorkerCount = allWorkers.filter((worker) => worker.worker_lifecycle?.state === 'launching').length;
    const returnedWorkerCount = allWorkers.filter((worker) => worker.worker_lifecycle?.state === 'returned').length;
    const staleWorkerCount = allWorkers.filter((worker) => worker.worker_lifecycle?.state === 'stale').length;
    const timedOutWorkerCount = allWorkers.filter((worker) => worker.worker_lifecycle?.state === 'timed_out').length;
    const reclaimNeededWorkerCount = allWorkers.filter((worker) => worker.worker_lifecycle?.reclaim_state === 'reclaim_needed').length;
    return {
        task_card_id: input.task_card.task_card_id,
        total_worker_count: input.task_delegations.length,
        active_worker_count: activeWorkers.length,
        queued_worker_count: queuedWorkerCount,
        launching_worker_count: launchingWorkerCount,
        running_worker_count: runningWorkerCount,
        returned_worker_count: returnedWorkerCount,
        completed_worker_count: completedWorkerCount,
        failed_worker_count: failedWorkerCount,
        cancelled_worker_count: cancelledWorkerCount,
        stale_worker_count: staleWorkerCount,
        timed_out_worker_count: timedOutWorkerCount,
        reclaim_needed_worker_count: reclaimNeededWorkerCount,
        workers: allWorkers,
        active_workers: activeWorkers,
        summary: `Task "${input.task_card.title}" has ${activeWorkers.length} active ${input.worker_label}${activeWorkers.length === 1 ? '' : 's'}` +
            ` out of the explicit cap ${input.max_active_workers}; ${completedWorkerCount} completed, ${failedWorkerCount} failed, ${cancelledWorkerCount} cancelled, ` +
            `${returnedWorkerCount} returned, ${staleWorkerCount} stale, and ${timedOutWorkerCount} timed out.`,
    };
}
function createVisibleWorkerRequest(workerRequest) {
    if (workerRequest === null) {
        return null;
    }
    return {
        scope: workerRequest.scope ?? null,
        slice_label: workerRequest.slice_label ?? null,
        partition_strategy: workerRequest.partition_strategy ?? null,
        coverage_focus: [...(workerRequest.coverage_focus ?? [])],
        coverage_rules: [...(workerRequest.coverage_rules ?? [])],
    };
}
function createVisibleWorkerResult(workerResult) {
    if (workerResult === null) {
        return null;
    }
    return {
        scope: workerResult.scope ?? null,
        slice_label: workerResult.slice_label ?? null,
        partition_strategy: workerResult.partition_strategy ?? null,
        coverage_focus: [...(workerResult.coverage_focus ?? [])],
        key_findings: [...(workerResult.key_findings ?? [])],
        evidence_paths: [...workerResult.evidence_paths],
        confidence: workerResult.confidence,
        uncertainty_summary: workerResult.uncertainty_summary,
    };
}
function createReadableDelegationContext(input) {
    const captain = createReadableAgentContext('orchestrator', constants_1.FOREMAN_AGENT_ROSTER.orchestrator, input.foremanConfig);
    const delegator = createReadableAgentContext(input.delegation.delegated_by_role, input.delegation.child_agent.parent_agent_id, input.foremanConfig);
    const worker = createReadableAgentContext(input.delegation.child_agent.role, input.delegation.child_agent.agent_id, input.foremanConfig);
    const task = createReadableTaskContext({
        task_card_id: input.delegation.task_card_id,
        title: input.taskTitle,
    });
    return {
        captain,
        delegator,
        worker,
        task,
        summary: `${delegator.display_name} delegated task "${task.title}" to ${worker.display_name} while ${captain.display_name} retained supervision.`,
    };
}
function createDelegationCounts(delegations) {
    return {
        total: delegations.length,
        active: delegations.filter((delegation) => delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running').length,
        completed: delegations.filter((delegation) => delegation.child_agent.status === 'completed').length,
        failed: delegations.filter((delegation) => delegation.child_agent.status === 'failed').length,
        cancelled: delegations.filter((delegation) => delegation.child_agent.status === 'cancelled').length,
    };
}
function createForemanServerIdentityView(sessionContext) {
    return {
        server_name: MCP_SERVER_INFO.name,
        server_version: MCP_SERVER_INFO.version,
        session_id: sessionContext.session_id,
        process_id: sessionContext.process_id,
        started_at: sessionContext.started_at,
        build_identity: `${MCP_SERVER_INFO.name}@${MCP_SERVER_INFO.version}:${sessionContext.started_at}`,
        entrypoint_path: typeof process.argv[1] === 'string' ? node_path_1.default.resolve(process.argv[1]) : null,
        shared_config_path: (0, runtime_1.resolveForemanConfigFilePath)(),
    };
}
async function getForemanServerIdentity(sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const serverIdentity = createForemanServerIdentityView(sessionContext);
    const installCheck = await withBoundedToolBudget({
        toolName: 'foreman_server_identity',
        stage: 'install_check',
        work: async () => await (0, setup_codex_mcp_1.checkCodexMcpInstall)({
            cwd: process.cwd(),
            codexPath: 'codex',
            serverName: 'codex-foreman',
        }),
        onTimeout: (diagnosis) => ({
            status: 'warning',
            packageName: 'codex-foreman',
            packageVersion: MCP_SERVER_INFO.version,
            publicEntrySkillName: 'cap',
            publicEntryLabel: '$cap',
            serverName: 'codex-foreman',
            expectedLaunchCommand: process.execPath,
            expectedLaunchArgs: [],
            expectedEntrypointPath: serverIdentity.entrypoint_path,
            registrationStatus: 'unreadable_registration',
            registrationSummary: diagnosis.summary,
            registeredLaunchCommand: null,
            registeredLaunchArgs: [],
            registeredEntrypointPath: null,
            configPath: (0, runtime_1.resolveForemanConfigFilePath)(),
            configExists: true,
            registryInspectionStatus: 'unavailable',
            registryInspectionSummary: diagnosis.summary,
            otherInstalledMcpServers: [],
            companionMcpUsageSummary: 'Companion MCP registry inspection was skipped because the bounded install-check budget was exhausted.',
            packagedHarnessSurfaceStatus: 'incomplete_surface',
            packagedHarnessSurfaceSummary: 'Packaged harness surface inspection was skipped because the bounded install-check budget was exhausted.',
            packagedHarnessSurface: [],
            capSkillName: 'cap',
            capSkillPath: node_path_1.default.join(process.env.CODEX_HOME ?? '', 'skills', 'cap'),
            capSkillStatus: 'unreadable_install',
            capSkillSummary: diagnosis.summary,
            customAgentDirectoryPath: node_path_1.default.join(process.env.CODEX_HOME ?? '', 'agents'),
            customAgentNames: [],
            customAgentFileCount: 0,
            customAgentStatus: 'unreadable_install',
            customAgentSummary: diagnosis.summary,
            modelPolicyStatus: 'warning',
            modelPolicySummary: diagnosis.summary,
            configuredRoleModels: [],
            activeRunHygieneStatus: 'warning',
            activeRunHygieneSummary: diagnosis.summary,
            activeRunRecommendedId: null,
            timeout_diagnosis: diagnosis,
        }),
    });
    const sessionRegistrationMatch = serverIdentity.entrypoint_path === null || installCheck.registeredEntrypointPath === null
        ? 'unknown'
        : serverIdentity.entrypoint_path === installCheck.registeredEntrypointPath
            ? 'matches_registered_target'
            : 'differs_from_registered_target';
    return {
        server_identity: serverIdentity,
        install_check: {
            ...installCheck,
            session_registration_match: sessionRegistrationMatch,
        },
    };
}
function createTaskGraphSummary(taskCardIndex) {
    const taskCardStatusLookup = new Map(taskCardIndex.map((taskCard) => [taskCard.task_card_id, taskCard.status]));
    const isReadyExecutionTask = (taskCard) => {
        if (taskCard.status !== 'queued' || taskCard.task_kind === 'review' || taskCard.node_kind !== 'execution') {
            return false;
        }
        return taskCard.depends_on_task_card_ids.every((dependencyTaskCardId) => taskCardStatusLookup.get(dependencyTaskCardId) === 'completed');
    };
    const assignedRoleCounts = {
        orchestrator: 0,
        planner: 0,
        explorer: 0,
        'code specialist': 0,
        verifier: 0,
    };
    for (const taskCard of taskCardIndex) {
        assignedRoleCounts[taskCard.assigned_role] += 1;
    }
    return {
        total_task_cards: taskCardIndex.length,
        queued_task_cards: taskCardIndex.filter((taskCard) => taskCard.status === 'queued').length,
        ready_execution_tasks: taskCardIndex.filter((taskCard) => isReadyExecutionTask(taskCard)).length,
        ready_low_cost_tasks: taskCardIndex.filter((taskCard) => isReadyExecutionTask(taskCard) && taskCard.model_tier_intent === 'low_cost').length,
        queued_review_tasks: taskCardIndex.filter((taskCard) => taskCard.status === 'queued' && taskCard.task_kind === 'review').length,
        queued_fan_in_tasks: taskCardIndex.filter((taskCard) => taskCard.status === 'queued' && taskCard.node_kind === 'fan_in').length,
        low_cost_task_cards: taskCardIndex.filter((taskCard) => taskCard.model_tier_intent === 'low_cost').length,
        standard_task_cards: taskCardIndex.filter((taskCard) => taskCard.model_tier_intent === 'standard').length,
        high_tier_task_cards: taskCardIndex.filter((taskCard) => taskCard.model_tier_intent === 'high_tier').length,
        child_aggregation_task_cards: taskCardIndex.filter((taskCard) => taskCard.child_aggregation_contract !== 'none').length,
        fan_in_barrier_task_cards: taskCardIndex.filter((taskCard) => taskCard.fan_in_barrier_semantics !== 'none').length,
        orchestrator_review_gated_task_cards: taskCardIndex.filter((taskCard) => taskCard.orchestrator_review_gate !== 'none').length,
        assigned_role_counts: assignedRoleCounts,
    };
}
function mapWorkflowRecommendedOperatorAction(nextStep) {
    switch (nextStep) {
        case 'execute_task':
            return 'advance';
        case 'verify_task':
            return 'verify';
        case 'await_verification':
            return 'resolve';
        case 'await_repair_decision':
            return 'retry';
        default:
            return 'none';
    }
}
function deriveWorkflowPhase(run, taskCard) {
    if (run.stage === 'verification') {
        return 'review';
    }
    if (taskCard?.task_kind === 'explore') {
        return 'explore';
    }
    if (taskCard?.task_kind === 'plan') {
        return 'plan';
    }
    if (taskCard?.task_kind === 'review') {
        return 'review';
    }
    return 'execute';
}
async function createWorkflowOperatorStateView(input) {
    const runPaths = (0, runtime_1.createRunPaths)(input.cwd, input.run.run_id);
    const plannerAttemptId = input.taskCard?.planner_attempt_id ?? input.run.planning_clarification_request?.planner_attempt_id ?? null;
    const workflowPhase = input.run.planning_clarification_request !== null && input.taskCard === null
        ? 'plan'
        : deriveWorkflowPhase(input.run, input.taskCard);
    const recommendedOperatorAction = mapWorkflowRecommendedOperatorAction(input.nextStep);
    const latestPlanUpdate = plannerAttemptId === null
        ? { artifact: null, filePath: null }
        : await (0, runtime_1.loadPlanUpdateArtifactIfPresent)((0, runtime_1.createPlannerAttemptPaths)(runPaths, plannerAttemptId));
    const latestExploreArtifact = input.taskCard === null ? { artifact: null, filePath: null } : await (0, runtime_1.loadExploreArtifactIfPresent)(runPaths, input.taskCard.task_card_id);
    const exploreEvidenceState = input.taskCard === null || (input.taskCard.task_kind !== 'explore' && input.taskCard.task_kind !== 'plan')
        ? 'not_applicable'
        : latestExploreArtifact.artifact === null
            ? 'pending'
            : 'recorded';
    const latestPlanUpdateFile = latestPlanUpdate.filePath === null ? null : node_path_1.default.relative(input.cwd, latestPlanUpdate.filePath);
    const latestExploreArtifactFile = latestExploreArtifact.filePath === null ? null : node_path_1.default.relative(input.cwd, latestExploreArtifact.filePath);
    const phaseSummary = workflowPhase === 'explore'
        ? 'Foreman is tracking a bounded explore task and expects an explicit evidence envelope before follow-on planning.'
        : workflowPhase === 'plan'
            ? 'Foreman is tracking a bounded planning task and expects the next plan update artifact to stay inspectable.'
            : workflowPhase === 'review'
                ? 'Foreman is tracking the review boundary for the current active task.'
                : 'Foreman is tracking the current execution slice.';
    return {
        phase: workflowPhase,
        summary: `${phaseSummary} ` +
            `plan_update=${latestPlanUpdate.artifact === null ? 'missing' : 'recorded'} ` +
            `explore_evidence=${exploreEvidenceState}.`,
        recommended_operator_action: recommendedOperatorAction,
        explore_evidence_state: exploreEvidenceState,
        latest_explore_artifact_file: latestExploreArtifactFile,
        plan_update_available: latestPlanUpdate.artifact !== null,
        latest_plan_update_file: latestPlanUpdateFile,
    };
}
function createVisibleDelegation(delegation, taskTitle, foremanConfig) {
    return {
        delegation_id: delegation.delegation_id,
        task_card_id: delegation.task_card_id,
        source_task_card_id: delegation.source_task_card_id ?? null,
        delegated_by_role: delegation.delegated_by_role,
        review_round: delegation.review_round,
        summary: SAFE_PERSISTED_DETAIL_SUMMARY,
        context: createReadableDelegationContext({
            delegation,
            taskTitle,
            foremanConfig,
        }),
        child_agent: delegation.child_agent,
        child_agent_config_summary: createTaskCardAgentConfigSummary(delegation.child_agent.role, foremanConfig),
        worker_request: createVisibleWorkerRequest(delegation.worker_request),
        worker_role_config_snapshot: delegation.worker_role_config_snapshot ?? null,
        worker_policy_decision: delegation.worker_policy_decision ?? null,
        worker_lifecycle: createWorkerLifecycleView(delegation),
        worker_result: createVisibleWorkerResult(delegation.worker_result),
        executor: delegation.executor,
        result_summary: delegation.result_summary === null ? null : SAFE_PERSISTED_DETAIL_SUMMARY,
        reviewer_outcome: delegation.reviewer_outcome,
        latest_failure: delegation.latest_failure === null ? null : { ...delegation.latest_failure, summary: SAFE_PERSISTED_DETAIL_SUMMARY },
        updated_at: delegation.updated_at,
        completed_at: delegation.completed_at,
    };
}
const SAFE_PERSISTED_DETAIL_SUMMARY = 'details recorded in persisted state.';
function sanitizeLatestSummaryRecord(record) {
    if (record === null) {
        return null;
    }
    return {
        ...record,
        summary: SAFE_PERSISTED_DETAIL_SUMMARY,
    };
}
async function createForemanStatusResult(cwd, run, taskCard, visibility, taskDelegations, progress, hydration, latestVerifiedCheckpoint, alwaysOnMode, mcpMutationLease, serverIdentity, taskGraphSummary, orchestratorState, foremanConfig) {
    const workspaceLifecycleViews = await (0, run_lifecycle_1.inspectWorkspaceRunLifecycleViews)(cwd);
    const runLifecycle = workspaceLifecycleViews.find((candidate) => candidate.run_id === run.run_id) ??
        (0, run_lifecycle_1.deriveRunLifecycleView)(run, [run]);
    const currentTaskCard = createCurrentTaskCardView(cwd, run, taskCard, visibility.orchestrator, orchestratorState, mcpMutationLease, taskDelegations, foremanConfig);
    const orchestrationPolicy = orchestratorState.orchestration_policy;
    const mutationGuardrailsMetadata = (0, orchestrator_1.derivePolicyAwareMutationGuardrailsMetadata)(orchestrationPolicy, visibility.orchestrator);
    const routingMetadata = (0, orchestrator_1.derivePolicyAwareRoutingMetadata)(run, taskCard, orchestrationPolicy, visibility.orchestrator);
    const reviewMetadata = (0, orchestrator_1.derivePolicyAwareReviewMetadata)(run, taskCard, orchestrationPolicy, visibility.orchestrator, taskDelegations);
    const researchMetadata = (0, orchestrator_1.derivePolicyAwareResearchMetadata)(orchestrationPolicy, visibility.orchestrator);
    const currentStageDelegations = selectCurrentStageDelegations(run, taskCard, taskDelegations);
    const maxActiveWorkers = run.stage === 'verification' && taskCard.owner_role === 'verifier' && taskCard.verification_state === 'pending'
        ? orchestrationPolicy.review.max_active_reviewers
        : orchestrationPolicy.parallelism.max_active_workers;
    const workerLabel = run.stage === 'verification' && taskCard.owner_role === 'verifier' && taskCard.verification_state === 'pending'
        ? 'reviewer'
        : 'delegated worker';
    const continuity = (0, runtime_1.createContinuityProjection)({
        run,
        taskCard,
        latestHandoff: visibility.latest_handoff,
        orchestratorDecision: visibility.orchestrator,
        progress,
    });
    const planningClarificationRequest = sanitizePlanningClarificationRequest(run.planning_clarification_request);
    const workflowOperatorState = await createWorkflowOperatorStateView({
        cwd,
        run,
        taskCard,
        nextStep: visibility.orchestrator.next_step,
    });
    const runLocator = createResolvedForemanRunLocator(cwd, visibility.run_id);
    const specialistRoleRoster = createSpecialistRoleRosterView(foremanConfig);
    const operatorSummary = createOperatorSummary(currentTaskCard, {
        latest_response: sanitizeLatestSummaryRecord(run.latest_response),
        latest_orchestrator_synthesis: sanitizeLatestSummaryRecord(run.latest_orchestrator_synthesis),
        stage: visibility.stage,
        active_role: visibility.active_role,
    });
    const loopState = (0, canonical_loop_1.deriveForemanLoopState)({
        runStatus: run.status,
        workflowStage: run.stage,
        activeRole: run.active_role,
        nextStep: visibility.orchestrator.next_step,
        taskCard: taskCard,
        hasPlanningClarification: run.planning_clarification_request !== null,
        hasContractMismatch: currentTaskCard.assigned_role_playbook?.contract_validation_state === 'mismatch' ||
            currentTaskCard.assigned_role_playbook?.contract_validation_state === 'unavailable',
    });
    const allowedNextCommands = (0, orchestrator_1.getAllowedExplicitCommandsForDecision)(visibility.orchestrator);
    const runTruthSurface = createRunTruthSurfaceView({
        run,
        runLifecycle,
        currentTaskCard,
        loopState,
        workflowOperatorState,
        allowedNextCommands,
        resumeFrom: progress.resume_from,
        nextStep: visibility.orchestrator.next_step,
        canAdvance: visibility.orchestrator.can_advance,
        planningClarificationRequest,
    });
    return {
        cwd,
        run_id: visibility.run_id,
        run_directory: runLocator.run_directory,
        run_ref: runLocator.run_ref,
        goal: visibility.goal,
        run_lifecycle: runLifecycle,
        readable_context: createReadableRunContext({
            ownerRole: currentTaskCard.owner_role,
            assignedRole: currentTaskCard.assigned_role,
            assignedAgentId: currentTaskCard.assigned_agent_id,
            taskCard: currentTaskCard,
            foremanConfig,
        }),
        orchestration_policy: orchestrationPolicy,
        status: visibility.status,
        stage: visibility.stage,
        completed: progress.completed,
        in_progress: progress.in_progress,
        remaining: progress.remaining,
        resume_from: progress.resume_from,
        active_role: visibility.active_role,
        active_agent_id: visibility.active_agent_id,
        active_thread_id: visibility.active_thread_id,
        child_agents: visibility.child_agents,
        specialist_executors: visibility.specialist_executors,
        worker_visibility: createWorkerVisibility({
            task_delegations: currentStageDelegations,
            task_card: currentTaskCard,
            max_active_workers: maxActiveWorkers,
            worker_label: workerLabel,
            foremanConfig,
        }),
        server_identity: serverIdentity,
        task_graph_summary: taskGraphSummary,
        current_task_card: currentTaskCard,
        loop_state: loopState,
        run_truth_surface: runTruthSurface,
        specialist_role_roster: specialistRoleRoster,
        operator_summary: operatorSummary,
        orchestrator_agent_config_summary: createTaskCardAgentConfigSummary('orchestrator', foremanConfig),
        orchestrator_request_settings_preview: createOrchestratorRequestSettingsPreview(foremanConfig),
        orchestrator_scope: ORCHESTRATOR_SCOPE,
        orchestrator_scope_summary: ORCHESTRATOR_SCOPE_SUMMARY,
        latest_handoff: sanitizeLatestSummaryRecord(visibility.latest_handoff),
        latest_verification: sanitizeLatestSummaryRecord(visibility.latest_verification),
        latest_failure: sanitizeLatestSummaryRecord(visibility.latest_failure),
        latest_verified_checkpoint: sanitizeLatestSummaryRecord(latestVerifiedCheckpoint),
        latest_orchestrator_synthesis: sanitizeLatestSummaryRecord(run.latest_orchestrator_synthesis),
        latest_response: sanitizeLatestSummaryRecord(run.latest_response),
        hydration,
        always_on_mode: alwaysOnMode,
        always_on_operator_state: createAlwaysOnOperatorStateView(alwaysOnMode, visibility.orchestrator.next_step, visibility.orchestrator.can_advance),
        workflow_operator_state: workflowOperatorState,
        mcp_mutation_lease: mcpMutationLease,
        continuity,
        planning_clarification_request: planningClarificationRequest,
        next_step: visibility.orchestrator.next_step,
        can_advance: visibility.orchestrator.can_advance,
        decision_summary: visibility.orchestrator.summary,
        mutation_guardrails_summary: mutationGuardrailsMetadata.mutation_guardrails_summary,
        mutation_guardrails_trace: mutationGuardrailsMetadata.mutation_guardrails_trace,
        routing_summary: routingMetadata.routing_summary,
        routing_trace: routingMetadata.routing_trace,
        review_summary: reviewMetadata.review_summary,
        review_trace: reviewMetadata.review_trace,
        research_summary: researchMetadata.research_summary,
        research_trace: researchMetadata.research_trace,
        allowed_next_commands: allowedNextCommands,
    };
}
function requirePlanningClarificationRequest(run) {
    const clarificationRequest = run.planning_clarification_request;
    if (clarificationRequest === null) {
        throw new Error(`Run ${run.run_id} is marked as a planning clarification hold but planning_clarification_request is missing from run.json.`);
    }
    return clarificationRequest;
}
function sanitizePlanningClarificationRequest(clarificationRequest) {
    if (clarificationRequest === null) {
        return null;
    }
    return {
        ...clarificationRequest,
        summary: 'Planner clarification is required. Details are recorded in persisted state.',
        clarification_request: 'Clarification request details are recorded in persisted state.',
    };
}
async function createClarificationHoldStatusResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity) {
    const workspaceLifecycleViews = await (0, run_lifecycle_1.inspectWorkspaceRunLifecycleViews)(cwd);
    const runLifecycle = workspaceLifecycleViews.find((candidate) => candidate.run_id === run.run_id) ??
        (0, run_lifecycle_1.deriveRunLifecycleView)(run, [run]);
    const continuity = (0, runtime_1.createContinuityProjection)({ run });
    const workflowOperatorState = await createWorkflowOperatorStateView({
        cwd,
        run,
        taskCard: null,
        nextStep: 'await_clarification',
    });
    const runLocator = createResolvedForemanRunLocator(cwd, run.run_id);
    const loopState = (0, canonical_loop_1.deriveForemanLoopState)({
        runStatus: run.status,
        workflowStage: run.stage,
        activeRole: run.active_role,
        nextStep: 'await_clarification',
        taskCard: null,
        hasPlanningClarification: true,
    });
    const planningClarificationRequest = sanitizePlanningClarificationRequest(requirePlanningClarificationRequest(run));
    const runTruthSurface = createRunTruthSurfaceView({
        run,
        runLifecycle,
        currentTaskCard: null,
        loopState,
        workflowOperatorState,
        allowedNextCommands: [],
        resumeFrom: null,
        nextStep: 'await_clarification',
        canAdvance: false,
        planningClarificationRequest,
    });
    return {
        cwd,
        run_id: run.run_id,
        run_directory: runLocator.run_directory,
        run_ref: runLocator.run_ref,
        goal: run.goal,
        run_lifecycle: runLifecycle,
        readable_context: null,
        orchestration_policy: null,
        status: run.status,
        stage: run.stage,
        completed: null,
        in_progress: null,
        remaining: null,
        resume_from: null,
        active_role: run.active_role,
        active_agent_id: run.active_agent_id,
        active_thread_id: run.active_thread_id,
        child_agents: run.child_agents,
        specialist_executors: run.specialist_executors,
        worker_visibility: null,
        server_identity: serverIdentity,
        task_graph_summary: EMPTY_TASK_GRAPH_SUMMARY,
        current_task_card: null,
        loop_state: loopState,
        run_truth_surface: runTruthSurface,
        specialist_role_roster: [],
        operator_summary: null,
        orchestrator_agent_config_summary: null,
        orchestrator_request_settings_preview: null,
        orchestrator_scope: ORCHESTRATOR_SCOPE,
        orchestrator_scope_summary: ORCHESTRATOR_SCOPE_SUMMARY,
        latest_handoff: null,
        latest_verification: sanitizeLatestSummaryRecord(run.latest_verification),
        latest_failure: sanitizeLatestSummaryRecord(run.latest_failure),
        latest_verified_checkpoint: sanitizeLatestSummaryRecord(run.latest_verified_checkpoint),
        latest_orchestrator_synthesis: sanitizeLatestSummaryRecord(run.latest_orchestrator_synthesis),
        latest_response: sanitizeLatestSummaryRecord(run.latest_response),
        hydration: null,
        always_on_mode: alwaysOnMode,
        always_on_operator_state: createAlwaysOnOperatorStateView(alwaysOnMode, 'await_clarification', false),
        workflow_operator_state: workflowOperatorState,
        mcp_mutation_lease: mcpMutationLease,
        continuity,
        planning_clarification_request: planningClarificationRequest,
        next_step: 'await_clarification',
        can_advance: false,
        decision_summary: null,
        mutation_guardrails_summary: null,
        mutation_guardrails_trace: null,
        routing_summary: null,
        routing_trace: null,
        review_summary: null,
        review_trace: null,
        research_summary: null,
        research_trace: null,
        allowed_next_commands: [],
    };
}
function isTerminalPlanningRunWithoutTaskCard(run) {
    return (run.stage === 'planning' &&
        run.planning_clarification_request === null &&
        run.active_task_card_id === null &&
        run.task_card_ids.length === 0 &&
        (run.status === 'failed' || run.status === 'cancelled'));
}
function createPlanningTerminalContinuityProjection(run) {
    return {
        summary: `planner_attempt_id=none; planning_terminal_status=${run.status}; ` +
            `latest_verified_checkpoint_recorded=${run.latest_verified_checkpoint === null ? 'no' : 'yes'}; ` +
            'planning_terminal_details=recorded_in_persisted_state',
        planner_attempt_id: null,
        review_pass_count: null,
        latest_handoff_summary: null,
        latest_verified_checkpoint_summary: run.latest_verified_checkpoint === null
            ? null
            : `Verified checkpoint recorded for task_card_id=${run.latest_verified_checkpoint.task_card_id} at ${run.latest_verified_checkpoint.recorded_at}; details remain in persisted state.`,
        session_handoff_notes: [
            `planning_terminal_status=${run.status}`,
            `latest_failure_reason=${run.latest_failure?.reason ?? 'none'}`,
            `latest_verified_checkpoint=${run.latest_verified_checkpoint?.task_card_id ?? 'none'}`,
            'planning_terminal_details=recorded_in_persisted_state',
        ],
    };
}
async function createPlanningTerminalStatusResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity) {
    const workspaceLifecycleViews = await (0, run_lifecycle_1.inspectWorkspaceRunLifecycleViews)(cwd);
    const runLifecycle = workspaceLifecycleViews.find((candidate) => candidate.run_id === run.run_id) ??
        (0, run_lifecycle_1.deriveRunLifecycleView)(run, [run]);
    const nextStep = run.status === 'cancelled' ? 'halt_cancelled' : 'halt_failed';
    const runLocator = createResolvedForemanRunLocator(cwd, run.run_id);
    const loopState = (0, canonical_loop_1.deriveForemanLoopState)({
        runStatus: run.status,
        workflowStage: run.stage,
        activeRole: run.active_role,
        nextStep,
        taskCard: null,
        hasPlanningClarification: false,
    });
    const workflowOperatorState = {
        phase: 'plan',
        summary: 'Foreman ended during bounded planning before any task-card was created. ' +
            'Inspect the persisted planner artifacts and recorded failure before retrying.',
        recommended_operator_action: 'none',
        explore_evidence_state: 'not_applicable',
        latest_explore_artifact_file: null,
        plan_update_available: false,
        latest_plan_update_file: null,
    };
    const runTruthSurface = createRunTruthSurfaceView({
        run,
        runLifecycle,
        currentTaskCard: null,
        loopState,
        workflowOperatorState,
        allowedNextCommands: [],
        resumeFrom: null,
        nextStep,
        canAdvance: false,
        planningClarificationRequest: null,
    });
    return {
        cwd,
        run_id: run.run_id,
        run_directory: runLocator.run_directory,
        run_ref: runLocator.run_ref,
        goal: run.goal,
        run_lifecycle: runLifecycle,
        readable_context: null,
        orchestration_policy: null,
        status: run.status,
        stage: run.stage,
        completed: null,
        in_progress: null,
        remaining: null,
        resume_from: null,
        active_role: run.active_role,
        active_agent_id: run.active_agent_id,
        active_thread_id: run.active_thread_id,
        child_agents: run.child_agents,
        specialist_executors: run.specialist_executors,
        worker_visibility: null,
        server_identity: serverIdentity,
        task_graph_summary: EMPTY_TASK_GRAPH_SUMMARY,
        current_task_card: null,
        loop_state: loopState,
        run_truth_surface: runTruthSurface,
        specialist_role_roster: [],
        operator_summary: null,
        orchestrator_agent_config_summary: null,
        orchestrator_request_settings_preview: null,
        orchestrator_scope: ORCHESTRATOR_SCOPE,
        orchestrator_scope_summary: ORCHESTRATOR_SCOPE_SUMMARY,
        latest_handoff: null,
        latest_verification: sanitizeLatestSummaryRecord(run.latest_verification),
        latest_failure: sanitizeLatestSummaryRecord(run.latest_failure),
        latest_verified_checkpoint: sanitizeLatestSummaryRecord(run.latest_verified_checkpoint),
        latest_orchestrator_synthesis: sanitizeLatestSummaryRecord(run.latest_orchestrator_synthesis),
        latest_response: sanitizeLatestSummaryRecord(run.latest_response),
        hydration: null,
        always_on_mode: alwaysOnMode,
        always_on_operator_state: createAlwaysOnOperatorStateView(alwaysOnMode, nextStep, false),
        workflow_operator_state: workflowOperatorState,
        mcp_mutation_lease: mcpMutationLease,
        continuity: createPlanningTerminalContinuityProjection(run),
        planning_clarification_request: null,
        next_step: nextStep,
        can_advance: false,
        decision_summary: sanitizeLatestSummaryRecord(run.latest_failure)?.summary ?? null,
        mutation_guardrails_summary: null,
        mutation_guardrails_trace: null,
        routing_summary: null,
        routing_trace: null,
        review_summary: null,
        review_trace: null,
        research_summary: null,
        research_trace: null,
        allowed_next_commands: [],
    };
}
function requireCurrentTaskCard(status) {
    const currentTaskCard = status.current_task_card;
    if (currentTaskCard === null) {
        throw new Error(`Run ${status.run_id} does not have an active task-card view for this operation.`);
    }
    return currentTaskCard;
}
function createAlwaysOnOperatorStateView(alwaysOnMode, nextStep, canAdvance) {
    if (!alwaysOnMode.enabled) {
        return {
            phase: 'disabled',
            summary: 'Always-on is disabled. Use the explicit CLI or MCP path, or enable always-on explicitly for this run.',
            recommended_operator_action: 'always_on_start',
            last_tick_at: alwaysOnMode.last_tick_at ?? null,
            last_loop_stop_reason: alwaysOnMode.last_companion_loop?.stop_reason ?? null,
        };
    }
    if (nextStep === 'halt_completed' || nextStep === 'halt_failed' || nextStep === 'halt_cancelled') {
        return {
            phase: 'terminal',
            summary: `Always-on is enabled, but the run is already at ${nextStep}. No further bounded tick is expected.`,
            recommended_operator_action: 'none',
            last_tick_at: alwaysOnMode.last_tick_at ?? null,
            last_loop_stop_reason: alwaysOnMode.last_companion_loop?.stop_reason ?? null,
        };
    }
    if (!canAdvance ||
        nextStep === 'await_verification' ||
        nextStep === 'await_repair_decision' ||
        nextStep === 'await_operator' ||
        nextStep === 'await_fan_in' ||
        nextStep === 'await_clarification') {
        return {
            phase: 'manual_boundary',
            summary: `Always-on is enabled and waiting at ${nextStep}. Operator action or another explicit surface is required before more bounded progress can happen.`,
            recommended_operator_action: nextStep === 'execute_task'
                ? 'advance'
                : nextStep === 'verify_task'
                    ? 'verify'
                    : nextStep === 'await_verification'
                        ? 'resolve'
                        : nextStep === 'await_repair_decision'
                            ? 'retry'
                            : 'none',
            last_tick_at: alwaysOnMode.last_tick_at ?? null,
            last_loop_stop_reason: alwaysOnMode.last_companion_loop?.stop_reason ?? null,
        };
    }
    if (alwaysOnMode.last_tick_at === null) {
        return {
            phase: 'ready',
            summary: 'Always-on is enabled and ready for the first explicit tick or loop.',
            recommended_operator_action: 'always_on_loop',
            last_tick_at: null,
            last_loop_stop_reason: alwaysOnMode.last_companion_loop?.stop_reason ?? null,
        };
    }
    return {
        phase: 'idle',
        summary: 'Always-on is enabled and idle between explicit bounded ticks or loops.',
        recommended_operator_action: 'always_on_loop',
        last_tick_at: alwaysOnMode.last_tick_at ?? null,
        last_loop_stop_reason: alwaysOnMode.last_companion_loop?.stop_reason ?? null,
    };
}
function createForemanActivityAttemptSummary(attempt) {
    const commands = attempt.steps.map((step) => step.command);
    const commandSummary = commands.length === 0
        ? 'No orchestration command was dispatched'
        : `Dispatched ${commands.length} orchestration step${commands.length === 1 ? '' : 's'} (${commands.join(', ')})`;
    const stopSummary = attempt.stop ? ` and stopped at ${attempt.stop.reason}` : '';
    return `${commandSummary}${stopSummary}.`;
}
function createForemanActivityAttemptSnapshot(snapshot) {
    return {
        status: snapshot.status,
        stage: snapshot.stage,
        verification_state: snapshot.verification_state,
        next_step: snapshot.next_step,
        thread_id: snapshot.thread_id,
        routing_summary: snapshot.routing_summary,
        routing_trace: snapshot.routing_trace,
        review_summary: snapshot.review_summary,
        review_trace: snapshot.review_trace,
    };
}
function createForemanActivityResult(input) {
    const currentTaskCard = requireCurrentTaskCard(input.status);
    const currentStageDelegations = selectCurrentStageDelegations(input.run, input.taskCard, input.taskDelegationSummary.delegations);
    const activeDelegations = currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running');
    return {
        cwd: input.status.cwd,
        run_id: input.status.run_id,
        run_directory: input.status.run_directory,
        run_ref: input.status.run_ref,
        goal: input.status.goal,
        readable_context: input.status.readable_context,
        orchestration_policy: input.status.orchestration_policy,
        status: input.status.status,
        stage: input.status.stage,
        completed: input.status.completed,
        in_progress: input.status.in_progress,
        remaining: input.status.remaining,
        resume_from: input.status.resume_from,
        active_role: input.status.active_role,
        active_agent_id: input.status.active_agent_id,
        active_thread_id: input.status.active_thread_id,
        child_agents: input.status.child_agents,
        specialist_executors: input.status.specialist_executors,
        worker_visibility: input.status.worker_visibility,
        server_identity: input.status.server_identity,
        task_graph_summary: input.status.task_graph_summary,
        current_task_card: input.status.current_task_card,
        loop_state: input.status.loop_state,
        run_truth_surface: input.status.run_truth_surface,
        specialist_role_roster: input.status.specialist_role_roster,
        operator_summary: input.status.operator_summary ?? null,
        orchestrator_agent_config_summary: input.status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: input.status.orchestrator_request_settings_preview,
        orchestrator_scope: input.status.orchestrator_scope,
        orchestrator_scope_summary: input.status.orchestrator_scope_summary,
        latest_handoff: input.status.latest_handoff,
        latest_verification: input.status.latest_verification,
        latest_failure: input.status.latest_failure,
        latest_verified_checkpoint: input.status.latest_verified_checkpoint,
        latest_orchestrator_synthesis: input.status.latest_orchestrator_synthesis,
        latest_response: input.status.latest_response,
        hydration: input.status.hydration,
        always_on_mode: input.status.always_on_mode,
        always_on_operator_state: input.status.always_on_operator_state,
        workflow_operator_state: input.status.workflow_operator_state,
        mcp_mutation_lease: input.status.mcp_mutation_lease,
        continuity: input.status.continuity,
        planning_clarification_request: input.status.planning_clarification_request,
        next_step: input.status.next_step,
        can_advance: input.status.can_advance,
        decision_summary: input.status.decision_summary,
        mutation_guardrails_summary: input.status.mutation_guardrails_summary,
        mutation_guardrails_trace: input.status.mutation_guardrails_trace,
        routing_summary: input.status.routing_summary,
        routing_trace: input.status.routing_trace,
        review_summary: input.status.review_summary,
        review_trace: input.status.review_trace,
        research_summary: input.status.research_summary,
        research_trace: input.status.research_trace,
        allowed_next_commands: input.status.allowed_next_commands,
        latest_orchestration_attempt: input.latestAttempt === null
            ? null
            : {
                attempt_id: input.latestAttempt.attempt_id,
                entrypoint: input.latestAttempt.entrypoint,
                started_at: input.latestAttempt.started_at,
                completed_at: input.latestAttempt.completed_at,
                step_count: input.latestAttempt.steps.length,
                stop_reason: input.latestAttempt.stop?.reason ?? null,
                summary: createForemanActivityAttemptSummary(input.latestAttempt),
                steps: input.latestAttempt.steps.map((step) => ({
                    step_number: step.step_number,
                    command: step.command,
                    before: createForemanActivityAttemptSnapshot(step.before),
                    after: createForemanActivityAttemptSnapshot(step.after),
                })),
            },
        active_task_delegations: {
            task_card_id: currentTaskCard.task_card_id,
            total: currentStageDelegations.length,
            queued: currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'queued').length,
            running: currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'running').length,
            completed: currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'completed').length,
            failed: currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'failed').length,
            cancelled: currentStageDelegations.filter((delegation) => delegation.child_agent.status === 'cancelled').length,
            active: activeDelegations.map((delegation) => ({
                delegation_id: delegation.delegation_id,
                delegated_by_role: delegation.delegated_by_role,
                review_round: delegation.review_round,
                summary: SAFE_PERSISTED_DETAIL_SUMMARY,
                context: createReadableDelegationContext({
                    delegation,
                    taskTitle: input.taskCard.title,
                    foremanConfig: input.foremanConfig,
                }),
                child_agent: delegation.child_agent,
                child_agent_config_summary: createTaskCardAgentConfigSummary(delegation.child_agent.role, input.foremanConfig),
                executor: delegation.executor,
                worker_policy_decision: delegation.worker_policy_decision ?? null,
                worker_lifecycle: createWorkerLifecycleView(delegation),
                updated_at: delegation.updated_at,
            })),
        },
        task_delegations: input.taskDelegationSummary.delegations.map((delegation) => createVisibleDelegation(delegation, input.taskCard.title, input.foremanConfig)),
    };
}
async function createClarificationHoldActivityResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity) {
    const status = await createClarificationHoldStatusResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity);
    return {
        ...status,
        latest_orchestration_attempt: null,
        active_task_delegations: null,
        task_delegations: [],
    };
}
async function createPlanningTerminalActivityResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity) {
    const status = await createPlanningTerminalStatusResult(cwd, run, alwaysOnMode, mcpMutationLease, serverIdentity);
    return {
        ...status,
        latest_orchestration_attempt: null,
        active_task_delegations: null,
        task_delegations: [],
    };
}
const CONTINUITY_DETAILS_NOTICE = '\nContinuity details are available in structured content.';
const CLARIFICATION_REQUEST_NOTICE = '\nPlanner clarification request is available in structured content.';
async function resolveOperatorOutputVerbosity(cwd) {
    const foremanConfig = await (0, runtime_1.loadForemanConfig)(cwd);
    return foremanConfig.output.verbosity;
}
function resolveCurrentTaskRole(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.assigned_role ?? currentTaskCard.owner_role;
}
function createRunTruthSurfaceView(input) {
    const selectedModel = input.currentTaskCard?.assigned_role_playbook?.configured_model ??
        input.currentTaskCard?.assigned_agent_config_summary?.model ??
        input.currentTaskCard?.agent_config_summary?.model ??
        null;
    const selectedVariant = input.currentTaskCard?.assigned_role_playbook?.configured_variant ??
        input.currentTaskCard?.assigned_agent_config_summary?.variant ??
        input.currentTaskCard?.agent_config_summary?.variant ??
        null;
    const ownerAgentId = input.currentTaskCard?.owner_agent_config_summary?.roster_name ??
        input.currentTaskCard?.agent_config_summary?.roster_name ??
        null;
    const selectedAgentId = input.currentTaskCard?.assigned_agent_id ??
        input.currentTaskCard?.assigned_agent_config_summary?.roster_name ??
        null;
    let boundaryState = 'running';
    if (input.run.status === 'completed' || input.nextStep === 'halt_completed') {
        boundaryState = 'completed';
    }
    else if (input.run.status === 'cancelled' || input.nextStep === 'halt_cancelled') {
        boundaryState = 'terminal_cancelled';
    }
    else if (input.run.status === 'failed' || input.nextStep === 'halt_failed') {
        boundaryState = 'terminal_failed';
    }
    else if (input.loopState.current_stage === 'degraded') {
        boundaryState = 'degraded';
    }
    else if (input.nextStep === 'await_repair_decision') {
        boundaryState = 'repair_required';
    }
    else if (input.planningClarificationRequest !== null ||
        input.nextStep === 'await_clarification' ||
        input.nextStep === 'await_verification' ||
        input.nextStep === 'await_operator' ||
        input.runLifecycle?.state === 'manual_hold' ||
        input.loopState.current_stage === 'blocked') {
        boundaryState = 'manual_hold';
    }
    else if (input.canAdvance || input.allowedNextCommands.length > 0) {
        boundaryState = 'resume_ready';
    }
    let holdState = 'none';
    if (input.planningClarificationRequest !== null || input.nextStep === 'await_clarification') {
        holdState = 'planning_clarification_active';
    }
    else if (input.nextStep === 'await_verification') {
        holdState = 'await_verification';
    }
    else if (input.nextStep === 'await_operator') {
        holdState = 'await_operator';
    }
    else if (boundaryState === 'manual_hold') {
        holdState = 'blocked';
    }
    const repairState = input.nextStep === 'await_repair_decision' ? 'await_repair_decision' : 'none';
    const resumeAction = input.workflowOperatorState?.recommended_operator_action &&
        input.workflowOperatorState.recommended_operator_action !== 'none'
        ? input.workflowOperatorState.recommended_operator_action
        : input.allowedNextCommands[0] ?? 'none';
    const summary = [
        `boundary=${boundaryState}`,
        `lifecycle=${input.runLifecycle?.state ?? 'none'}`,
        `owner=${ownerAgentId ?? input.loopState.current_owner_role ?? 'none'}`,
        `specialist=${selectedAgentId ?? input.loopState.selected_specialist_role ?? 'none'}`,
        `model=${selectedModel ?? 'none'}/${selectedVariant ?? 'none'}`,
        `hold=${holdState}`,
        `repair=${repairState}`,
        `next=${resumeAction}`,
    ].join(' ');
    return {
        boundary_state: boundaryState,
        hold_state: holdState,
        repair_state: repairState,
        lifecycle_state: input.runLifecycle?.state ?? 'none',
        loop_stage: input.loopState.current_stage,
        path_variant: input.loopState.path_variant,
        current_owner_role: input.currentTaskCard?.owner_role ?? input.loopState.current_owner_role,
        current_owner_agent_id: ownerAgentId,
        selected_specialist_role: input.currentTaskCard?.assigned_role ?? input.loopState.selected_specialist_role,
        selected_specialist_agent_id: selectedAgentId,
        selected_model: selectedModel,
        selected_variant: selectedVariant,
        resume_action: resumeAction,
        allowed_next_commands: input.allowedNextCommands,
        resume_from: input.resumeFrom,
        degraded: boundaryState === 'degraded',
        summary,
    };
}
function resolveCurrentTaskModel(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.resolved_request_settings?.model ??
        currentTaskCard.role_config_snapshot?.model ??
        currentTaskCard.agent_config_summary?.model ??
        'none');
}
function resolveCurrentTaskVariant(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.resolved_request_settings?.variant ??
        currentTaskCard.role_config_snapshot?.variant ??
        currentTaskCard.agent_config_summary?.variant ??
        'none');
}
function resolveCurrentTaskDispatchedModel(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.dispatched_model_launch?.dispatched_model ??
        currentTaskCard.actual_model_launch?.dispatched_model ??
        currentTaskCard.actual_model_launch?.actual_model ??
        'pending');
}
function resolveCurrentTaskDispatchedVariant(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.dispatched_model_launch?.dispatched_variant ??
        currentTaskCard.actual_model_launch?.dispatched_variant ??
        currentTaskCard.actual_model_launch?.actual_variant ??
        'pending');
}
function resolveCurrentTaskModelEvidenceState(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.model_enforcement_state ?? 'not_started';
}
function resolveCurrentTaskObservedModel(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.observed_model ?? currentTaskCard.actual_model_launch?.observed_model ?? 'pending';
}
function resolveCurrentTaskObservedVariant(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.observed_variant ?? currentTaskCard.actual_model_launch?.observed_variant ?? 'pending';
}
function resolveCurrentTaskObservationState(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.observation_status ?? currentTaskCard.actual_model_launch?.observation_status ?? 'not_started';
}
function resolveCurrentTaskObservationMatchState(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.observation_match_state ?? currentTaskCard.actual_model_launch?.observation_match_state ?? 'not_started');
}
function resolveCurrentTaskObservationUnavailableReason(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.observation_unavailable_reason ??
        currentTaskCard.actual_model_launch?.observation_unavailable_reason ??
        'none');
}
function resolveCurrentTaskExecutionOwner(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.execution_owner ?? 'host_session';
}
function resolveCurrentTaskCodexUiTraceOwner(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.codex_ui_trace_owner ?? 'host_session';
}
function describeCurrentTaskOwnership(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    const guardVerdict = currentTaskCard.ownership_guard?.verdict ?? 'ownership_unclear';
    if ((currentTaskCard.execution_owner ?? 'host_session') === 'foreman_worker') {
        return `Foreman worker execution; Codex trace=${resolveCurrentTaskCodexUiTraceOwner(currentTaskCard)}; sentinel=${guardVerdict}`;
    }
    return `host session work; Codex trace=${resolveCurrentTaskCodexUiTraceOwner(currentTaskCard)}; sentinel=${guardVerdict}`;
}
function describeRunLifecycle(runLifecycle) {
    if (!runLifecycle) {
        return 'none';
    }
    return `${runLifecycle.state} (${runLifecycle.freshness})`;
}
function resolveCurrentTaskModelEvidenceSlug(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    const modelState = resolveCurrentTaskModelEvidenceState(currentTaskCard);
    const observationMatch = resolveCurrentTaskObservationMatchState(currentTaskCard);
    const observationUnavailable = resolveCurrentTaskObservationUnavailableReason(currentTaskCard);
    const observedCapability = currentTaskCard.observed_capability ?? currentTaskCard.actual_model_launch?.observed_capability;
    if (modelState === 'mismatch') {
        return 'configured_dispatch_mismatch';
    }
    if (observationMatch === 'mismatch') {
        return 'observed_mismatch';
    }
    switch (observationUnavailable) {
        case 'no_thread_id':
            return 'observed_thread_id_missing';
        case 'surface_mismatch':
            return 'observed_surface_mismatch';
        case 'temporary_probe_failure':
            return 'observed_probe_unavailable';
        case 'environment_limited':
            return 'observed_environment_limited';
        case 'unsupported':
            return observedCapability === 'launch_request_only' ? 'launch_request_only' : 'observed_unsupported';
        default:
            break;
    }
    if (observationMatch === 'matched') {
        return 'observed_match';
    }
    if (modelState === 'verified_match') {
        return 'launch_match';
    }
    if (modelState === 'not_started' && observationMatch === 'not_started') {
        return 'pending';
    }
    return 'none';
}
function describeCurrentTaskModelEvidence(currentTaskCard) {
    switch (resolveCurrentTaskModelEvidenceSlug(currentTaskCard)) {
        case 'configured_dispatch_mismatch':
            return 'configured/dispatched mismatch';
        case 'observed_mismatch':
            return 'observed mismatch';
        case 'observed_thread_id_missing':
            return 'observed evidence unavailable (thread id missing)';
        case 'observed_surface_mismatch':
            return 'observed evidence unavailable (surface mismatch)';
        case 'observed_probe_unavailable':
            return 'observed evidence unavailable (probe failure)';
        case 'observed_environment_limited':
            return 'observed evidence unavailable (environment limited)';
        case 'launch_request_only':
            return 'launch request only';
        case 'observed_unsupported':
            return 'observed evidence unsupported';
        case 'observed_match':
            return 'observed match';
        case 'launch_match':
            return 'launch matched';
        case 'pending':
            return 'pending';
        default:
            return 'none';
    }
}
function describeCurrentTaskModelEvidenceSummary(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return [
        `cfg=${resolveCurrentTaskModel(currentTaskCard)}/${resolveCurrentTaskVariant(currentTaskCard)}`,
        `dispatch=${resolveCurrentTaskDispatchedModel(currentTaskCard)}/${resolveCurrentTaskDispatchedVariant(currentTaskCard)}`,
        `observed=${resolveCurrentTaskObservedModel(currentTaskCard)}/${resolveCurrentTaskObservedVariant(currentTaskCard)}`,
        `state=${describeCurrentTaskModelEvidence(currentTaskCard)}`,
    ].join(' ');
}
function resolveCurrentAgentName(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return (currentTaskCard.concrete_worker_id ??
        currentTaskCard.assigned_agent_id ??
        currentTaskCard.agent_config_summary?.roster_name ??
        'none');
}
function resolveOperatorDisplayProofState(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'planned_assignment_only';
    }
    return (currentTaskCard.execution_proof?.proof_state ?? 'planned_assignment_only');
}
function resolveOperatorDisplayAgentName(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    const proofState = resolveOperatorDisplayProofState(currentTaskCard);
    const assignedName = currentTaskCard.assigned_agent_id ??
        currentTaskCard.assigned_agent_config_summary?.roster_name ??
        currentTaskCard.agent_config_summary?.roster_name ??
        'none';
    const ownerName = currentTaskCard.owner_agent_config_summary?.roster_name ??
        currentTaskCard.agent_config_summary?.roster_name ??
        assignedName;
    if (proofState === 'foreman_worker_visible') {
        return currentTaskCard.concrete_worker_id ?? assignedName;
    }
    if (proofState === 'captain_read_only_fallback') {
        return ownerName;
    }
    if (proofState === 'host_session_fallback' &&
        (currentTaskCard.resolved_request_settings?.request_kind === 'verification' ||
            currentTaskCard.owner_role === 'verifier')) {
        return ownerName;
    }
    return assignedName;
}
function resolveOperatorDisplayRole(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    const proofState = resolveOperatorDisplayProofState(currentTaskCard);
    if (proofState === 'captain_read_only_fallback' ||
        (proofState === 'host_session_fallback' &&
            (currentTaskCard.resolved_request_settings?.request_kind === 'verification' ||
                currentTaskCard.owner_role === 'verifier'))) {
        return currentTaskCard.owner_role;
    }
    return currentTaskCard.assigned_role ?? currentTaskCard.owner_role;
}
function createOperatorDisplayAgentLine(currentTaskCard) {
    const role = resolveOperatorDisplayRole(currentTaskCard);
    const proofState = resolveOperatorDisplayProofState(currentTaskCard);
    const suffix = proofState === 'foreman_worker_visible'
        ? ''
        : proofState === 'captain_read_only_fallback'
            ? '; captain fallback'
            : proofState === 'host_session_fallback'
                ? '; host fallback'
                : '; planned';
    return `Agent: ${resolveOperatorDisplayAgentName(currentTaskCard)}${role !== 'none' ? ` (${role}${suffix})` : ''}`;
}
function createOperatorDisplayModelLine(currentTaskCard) {
    const model = resolveCurrentTaskModel(currentTaskCard);
    const variant = resolveCurrentTaskVariant(currentTaskCard);
    const proofState = resolveOperatorDisplayProofState(currentTaskCard);
    const prefix = proofState === 'foreman_worker_visible'
        ? ''
        : proofState === 'captain_read_only_fallback'
            ? 'captain fallback '
            : proofState === 'host_session_fallback'
                ? 'host fallback '
                : 'planned ';
    return `Model: ${prefix}${model} / ${variant}`;
}
function describeCurrentTaskExecutionProof(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.execution_proof?.summary ?? 'none';
}
function describeCurrentTaskOwnershipChain(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'none';
    }
    return currentTaskCard.ownership_chain?.summary ?? currentTaskCard.ownership_summary ?? 'none';
}
function compactRoutingReason(reason) {
    const compacted = reason?.replace(/\s+/g, ' ').trim();
    if (!compacted) {
        return 'none';
    }
    return compacted.length > 72 ? `${compacted.slice(0, 69)}...` : compacted;
}
function extractRoutingTraceFromGuidanceSource(guidanceSource) {
    if (!guidanceSource || typeof guidanceSource !== 'object' || !('routing_trace' in guidanceSource)) {
        return null;
    }
    const candidate = guidanceSource;
    return candidate.routing_trace ?? null;
}
function describeCurrentTaskRouting(currentTaskCard, routingTrace) {
    const targetRole = routingTrace?.route_target_role ?? currentTaskCard?.assigned_role ?? currentTaskCard?.owner_role ?? 'none';
    const modelTier = currentTaskCard?.model_tier_intent ?? 'none';
    const selectedRoute = routingTrace?.selected_route ?? 'none';
    const workloadClass = routingTrace?.workload_class ?? 'none';
    const pathWeight = routingTrace?.path_weight ?? 'none';
    const executionPath = routingTrace?.execution_path ?? 'none';
    const effortBudget = routingTrace?.reasoning_effort_budget ?? 'none';
    const reviewRequirement = routingTrace?.review_requirement ?? 'none';
    const category = routingTrace?.recommended_category ?? 'none';
    const skills = routingTrace?.recommended_skills && routingTrace.recommended_skills.length > 0
        ? routingTrace.recommended_skills.join(',')
        : 'none';
    const reason = compactRoutingReason(routingTrace?.selected_route_reason);
    return `target=${targetRole} tier=${modelTier} workload=${workloadClass} weight=${pathWeight} path=${executionPath} effort=${effortBudget} review=${reviewRequirement} route=${selectedRoute} category=${category} skills=${skills} reason=${reason}`;
}
function createTaskOperatorVisibilitySummary(currentTaskCard) {
    if (currentTaskCard === null) {
        return 'task=none';
    }
    const role = resolveCurrentTaskRole(currentTaskCard);
    const rosterName = currentTaskCard.agent_config_summary?.roster_name ?? 'unknown';
    const requestKind = currentTaskCard.resolved_request_settings?.request_kind ?? 'none';
    const model = resolveCurrentTaskModel(currentTaskCard);
    const variant = resolveCurrentTaskVariant(currentTaskCard);
    const taskKind = currentTaskCard.task_kind ?? 'execution';
    const source = currentTaskCard.execution_source ?? 'codex_session';
    const executionOwner = resolveCurrentTaskExecutionOwner(currentTaskCard);
    const codexUiTraceOwner = resolveCurrentTaskCodexUiTraceOwner(currentTaskCard);
    const worker = currentTaskCard.concrete_worker_id ?? 'none';
    const dispatchedModel = resolveCurrentTaskDispatchedModel(currentTaskCard);
    const dispatchedVariant = resolveCurrentTaskDispatchedVariant(currentTaskCard);
    const modelState = resolveCurrentTaskModelEvidenceState(currentTaskCard);
    const observedModel = resolveCurrentTaskObservedModel(currentTaskCard);
    const observedVariant = resolveCurrentTaskObservedVariant(currentTaskCard);
    const observationState = resolveCurrentTaskObservationState(currentTaskCard);
    const observationMatchState = resolveCurrentTaskObservationMatchState(currentTaskCard);
    const observedSource = currentTaskCard.observed_source ?? 'none';
    const observedConfidence = currentTaskCard.observed_confidence ?? 'none';
    const observedCapability = currentTaskCard.observed_capability ?? 'none';
    const observationUnavailable = resolveCurrentTaskObservationUnavailableReason(currentTaskCard);
    const observationMismatch = currentTaskCard.observation_mismatch_summary ?? 'none';
    const evidence = resolveCurrentTaskModelEvidenceSlug(currentTaskCard);
    const configDriftState = currentTaskCard.shared_config_drift?.state ?? 'none';
    const configDriftRequest = currentTaskCard.shared_config_drift?.request_kind ?? 'none';
    const configDriftRole = currentTaskCard.shared_config_drift?.role ?? 'none';
    const guardVerdict = currentTaskCard.ownership_guard?.verdict ?? 'ownership_unclear';
    const framingTarget = currentTaskCard.assignment_framing?.target_agent_id ?? 'none';
    const playbookBundle = currentTaskCard.assigned_role_playbook?.playbook_bundle.length
        ? currentTaskCard.assigned_role_playbook.playbook_bundle.join(',')
        : 'none';
    const wrapperDoc = currentTaskCard.assigned_role_playbook?.wrapper_doc_path ?? 'none';
    const resultContract = currentTaskCard.assigned_role_playbook?.result_contract_fields.length
        ? currentTaskCard.assigned_role_playbook.result_contract_fields.join(',')
        : 'none';
    const contractSource = currentTaskCard.assigned_role_playbook?.contract_source ?? 'none';
    const contractState = currentTaskCard.assigned_role_playbook?.contract_validation_state ?? 'none';
    return `task_role=${role} task_kind=${taskKind} roster=${rosterName} request=${requestKind} model=${model} variant=${variant} dispatched_model=${dispatchedModel} dispatched_variant=${dispatchedVariant} model_state=${modelState} observed_model=${observedModel} observed_variant=${observedVariant} observation_state=${observationState} observation_match=${observationMatchState} observed_source=${observedSource} observed_confidence=${observedConfidence} observed_capability=${observedCapability} observation_unavailable=${observationUnavailable} observation_mismatch=${observationMismatch} evidence=${evidence} playbooks=${playbookBundle} wrapper=${wrapperDoc} result_contract=${resultContract} contract_source=${contractSource} contract_state=${contractState} config_drift=${configDriftState} config_drift_request=${configDriftRequest} config_drift_role=${configDriftRole} source=${source} execution_owner=${executionOwner} codex_ui_trace_owner=${codexUiTraceOwner} worker=${worker} sentinel=${guardVerdict} framing_target=${framingTarget}`;
}
function createCompactOperatorVisibilitySummary(currentTaskCard, runLifecycle, nextStep, loopState, runTruthSurface, workflowOperatorState) {
    const phase = workflowOperatorState?.phase ?? 'none';
    const workflowNext = workflowOperatorState?.recommended_operator_action ?? 'none';
    return [
        `phase=${phase}`,
        `next=${workflowNext !== 'none' ? workflowNext : nextStep}`,
        `lifecycle=${describeRunLifecycle(runLifecycle)}`,
        `loop=${loopState?.current_stage ?? 'none'}`,
        `path=${loopState?.path_variant ?? 'none'}`,
        `boundary=${runTruthSurface?.boundary_state ?? 'none'}`,
        `hold=${runTruthSurface?.hold_state ?? 'none'}`,
        `repair=${runTruthSurface?.repair_state ?? 'none'}`,
        `resume=${runTruthSurface?.resume_action ?? 'none'}`,
        `task_role=${resolveCurrentTaskRole(currentTaskCard)}`,
        `ownership=${resolveCurrentTaskExecutionOwner(currentTaskCard)}`,
        `trace_owner=${resolveCurrentTaskCodexUiTraceOwner(currentTaskCard)}`,
        `config_drift=${currentTaskCard?.shared_config_drift?.state ?? 'none'}`,
        `model=${resolveCurrentTaskModel(currentTaskCard)}`,
        `variant=${resolveCurrentTaskVariant(currentTaskCard)}`,
        `dispatched_model=${resolveCurrentTaskDispatchedModel(currentTaskCard)}`,
        `dispatched_variant=${resolveCurrentTaskDispatchedVariant(currentTaskCard)}`,
        `model_state=${resolveCurrentTaskModelEvidenceState(currentTaskCard)}`,
        `observed_model=${resolveCurrentTaskObservedModel(currentTaskCard)}`,
        `observed_variant=${resolveCurrentTaskObservedVariant(currentTaskCard)}`,
        `observation_state=${resolveCurrentTaskObservationState(currentTaskCard)}`,
        `observation_match=${resolveCurrentTaskObservationMatchState(currentTaskCard)}`,
        `evidence=${resolveCurrentTaskModelEvidenceSlug(currentTaskCard)}`,
    ].join(' ');
}
function createQuietOperatorVisibilitySummary(currentTaskCard, runLifecycle, nextStep, loopState, runTruthSurface, workflowOperatorState) {
    const phase = workflowOperatorState?.phase ?? 'none';
    const workflowNext = workflowOperatorState?.recommended_operator_action ?? 'none';
    return [
        createOperatorDisplayAgentLine(currentTaskCard),
        createOperatorDisplayModelLine(currentTaskCard),
        `Lifecycle: ${describeRunLifecycle(runLifecycle)}`,
        `Loop: ${loopState ? `${loopState.current_stage} (${loopState.path_variant})` : 'none'}`,
        `State: ${runTruthSurface ? `${runTruthSurface.boundary_state} / hold=${runTruthSurface.hold_state} / repair=${runTruthSurface.repair_state}` : 'none'}`,
        `Phase: ${phase}`,
        `Next: ${workflowNext !== 'none' ? workflowNext : nextStep}`,
    ].join('\n');
}
function describeOperatorProvenance(guidanceSource) {
    if (guidanceSource === null) {
        return 'none recorded';
    }
    if (guidanceSource.latest_response?.provenance_header) {
        return guidanceSource.latest_response.provenance_header;
    }
    if (guidanceSource.latest_orchestrator_synthesis?.provenance_header) {
        return guidanceSource.latest_orchestrator_synthesis.provenance_header;
    }
    if (guidanceSource.provenance_header) {
        return guidanceSource.provenance_header;
    }
    return 'none recorded';
}
function describeOperatorReviewState(currentTaskCard, guidanceSource) {
    const reviewOutcome = guidanceSource?.latest_response?.review_outcome ?? guidanceSource?.latest_orchestrator_synthesis?.review_outcome ?? null;
    if (reviewOutcome === 'pass') {
        return 'arbiter passed';
    }
    if (reviewOutcome === 'repair') {
        return 'arbiter returned rework';
    }
    if (reviewOutcome === 'hold') {
        return 'arbiter blocked';
    }
    if (reviewOutcome === 'pending') {
        return 'arbiter pending';
    }
    if (currentTaskCard?.verification_state === 'passed') {
        return 'arbiter passed';
    }
    if (currentTaskCard?.verification_state === 'needs_work') {
        return 'arbiter returned rework';
    }
    if (currentTaskCard?.verification_state === 'blocked') {
        return 'arbiter blocked';
    }
    const reviewStageActive = guidanceSource?.stage === 'verification' ||
        currentTaskCard?.owner_role === 'verifier' ||
        currentTaskCard?.assigned_role === 'verifier' ||
        guidanceSource?.active_role === 'verifier';
    if (reviewStageActive) {
        const runningCount = guidanceSource?.worker_visibility?.running_worker_count ?? 0;
        return runningCount > 0 ? 'arbiter running' : 'arbiter pending';
    }
    return 'arbiter pending';
}
function describeOperatorLatestHandoff(guidanceSource) {
    if (guidanceSource?.continuity?.latest_handoff_summary) {
        return guidanceSource.continuity.latest_handoff_summary.replace(/^Latest handoff:\s*/i, '');
    }
    if (guidanceSource?.latest_handoff) {
        return `${guidanceSource.latest_handoff.from_role} -> ${guidanceSource.latest_handoff.to_role}`;
    }
    return 'none recorded';
}
function createDefaultOperatorVisibilitySummary(currentTaskCard, _runLifecycle, _nextStep, loopState, runTruthSurface, _workflowOperatorState, taskGraphSummary, _guidanceSource) {
    const graphSummary = [
        `total=${taskGraphSummary.total_task_cards}`,
        `ready=${taskGraphSummary.ready_execution_tasks}`,
        `queued=${taskGraphSummary.queued_task_cards}`,
    ].join(' ');
    return [
        createOperatorDisplayAgentLine(currentTaskCard),
        `Task: ${currentTaskCard?.title ?? 'none'}`,
        createOperatorDisplayModelLine(currentTaskCard),
        `Loop: ${loopState ? `${loopState.current_stage} (${loopState.path_variant})` : 'none'}`,
        `State: ${runTruthSurface ? `${runTruthSurface.boundary_state} / next=${runTruthSurface.resume_action}` : 'none'}`,
        `Graph: ${graphSummary}`,
    ].join('\n');
}
function createRunTruthOperatorVisibilitySummary(runTruthSurface) {
    if (runTruthSurface === null) {
        return 'run_truth=none';
    }
    return [
        `run_truth_boundary=${runTruthSurface.boundary_state}`,
        `run_truth_hold=${runTruthSurface.hold_state}`,
        `run_truth_repair=${runTruthSurface.repair_state}`,
        `run_truth_owner=${runTruthSurface.current_owner_agent_id ?? runTruthSurface.current_owner_role ?? 'none'}`,
        `run_truth_specialist=${runTruthSurface.selected_specialist_agent_id ?? runTruthSurface.selected_specialist_role ?? 'none'}`,
        `run_truth_model=${runTruthSurface.selected_model ?? 'none'}`,
        `run_truth_variant=${runTruthSurface.selected_variant ?? 'none'}`,
        `run_truth_resume=${runTruthSurface.resume_action}`,
    ].join(' ');
}
function createOrchestratorOperatorVisibilitySummary(input) {
    const profile = input.orchestrator_request_settings_preview?.profile ??
        input.orchestrator_agent_config_summary?.profile ??
        'none';
    const model = input.orchestrator_request_settings_preview?.model ??
        input.orchestrator_agent_config_summary?.model ??
        'none';
    const variant = input.orchestrator_request_settings_preview?.variant ??
        input.orchestrator_agent_config_summary?.variant ??
        'none';
    return `captain_scope=${input.orchestrator_scope} captain_profile=${profile} captain_model=${model} captain_variant=${variant}`;
}
function createOrchestratorSynthesisOperatorVisibilitySummary(input) {
    const synthesis = input.latest_orchestrator_synthesis;
    return [
        `synthesis_provenance=${synthesis?.provenance_header ?? 'none'}`,
        `synthesis_boundary=${synthesis?.boundary ?? 'none'}`,
        `synthesis_step=${synthesis?.next_step ?? 'none'}`,
        `synthesis_action=${synthesis?.recommended_action ?? 'none'}`,
        `synthesis_class=${synthesis?.decision_class ?? 'none'}`,
        `synthesis_review=${synthesis?.review_outcome ?? 'none'}`,
        `synthesis_allowed=${synthesis && synthesis.allowed_next_actions.length > 0 ? synthesis.allowed_next_actions.join(',') : 'none'}`,
        `synthesis_workers=${synthesis?.worker_result_count ?? 0}`,
    ].join(' ');
}
function createHydrationOperatorVisibilitySummary(hydration) {
    return `hydration=${hydration?.mode ?? 'none'}`;
}
function createLeaseOperatorVisibilitySummary(lease) {
    return `lease=${lease.state}`;
}
function createTaskGraphOperatorVisibilitySummary(input) {
    return [
        `graph_total=${input.task_graph_summary.total_task_cards}`,
        `graph_queued=${input.task_graph_summary.queued_task_cards}`,
        `graph_ready=${input.task_graph_summary.ready_execution_tasks}`,
        `graph_low_cost_ready=${input.task_graph_summary.ready_low_cost_tasks}`,
        `graph_fan_in=${input.task_graph_summary.queued_fan_in_tasks}`,
        `graph_low_cost=${input.task_graph_summary.low_cost_task_cards}`,
        `graph_standard=${input.task_graph_summary.standard_task_cards}`,
        `graph_high_tier=${input.task_graph_summary.high_tier_task_cards}`,
        `graph_aggregation=${input.task_graph_summary.child_aggregation_task_cards}`,
        `graph_review_gate=${input.task_graph_summary.orchestrator_review_gated_task_cards}`,
    ].join(' ');
}
function createWorkflowOperatorVisibilitySummary(input) {
    if (!input.workflow_operator_state) {
        return 'workflow_phase=none workflow_next=none explore_evidence=none plan_update=missing';
    }
    return [
        `workflow_phase=${input.workflow_operator_state.phase}`,
        `workflow_next=${input.workflow_operator_state.recommended_operator_action}`,
        `explore_evidence=${input.workflow_operator_state.explore_evidence_state}`,
        `plan_update=${input.workflow_operator_state.plan_update_available ? 'recorded' : 'missing'}`,
    ].join(' ');
}
function createCaptainLoopOperatorVisibilitySummary(input) {
    if (!input.current_task_card) {
        return 'captain_directed=none common_review_path=none review_round=not_applicable';
    }
    return [
        'captain_directed=true',
        'common_review_path=captain->assigned_agent->arbiter->captain',
        `workflow_stage=${input.stage}`,
        `loop_stage=${input.loop_state.current_stage}`,
        `path_variant=${input.loop_state.path_variant}`,
        `current_owner_role=${input.current_task_card.owner_role}`,
        `current_assigned_role=${input.current_task_card.assigned_role}`,
        `review_round=${input.current_task_card.review_pass_count}`,
        `verification_state=${input.current_task_card.verification_state}`,
    ].join(' ');
}
function createServerIdentityOperatorVisibilitySummary(input) {
    return [
        `server_version=${input.server_identity.server_version}`,
        `server_session=${input.server_identity.session_id}`,
        `server_build=${input.server_identity.build_identity}`,
    ].join(' ');
}
function createAlwaysOnOperatorVisibilitySummary(state) {
    return `always_on_phase=${state.phase} always_on_next=${state.recommended_operator_action}`;
}
function appendContinuityText(summary) {
    return `${summary}${CONTINUITY_DETAILS_NOTICE}`;
}
function appendClarificationText(summary) {
    return `${summary}${CLARIFICATION_REQUEST_NOTICE}`;
}
function createForemanStartResult(cwd, result, status) {
    return {
        cwd,
        run_id: result.runId,
        task_card_id: result.taskCardId,
        run_directory: result.runDirectory,
        run_ref: (0, runtime_1.createForemanRunRef)(result.runDirectory),
        status: result.status,
        stage: result.stage,
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        workflow_operator_state: status.workflow_operator_state,
        next_step: result.nextStep,
        can_advance: result.canAdvance,
        allowed_next_commands: (0, orchestrator_1.getAllowedExplicitCommandsForDecision)({
            next_step: result.nextStep,
            can_advance: result.canAdvance,
            summary: 'Foreman start created a new execution-ready run from operator-supplied scope.',
        }),
    };
}
function createForemanRunResult(cwd, result, status) {
    return {
        cwd,
        run_id: result.runId,
        task_card_id: result.taskCardId,
        run_directory: result.runDirectory,
        run_ref: (0, runtime_1.createForemanRunRef)(result.runDirectory),
        status: result.status,
        stage: result.stage,
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        workflow_operator_state: status.workflow_operator_state,
        thread_id: result.threadId,
        next_step: result.nextStep,
        can_advance: result.canAdvance,
        advanced: result.advanced,
        routing_summary: result.routingSummary,
        routing_trace: result.routingTrace,
        allowed_next_commands: (0, orchestrator_1.getAllowedExplicitCommandsForDecision)({
            next_step: result.nextStep,
            can_advance: result.canAdvance,
            summary: 'Foreman run created and advanced the new execution-ready run through the bounded MCP front door.',
        }),
    };
}
function createForemanDelegationsResult(status, counts, delegations) {
    return {
        cwd: status.cwd,
        run_id: status.run_id,
        run_directory: status.run_directory,
        run_ref: status.run_ref,
        goal: status.goal,
        readable_context: status.readable_context,
        status: status.status,
        stage: status.stage,
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        hydration: status.hydration,
        workflow_operator_state: status.workflow_operator_state,
        mcp_mutation_lease: status.mcp_mutation_lease,
        planning_clarification_request: status.planning_clarification_request,
        next_step: status.next_step,
        can_advance: status.can_advance,
        allowed_next_commands: status.allowed_next_commands,
        delegation_counts: counts,
        delegations,
    };
}
function createForemanDelegateResult(cwd, delegation) {
    const runLocator = createResolvedForemanRunLocator(cwd, delegation.run_id);
    return {
        cwd,
        run_id: delegation.run_id,
        run_directory: runLocator.run_directory,
        run_ref: runLocator.run_ref,
        task_card_id: delegation.task_card_id,
        delegation_id: delegation.delegation_id,
        delegated_by_role: delegation.delegated_by_role,
        review_round: delegation.review_round,
        summary: delegation.summary,
        child_agent: delegation.child_agent,
        executor: delegation.executor,
        worker_policy_decision: delegation.worker_policy_decision ?? null,
        worker_lifecycle: createWorkerLifecycleView(delegation),
        created_at: delegation.created_at,
        updated_at: delegation.updated_at,
    };
}
function createForemanUpdateDelegationResult(cwd, delegation) {
    const runLocator = createResolvedForemanRunLocator(cwd, delegation.run_id);
    return {
        cwd,
        run_id: delegation.run_id,
        run_directory: runLocator.run_directory,
        run_ref: runLocator.run_ref,
        delegation_id: delegation.delegation_id,
        task_card_id: delegation.task_card_id,
        delegated_by_role: delegation.delegated_by_role,
        review_round: delegation.review_round,
        summary: delegation.summary,
        child_agent: delegation.child_agent,
        executor: delegation.executor,
        worker_policy_decision: delegation.worker_policy_decision ?? null,
        worker_lifecycle: createWorkerLifecycleView(delegation),
        result_summary: delegation.result_summary,
        reviewer_outcome: delegation.reviewer_outcome,
        latest_failure: delegation.latest_failure,
        updated_at: delegation.updated_at,
        completed_at: delegation.completed_at,
    };
}
function createForemanOrchestrateResult(status, detail) {
    const recoveredTaskCardId = status.current_task_card?.task_card_id ??
        status.readable_context?.task.task_card_id ??
        status.latest_orchestrator_synthesis?.task_card_id ??
        null;
    if (!recoveredTaskCardId) {
        throw new Error(`Could not recover task_card_id for foreman_orchestrate result on run ${status.run_id} after ${detail.orchestration_status}.`);
    }
    return {
        cwd: status.cwd,
        run_id: status.run_id,
        run_directory: status.run_directory,
        run_ref: status.run_ref,
        task_card_id: recoveredTaskCardId,
        readable_context: status.readable_context,
        status: status.status,
        stage: status.stage,
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        worker_visibility: status.worker_visibility,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        hydration: status.hydration,
        workflow_operator_state: status.workflow_operator_state,
        mcp_mutation_lease: status.mcp_mutation_lease,
        next_step: status.next_step,
        can_advance: status.can_advance,
        allowed_next_commands: status.allowed_next_commands,
        decision_summary: status.decision_summary,
        orchestration_status: detail.orchestration_status,
        dispatched_command: detail.dispatched_command,
        dispatched_via: detail.dispatched_via,
        stop_reason: detail.stop_reason,
        orchestration_summary: detail.orchestration_summary,
    };
}
function requireCodexBin(codexBin, nextStep, handler) {
    if (codexBin) {
        return codexBin;
    }
    throw new Error(`foreman_orchestrate requires codex_bin when the current persisted decision is ${nextStep} and it dispatches ${handler}.`);
}
async function loadForemanStatusForOrchestration(cwd, runId) {
    return getForemanStatus({
        run_id: runId,
        cwd,
    });
}
function resolveForemanOrchestrateProgressionStepCount(input) {
    if (input.fast_mode === undefined) {
        return input.progression_step_count === 2 ? 2 : 1;
    }
    const fastModeProgressionStepCount = input.fast_mode ? 2 : 1;
    if (input.progression_step_count !== undefined &&
        input.progression_step_count !== fastModeProgressionStepCount) {
        throw new Error('foreman_orchestrate argument contract error: fast_mode and progression_step_count must agree when both are provided. ' +
            'Use fast_mode=true with progression_step_count=2, or fast_mode=false with progression_step_count=1.');
    }
    return fastModeProgressionStepCount;
}
function describeForemanOrchestrateTwoStepProgression(input) {
    if (input.progression_step_count === 2) {
        return 'progression_step_count=2';
    }
    return 'effective two-step progression';
}
function validateForemanOrchestrateProgressionContract(input, progressionStepCount, currentStatus) {
    if (progressionStepCount === 2 && currentStatus.next_step !== 'execute_task') {
        throw new Error(`foreman_orchestrate supports ${describeForemanOrchestrateTwoStepProgression(input)} only when the current persisted decision is execute_task. ` +
            `This Milestone 5 slice does not allow two-step progression from ${currentStatus.next_step}.`);
    }
}
function getForemanOrchestrateDispatchedHandler(command) {
    switch (command) {
        case 'advance':
            return 'advanceForemanRun';
        case 'verify':
            return 'verifyForemanRun';
        case 'retry':
            return 'retryForemanRun';
        case 'replan':
            return 'replanForemanRun';
        case 'resolve':
            return 'resolveForemanRun';
    }
}
function buildForemanOrchestrateDispatchedSummary(input) {
    if (input.commands.length === 1) {
        switch (input.commands[0]) {
            case 'advance':
                return `Dispatched advanceForemanRun for ${input.startingNextStep}.`;
            case 'verify':
                return `Dispatched verifyForemanRun for ${input.startingNextStep}.`;
            case 'retry':
                return 'Dispatched retryForemanRun for await_repair_decision.';
            case 'replan':
                return 'Dispatched replanForemanRun for await_repair_decision.';
            case 'resolve':
                return 'Dispatched resolveForemanRun for await_verification.';
        }
    }
    const commandSequence = input.commands.map((command) => getForemanOrchestrateDispatchedHandler(command)).join(' -> ');
    return `Dispatched bounded foreman_orchestrate progression from ${input.startingNextStep} via ${commandSequence} and stopped at ${input.stopReason}.`;
}
function isResultStopReason(value) {
    return value !== 'max_steps_reached' && value !== 'task_boundary_reached';
}
function validateForemanOrchestrateLoopInputs(input, progressionStepCount, currentStatus) {
    validateForemanOrchestrateProgressionContract(input, progressionStepCount, currentStatus);
    switch (currentStatus.next_step) {
        case 'execute_task':
            requireCodexBin(input.codex_bin, currentStatus.next_step, 'advanceForemanRun');
            return;
        case 'verify_task':
            requireCodexBin(input.codex_bin, currentStatus.next_step, 'verifyForemanRun');
            return;
        case 'await_fan_in':
            return;
        case 'await_repair_decision':
            if (!input.repair_action) {
                throw new Error('foreman_orchestrate requires repair_action when the current persisted decision is await_repair_decision. Choose retry or replan explicitly.');
            }
            if (input.repair_action === 'replan') {
                if (!input.replan_prompt) {
                    throw new Error('foreman_orchestrate requires replan_prompt when repair_action=replan and the current persisted decision is await_repair_decision.');
                }
                requireCodexBin(input.codex_bin, currentStatus.next_step, 'replanForemanRun');
            }
            return;
        case 'await_verification':
            if (!input.resolve_outcome || !input.resolve_summary) {
                throw new Error('foreman_orchestrate requires both resolve_outcome and resolve_summary when the current persisted decision is await_verification.');
            }
            return;
        case 'await_operator':
        case 'halt_completed':
        case 'halt_failed':
        case 'halt_cancelled':
            return;
    }
}
async function writeToStream(output, chunk) {
    await new Promise((resolve, reject) => {
        const handleError = (error) => {
            output.off('error', handleError);
            output.off('drain', handleDrain);
            reject(error);
        };
        const handleDrain = () => {
            output.off('error', handleError);
            output.off('drain', handleDrain);
            resolve();
        };
        output.on('error', handleError);
        const flushed = output.write(chunk);
        if (!flushed) {
            output.once('drain', handleDrain);
            return;
        }
        output.off('error', handleError);
        resolve();
    });
}
async function reportStderr(errorOutput, message) {
    await writeToStream(errorOutput, `${message}\n`);
}
async function getForemanStatus(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_paths: runPaths } = locator;
    const [runRecord, alwaysOnMode, foremanConfig, mcpMutationLeaseRecord] = await Promise.all([
        (0, runtime_1.loadRunRecord)(runPaths),
        (0, runtime_1.loadAlwaysOnModeRecord)(runPaths),
        (0, runtime_1.loadForemanConfig)(cwd),
        loadForemanMcpMutationLeaseRecord(cwd, runId),
    ]);
    const mcpMutationLease = createForemanMcpMutationLeaseView(sessionContext, mcpMutationLeaseRecord);
    const serverIdentity = createForemanServerIdentityView(sessionContext);
    if ((0, runtime_1.isPlanningClarificationHold)(runRecord)) {
        return createClarificationHoldStatusResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity);
    }
    if (isTerminalPlanningRunWithoutTaskCard(runRecord)) {
        return createPlanningTerminalStatusResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity);
    }
    const { run, taskCard, latestHandoff, orchestratorState } = await (0, runtime_1.loadHotRunContext)(runPaths);
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, taskCard.task_card_id);
    const currentStageDelegationSummary = (0, runtime_1.summarizeTaskDelegations)(taskCard.task_card_id, selectCurrentStageDelegations(run, taskCard, taskDelegationSummary.delegations));
    const decision = (0, orchestrator_1.decideOrchestratorNextStep)(run, taskCard, {
        verificationRequestAvailable: orchestratorState.verification_request !== null,
        orchestrationPolicy: orchestratorState.orchestration_policy,
        activeTaskDelegationCounts: currentStageDelegationSummary,
    });
    const visibility = (0, runtime_1.createVisibilityProjection)(run, taskCard, latestHandoff, decision);
    const { progress, hydration } = await (0, runtime_1.loadSelectiveProgressProjection)(runPaths, run, taskCard, decision);
    const taskGraphSummary = createTaskGraphSummary(await (0, runtime_1.loadSelectiveTaskCardIndex)(runPaths, run, taskCard));
    return createForemanStatusResult(cwd, run, taskCard, visibility, taskDelegationSummary.delegations, progress, hydration, run.latest_verified_checkpoint, alwaysOnMode, mcpMutationLease, serverIdentity, taskGraphSummary, orchestratorState, foremanConfig);
}
async function getForemanActivity(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_paths: runPaths, run_id: runId } = locator;
    const [runRecord, alwaysOnMode, foremanConfig, mcpMutationLeaseRecord] = await Promise.all([
        (0, runtime_1.loadRunRecord)(runPaths),
        (0, runtime_1.loadAlwaysOnModeRecord)(runPaths),
        (0, runtime_1.loadForemanConfig)(cwd),
        loadForemanMcpMutationLeaseRecord(cwd, runId),
    ]);
    const mcpMutationLease = createForemanMcpMutationLeaseView(sessionContext, mcpMutationLeaseRecord);
    const serverIdentity = createForemanServerIdentityView(sessionContext);
    if ((0, runtime_1.isPlanningClarificationHold)(runRecord)) {
        return createClarificationHoldActivityResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity);
    }
    if (isTerminalPlanningRunWithoutTaskCard(runRecord)) {
        return createPlanningTerminalActivityResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity);
    }
    const status = await getForemanStatus({
        run_dir: locator.run_directory,
    }, sessionContext);
    const [runContext, latestAttempt] = await Promise.all([(0, runtime_1.loadHotRunContext)(runPaths), (0, runtime_1.loadLatestOrchestrationAttempt)(runPaths)]);
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, runContext.taskCard.task_card_id);
    return createForemanActivityResult({
        status,
        run: runContext.run,
        taskCard: runContext.taskCard,
        latestAttempt,
        taskDelegationSummary,
        foremanConfig,
    });
}
async function recommendForemanEntryForMcp(input) {
    return await withBoundedToolBudget({
        toolName: 'foreman_recommend_entry',
        stage: 'startup',
        work: async () => {
            const cwd = resolveCwd(input.cwd);
            const foremanConfig = await (0, runtime_1.loadForemanConfig)(cwd);
            return (0, entry_policy_1.recommendForemanEntry)({
                cwd,
                request: input.request,
            }, foremanConfig.entry_policy, foremanConfig.agents.orchestrator);
        },
        onTimeout: (diagnosis) => ({
            cwd: resolveCwd(input.cwd),
            request: input.request,
            policy_mode: 'codex_cli_foreman_first',
            policy_summary: 'Returning a degraded recommendation because the bounded Foreman entry recommendation budget was exhausted.',
            automatic_entry_supported: false,
            entry_boundary: 'session_instruction_plus_wrapper',
            entry_boundary_summary: 'Degraded fallback after recommendation timeout. Use explicit entry or retry once the session is responsive.',
            upstream_codex_binary_intercept_supported: false,
            upstream_codex_binary_intercept_summary: 'Codex CLI interception is still unsupported; the current fallback is an honest degraded recommendation.',
            orchestrator_scope: ORCHESTRATOR_SCOPE,
            orchestrator_scope_summary: ORCHESTRATOR_SCOPE_SUMMARY,
            orchestrator_agent: {
                role: 'orchestrator',
                roster_name: 'captain',
                profile: null,
                model: null,
                variant: null,
                config_entries: [],
            },
            orchestrator_request_settings_preview: {
                source: 'shared_role_config',
                profile: null,
                model: null,
                variant: null,
                config_entries: [],
            },
            recommended_entrypoint: 'plan',
            task_shape: 'multi_step_or_unclear',
            confidence: 'medium',
            summary: diagnosis.summary,
            rationale: [
                'The bounded recommendation path exceeded its startup budget, so Foreman returned a degraded plan-first suggestion instead of hanging.',
            ],
            suggested_cli_command: 'codex-foreman plan',
            suggested_mcp_tool: null,
            timeout_diagnosis: diagnosis,
        }),
    });
}
async function autoEnterForemanForMcp(input) {
    return await withBoundedToolBudget({
        toolName: 'foreman_auto_entry',
        stage: 'hydration',
        work: async () => {
            const cwd = resolveCwd(input.cwd);
            return (0, run_command_1.autoEnterForeman)({
                cwd,
                request: input.request,
                codexPath: input.codex_bin ?? 'codex',
            });
        },
        onTimeout: (diagnosis) => ({
            cwd: resolveCwd(input.cwd),
            request: input.request,
            policy_mode: 'codex_cli_foreman_first',
            automatic_entry_supported: false,
            entry_boundary: 'session_instruction_plus_wrapper',
            entry_boundary_summary: 'Degraded fallback after bounded auto-entry hydration timeout.',
            upstream_codex_binary_intercept_supported: false,
            upstream_codex_binary_intercept_summary: 'Codex CLI interception remains unsupported; the current fallback preserves a visible degraded boundary.',
            created: false,
            run_selection: 'no_run_created',
            inspected_active_run_count: 0,
            fresh_active_run_count: 0,
            stale_active_run_count: 0,
            entrypoint_used: null,
            scoping_source: null,
            run_decision_reason: diagnosis.summary,
            active_run_candidates: [],
            selected_run_lifecycle: null,
            run_id: null,
            task_card_id: null,
            run_directory: null,
            status: null,
            stage: null,
            next_step: null,
            can_advance: null,
            summary: diagnosis.summary,
            recommendation: {
                cwd: resolveCwd(input.cwd),
                request: input.request,
                policy_mode: 'codex_cli_foreman_first',
                policy_summary: 'Degraded recommendation generated because auto-entry timed out during bounded hydration.',
                automatic_entry_supported: false,
                entry_boundary: 'session_instruction_plus_wrapper',
                entry_boundary_summary: 'Degraded fallback after auto-entry timeout.',
                upstream_codex_binary_intercept_supported: false,
                upstream_codex_binary_intercept_summary: 'Codex CLI interception remains unsupported; retry or use explicit entry once Foreman state is responsive.',
                orchestrator_scope: ORCHESTRATOR_SCOPE,
                orchestrator_scope_summary: ORCHESTRATOR_SCOPE_SUMMARY,
                orchestrator_agent: {
                    role: 'orchestrator',
                    roster_name: 'captain',
                    profile: null,
                    model: null,
                    variant: null,
                    config_entries: [],
                },
                orchestrator_request_settings_preview: {
                    source: 'shared_role_config',
                    profile: null,
                    model: null,
                    variant: null,
                    config_entries: [],
                },
                recommended_entrypoint: 'plan',
                task_shape: 'multi_step_or_unclear',
                confidence: 'medium',
                summary: diagnosis.summary,
                rationale: ['Auto-entry exceeded the bounded hydration budget, so Foreman returned a visible degraded fallback.'],
                suggested_cli_command: 'codex-foreman plan',
                suggested_mcp_tool: null,
                timeout_diagnosis: diagnosis,
            },
            timeout_diagnosis: diagnosis,
        }),
    });
}
async function getForemanDelegations(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_paths: runPaths } = locator;
    const [runRecord, alwaysOnMode, foremanConfig, mcpMutationLeaseRecord] = await Promise.all([
        (0, runtime_1.loadRunRecord)(runPaths),
        (0, runtime_1.loadAlwaysOnModeRecord)(runPaths),
        (0, runtime_1.loadForemanConfig)(cwd),
        loadForemanMcpMutationLeaseRecord(cwd, runId),
    ]);
    const mcpMutationLease = createForemanMcpMutationLeaseView(sessionContext, mcpMutationLeaseRecord);
    const serverIdentity = createForemanServerIdentityView(sessionContext);
    if ((0, runtime_1.isPlanningClarificationHold)(runRecord)) {
        return createForemanDelegationsResult(await createClarificationHoldStatusResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity), createDelegationCounts([]), []);
    }
    if (isTerminalPlanningRunWithoutTaskCard(runRecord)) {
        return createForemanDelegationsResult(await createPlanningTerminalStatusResult(cwd, runRecord, alwaysOnMode, mcpMutationLease, serverIdentity), createDelegationCounts([]), []);
    }
    const { run, taskCard, latestHandoff, orchestratorState } = await (0, runtime_1.loadHotRunContext)(runPaths);
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, taskCard.task_card_id);
    const currentStageDelegationSummary = (0, runtime_1.summarizeTaskDelegations)(taskCard.task_card_id, selectCurrentStageDelegations(run, taskCard, taskDelegationSummary.delegations));
    const decision = (0, orchestrator_1.decideOrchestratorNextStep)(run, taskCard, {
        verificationRequestAvailable: orchestratorState.verification_request !== null,
        orchestrationPolicy: orchestratorState.orchestration_policy,
        activeTaskDelegationCounts: currentStageDelegationSummary,
    });
    const visibility = (0, runtime_1.createVisibilityProjection)(run, taskCard, latestHandoff, decision);
    const { progress, hydration } = await (0, runtime_1.loadSelectiveProgressProjection)(runPaths, run, taskCard, decision);
    const delegationRecords = await (0, runtime_1.loadDelegationArtifacts)(runPaths);
    const status = await createForemanStatusResult(cwd, run, taskCard, visibility, taskDelegationSummary.delegations, progress, hydration, run.latest_verified_checkpoint, alwaysOnMode, mcpMutationLease, serverIdentity, createTaskGraphSummary(await (0, runtime_1.loadSelectiveTaskCardIndex)(runPaths, run, taskCard)), orchestratorState, foremanConfig);
    const referencedTaskCardIds = Array.from(new Set(delegationRecords.map((delegation) => delegation.task_card_id)));
    const taskTitleById = referencedTaskCardIds.length === 0 || referencedTaskCardIds.every((taskCardId) => taskCardId === taskCard.task_card_id)
        ? new Map([[taskCard.task_card_id, taskCard.title]])
        : await (0, runtime_1.loadTaskCardTitlesForRun)(runPaths, run, referencedTaskCardIds);
    const delegations = delegationRecords.map((delegation) => createVisibleDelegation(delegation, taskTitleById.get(delegation.task_card_id) ?? delegation.task_card_id, foremanConfig));
    return createForemanDelegationsResult(status, createDelegationCounts(delegationRecords), delegations);
}
async function declareForemanDelegation(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_paths: runPaths } = locator;
    await (0, runtime_1.loadRunRecord)(runPaths);
    await acquireForemanMcpMutationLease({
        cwd,
        runId,
        sessionContext,
        toolName: 'foreman_delegate',
    });
    const { run, taskCard, orchestratorState } = await (0, runtime_1.loadHotRunContext)(runPaths);
    const delegationRecords = await (0, runtime_1.loadDelegationArtifacts)(runPaths);
    if (run.active_role === null) {
        throw new Error('foreman_delegate requires a run with an active_role so the delegator can be derived from persisted state.');
    }
    if (run.active_agent_id === null) {
        throw new Error('foreman_delegate requires a run with an active_agent_id so the parent delegator can be derived from persisted state.');
    }
    if (run.active_task_card_id === null) {
        throw new Error('foreman_delegate requires a run with an active_task_card_id so delegation targets a concrete active task.');
    }
    if (taskCard.task_card_id !== run.active_task_card_id) {
        throw new Error(`foreman_delegate integrity mismatch: active task-card ${run.active_task_card_id} does not match loaded task-card ${taskCard.task_card_id}.`);
    }
    if (input.child_agent_id === run.active_agent_id) {
        throw new Error('foreman_delegate cannot declare a child_agent_id that matches the current active_agent_id.');
    }
    if (delegationRecords.some((delegation) => delegation.child_agent.agent_id === input.child_agent_id &&
        (delegation.child_agent.status === 'queued' || delegation.child_agent.status === 'running'))) {
        throw new Error(`foreman_delegate cannot redeclare existing child_agent_id ${input.child_agent_id} for this run.`);
    }
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, taskCard.task_card_id);
    const currentStageDelegationSummary = (0, runtime_1.summarizeTaskDelegations)(taskCard.task_card_id, selectCurrentStageDelegations(run, taskCard, taskDelegationSummary.delegations));
    const maxActiveWorkers = orchestratorState.orchestration_policy.parallelism.max_active_workers;
    if (currentStageDelegationSummary.total > currentStageDelegationSummary.queued) {
        throw new Error(`foreman_delegate cannot declare additional child workers because active task ${taskCard.task_card_id} is already frozen for explicit fan-in after child lifecycle progress started.`);
    }
    if (currentStageDelegationSummary.active >= maxActiveWorkers) {
        throw new Error(`foreman_delegate cannot declare another active child delegation for task ${taskCard.task_card_id} because the explicit cap ${maxActiveWorkers} is already reached (${currentStageDelegationSummary.active} queued/running).`);
    }
    const timestamp = (0, runtime_1.nowTimestamp)();
    const delegationId = await (0, runtime_1.allocateDelegationId)(runPaths);
    const delegation = {
        delegation_id: delegationId,
        run_id: run.run_id,
        task_card_id: taskCard.task_card_id,
        delegated_by_role: run.active_role,
        review_round: null,
        summary: input.summary,
        child_agent: {
            agent_id: input.child_agent_id,
            parent_agent_id: run.active_agent_id,
            role: taskCard.assigned_role,
            status: 'queued',
            task_card_id: taskCard.task_card_id,
        },
        executor: {
            executor_id: `specialist-executor:${input.child_agent_id}`,
            status: 'queued',
            task_card_id: taskCard.task_card_id,
            delegation_id: delegationId,
            child_agent_id: input.child_agent_id,
        },
        worker_request: taskCard.assigned_role === 'code specialist'
            ? {
                prompt: input.summary,
                acceptance: taskCard.acceptance,
            }
            : null,
        worker_lifecycle: (0, runtime_1.createDelegationWorkerLifecycleRecord)({
            createdAt: timestamp,
        }),
        worker_result: null,
        result_summary: null,
        reviewer_outcome: null,
        latest_failure: null,
        created_at: timestamp,
        updated_at: timestamp,
        completed_at: null,
    };
    await (0, runtime_1.persistDelegationWithVisibilitySync)(runPaths, delegation);
    return createForemanDelegateResult(cwd, delegation);
}
async function updateForemanDelegation(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_paths: runPaths } = locator;
    await (0, runtime_1.loadRunRecord)(runPaths);
    await acquireForemanMcpMutationLease({
        cwd,
        runId,
        sessionContext,
        toolName: 'foreman_update_delegation',
    });
    const delegation = await (0, runtime_1.loadDelegationArtifact)(runPaths, input.delegation_id);
    if (delegation.run_id !== runId) {
        throw new Error(`foreman_update_delegation requires delegation ${input.delegation_id} to belong to run ${runId}.`);
    }
    const updatedDelegation = await (0, runtime_1.updateDelegationWithVisibilitySync)(runPaths, {
        delegationId: input.delegation_id,
        status: input.status,
        resultSummary: input.result_summary,
        failureStage: input.failure_stage,
        failureReason: input.failure_reason,
        failureSummary: input.failure_summary,
    });
    return createForemanUpdateDelegationResult(cwd, updatedDelegation);
}
async function startForemanMcpRun(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const cwd = resolveCwd(input.cwd);
    const result = await (0, run_command_1.startForemanRun)({
        cwd,
        goal: input.goal,
        title: input.title,
        intent: input.intent,
        scope: input.scope,
        acceptance: input.acceptance,
        prompt: input.prompt,
    });
    const status = await getForemanStatus({ run_id: result.runId, cwd }, sessionContext);
    return createForemanStartResult(cwd, result, status);
}
async function runForemanMcpRun(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const cwd = resolveCwd(input.cwd);
    const result = await (0, run_command_1.runForemanCommand)({
        cwd,
        goal: input.goal,
        title: input.title,
        intent: input.intent,
        scope: input.scope,
        acceptance: input.acceptance,
        prompt: input.prompt,
        codexPath: input.codex_bin,
    });
    const status = await getForemanStatus({ run_id: result.runId, cwd }, sessionContext);
    return createForemanRunResult(cwd, result, status);
}
async function orchestrateForemanRun(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId } = locator;
    const currentStatus = await loadForemanStatusForOrchestration(cwd, runId);
    const progressionStepCount = resolveForemanOrchestrateProgressionStepCount(input);
    validateForemanOrchestrateLoopInputs(input, progressionStepCount, currentStatus);
    await acquireForemanMcpMutationLease({
        cwd,
        runId,
        sessionContext,
        toolName: 'foreman_orchestrate',
    });
    const loopResult = await (0, orchestration_loop_1.runBoundedOrchestrationLoop)({
        cwd,
        runId,
        entrypoint: 'foreman_orchestrate',
        codexPath: input.codex_bin,
        repairAction: input.repair_action,
        replanPrompt: input.replan_prompt,
        resolveOutcome: input.resolve_outcome,
        resolveSummary: input.resolve_summary,
        maxSteps: progressionStepCount,
        stopAtTaskBoundary: true,
    });
    const nextStatus = await loadForemanStatusForOrchestration(cwd, runId);
    const dispatchedStep = loopResult.attempt.steps.at(-1);
    if (dispatchedStep) {
        const dispatchedStopReason = progressionStepCount === 2 && (loopResult.stopReason === 'await_verification' || loopResult.stopReason === 'await_repair_decision')
            ? loopResult.stopReason
            : null;
        return createForemanOrchestrateResult(nextStatus, {
            orchestration_status: 'dispatched',
            dispatched_command: dispatchedStep.command,
            dispatched_via: getForemanOrchestrateDispatchedHandler(dispatchedStep.command),
            stop_reason: dispatchedStopReason,
            orchestration_summary: buildForemanOrchestrateDispatchedSummary({
                startingNextStep: currentStatus.next_step,
                commands: loopResult.attempt.steps.map((step) => step.command),
                stopReason: loopResult.stopReason,
            }),
        });
    }
    if (!isResultStopReason(loopResult.stopReason)) {
        throw new Error(`Unexpected orchestration loop stop reason ${loopResult.stopReason} for zero-step foreman_orchestrate execution.`);
    }
    return createForemanOrchestrateResult(nextStatus, {
        orchestration_status: 'stopped',
        dispatched_command: null,
        dispatched_via: null,
        stop_reason: loopResult.stopReason,
        orchestration_summary: `No automatic orchestration action is available when next_step=${currentStatus.next_step}. ` +
            (currentStatus.decision_summary ?? 'No task-backed orchestrator summary is available for this run state.'),
    });
}
async function tickForemanAlwaysOnCompanion(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_directory: runDirectory, run_ref: runRef, run_paths: runPaths } = locator;
    await (0, runtime_1.loadRunRecord)(runPaths);
    await acquireForemanMcpMutationLease({
        cwd,
        runId,
        sessionContext,
        toolName: 'foreman_always_on_tick',
    });
    const result = await (0, run_command_1.manageForemanAlwaysOnMode)({
        cwd,
        runId,
        action: 'tick',
        codexPath: input.codex_bin,
        maxSteps: input.max_steps,
    });
    if (result.companionExecution === null) {
        throw new Error(`Always-on companion tick for run ${runId} did not return companion execution details.`);
    }
    const status = await getForemanStatus({ run_dir: runDirectory }, sessionContext);
    return {
        cwd,
        run_id: result.runId,
        run_directory: runDirectory,
        run_ref: runRef,
        task_card_id: result.companionExecution.taskCardId,
        status: result.companionExecution.status,
        stage: result.companionExecution.stage,
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        mcp_mutation_lease: status.mcp_mutation_lease,
        verification_state: result.companionExecution.verificationState,
        next_step: result.companionExecution.nextStep,
        can_advance: result.companionExecution.canAdvance,
        always_on_mode: result.alwaysOnMode,
        always_on_operator_state: status.always_on_operator_state,
        workflow_operator_state: status.workflow_operator_state,
        orchestration_status: result.companionExecution.continued ? 'dispatched' : 'stopped',
        steps_executed: result.companionExecution.stepsExecuted,
        stop_reason: result.companionExecution.stopReason,
        request_settings: result.companionExecution.requestSettings,
        orchestration_summary: result.companionExecution.summary,
    };
}
async function runForemanAlwaysOnLoop(input, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    const locator = resolveForemanRunLocator(input);
    const { cwd, run_id: runId, run_directory: runDirectory, run_ref: runRef, run_paths: runPaths } = locator;
    await (0, runtime_1.loadRunRecord)(runPaths);
    await acquireForemanMcpMutationLease({
        cwd,
        runId,
        sessionContext,
        toolName: 'foreman_always_on_loop',
    });
    const result = await (0, run_command_1.manageForemanAlwaysOnMode)({
        cwd,
        runId,
        action: 'loop',
        codexPath: input.codex_bin,
        maxSteps: input.max_steps,
        maxIterations: input.max_iterations,
        backoffMs: input.backoff_ms,
        maxBackoffMs: input.max_backoff_ms,
    });
    if (result.companionLoop === null) {
        throw new Error(`Always-on companion loop for run ${runId} did not return loop details.`);
    }
    const finalTick = result.companionLoop.finalTick;
    const status = await getForemanStatus({ run_dir: runDirectory }, sessionContext);
    return {
        cwd,
        run_id: result.runId,
        run_directory: runDirectory,
        run_ref: runRef,
        task_card_id: finalTick?.taskCardId ?? '',
        status: finalTick?.status ?? 'active',
        stage: finalTick?.stage ?? 'execution',
        current_task_card: status.current_task_card,
        loop_state: status.loop_state,
        run_truth_surface: status.run_truth_surface,
        server_identity: status.server_identity,
        task_graph_summary: status.task_graph_summary,
        orchestrator_agent_config_summary: status.orchestrator_agent_config_summary,
        orchestrator_request_settings_preview: status.orchestrator_request_settings_preview,
        orchestrator_scope: status.orchestrator_scope,
        orchestrator_scope_summary: status.orchestrator_scope_summary,
        latest_orchestrator_synthesis: status.latest_orchestrator_synthesis,
        mcp_mutation_lease: status.mcp_mutation_lease,
        verification_state: finalTick?.verificationState ?? null,
        next_step: finalTick?.nextStep ?? 'await_operator',
        can_advance: finalTick?.canAdvance ?? false,
        always_on_mode: result.alwaysOnMode,
        always_on_operator_state: status.always_on_operator_state,
        workflow_operator_state: status.workflow_operator_state,
        orchestration_status: result.companionLoop.tickCount > 0 ? 'dispatched' : 'stopped',
        steps_executed: finalTick?.stepsExecuted ?? 0,
        stop_reason: finalTick?.stopReason ?? 'await_operator',
        request_settings: finalTick?.requestSettings ?? {
            execution_request: {
                profile: null,
                config_entries: [],
            },
            verification_request: null,
        },
        orchestration_summary: result.companionLoop.summary,
        tick_count: result.companionLoop.tickCount,
        iteration_count: result.companionLoop.iterationCount,
        backoff_history_ms: result.companionLoop.backoffHistoryMs,
    };
}
async function handleMcpRequest(value, sessionContext = DEFAULT_MCP_SESSION_CONTEXT) {
    assertJsonRpcRequest(value);
    if (value.method === 'notifications/initialized') {
        return null;
    }
    if (!hasRequestId(value)) {
        return null;
    }
    try {
        switch (value.method) {
            case 'initialize': {
                const protocolVersion = isRecord(value.params)
                    ? negotiateProtocolVersion(value.params.protocolVersion)
                    : MCP_PROTOCOL_VERSION;
                const instructions = await createMcpInitializeInstructions(process.cwd());
                return createSuccessResponse(value.id, {
                    protocolVersion,
                    capabilities: {
                        tools: {},
                    },
                    serverInfo: MCP_SERVER_INFO,
                    instructions,
                });
            }
            case 'ping':
                return createSuccessResponse(value.id, {});
            case 'tools/list':
                return createSuccessResponse(value.id, {
                    tools: FOREMAN_TOOLS,
                });
            case 'tools/call': {
                if (!isRecord(value.params)) {
                    throw new Error('tools/call params must be an object.');
                }
                const toolName = readRequiredString(value.params, 'name');
                if (toolName === FOREMAN_SERVER_IDENTITY_TOOL.name) {
                    const result = await getForemanServerIdentity(sessionContext);
                    const companionNames = result.install_check.otherInstalledMcpServers.length > 0
                        ? result.install_check.otherInstalledMcpServers.map((server) => server.name).join(', ')
                        : 'none';
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: [
                                    'Attached Foreman MCP session',
                                    `Build: ${result.server_identity.build_identity}`,
                                    `Session: ${result.server_identity.session_id}`,
                                    `Started: ${result.server_identity.started_at}`,
                                    `Entrypoint: ${result.server_identity.entrypoint_path ?? 'none'}`,
                                    `Config: ${result.server_identity.shared_config_path}`,
                                    `Install check: ${result.install_check.status}`,
                                    `Registration: ${result.install_check.registrationStatus}`,
                                    `Session registration match: ${result.install_check.session_registration_match}`,
                                    result.install_check.timeout_diagnosis
                                        ? `Timeout diagnosis: ${result.install_check.timeout_diagnosis.summary}`
                                        : null,
                                    `Registry summary: ${result.install_check.registryInspectionSummary}`,
                                    `Companion MCPs: ${companionNames}`,
                                ]
                                    .filter((line) => line !== null)
                                    .join('\n'),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_STATUS_TOOL.name) {
                    const status = await getForemanStatus(parseForemanStatusArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(status.cwd);
                    const operatorViewText = ` Operator view: ${createTaskOperatorVisibilitySummary(status.current_task_card)} ` +
                        `${createRunTruthOperatorVisibilitySummary(status.run_truth_surface)} ` +
                        `${createCaptainLoopOperatorVisibilitySummary(status)} ` +
                        `${createWorkflowOperatorVisibilitySummary(status)} ` +
                        `${createOrchestratorOperatorVisibilitySummary(status)} ` +
                        `${createOrchestratorSynthesisOperatorVisibilitySummary(status)} ` +
                        `${createTaskGraphOperatorVisibilitySummary(status)} ` +
                        `${createHydrationOperatorVisibilitySummary(status.hydration)} ` +
                        `${createLeaseOperatorVisibilitySummary(status.mcp_mutation_lease)} ` +
                        `${createServerIdentityOperatorVisibilitySummary(status)} ` +
                        `${createAlwaysOnOperatorVisibilitySummary(status.always_on_operator_state)}.`;
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: status.planning_clarification_request === null
                                    ? verbosity === 'debug'
                                        ? appendContinuityText(`Run ${status.run_id} is ${status.status} at stage ${status.stage}. Current next_step=${status.next_step}.${operatorViewText}`)
                                        : verbosity === 'quiet'
                                            ? createQuietOperatorVisibilitySummary(status.current_task_card, status.run_lifecycle, status.next_step, status.loop_state, status.run_truth_surface, status.workflow_operator_state)
                                            : createDefaultOperatorVisibilitySummary(status.current_task_card, status.run_lifecycle, status.next_step, status.loop_state, status.run_truth_surface, status.workflow_operator_state, status.task_graph_summary, status)
                                    : appendClarificationText(`Run ${status.run_id} is blocked at stage planning with next_step=await_clarification. No active task runtime exists yet.`),
                            },
                        ],
                        structuredContent: status,
                    });
                }
                if (toolName === FOREMAN_ACTIVITY_TOOL.name) {
                    const result = await getForemanActivity(parseForemanActivityArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    const latestAttemptText = result.latest_orchestration_attempt
                        ? ` Latest attempt ${result.latest_orchestration_attempt.attempt_id}: ${result.latest_orchestration_attempt.summary}`
                        : ' No orchestration attempt is recorded yet.';
                    const operatorViewText = ` Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ` +
                        `${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ` +
                        `${createCaptainLoopOperatorVisibilitySummary(result)} ` +
                        `${createWorkflowOperatorVisibilitySummary(result)} ` +
                        `${createOrchestratorOperatorVisibilitySummary(result)} ` +
                        `${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ` +
                        `${createTaskGraphOperatorVisibilitySummary(result)} ` +
                        `${createHydrationOperatorVisibilitySummary(result.hydration)} ` +
                        `${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ` +
                        `${createServerIdentityOperatorVisibilitySummary(result)} ` +
                        `${createAlwaysOnOperatorVisibilitySummary(result.always_on_operator_state)}.`;
                    const activityText = result.planning_clarification_request === null
                        ? verbosity === 'debug'
                            ? appendContinuityText(`Run ${result.run_id} is ${result.status} at stage ${result.stage} with next_step=${result.next_step}. ` +
                                `Active task delegations: ${result.active_task_delegations?.queued ?? 0} queued, ${result.active_task_delegations?.running ?? 0} running.` +
                                operatorViewText +
                                latestAttemptText)
                            : verbosity === 'quiet'
                                ? createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state)
                                : createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result)
                        : appendClarificationText(`Run ${result.run_id} is blocked at stage planning with next_step=await_clarification. ` +
                            `No active task, delegation runtime, or orchestration attempt exists yet.`);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: activityText,
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_RECOMMEND_ENTRY_TOOL.name) {
                    const result = await recommendForemanEntryForMcp(parseForemanRecommendEntryArguments(value.params.arguments));
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: `Foreman entry recommendation for this request is ${result.recommended_entrypoint} ` +
                                    `with confidence=${result.confidence}, task_shape=${result.task_shape}, and policy=${result.policy_mode}. ` +
                                    `Operator view: captain_model=${result.orchestrator_request_settings_preview.model ?? 'none'} ` +
                                    `captain_variant=${result.orchestrator_request_settings_preview.variant ?? 'none'} ` +
                                    `scope=${result.orchestrator_scope} ` +
                                    `entry_boundary=${result.entry_boundary} ` +
                                    `upstream_intercept_supported=${result.upstream_codex_binary_intercept_supported}.` +
                                    `${result.timeout_diagnosis ? ` Timeout diagnosis: ${result.timeout_diagnosis.summary}` : ''}`,
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_AUTO_ENTRY_TOOL.name) {
                    const result = await autoEnterForemanForMcp(parseForemanAutoEntryArguments(value.params.arguments));
                    const visibilitySummary = `policy=${result.policy_mode}, entry_boundary=${result.entry_boundary}, ` +
                        `upstream_intercept_supported=${result.upstream_codex_binary_intercept_supported}, ` +
                        `fresh_active_runs=${result.fresh_active_run_count}, stale_active_runs=${result.stale_active_run_count}`;
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: result.run_selection === 'existing_run_reused' && result.run_id
                                    ? `Foreman auto-entry reused active run ${result.run_id} with ${visibilitySummary}, next_step=${result.next_step}, and decision_reason=${result.run_decision_reason}.`
                                    : result.created
                                        ? `Foreman auto-entry created run ${result.run_id} through ${result.entrypoint_used} with ${visibilitySummary}, next_step=${result.next_step}, and decision_reason=${result.run_decision_reason}.`
                                        : `Foreman auto-entry did not create a run because policy=${result.policy_mode} still requires an explicit entry call. entry_boundary=${result.entry_boundary} upstream_intercept_supported=${result.upstream_codex_binary_intercept_supported}. Use ${result.recommendation.suggested_cli_command}.` +
                                            `${result.timeout_diagnosis ? ` Timeout diagnosis: ${result.timeout_diagnosis.summary}` : ''}`,
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_START_TOOL.name) {
                    const result = await startForemanMcpRun(parseForemanStartArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: verbosity === 'debug'
                                    ? `Run ${result.run_id} was prepared locally in ${result.cwd} with status ${result.status} at stage ${result.stage}. ` +
                                        `Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ` +
                                        `${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ` +
                                        `${createCaptainLoopOperatorVisibilitySummary(result)} ` +
                                        `${createWorkflowOperatorVisibilitySummary(result)} ` +
                                        `${createOrchestratorOperatorVisibilitySummary(result)} ` +
                                        `${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ` +
                                        `${createTaskGraphOperatorVisibilitySummary(result)} ` +
                                        `${createServerIdentityOperatorVisibilitySummary(result)}. Codex was not invoked.`
                                    : verbosity === 'quiet'
                                        ? createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state)
                                        : createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_RUN_TOOL.name) {
                    const result = await runForemanMcpRun(parseForemanRunArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: verbosity === 'debug'
                                    ? `Run ${result.run_id} was created locally in ${result.cwd} and advanced through the bounded start+advance flow to stage ${result.stage} with next_step=${result.next_step}. ` +
                                        `Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ` +
                                        `${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ` +
                                        `${createCaptainLoopOperatorVisibilitySummary(result)} ` +
                                        `${createWorkflowOperatorVisibilitySummary(result)} ` +
                                        `${createOrchestratorOperatorVisibilitySummary(result)} ` +
                                        `${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ` +
                                        `${createTaskGraphOperatorVisibilitySummary(result)} ` +
                                        `${createServerIdentityOperatorVisibilitySummary(result)}.`
                                    : verbosity === 'quiet'
                                        ? createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state)
                                        : createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_DELEGATIONS_TOOL.name) {
                    const result = await getForemanDelegations(parseForemanDelegationsArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    const operatorViewText = ` Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ` +
                        `${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ` +
                        `${createCaptainLoopOperatorVisibilitySummary(result)} ` +
                        `${createWorkflowOperatorVisibilitySummary(result)} ` +
                        `${createOrchestratorOperatorVisibilitySummary(result)} ` +
                        `${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ` +
                        `${createTaskGraphOperatorVisibilitySummary(result)} ` +
                        `${createHydrationOperatorVisibilitySummary(result.hydration)} ` +
                        `${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ` +
                        `${createServerIdentityOperatorVisibilitySummary(result)}.`;
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: result.planning_clarification_request === null
                                    ? verbosity === 'debug'
                                        ? result.delegations.length === 0
                                            ? `Run ${result.run_id} has no persisted delegation artifacts in ${result.cwd}.${operatorViewText}`
                                            : `Run ${result.run_id} has ${result.delegations.length} persisted delegation artifact${result.delegations.length === 1 ? '' : 's'} in ${result.cwd}.${operatorViewText}`
                                        : verbosity === 'quiet'
                                            ? [
                                                createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state),
                                                `Delegations: ${result.delegations.length}`,
                                            ].join('\n')
                                            : [
                                                createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                                                `Delegations: ${result.delegations.length}`,
                                            ].join('\n')
                                    : appendClarificationText(`Run ${result.run_id} is blocked awaiting planner clarification, so no task-scoped delegation artifacts exist yet.`),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_DELEGATE_TOOL.name) {
                    const result = await declareForemanDelegation(parseForemanDelegateArguments(value.params.arguments), sessionContext);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: `Run ${result.run_id} declared queued delegation ${result.delegation_id} for task ${result.task_card_id} to child agent ${result.child_agent.agent_id}.`,
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_UPDATE_DELEGATION_TOOL.name) {
                    const result = await updateForemanDelegation(parseForemanUpdateDelegationArguments(value.params.arguments), sessionContext);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: `Run ${result.run_id} updated delegation ${result.delegation_id} to ${result.child_agent.status}.`,
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_ORCHESTRATE_TOOL.name) {
                    const result = await orchestrateForemanRun(parseForemanOrchestrateArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: verbosity === 'debug'
                                    ? result.orchestration_status === 'dispatched'
                                        ? `Run ${result.run_id} was routed through ${result.dispatched_via} and is now ${result.status} at stage ${result.stage} with next_step=${result.next_step}. Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                        : `Run ${result.run_id} was not mutated because next_step=${result.next_step} has no automatic orchestration action in this MCP milestone. Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                    : verbosity === 'quiet'
                                        ? createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state)
                                        : createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_ALWAYS_ON_TICK_TOOL.name) {
                    const result = await tickForemanAlwaysOnCompanion(parseForemanAlwaysOnTickArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: verbosity === 'debug'
                                    ? result.orchestration_status === 'dispatched'
                                        ? `Run ${result.run_id} executed one bounded always-on companion slice and is now ${result.status} at stage ${result.stage} with next_step=${result.next_step}. Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                        : `Run ${result.run_id} inspected the enabled always-on companion state and stopped at ${result.stop_reason} without dispatching a step. Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                    : verbosity === 'quiet'
                                        ? [
                                            createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state),
                                            `Loop: ${result.stop_reason}`,
                                        ].join('\n')
                                        : [
                                            createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                                            `Loop: ${result.stop_reason}`,
                                        ].join('\n'),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                if (toolName === FOREMAN_ALWAYS_ON_LOOP_TOOL.name) {
                    const result = await runForemanAlwaysOnLoop(parseForemanAlwaysOnLoopArguments(value.params.arguments), sessionContext);
                    const verbosity = await resolveOperatorOutputVerbosity(result.cwd);
                    return createSuccessResponse(value.id, {
                        content: [
                            {
                                type: 'text',
                                text: verbosity === 'debug'
                                    ? result.orchestration_status === 'dispatched'
                                        ? `Run ${result.run_id} executed an explicit bounded always-on companion loop and stopped at ${result.stop_reason} after ${result.tick_count} tick(s). Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                        : `Run ${result.run_id} stopped its explicit bounded always-on companion loop at ${result.stop_reason} without dispatching a tick. Operator view: ${createTaskOperatorVisibilitySummary(result.current_task_card)} ${createRunTruthOperatorVisibilitySummary(result.run_truth_surface)} ${createCaptainLoopOperatorVisibilitySummary(result)} ${createWorkflowOperatorVisibilitySummary(result)} ${createOrchestratorOperatorVisibilitySummary(result)} ${createOrchestratorSynthesisOperatorVisibilitySummary(result)} ${createTaskGraphOperatorVisibilitySummary(result)} ${createLeaseOperatorVisibilitySummary(result.mcp_mutation_lease)} ${createServerIdentityOperatorVisibilitySummary(result)}.`
                                    : verbosity === 'quiet'
                                        ? [
                                            createQuietOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state),
                                            `Loop: ${result.stop_reason} after ${result.tick_count} tick(s)`,
                                        ].join('\n')
                                        : [
                                            createDefaultOperatorVisibilitySummary(result.current_task_card, null, result.next_step, result.loop_state, result.run_truth_surface, result.workflow_operator_state, result.task_graph_summary, result),
                                            `Loop: ${result.stop_reason} after ${result.tick_count} tick(s)`,
                                        ].join('\n'),
                            },
                        ],
                        structuredContent: result,
                    });
                }
                return createErrorResponse(value.id, -32601, `Unknown tool: ${toolName}.`);
            }
            default:
                return createErrorResponse(value.id, -32601, `Unsupported MCP method: ${value.method}.`);
        }
    }
    catch (error) {
        return createErrorResponse(value.id, -32602, error instanceof Error ? error.message : 'Invalid MCP request.');
    }
}
function createMcpSession() {
    let lifecycleState = 'awaiting_initialize';
    const sessionContext = createMcpSessionContext();
    return {
        async handleMessage(value) {
            assertJsonRpcRequest(value);
            switch (lifecycleState) {
                case 'awaiting_initialize': {
                    if (value.method !== 'initialize') {
                        return hasRequestId(value)
                            ? createErrorResponse(value.id, MCP_SERVER_NOT_READY_ERROR, 'Server not initialized. Send initialize first.')
                            : null;
                    }
                    const response = await handleMcpRequest(value, sessionContext);
                    if (response && isSuccessResponse(response)) {
                        lifecycleState = 'awaiting_client_initialized';
                    }
                    return response;
                }
                case 'awaiting_client_initialized': {
                    if (value.method === 'notifications/initialized') {
                        lifecycleState = 'ready';
                        return null;
                    }
                    if (value.method === 'tools/list') {
                        return await handleMcpRequest(value, sessionContext);
                    }
                    return hasRequestId(value)
                        ? createErrorResponse(value.id, MCP_SERVER_NOT_READY_ERROR, 'Server not ready. Send notifications/initialized before sending requests.')
                        : null;
                }
                case 'ready': {
                    if (value.method === 'initialize') {
                        return hasRequestId(value)
                            ? createErrorResponse(value.id, -32600, 'Server is already initialized.')
                            : null;
                    }
                    return await handleMcpRequest(value, sessionContext);
                }
            }
        },
    };
}
function runForemanMcpServer(input = process.stdin, output = process.stdout, errorOutput = process.stderr) {
    const transport = new stdio_js_1.StdioServerTransport(input, output);
    const session = createMcpSession();
    let pending = Promise.resolve();
    const dispatchMessage = async (message) => {
        const response = await session.handleMessage(message);
        if (!response) {
            return;
        }
        await transport.send(response);
    };
    transport.onmessage = (message) => {
        pending = pending.then(async () => {
            try {
                await dispatchMessage(message);
            }
            catch (error) {
                await reportStderr(errorOutput, error instanceof Error ? error.message : 'An unexpected MCP server error occurred.');
            }
        });
    };
    transport.onerror = (error) => {
        pending = pending.then(async () => {
            await reportStderr(errorOutput, error.message);
        });
    };
    void transport.start().catch((error) => {
        pending = pending.then(async () => {
            await reportStderr(errorOutput, error instanceof Error ? error.message : 'Failed to start MCP stdio transport.');
        });
    });
}
//# sourceMappingURL=mcp-server.js.map