"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCliArgs = parseCliArgs;
exports.runCli = runCli;
const promises_1 = require("node:timers/promises");
const cli_mutation_lease_1 = require("./cli-mutation-lease");
const entry_policy_1 = require("./entry-policy");
const navigation_aids_1 = require("./navigation-aids");
const runtime_1 = require("./runtime");
const run_command_1 = require("./run-command");
const mcp_server_1 = require("./mcp-server");
const setup_codex_mcp_1 = require("./setup-codex-mcp");
class UsageError extends Error {
}
function usage() {
    return [
        'Usage:',
        '  codex-foreman plan --goal <text> --prompt <text> [--codex-bin <path>] [--profile <name>] [-c key=value ...] [--cwd <path>]',
        '    Run one explicit planner pass, require one strict JSON object containing either ordered task_cards or a clarification_request, and leave the run execution-ready or paused for clarification.',
        '  codex-foreman start --goal <text> --title <text> --intent <text> --scope <text> --acceptance <text> --prompt <text> [--profile <name>] [-c key=value ...] [--cwd <path>]',
        '    Prepare an execution-ready run from operator-supplied scoped task inputs. Does not invoke Codex or planner automation.',
        '  codex-foreman auto-entry --request <text> [--codex-bin <path>] [--cwd <path>]',
        '    Opt-in bounded Foreman-first entry. It reads shared entry policy, recommends start or plan, and only creates a run automatically when the policy mode allows it.',
        '  codex-foreman recommend-entry --request <text> [--cwd <path>]',
        '    Recommend whether a new request should enter Foreman through start or plan. This is read-only operator guidance and does not create a run.',
        '  codex-foreman advise --run-id <id> [--codex-bin <path>] [--profile <name>] [-c key=value ...] [--cwd <path>]',
        '    Run one read-only advisory Codex pass against the current active task, require one strict JSON object containing summary and recommended_next_action, and leave persisted Foreman state unchanged.',
        '  codex-foreman advance --run-id <id> [--codex-bin <path>] [--cwd <path>]',
        '    Resume a persisted run and perform the next orchestrator-approved step. This is the main explicit execution entrypoint.',
        '  codex-foreman continue --run-id <id> [--codex-bin <path>] [--max-steps <n>] [--cwd <path>]',
        '    Thin wrapper over advance/verify only: it chains already-approved execution and verification steps, then stops at manual/operator boundaries or when the safe max-steps window is consumed.',
        '  codex-foreman watch --run-id <id> [--interval-ms <n>] [--iterations <n>] [--activity] [--show-changes] [--changes-only] [--quiet|--debug] [--cwd <path>]',
        '    Poll persisted Foreman status and optionally recent activity for terminal use. Default output follows foreman-config verbosity, while --quiet and --debug override it for this watch invocation only.',
        '  codex-foreman always-on --run-id <id> --action <start|stop|status|tick|loop> [--codex-bin <path>] [--max-steps <n>] [--max-iterations <n>] [--backoff-ms <n>] [--max-backoff-ms <n>] [--cwd <path>]',
        '    Manage the opt-in always-on companion mode for one persisted run. start/stop/status update inspectable state, tick runs one bounded companion executor slice, and loop repeatedly calls that bounded tick with explicit stop/backoff rules.',
        '  codex-foreman verify --run-id <id> [--codex-bin <path>] [--cwd <path>]',
        '    Run the explicit verifier automation step when the persisted run is pending verification and verification input is available.',
        '  codex-foreman retry --run-id <id> [--cwd <path>]',
        '    Reuse the current verification-blocked task-card for one explicit repair attempt. Leaves the run execution-ready and still requires a later advance.',
        '  codex-foreman replan --run-id <id> --prompt <text> [--codex-bin <path>] [--profile <name>] [-c key=value ...] [--cwd <path>]',
        '    Run one explicit repair planner pass from the verification-blocked task context, preserve prior planning evidence, and leave only the first new repair task execution-ready on success.',
        '  codex-foreman resolve --run-id <id> --outcome <passed|needs_work|blocked> --summary <text> [--cwd <path>]',
        '    Resolve a verification-pending run explicitly through the verifier/operator path.',
        '  codex-foreman setup [--codex-bin <path>] [--server-name <name>]',
        '    Register the installed codex-foreman MCP server with Codex CLI, install or refresh the packaged $cap skill and custom-agent roster under the local Codex home, and add the MCP only when no conflicting registration exists.',
        '  codex-foreman check-install [--codex-bin <path>] [--server-name <name>] [--cwd <path>]',
        '    Inspect Foreman MCP registration health, shared config presence, $cap skill state, packaged custom-agent roster state, and other installed Codex MCP servers without mutating Codex config.',
        '  codex-foreman generate-navigation --target-dir <path> [--run-id <id>] [--output-dir <path>] [--validate-only] [--cwd <path>]',
        '    Generate or validate a bounded repository-local navigation bundle for one target directory under .foreman/navigation/. The generated artifacts are derived, non-canonical investigation aids for captain, tactician, and scout.',
        '  codex-foreman run --goal <text> --title <text> --intent <text> --scope <text> --acceptance <text> --prompt <text> [--codex-bin <path>] [--profile <name>] [-c key=value ...] [--cwd <path>]',
        '    Convenience wrapper: start + advance.',
    ].join('\n');
}
function requireValue(flag, argv, index) {
    const value = argv[index + 1];
    if (!value) {
        throw new UsageError(`Missing value for ${flag}.\n${usage()}`);
    }
    return value;
}
function parseIntegerFlag(flag, argv, index) {
    const rawValue = requireValue(flag, argv, index);
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed)) {
        throw new UsageError(`Invalid value for ${flag}: ${rawValue}. Expected an integer.\n${usage()}`);
    }
    return parsed;
}
function clampContinueMaxSteps(maxSteps) {
    return Math.min(4, Math.max(1, maxSteps));
}
function clampWatchIntervalMs(intervalMs) {
    return Math.min(30_000, Math.max(250, intervalMs));
}
function clampWatchIterations(iterations) {
    return Math.min(10_000, Math.max(1, iterations));
}
function parseStartLikeOptions(rest, command) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--goal':
                options.goal = requireValue(token, rest, index);
                index += 1;
                break;
            case '--title':
                options.title = requireValue(token, rest, index);
                index += 1;
                break;
            case '--intent':
                options.intent = requireValue(token, rest, index);
                index += 1;
                break;
            case '--scope':
                options.scope = requireValue(token, rest, index);
                index += 1;
                break;
            case '--acceptance':
                options.acceptance = requireValue(token, rest, index);
                index += 1;
                break;
            case '--prompt':
                options.prompt = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                if (command !== 'run') {
                    throw new UsageError(`--codex-bin is not supported for the ${command} command.\n${usage()}`);
                }
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--profile':
                options.profile = requireValue(token, rest, index);
                index += 1;
                break;
            case '-c':
            case '--config': {
                const configEntry = requireValue(token, rest, index);
                if (!configEntry.includes('=')) {
                    throw new UsageError(`Config values must use key=value format: ${configEntry}.`);
                }
                if (!options.configEntries) {
                    options.configEntries = [];
                }
                options.configEntries.push(configEntry);
                index += 1;
                break;
            }
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    const requiredFields = ['goal', 'title', 'intent', 'scope', 'acceptance', 'prompt'];
    for (const field of requiredFields) {
        if (!options[field]) {
            throw new UsageError(`Missing required flag --${field.replace('_', '-')}.\n${usage()}`);
        }
    }
    if (command === 'run') {
        return options;
    }
    const { codexPath: _ignoredCodexPath, ...startOptions } = options;
    return startOptions;
}
function parsePlanOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--goal':
                options.goal = requireValue(token, rest, index);
                index += 1;
                break;
            case '--prompt':
                options.prompt = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--profile':
                options.profile = requireValue(token, rest, index);
                index += 1;
                break;
            case '-c':
            case '--config': {
                const configEntry = requireValue(token, rest, index);
                if (!configEntry.includes('=')) {
                    throw new UsageError(`Config values must use key=value format: ${configEntry}.`);
                }
                if (!options.configEntries) {
                    options.configEntries = [];
                }
                options.configEntries.push(configEntry);
                index += 1;
                break;
            }
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.goal) {
        throw new UsageError(`Missing required flag --goal.\n${usage()}`);
    }
    if (!options.prompt) {
        throw new UsageError(`Missing required flag --prompt.\n${usage()}`);
    }
    return options;
}
function parseAdvanceOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    return options;
}
function parseAdviseOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--profile':
                options.profile = requireValue(token, rest, index);
                index += 1;
                break;
            case '-c':
            case '--config': {
                const configEntry = requireValue(token, rest, index);
                if (!configEntry.includes('=')) {
                    throw new UsageError(`Config values must use key=value format: ${configEntry}.`);
                }
                if (!options.configEntries) {
                    options.configEntries = [];
                }
                options.configEntries.push(configEntry);
                index += 1;
                break;
            }
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    return options;
}
function parseRecommendEntryOptions(rest) {
    const options = {
        cwd: process.cwd(),
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--request':
                options.request = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.request) {
        throw new UsageError(`Missing required flag --request.\n${usage()}`);
    }
    return options;
}
function parseAutoEntryOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--request':
                options.request = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.request) {
        throw new UsageError(`Missing required flag --request.\n${usage()}`);
    }
    return options;
}
function parseContinueOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--max-steps':
                options.maxSteps = clampContinueMaxSteps(parseIntegerFlag(token, rest, index));
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    return options;
}
function parseWatchOptions(rest) {
    const options = {
        cwd: process.cwd(),
        intervalMs: 2_000,
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--interval-ms':
                options.intervalMs = clampWatchIntervalMs(parseIntegerFlag(token, rest, index));
                index += 1;
                break;
            case '--iterations':
                options.iterations = clampWatchIterations(parseIntegerFlag(token, rest, index));
                index += 1;
                break;
            case '--activity':
                options.showActivity = true;
                break;
            case '--show-changes':
                options.showChanges = true;
                break;
            case '--changes-only':
                options.changesOnly = true;
                break;
            case '--quiet':
                options.quiet = true;
                break;
            case '--debug':
                options.debug = true;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    if (options.quiet && options.debug) {
        throw new UsageError(`--quiet and --debug cannot be used together.\n${usage()}`);
    }
    return options;
}
function parseAlwaysOnOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--action': {
                const action = requireValue(token, rest, index);
                if (action !== 'start' && action !== 'stop' && action !== 'status' && action !== 'tick' && action !== 'loop') {
                    throw new UsageError(`Invalid --action value: ${action}. Expected start, stop, status, tick, or loop.\n${usage()}`);
                }
                options.action = action;
                index += 1;
                break;
            }
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--max-steps':
                options.maxSteps = clampContinueMaxSteps(parseIntegerFlag(token, rest, index));
                index += 1;
                break;
            case '--max-iterations':
                options.maxIterations = parseIntegerFlag(token, rest, index);
                index += 1;
                break;
            case '--backoff-ms':
                options.backoffMs = parseIntegerFlag(token, rest, index);
                index += 1;
                break;
            case '--max-backoff-ms':
                options.maxBackoffMs = parseIntegerFlag(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    if (!options.action) {
        throw new UsageError(`Missing required flag --action.\n${usage()}`);
    }
    return options;
}
function didContinueChangeActiveTask(steps) {
    return steps.some((step) => step.taskCardIdBefore !== step.taskCardIdAfter);
}
function formatContinueManualNextHint(result) {
    if (result.latestResponse?.user_message) {
        return result.latestResponse.user_message;
    }
    if (result.latestOrchestratorSynthesis?.user_message) {
        return result.latestOrchestratorSynthesis.user_message;
    }
    if (result.stopReason === 'await_verification') {
        return 'resolve the verification decision to continue';
    }
    if (result.stopReason === 'await_repair_decision') {
        return 'retry or replan the blocked task to continue';
    }
    if (result.stopReason === 'task_boundary_reached') {
        return 'commit/push the completed task, then advance to the next task';
    }
    return null;
}
function formatContinueStepTrace(step) {
    return [
        'continue_step',
        `step=${step.stepNumber}`,
        `command=${step.command}`,
        `task_card_id_before=${step.taskCardIdBefore}`,
        `task_card_id_after=${step.taskCardIdAfter}`,
        `stage_before=${step.stageBefore}`,
        `stage_after=${step.stageAfter}`,
        `next_step_before=${step.nextStepBefore}`,
        `next_step_after=${step.nextStepAfter}`,
        `advanced=${step.advanced}`,
        `verified=${step.verified}`,
    ].join(' ');
}
function formatAdvisedNextCommand(runId, action) {
    switch (action) {
        case 'advance':
            return `codex-foreman advance --run-id ${runId}`;
        case 'verify':
            return `codex-foreman verify --run-id ${runId}`;
        case 'resolve':
            return `codex-foreman resolve --run-id ${runId} --outcome <passed|needs_work|blocked> --summary <text>`;
        case 'retry':
            return `codex-foreman retry --run-id ${runId}`;
        case 'replan':
            return `codex-foreman replan --run-id ${runId} --prompt <text>`;
    }
    const unsupportedAction = action;
    throw new Error(`Unsupported advised next action: ${unsupportedAction}`);
}
function compactWatchText(value, fallback = 'none') {
    const compacted = value?.replace(/\s+/g, ' ').trim();
    return compacted && compacted.length > 0 ? compacted : fallback;
}
function quoteWatchText(value) {
    return `"${compactWatchText(value).replace(/"/g, "'")}"`;
}
function formatAlwaysOnRequestSettingsLine(requestSettings) {
    const formatRequest = (label, request) => request === null
        ? `${label}_profile=none ${label}_config_entries=none`
        : `${label}_profile=${compactWatchText(request.profile)} ${label}_config_entries=${compactWatchText(request.config_entries.join(','))}`;
    return `Always-on request settings: ${formatRequest('execution', requestSettings.execution_request)} ${formatRequest('verification', requestSettings.verification_request)}`;
}
function formatTaskCardRequestSummary(status) {
    const requestSettings = status.current_task_card?.resolved_request_settings;
    if (requestSettings !== null && requestSettings !== undefined) {
        return [
            `task_request=${requestSettings.request_kind}`,
            `task_profile=${compactWatchText(requestSettings.profile)}`,
            `task_model=${compactWatchText(requestSettings.model)}`,
            `task_variant=${compactWatchText(requestSettings.variant)}`,
        ].join(' ');
    }
    const agentConfigSummary = status.current_task_card?.agent_config_summary;
    if (agentConfigSummary !== null && agentConfigSummary !== undefined) {
        return [
            `task_request=none`,
            `task_profile=${compactWatchText(agentConfigSummary.profile)}`,
            `task_model=${compactWatchText(agentConfigSummary.model)}`,
            `task_variant=${compactWatchText(agentConfigSummary.variant)}`,
        ].join(' ');
    }
    return 'task_request=none task_profile=none task_model=none task_variant=none';
}
function formatOrchestratorRequestSummary(status) {
    return [
        `captain_profile=${compactWatchText(status.orchestrator_request_settings_preview?.profile ?? status.orchestrator_agent_config_summary?.profile)}`,
        `captain_model=${compactWatchText(status.orchestrator_request_settings_preview?.model ?? status.orchestrator_agent_config_summary?.model)}`,
        `captain_variant=${compactWatchText(status.orchestrator_request_settings_preview?.variant ?? status.orchestrator_agent_config_summary?.variant)}`,
    ].join(' ');
}
function formatAlwaysOnOperatorSummary(status) {
    return [
        `always_on_phase=${compactWatchText(status.always_on_operator_state.phase)}`,
        `always_on_next=${compactWatchText(status.always_on_operator_state.recommended_operator_action)}`,
        `always_on_last_tick=${compactWatchText(status.always_on_operator_state.last_tick_at)}`,
        `always_on_last_loop_stop=${compactWatchText(status.always_on_operator_state.last_loop_stop_reason)}`,
    ].join(' ');
}
function formatWorkflowOperatorSummary(status) {
    const workflow = status.workflow_operator_state;
    return [
        `workflow_phase=${compactWatchText(workflow?.phase)}`,
        `workflow_next=${compactWatchText(workflow?.recommended_operator_action)}`,
        `explore_evidence=${compactWatchText(workflow?.explore_evidence_state)}`,
        `plan_update=${workflow?.plan_update_available ? 'recorded' : 'missing'}`,
    ].join(' ');
}
function formatWatchMutationLeaseSummary(status) {
    const lease = status.mcp_mutation_lease;
    return [
        `lease_state=${compactWatchText(lease?.state)}`,
        `lease_owner=${compactWatchText(lease?.owner_session_id)}`,
        `lease_tool=${compactWatchText(lease?.last_mutating_tool)}`,
    ].join(' ');
}
function formatWatchServerIdentitySummary(status) {
    const identity = status.server_identity;
    return [
        `server_version=${compactWatchText(identity?.server_version)}`,
        `server_session=${compactWatchText(identity?.session_id)}`,
        `server_started_at=${compactWatchText(identity?.started_at)}`,
        `server_build=${quoteWatchText(identity?.build_identity)}`,
    ].join(' ');
}
function formatWatchTaskGraphSummary(status) {
    const graphSummary = status.task_graph_summary ?? {
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
    return [
        `graph_total=${graphSummary.total_task_cards}`,
        `graph_queued=${graphSummary.queued_task_cards}`,
        `graph_ready=${graphSummary.ready_execution_tasks}`,
        `graph_low_cost_ready=${graphSummary.ready_low_cost_tasks}`,
        `graph_review=${graphSummary.queued_review_tasks}`,
        `graph_fan_in=${graphSummary.queued_fan_in_tasks}`,
    ].join(' ');
}
function formatReadableWorkerAssignments(status) {
    const workerVisibility = status.worker_visibility;
    if (!workerVisibility) {
        return 'No active workers.';
    }
    const activeWorkers = workerVisibility.active_workers ?? [];
    const allWorkers = workerVisibility.workers ?? [];
    const visibleSource = activeWorkers.length > 0 ? activeWorkers : allWorkers;
    if (visibleSource.length === 0) {
        return workerVisibility?.summary ?? 'No active workers.';
    }
    const visibleWorkers = visibleSource.slice(0, 2).map((worker) => {
        const statusText = compactWatchText(worker.status);
        const summary = compactWatchText(worker.summary);
        return `${worker.readable_name} [${statusText}] ${summary}`;
    });
    const remaining = visibleSource.length - visibleWorkers.length;
    return remaining > 0 ? `${visibleWorkers.join('; ')}; +${remaining} more worker(s)` : visibleWorkers.join('; ');
}
function resolveWatchVerbosity(options, configuredVerbosity) {
    if (options.quiet) {
        return 'quiet';
    }
    if (options.debug) {
        return 'debug';
    }
    return configuredVerbosity;
}
function resolveWatchModelEvidenceSlug(status) {
    const modelState = status.current_task_card?.model_enforcement_state ?? 'not_started';
    const observationMatch = status.current_task_card?.observation_match_state ??
        status.current_task_card?.actual_model_launch?.observation_match_state ??
        'not_started';
    const observedCapability = status.current_task_card?.observed_capability ?? status.current_task_card?.actual_model_launch?.observed_capability ?? 'unsupported';
    const observationUnavailable = status.current_task_card?.observation_unavailable_reason ??
        status.current_task_card?.actual_model_launch?.observation_unavailable_reason ??
        'none';
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
function describeWatchModelEvidence(status) {
    switch (resolveWatchModelEvidenceSlug(status)) {
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
function describeWatchOwnership(status) {
    const executionOwner = status.current_task_card?.execution_owner ?? 'host_session';
    const codexUiTraceOwner = status.current_task_card?.codex_ui_trace_owner ?? 'host_session';
    const guardVerdict = status.current_task_card?.ownership_guard?.verdict ?? 'ownership_unclear';
    if (executionOwner === 'foreman_worker') {
        return `Foreman worker execution; Codex trace=${codexUiTraceOwner}; sentinel=${guardVerdict}`;
    }
    return `host session work; Codex trace=${codexUiTraceOwner}; sentinel=${guardVerdict}`;
}
function describeWatchConfigDrift(status) {
    const drift = status.current_task_card?.shared_config_drift;
    if (drift === undefined || drift === null) {
        return 'none';
    }
    return `${drift.state} ${drift.request_kind}/${drift.role}: ${drift.persisted_model ?? 'none'} -> ${drift.current_model ?? 'none'}`;
}
function compactWatchRoutingReason(reason) {
    const compacted = compactWatchText(reason);
    if (compacted === 'none') {
        return compacted;
    }
    return compacted.length > 72 ? `${compacted.slice(0, 69)}...` : compacted;
}
function formatWatchRoutingSummary(status) {
    const routingTrace = status.routing_trace;
    const targetRole = compactWatchText(routingTrace?.route_target_role ?? status.current_task_card?.assigned_role ?? status.current_task_card?.owner_role);
    const modelTier = compactWatchText(status.current_task_card?.model_tier_intent);
    const route = compactWatchText(routingTrace?.selected_route);
    const category = compactWatchText(routingTrace?.recommended_category);
    const skills = routingTrace?.recommended_skills && routingTrace.recommended_skills.length > 0
        ? routingTrace.recommended_skills.join(',')
        : undefined;
    return `target=${targetRole} tier=${modelTier} route=${route} category=${category} skills=${compactWatchText(skills)} reason=${compactWatchRoutingReason(routingTrace?.selected_route_reason)}`;
}
function resolveWatchProofState(status) {
    return (status.current_task_card?.execution_proof?.proof_state ??
        'planned_assignment_only');
}
function resolveWatchAgentAndRole(status) {
    const proofState = resolveWatchProofState(status);
    const assignedAgent = compactWatchText(status.current_task_card?.assigned_agent_id ??
        status.current_task_card?.assigned_agent_config_summary?.roster_name ??
        status.active_agent_id ??
        status.current_task_card?.agent_config_summary?.roster_name);
    const ownerAgent = compactWatchText(status.current_task_card?.owner_agent_config_summary?.roster_name ??
        status.current_task_card?.agent_config_summary?.roster_name ??
        status.active_agent_id);
    if (proofState === 'foreman_worker_visible') {
        return {
            agent: compactWatchText(status.current_task_card?.concrete_worker_id ?? assignedAgent),
            role: compactWatchText(status.current_task_card?.assigned_role ?? status.current_task_card?.owner_role ?? status.active_role),
        };
    }
    if (proofState === 'captain_read_only_fallback') {
        return {
            agent: ownerAgent,
            role: compactWatchText(status.current_task_card?.owner_role ?? status.active_role),
        };
    }
    if (proofState === 'host_session_fallback' &&
        (status.current_task_card?.resolved_request_settings?.request_kind === 'verification' ||
            status.current_task_card?.owner_role === 'verifier')) {
        return {
            agent: ownerAgent,
            role: compactWatchText(status.current_task_card?.owner_role ?? status.active_role),
        };
    }
    return {
        agent: assignedAgent,
        role: compactWatchText(status.current_task_card?.assigned_role ?? status.current_task_card?.owner_role ?? status.active_role),
    };
}
function formatWatchAgentLine(status) {
    const proofState = resolveWatchProofState(status);
    const { agent, role } = resolveWatchAgentAndRole(status);
    const suffix = proofState === 'foreman_worker_visible'
        ? ''
        : proofState === 'captain_read_only_fallback'
            ? '; captain fallback'
            : proofState === 'host_session_fallback'
                ? '; host fallback'
                : '; planned';
    return `Agent: ${agent}${role !== 'none' ? ` (${role}${suffix})` : ''}`;
}
function formatWatchModelLine(status) {
    const model = compactWatchText(status.current_task_card?.resolved_request_settings?.model ??
        status.current_task_card?.role_config_snapshot?.model ??
        status.current_task_card?.agent_config_summary?.model);
    const variant = compactWatchText(status.current_task_card?.resolved_request_settings?.variant ??
        status.current_task_card?.role_config_snapshot?.variant ??
        status.current_task_card?.agent_config_summary?.variant);
    const proofState = resolveWatchProofState(status);
    const prefix = proofState === 'foreman_worker_visible'
        ? ''
        : proofState === 'captain_read_only_fallback'
            ? 'captain fallback '
            : proofState === 'host_session_fallback'
                ? 'host fallback '
                : 'planned ';
    return `Model: ${prefix}${model} / ${variant}`;
}
function formatCompactWatchStatusLine(status) {
    return [
        formatWatchAgentLine(status),
        `Task: ${status.current_task_card?.title ?? 'none'}`,
        formatWatchModelLine(status),
        `Graph: total=${status.task_graph_summary?.total_task_cards ?? 0} ready=${status.task_graph_summary?.ready_execution_tasks ?? 0} queued=${status.task_graph_summary?.queued_task_cards ?? 0}`,
    ].join('\n');
}
function formatQuietWatchStatusLine(status) {
    return [
        formatWatchAgentLine(status),
        formatWatchModelLine(status),
        `Phase: ${compactWatchText(status.workflow_operator_state?.phase)}`,
        `Next: ${compactWatchText(status.workflow_operator_state?.recommended_operator_action ?? status.next_step)}`,
    ].join('\n');
}
function formatWatchReviewState(status) {
    const reviewOutcome = status.latest_response?.review_outcome ?? status.latest_orchestrator_synthesis?.review_outcome ?? null;
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
    if (status.current_task_card?.verification_state === 'passed') {
        return 'arbiter passed';
    }
    if (status.current_task_card?.verification_state === 'needs_work') {
        return 'arbiter returned rework';
    }
    if (status.current_task_card?.verification_state === 'blocked') {
        return 'arbiter blocked';
    }
    const reviewStageActive = status.stage === 'verification' ||
        status.active_role === 'verifier' ||
        status.current_task_card?.owner_role === 'verifier' ||
        status.current_task_card?.assigned_role === 'verifier';
    if (reviewStageActive) {
        return (status.worker_visibility?.running_worker_count ?? 0) > 0 ? 'arbiter running' : 'arbiter pending';
    }
    return 'arbiter pending';
}
function formatWatchHandoff(status) {
    if (status.continuity?.latest_handoff_summary) {
        return status.continuity.latest_handoff_summary.replace(/^Latest handoff:\s*/i, '');
    }
    if (status.latest_handoff) {
        return `${status.latest_handoff.from_role} -> ${status.latest_handoff.to_role}`;
    }
    return 'none recorded';
}
function formatWatchStatusLine(status, verbosity) {
    if (verbosity === 'quiet') {
        return formatQuietWatchStatusLine(status);
    }
    if (verbosity !== 'debug') {
        return formatCompactWatchStatusLine(status);
    }
    return [
        `Run ${status.run_id}`,
        `cwd=${quoteWatchText(status.cwd)}`,
        `status=${status.status}`,
        `stage=${status.stage}`,
        `next_step=${status.next_step}`,
        `active_role=${compactWatchText(status.active_role)}`,
        `active_agent=${compactWatchText(status.active_agent_id)}`,
        `task_card_id=${compactWatchText(status.current_task_card?.task_card_id)}`,
        `task_title=${quoteWatchText(status.current_task_card?.title)}`,
        `task_kind=${compactWatchText(status.current_task_card?.task_kind)}`,
        `task_assigned_role=${compactWatchText(status.current_task_card?.assigned_role)}`,
        `task_model_tier=${compactWatchText(status.current_task_card?.model_tier_intent)}`,
        `task_aggregation=${compactWatchText(status.current_task_card?.child_aggregation_contract)}`,
        `task_fan_in=${compactWatchText(status.current_task_card?.fan_in_barrier_semantics)}`,
        `task_gate=${compactWatchText(status.current_task_card?.orchestrator_review_gate)}`,
        `task_assignment=${compactWatchText(status.current_task_card?.execution_assignment_state)}`,
        `task_source=${compactWatchText(status.current_task_card?.execution_source)}`,
        `task_execution_owner=${compactWatchText(status.current_task_card?.execution_owner)}`,
        `task_trace_owner=${compactWatchText(status.current_task_card?.codex_ui_trace_owner)}`,
        `task_ownership_summary=${quoteWatchText(status.current_task_card?.ownership_summary)}`,
        `task_worker=${compactWatchText(status.current_task_card?.concrete_worker_id)}`,
        `task_config_drift_state=${compactWatchText(status.current_task_card?.shared_config_drift?.state)}`,
        `task_config_drift_request=${compactWatchText(status.current_task_card?.shared_config_drift?.request_kind)}`,
        `task_config_drift_role=${compactWatchText(status.current_task_card?.shared_config_drift?.role)}`,
        `task_config_drift_summary=${quoteWatchText(status.current_task_card?.shared_config_drift?.summary)}`,
        `task_dispatched_model=${compactWatchText(status.current_task_card?.dispatched_model_launch?.dispatched_model ??
            status.current_task_card?.actual_model_launch?.dispatched_model ??
            status.current_task_card?.actual_model_launch?.actual_model)}`,
        `task_dispatched_variant=${compactWatchText(status.current_task_card?.dispatched_model_launch?.dispatched_variant ??
            status.current_task_card?.actual_model_launch?.dispatched_variant ??
            status.current_task_card?.actual_model_launch?.actual_variant)}`,
        `task_model_state=${compactWatchText(status.current_task_card?.model_enforcement_state)}`,
        `task_observed_model=${compactWatchText(status.current_task_card?.observed_model ?? status.current_task_card?.actual_model_launch?.observed_model)}`,
        `task_observed_variant=${compactWatchText(status.current_task_card?.observed_variant ?? status.current_task_card?.actual_model_launch?.observed_variant)}`,
        `task_observation_state=${compactWatchText(status.current_task_card?.observation_status ?? status.current_task_card?.actual_model_launch?.observation_status)}`,
        `task_observation_match=${compactWatchText(status.current_task_card?.observation_match_state ??
            status.current_task_card?.actual_model_launch?.observation_match_state)}`,
        `task_observed_source=${compactWatchText(status.current_task_card?.observed_source ?? status.current_task_card?.actual_model_launch?.observed_source)}`,
        `task_observed_confidence=${compactWatchText(status.current_task_card?.observed_confidence ?? status.current_task_card?.actual_model_launch?.observed_confidence)}`,
        `task_observed_capability=${compactWatchText(status.current_task_card?.observed_capability ?? status.current_task_card?.actual_model_launch?.observed_capability)}`,
        `task_observation_unavailable=${compactWatchText(status.current_task_card?.observation_unavailable_reason ??
            status.current_task_card?.actual_model_launch?.observation_unavailable_reason)}`,
        `task_evidence=${compactWatchText(resolveWatchModelEvidenceSlug(status))}`,
        `task_observation_mismatch=${quoteWatchText(status.current_task_card?.observation_mismatch_summary ??
            status.current_task_card?.actual_model_launch?.observation_mismatch_summary)}`,
        formatTaskCardRequestSummary(status),
        formatOrchestratorRequestSummary(status),
        `captain_scope=${compactWatchText(status.orchestrator_scope)}`,
        `workers_active=${status.worker_visibility?.active_worker_count ?? 0}`,
        `workers_running=${status.worker_visibility?.running_worker_count ?? 0}`,
        `workers_completed=${status.worker_visibility?.completed_worker_count ?? 0}`,
        `workers_launching=${status.worker_visibility?.launching_worker_count ?? 0}`,
        `workers_returned=${status.worker_visibility?.returned_worker_count ?? 0}`,
        `workers_stale=${status.worker_visibility?.stale_worker_count ?? 0}`,
        `workers_timed_out=${status.worker_visibility?.timed_out_worker_count ?? 0}`,
        `workers_reclaim_needed=${status.worker_visibility?.reclaim_needed_worker_count ?? 0}`,
        formatWatchTaskGraphSummary(status),
        formatWorkflowOperatorSummary(status),
        `synthesis_provenance=${quoteWatchText(status.latest_orchestrator_synthesis?.provenance_header ?? 'none')}`,
        `synthesis_boundary=${compactWatchText(status.latest_orchestrator_synthesis?.boundary)}`,
        `synthesis_step=${compactWatchText(status.latest_orchestrator_synthesis?.next_step)}`,
        `synthesis_action=${compactWatchText(status.latest_orchestrator_synthesis?.recommended_action)}`,
        `synthesis_class=${compactWatchText(status.latest_orchestrator_synthesis?.decision_class)}`,
        `synthesis_review=${compactWatchText(status.latest_orchestrator_synthesis?.review_outcome)}`,
        `response_boundary=${compactWatchText(status.latest_response?.boundary)}`,
        `response_action=${compactWatchText(status.latest_response?.recommended_action)}`,
        `response_provenance=${quoteWatchText(status.latest_response?.provenance_header ?? 'none')}`,
        `always_on=${status.always_on_mode.status}`,
        formatAlwaysOnOperatorSummary(status),
        `context=${quoteWatchText(status.readable_context?.summary)}`,
        formatWatchServerIdentitySummary(status),
        formatWatchMutationLeaseSummary(status),
    ].join(' ');
}
function formatWatchActivityLine(activity, verbosity) {
    if (verbosity === 'quiet') {
        return `activity latest_attempt=${quoteWatchText(activity.latest_orchestration_attempt?.summary ?? null)}`;
    }
    if (verbosity !== 'debug') {
        return [
            'activity',
            `delegations=${quoteWatchText(activity.active_task_delegations === null
                ? 'none'
                : `${activity.active_task_delegations.running} running/${activity.active_task_delegations.queued} queued`)}`,
            `loop=${quoteWatchText(activity.always_on_mode.last_companion_loop?.summary ?? null)}`,
        ].join(' ');
    }
    const latestAttemptSummary = activity.latest_orchestration_attempt?.summary ?? null;
    const latestLoopSummary = activity.always_on_mode.last_companion_loop?.summary ?? null;
    const delegationSummary = activity.active_task_delegations === null
        ? 'none'
        : `${activity.active_task_delegations.queued} queued, ${activity.active_task_delegations.running} running, ${activity.active_task_delegations.completed} completed`;
    return [
        'activity',
        `latest_attempt=${quoteWatchText(latestAttemptSummary)}`,
        `delegations=${quoteWatchText(delegationSummary)}`,
        `loop=${quoteWatchText(latestLoopSummary)}`,
    ].join(' ');
}
function createWatchSnapshot(status, activity) {
    const graphSummary = status.task_graph_summary ?? {
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
    return {
        cwd: compactWatchText(status.cwd),
        status: compactWatchText(status.status),
        stage: compactWatchText(status.stage),
        next_step: compactWatchText(status.next_step),
        active_role: compactWatchText(status.active_role),
        active_agent: compactWatchText(status.active_agent_id),
        task_card_id: compactWatchText(status.current_task_card?.task_card_id),
        task_title: compactWatchText(status.current_task_card?.title),
        task_summary: compactWatchText(status.current_task_card?.title),
        task_kind: compactWatchText(status.current_task_card?.task_kind),
        task_assigned_role: compactWatchText(status.current_task_card?.assigned_role),
        task_model_tier: compactWatchText(status.current_task_card?.model_tier_intent),
        task_aggregation: compactWatchText(status.current_task_card?.child_aggregation_contract),
        task_fan_in: compactWatchText(status.current_task_card?.fan_in_barrier_semantics),
        task_gate: compactWatchText(status.current_task_card?.orchestrator_review_gate),
        task_assignment: compactWatchText(status.current_task_card?.execution_assignment_state),
        task_source: compactWatchText(status.current_task_card?.execution_source),
        task_execution_owner: compactWatchText(status.current_task_card?.execution_owner),
        task_trace_owner: compactWatchText(status.current_task_card?.codex_ui_trace_owner),
        task_ownership_summary: compactWatchText(status.current_task_card?.ownership_summary),
        task_worker: compactWatchText(status.current_task_card?.concrete_worker_id),
        task_config_drift_state: compactWatchText(status.current_task_card?.shared_config_drift?.state),
        task_config_drift_request: compactWatchText(status.current_task_card?.shared_config_drift?.request_kind),
        task_config_drift_role: compactWatchText(status.current_task_card?.shared_config_drift?.role),
        task_config_drift_summary: compactWatchText(status.current_task_card?.shared_config_drift?.summary),
        task_dispatched_model: compactWatchText(status.current_task_card?.dispatched_model_launch?.dispatched_model ??
            status.current_task_card?.actual_model_launch?.dispatched_model ??
            status.current_task_card?.actual_model_launch?.actual_model),
        task_dispatched_variant: compactWatchText(status.current_task_card?.dispatched_model_launch?.dispatched_variant ??
            status.current_task_card?.actual_model_launch?.dispatched_variant ??
            status.current_task_card?.actual_model_launch?.actual_variant),
        task_model_state: compactWatchText(status.current_task_card?.model_enforcement_state),
        task_observed_model: compactWatchText(status.current_task_card?.observed_model ?? status.current_task_card?.actual_model_launch?.observed_model),
        task_observed_variant: compactWatchText(status.current_task_card?.observed_variant ?? status.current_task_card?.actual_model_launch?.observed_variant),
        task_observation_state: compactWatchText(status.current_task_card?.observation_status ?? status.current_task_card?.actual_model_launch?.observation_status),
        task_observation_match: compactWatchText(status.current_task_card?.observation_match_state ??
            status.current_task_card?.actual_model_launch?.observation_match_state),
        task_observed_source: compactWatchText(status.current_task_card?.observed_source ?? status.current_task_card?.actual_model_launch?.observed_source),
        task_observed_confidence: compactWatchText(status.current_task_card?.observed_confidence ?? status.current_task_card?.actual_model_launch?.observed_confidence),
        task_observed_capability: compactWatchText(status.current_task_card?.observed_capability ?? status.current_task_card?.actual_model_launch?.observed_capability),
        task_observation_unavailable: compactWatchText(status.current_task_card?.observation_unavailable_reason ??
            status.current_task_card?.actual_model_launch?.observation_unavailable_reason),
        task_observation_mismatch: compactWatchText(status.current_task_card?.observation_mismatch_summary ??
            status.current_task_card?.actual_model_launch?.observation_mismatch_summary),
        task_request: compactWatchText(status.current_task_card?.resolved_request_settings?.request_kind),
        task_profile: compactWatchText(status.current_task_card?.agent_config_summary?.profile ?? status.current_task_card?.resolved_request_settings?.profile),
        task_model: compactWatchText(status.current_task_card?.agent_config_summary?.model ?? status.current_task_card?.resolved_request_settings?.model),
        task_variant: compactWatchText(status.current_task_card?.agent_config_summary?.variant ?? status.current_task_card?.resolved_request_settings?.variant),
        captain_profile: compactWatchText(status.orchestrator_request_settings_preview?.profile ?? status.orchestrator_agent_config_summary?.profile),
        captain_scope: compactWatchText(status.orchestrator_scope),
        captain_model: compactWatchText(status.orchestrator_request_settings_preview?.model ?? status.orchestrator_agent_config_summary?.model),
        captain_variant: compactWatchText(status.orchestrator_request_settings_preview?.variant ?? status.orchestrator_agent_config_summary?.variant),
        workers_active: String(status.worker_visibility?.active_worker_count ?? 0),
        workers_running: String(status.worker_visibility?.running_worker_count ?? 0),
        workers_completed: String(status.worker_visibility?.completed_worker_count ?? 0),
        workers_launching: String(status.worker_visibility?.launching_worker_count ?? 0),
        workers_returned: String(status.worker_visibility?.returned_worker_count ?? 0),
        workers_stale: String(status.worker_visibility?.stale_worker_count ?? 0),
        workers_timed_out: String(status.worker_visibility?.timed_out_worker_count ?? 0),
        workers_reclaim_needed: String(status.worker_visibility?.reclaim_needed_worker_count ?? 0),
        graph_total: String(graphSummary.total_task_cards),
        graph_queued: String(graphSummary.queued_task_cards),
        graph_ready: String(graphSummary.ready_execution_tasks),
        graph_low_cost_ready: String(graphSummary.ready_low_cost_tasks),
        graph_review: String(graphSummary.queued_review_tasks),
        graph_fan_in: String(graphSummary.queued_fan_in_tasks),
        workflow_phase: compactWatchText(status.workflow_operator_state?.phase),
        workflow_next: compactWatchText(status.workflow_operator_state?.recommended_operator_action),
        explore_evidence: compactWatchText(status.workflow_operator_state?.explore_evidence_state),
        plan_update: status.workflow_operator_state?.plan_update_available ? 'recorded' : 'missing',
        synthesis_boundary: compactWatchText(status.latest_orchestrator_synthesis?.boundary),
        synthesis_step: compactWatchText(status.latest_orchestrator_synthesis?.next_step),
        synthesis_action: compactWatchText(status.latest_orchestrator_synthesis?.recommended_action),
        synthesis_class: compactWatchText(status.latest_orchestrator_synthesis?.decision_class),
        synthesis_review: compactWatchText(status.latest_orchestrator_synthesis?.review_outcome),
        review_state: compactWatchText(formatWatchReviewState(status)),
        latest_handoff: compactWatchText(formatWatchHandoff(status)),
        provenance: compactWatchText(status.latest_response?.provenance_header ?? status.latest_orchestrator_synthesis?.provenance_header),
        always_on: compactWatchText(status.always_on_mode.status),
        always_on_phase: compactWatchText(status.always_on_operator_state.phase),
        always_on_next: compactWatchText(status.always_on_operator_state.recommended_operator_action),
        always_on_last_tick: compactWatchText(status.always_on_operator_state.last_tick_at),
        always_on_last_loop_stop: compactWatchText(status.always_on_operator_state.last_loop_stop_reason),
        lease_state: compactWatchText(status.mcp_mutation_lease?.state),
        lease_owner: compactWatchText(status.mcp_mutation_lease?.owner_session_id),
        lease_tool: compactWatchText(status.mcp_mutation_lease?.last_mutating_tool),
        server_version: compactWatchText(status.server_identity?.server_version),
        server_session: compactWatchText(status.server_identity?.session_id),
        server_started_at: compactWatchText(status.server_identity?.started_at),
        server_build: compactWatchText(status.server_identity?.build_identity),
        context: compactWatchText(status.readable_context?.summary),
        latest_attempt: compactWatchText(activity?.latest_orchestration_attempt?.summary),
        delegation_summary: activity === null || activity.active_task_delegations === null
            ? 'none'
            : `${activity.active_task_delegations.queued} queued, ${activity.active_task_delegations.running} running, ${activity.active_task_delegations.completed} completed`,
        loop_summary: compactWatchText(activity?.always_on_mode.last_companion_loop?.summary),
    };
}
function formatWatchChangesLine(previousSnapshot, nextSnapshot) {
    const changes = Object.entries(nextSnapshot)
        .filter(([key, value]) => previousSnapshot[key] !== value)
        .map(([key, value]) => `${key}=${quoteWatchText(previousSnapshot[key])}->${quoteWatchText(value)}`);
    if (changes.length === 0) {
        return null;
    }
    return ['changes', ...changes].join(' ');
}
async function runWatchCommand(options) {
    let remainingIterations = options.iterations ?? null;
    let previousOutput = null;
    let previousSnapshot = null;
    const configuredVerbosity = await Promise.resolve((0, runtime_1.loadForemanConfig)(options.cwd))
        .then((config) => config?.output?.verbosity ?? 'default')
        .catch(() => 'default');
    const verbosity = resolveWatchVerbosity(options, configuredVerbosity);
    while (remainingIterations === null || remainingIterations > 0) {
        const status = await (0, mcp_server_1.getForemanStatus)({
            cwd: options.cwd,
            run_id: options.runId,
        });
        const activity = options.showActivity
            ? await (0, mcp_server_1.getForemanActivity)({
                cwd: options.cwd,
                run_id: options.runId,
            })
            : null;
        const outputLines = [formatWatchStatusLine(status, verbosity)];
        if (activity !== null) {
            outputLines.push(formatWatchActivityLine(activity, verbosity));
        }
        const snapshot = createWatchSnapshot(status, activity);
        if (options.showChanges && previousSnapshot !== null) {
            const changesLine = formatWatchChangesLine(previousSnapshot, snapshot);
            if (changesLine !== null) {
                outputLines.push(changesLine);
            }
        }
        const output = `${outputLines.join('\n')}\n`;
        if (!options.changesOnly || output !== previousOutput) {
            process.stdout.write(output);
            previousOutput = output;
        }
        previousSnapshot = snapshot;
        if (remainingIterations !== null) {
            remainingIterations -= 1;
            if (remainingIterations === 0) {
                return;
            }
        }
        await (0, promises_1.setTimeout)(options.intervalMs);
    }
}
async function withCliRunMutationLease(input, execute) {
    await (0, cli_mutation_lease_1.acquireCliRunMutationLease)({
        cwd: input.cwd,
        runId: input.runId,
        session: (0, cli_mutation_lease_1.createCliMutationLeaseSessionContext)(),
        action: input.action,
    });
    return execute();
}
function parseResolveOptions(rest) {
    const options = {
        cwd: process.cwd(),
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--outcome': {
                const outcome = requireValue(token, rest, index);
                if (outcome !== 'passed' && outcome !== 'needs_work' && outcome !== 'blocked') {
                    throw new UsageError(`Invalid --outcome value: ${outcome}. Expected passed, needs_work, or blocked.\n${usage()}`);
                }
                options.outcome = outcome;
                index += 1;
                break;
            }
            case '--summary':
                options.summary = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    if (!options.outcome) {
        throw new UsageError(`Missing required flag --outcome.\n${usage()}`);
    }
    if (!options.summary) {
        throw new UsageError(`Missing required flag --summary.\n${usage()}`);
    }
    return options;
}
function parseRetryOptions(rest) {
    const options = {
        cwd: process.cwd(),
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    return options;
}
function parseReplanOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--prompt':
                options.prompt = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--profile':
                options.profile = requireValue(token, rest, index);
                index += 1;
                break;
            case '-c':
            case '--config': {
                const configEntry = requireValue(token, rest, index);
                if (!configEntry.includes('=')) {
                    throw new UsageError(`Config values must use key=value format: ${configEntry}.`);
                }
                if (!options.configEntries) {
                    options.configEntries = [];
                }
                options.configEntries.push(configEntry);
                index += 1;
                break;
            }
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    if (!options.prompt) {
        throw new UsageError(`Missing required flag --prompt.\n${usage()}`);
    }
    return options;
}
function parseVerifyOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.runId) {
        throw new UsageError(`Missing required flag --run-id.\n${usage()}`);
    }
    return options;
}
function parseSetupOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
        serverName: 'codex-foreman',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--server-name':
                options.serverName = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    return options;
}
function parseCheckInstallOptions(rest) {
    const options = {
        cwd: process.cwd(),
        codexPath: 'codex',
        serverName: 'codex-foreman',
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--codex-bin':
                options.codexPath = requireValue(token, rest, index);
                index += 1;
                break;
            case '--server-name':
                options.serverName = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    return options;
}
function parseGenerateNavigationOptions(rest) {
    const options = {
        cwd: process.cwd(),
        validateOnly: false,
    };
    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        switch (token) {
            case '--target-dir':
                options.targetDir = requireValue(token, rest, index);
                index += 1;
                break;
            case '--run-id':
                options.runId = requireValue(token, rest, index);
                index += 1;
                break;
            case '--output-dir':
                options.outputDir = requireValue(token, rest, index);
                index += 1;
                break;
            case '--cwd':
                options.cwd = requireValue(token, rest, index);
                index += 1;
                break;
            case '--validate-only':
                options.validateOnly = true;
                break;
            default:
                throw new UsageError(`Unexpected argument: ${token}.\n${usage()}`);
        }
    }
    if (!options.targetDir) {
        throw new UsageError(`Missing required flag --target-dir.\n${usage()}`);
    }
    return options;
}
function parseCliArgs(argv) {
    const [command, ...rest] = argv;
    if (!command || command === '--help' || command === '-h') {
        throw new UsageError(usage());
    }
    if (command === 'start') {
        return { command, options: parseStartLikeOptions(rest, 'start') };
    }
    if (command === 'plan') {
        return { command, options: parsePlanOptions(rest) };
    }
    if (command === 'advance') {
        return { command, options: parseAdvanceOptions(rest) };
    }
    if (command === 'advise') {
        return { command, options: parseAdviseOptions(rest) };
    }
    if (command === 'recommend-entry') {
        return { command, options: parseRecommendEntryOptions(rest) };
    }
    if (command === 'auto-entry') {
        return { command, options: parseAutoEntryOptions(rest) };
    }
    if (command === 'continue') {
        return { command, options: parseContinueOptions(rest) };
    }
    if (command === 'watch') {
        return { command, options: parseWatchOptions(rest) };
    }
    if (command === 'always-on') {
        return { command, options: parseAlwaysOnOptions(rest) };
    }
    if (command === 'verify') {
        return { command, options: parseVerifyOptions(rest) };
    }
    if (command === 'retry') {
        return { command, options: parseRetryOptions(rest) };
    }
    if (command === 'replan') {
        return { command, options: parseReplanOptions(rest) };
    }
    if (command === 'resolve') {
        return { command, options: parseResolveOptions(rest) };
    }
    if (command === 'setup') {
        return { command, options: parseSetupOptions(rest) };
    }
    if (command === 'check-install') {
        return { command, options: parseCheckInstallOptions(rest) };
    }
    if (command === 'generate-navigation') {
        return { command, options: parseGenerateNavigationOptions(rest) };
    }
    if (command === 'run') {
        return { command, options: parseStartLikeOptions(rest, 'run') };
    }
    throw new UsageError(`Unsupported command: ${command}.\n${usage()}`);
}
async function runCli(argv) {
    try {
        const parsed = parseCliArgs(argv);
        if (parsed.command === 'plan') {
            const result = await (0, run_command_1.planForemanRun)(parsed.options);
            if (result.nextStep === 'await_clarification') {
                process.stdout.write(`Run ${result.runId} planned with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}. Planner clarification is required before task execution can begin.\n`);
                if (result.clarificationRequest !== null) {
                    process.stdout.write(`Planner clarification request: ${result.clarificationRequest}\n`);
                }
            }
            else {
                process.stdout.write(`Run ${result.runId} planned with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}. Use advance to execute the planned task.\n`);
            }
            return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
        }
        if (parsed.command === 'start') {
            const result = await (0, run_command_1.startForemanRun)(parsed.options);
            process.stdout.write(`Run ${result.runId} prepared from operator-supplied scope with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}. Use advance to invoke Codex.\n`);
            return 0;
        }
        if (parsed.command === 'auto-entry') {
            const result = await (0, run_command_1.autoEnterForeman)(parsed.options);
            process.stdout.write(`Foreman auto-entry policy=${result.policy_mode} automatic_entry_supported=${result.automatic_entry_supported} created=${result.created} run_selection=${result.run_selection} recommended_entrypoint=${result.recommendation.recommended_entrypoint} in ${result.cwd}\n`);
            process.stdout.write(`Entry boundary: ${result.entry_boundary} (${result.entry_boundary_summary})\n`);
            process.stdout.write(`Upstream binary intercept supported: ${result.upstream_codex_binary_intercept_supported} (${result.upstream_codex_binary_intercept_summary})\n`);
            process.stdout.write(`Active run inspection: inspected=${result.inspected_active_run_count} fresh=${result.fresh_active_run_count} stale=${result.stale_active_run_count}\n`);
            process.stdout.write(`Run decision: ${result.run_decision_reason}\n`);
            process.stdout.write(`Summary: ${result.summary}\n`);
            if (result.run_id) {
                process.stdout.write(`Run ${result.run_id} selection=${result.run_selection} entrypoint=${result.entrypoint_used ?? 'reused'} scoping_source=${result.scoping_source} status=${result.status} stage=${result.stage} next_step=${result.next_step} in ${result.run_directory}\n`);
            }
            else {
                process.stdout.write(`Fallback explicit CLI command: ${result.recommendation.suggested_cli_command}\n`);
            }
            return 0;
        }
        if (parsed.command === 'advance') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'advance',
            }, () => (0, run_command_1.advanceForemanRun)(parsed.options));
            process.stdout.write(`Run ${result.runId} status=${result.status} stage=${result.stage} next_step=${result.nextStep} advanced=${result.advanced} in ${result.runDirectory}\n`);
            return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
        }
        if (parsed.command === 'advise') {
            const result = await (0, run_command_1.adviseForemanRun)(parsed.options);
            process.stdout.write(`Run ${result.runId} advised for task ${result.taskCardId} with status=${result.status} stage=${result.stage} next_step=${result.nextStep} verification_state=${result.verificationState} in ${result.runDirectory}\n`);
            process.stdout.write(`Advice summary: ${result.advice.summary}\n`);
            process.stdout.write(`Recommended next action: ${result.advice.recommended_next_action} (${formatAdvisedNextCommand(result.runId, result.advice.recommended_next_action)})\n`);
            return 0;
        }
        if (parsed.command === 'recommend-entry') {
            const foremanConfig = await (0, runtime_1.loadForemanConfig)(parsed.options.cwd);
            const result = (0, entry_policy_1.recommendForemanEntry)(parsed.options, foremanConfig.entry_policy, foremanConfig.agents.orchestrator);
            process.stdout.write(`Foreman entry recommendation: ${result.recommended_entrypoint} confidence=${result.confidence} task_shape=${result.task_shape} in ${result.cwd}\n`);
            process.stdout.write(`Entry policy: ${result.policy_mode} (${result.policy_summary})\n`);
            process.stdout.write(`Entry boundary: ${result.entry_boundary} (${result.entry_boundary_summary})\n`);
            process.stdout.write(`Upstream binary intercept supported: ${result.upstream_codex_binary_intercept_supported} (${result.upstream_codex_binary_intercept_summary})\n`);
            process.stdout.write(`Orchestrator scope: ${result.orchestrator_scope} (${result.orchestrator_scope_summary})\n`);
            process.stdout.write(`Orchestrator config: roster=${result.orchestrator_agent.roster_name} profile=${result.orchestrator_request_settings_preview.profile ?? 'none'} model=${result.orchestrator_request_settings_preview.model ?? 'none'} variant=${result.orchestrator_request_settings_preview.variant ?? 'none'}\n`);
            process.stdout.write(`Summary: ${result.summary}\n`);
            process.stdout.write(`Suggested CLI command: ${result.suggested_cli_command}\n`);
            if (result.suggested_mcp_tool !== null) {
                process.stdout.write(`Suggested MCP tool: ${result.suggested_mcp_tool}\n`);
            }
            else {
                process.stdout.write('Suggested MCP tool: none; use the explicit CLI planner path for this branch.\n');
            }
            for (const rationale of result.rationale) {
                process.stdout.write(`Rationale: ${rationale}\n`);
            }
            return 0;
        }
        if (parsed.command === 'continue') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'continue',
            }, () => (0, run_command_1.continueForemanRun)(parsed.options));
            const activeTaskChanged = didContinueChangeActiveTask(result.steps);
            const manualNextHint = formatContinueManualNextHint(result);
            process.stdout.write(`Run ${result.runId} continued=${result.continued} steps_executed=${result.stepsExecuted} stop_reason=${result.stopReason} status=${result.status} stage=${result.stage} next_step=${result.nextStep} task_card_id=${result.taskCardId} active_task_changed=${activeTaskChanged}${result.verificationState ? ` verification_state=${result.verificationState}` : ''} in ${result.runDirectory}\n`);
            if (manualNextHint) {
                const suffix = /[.!?]$/.test(manualNextHint) ? '' : '.';
                process.stdout.write(`Next manual step: ${manualNextHint}${suffix}\n`);
            }
            for (const step of result.steps) {
                process.stdout.write(`${formatContinueStepTrace(step)}\n`);
            }
            return result.status === 'failed' || result.status === 'cancelled' || result.stopReason === 'max_steps_reached' ? 1 : 0;
        }
        if (parsed.command === 'watch') {
            await runWatchCommand(parsed.options);
            return 0;
        }
        if (parsed.command === 'always-on') {
            const result = parsed.options.action === 'status'
                ? await (0, run_command_1.manageForemanAlwaysOnMode)(parsed.options)
                : await withCliRunMutationLease({
                    cwd: parsed.options.cwd,
                    runId: parsed.options.runId,
                    action: parsed.options.action === 'start'
                        ? 'always_on_start'
                        : parsed.options.action === 'stop'
                            ? 'always_on_stop'
                            : parsed.options.action === 'tick'
                                ? 'always_on_tick'
                                : 'always_on_loop',
                }, () => (0, run_command_1.manageForemanAlwaysOnMode)(parsed.options));
            const status = await (0, mcp_server_1.getForemanStatus)({
                run_id: parsed.options.runId,
                cwd: parsed.options.cwd,
            });
            process.stdout.write(`Run ${result.runId} always_on_status=${result.alwaysOnMode.status} enabled=${result.alwaysOnMode.enabled} in ${result.runDirectory}\n`);
            process.stdout.write(`Always-on summary: ${result.alwaysOnMode.summary}\n`);
            process.stdout.write(`Always-on operator state: phase=${status.always_on_operator_state.phase} next=${status.always_on_operator_state.recommended_operator_action} last_tick_at=${compactWatchText(status.always_on_operator_state.last_tick_at)} last_loop_stop=${compactWatchText(status.always_on_operator_state.last_loop_stop_reason)}\n`);
            process.stdout.write(`Always-on operator summary: ${status.always_on_operator_state.summary}\n`);
            process.stdout.write(`Workflow operator state: phase=${compactWatchText(status.workflow_operator_state?.phase)} next=${compactWatchText(status.workflow_operator_state?.recommended_operator_action)} explore_evidence=${compactWatchText(status.workflow_operator_state?.explore_evidence_state)} plan_update=${status.workflow_operator_state?.plan_update_available ? 'recorded' : 'missing'}\n`);
            process.stdout.write(`Workflow operator summary: ${status.workflow_operator_state?.summary ?? 'none'}\n`);
            if (result.companionExecution !== null) {
                process.stdout.write(`Always-on tick: continued=${result.companionExecution.continued} steps_executed=${result.companionExecution.stepsExecuted} stop_reason=${result.companionExecution.stopReason} status=${result.companionExecution.status} stage=${result.companionExecution.stage} next_step=${result.companionExecution.nextStep} task_card_id=${result.companionExecution.taskCardId}${result.companionExecution.verificationState ? ` verification_state=${result.companionExecution.verificationState}` : ''}\n`);
                process.stdout.write(`${formatAlwaysOnRequestSettingsLine(result.companionExecution.requestSettings)}\n`);
                process.stdout.write(`Always-on tick summary: ${result.companionExecution.summary}\n`);
            }
            if (result.companionLoop !== null) {
                process.stdout.write(`Always-on loop: ticks=${result.companionLoop.tickCount} iterations=${result.companionLoop.iterationCount} stop_reason=${result.companionLoop.stopReason} backoff_count=${result.companionLoop.backoffHistoryMs.length}\n`);
                process.stdout.write(`Always-on loop summary: ${result.companionLoop.summary}\n`);
            }
            return 0;
        }
        if (parsed.command === 'verify') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'verify',
            }, () => (0, run_command_1.verifyForemanRun)(parsed.options));
            process.stdout.write(`Run ${result.runId} verification_state=${result.verificationState} status=${result.status} stage=${result.stage} next_step=${result.nextStep} verified=${result.verified} in ${result.runDirectory}\n`);
            return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
        }
        if (parsed.command === 'retry') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'retry',
            }, () => (0, run_command_1.retryForemanRun)(parsed.options));
            process.stdout.write(`Run ${result.runId} retried with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}. Use advance to execute the repair attempt.\n`);
            return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
        }
        if (parsed.command === 'replan') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'replan',
            }, () => (0, run_command_1.replanForemanRun)(parsed.options));
            process.stdout.write(`Run ${result.runId} replanned with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}. Use advance to execute the first repair task when ready.\n`);
            return result.replanned ? 0 : 1;
        }
        if (parsed.command === 'resolve') {
            const result = await withCliRunMutationLease({
                cwd: parsed.options.cwd,
                runId: parsed.options.runId,
                action: 'resolve',
            }, () => (0, run_command_1.resolveForemanRun)(parsed.options));
            process.stdout.write(`Run ${result.runId} resolved with status=${result.status} stage=${result.stage} verification_state=${result.verificationState} next_step=${result.nextStep} in ${result.runDirectory}\n`);
            return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
        }
        if (parsed.command === 'setup') {
            const result = await (0, setup_codex_mcp_1.setupCodexMcp)(parsed.options);
            const action = result.status === 'registered' ? 'Registered' : 'Codex already has';
            const suffix = result.status === 'registered' ? 'ready for plain codex use.' : 'so no changes were made.';
            const skillAction = result.capSkillStatus === 'installed'
                ? 'Installed'
                : result.capSkillStatus === 'updated'
                    ? 'Updated'
                    : 'Using existing';
            process.stdout.write(`${action} MCP server ${result.serverName} -> ${[result.launchCommand, ...result.launchArgs].join(' ')}; ${suffix}\n`);
            process.stdout.write(`${result.configCreated ? 'Created' : 'Using'} shared config ${result.configPath}.\n`);
            process.stdout.write(`${skillAction} Codex skill $${result.capSkillName} at ${result.capSkillPath}.\n`);
            process.stdout.write(`${result.customAgentStatus === 'installed' ? 'Installed' : result.customAgentStatus === 'updated' ? 'Updated' : 'Using existing'} Codex custom agents (${result.customAgentFileCount}) at ${result.customAgentDirectoryPath}.\n`);
            if (result.restartRequired) {
                process.stdout.write('Restart Codex CLI to pick up the new Foreman skill or refreshed MCP session.\n');
            }
            return 0;
        }
        if (parsed.command === 'check-install') {
            const result = await (0, setup_codex_mcp_1.checkCodexMcpInstall)(parsed.options);
            process.stdout.write(`Foreman install check: status=${result.status} version=${result.packageVersion} entry=${result.publicEntryLabel} registration=${result.registrationStatus} config=${result.configExists ? 'present' : 'missing'} skill=${result.capSkillStatus} agents=${result.customAgentStatus} package_surface=${result.packagedHarnessSurfaceStatus} companion_mcps=${result.otherInstalledMcpServers.length} model_policy=${result.modelPolicyStatus} run_hygiene=${result.activeRunHygieneStatus}\n`);
            process.stdout.write(`Current package: ${result.packageName}@${result.packageVersion}\n`);
            process.stdout.write(`Public entry: ${result.publicEntryLabel} (skill=${result.publicEntrySkillName})\n`);
            process.stdout.write(`Expected launch target: ${[result.expectedLaunchCommand, ...result.expectedLaunchArgs].join(' ')}\n`);
            process.stdout.write(`Registration summary: ${result.registrationSummary}\n`);
            process.stdout.write(`Shared config: ${result.configExists ? 'present' : 'missing'} at ${result.configPath}\n`);
            process.stdout.write(`Model policy: ${result.modelPolicySummary}\n`);
            process.stdout.write(`Run hygiene: ${result.activeRunHygieneSummary}\n`);
            process.stdout.write(`Codex skill $${result.capSkillName}: ${result.capSkillSummary}\n`);
            process.stdout.write(`Codex custom agents: ${result.customAgentSummary}\n`);
            process.stdout.write(`Packaged harness surface: ${result.packagedHarnessSurfaceSummary}\n`);
            process.stdout.write(`Registry summary: ${result.registryInspectionSummary}\n`);
            for (const server of result.otherInstalledMcpServers) {
                process.stdout.write(`Companion MCP ${server.name}: enabled=${server.enabled} compatibility=${server.compatibility} approval=${server.approvalExpectation} scope=${server.recommendationScope} hint=${server.usageHint}\n`);
            }
            return result.status === 'ok' ? 0 : 1;
        }
        if (parsed.command === 'generate-navigation') {
            const result = parsed.options.validateOnly
                ? await (0, navigation_aids_1.validateNavigationBundle)(parsed.options)
                : await (0, navigation_aids_1.generateNavigationBundle)(parsed.options);
            process.stdout.write(`Navigation bundle ${result.status}: target=${result.relativeTargetDir} output=${result.outputDir} files=${result.fileCount} functions=${result.functionCount} artifacts=${result.artifactCount} stale=${result.stale}\n`);
            process.stdout.write(`Summary: ${result.summary}\n`);
            for (const artifact of result.artifacts) {
                process.stdout.write(`Artifact ${artifact.kind}: confidence=${artifact.confidence} path=${artifact.path} summary=${artifact.summary}\n`);
            }
            return result.stale ? 1 : 0;
        }
        const result = await (0, run_command_1.runForemanCommand)(parsed.options);
        process.stdout.write(`Run ${result.runId} finished with status=${result.status} stage=${result.stage} next_step=${result.nextStep} in ${result.runDirectory}\n`);
        return result.status === 'failed' || result.status === 'cancelled' ? 1 : 0;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown CLI error.';
        process.stderr.write(`${message}\n`);
        return 1;
    }
}
//# sourceMappingURL=cli.js.map