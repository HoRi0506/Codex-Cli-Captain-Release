"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCodexLauncherArgs = parseCodexLauncherArgs;
exports.runCodexLauncher = runCodexLauncher;
const node_child_process_1 = require("node:child_process");
const cli_mutation_lease_1 = require("./cli-mutation-lease");
const runtime_1 = require("./runtime");
const run_command_1 = require("./run-command");
const workflow_variants_1 = require("./workflow-variants");
class LauncherUsageError extends Error {
}
function usage() {
    return [
        'Usage:',
        '  codex-foreman-codex [--request <text>] [--codex-bin <path>] [--cwd <path>] [--no-foreman-auto-entry] [-- <codex-args...>]',
        '    Launcher-level Foreman-first front door. When shared entry policy is codex_cli_foreman_first and --request is provided, it runs bounded auto-entry before starting Codex CLI.',
        '    This does not patch the upstream Codex CLI binary. It is an explicit wrapper surface.',
    ].join('\n');
}
function parseCodexLauncherArgs(argv) {
    const parsed = {
        cwd: process.cwd(),
        codexPath: 'codex',
        request: null,
        disableForemanAutoEntry: false,
        passthroughArgs: [],
    };
    let passthrough = false;
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (token === undefined) {
            continue;
        }
        if (passthrough) {
            parsed.passthroughArgs.push(token);
            continue;
        }
        switch (token) {
            case '--help':
            case '-h':
                throw new LauncherUsageError(usage());
            case '--':
                passthrough = true;
                break;
            case '--request':
                parsed.request = argv[index + 1] ?? null;
                if (!parsed.request) {
                    throw new LauncherUsageError(`Missing value for --request.\n${usage()}`);
                }
                index += 1;
                break;
            case '--cwd':
                parsed.cwd = argv[index + 1] ?? '';
                if (!parsed.cwd) {
                    throw new LauncherUsageError(`Missing value for --cwd.\n${usage()}`);
                }
                index += 1;
                break;
            case '--codex-bin':
                parsed.codexPath = argv[index + 1] ?? '';
                if (!parsed.codexPath) {
                    throw new LauncherUsageError(`Missing value for --codex-bin.\n${usage()}`);
                }
                index += 1;
                break;
            case '--no-foreman-auto-entry':
                parsed.disableForemanAutoEntry = true;
                break;
            default:
                parsed.passthroughArgs.push(token);
                break;
        }
    }
    return parsed;
}
function buildLauncherPrompt(result, request) {
    if (result.run_selection === 'no_run_created' || result.run_id === null) {
        return [
            'Foreman auto-entry kept this request on the bounded captain-owned no-run path.',
            'Answer inside the stated request, keep the work lightweight, and do not widen into a broader repository task unless a later explicit Foreman decision requires it.',
            `Workflow path: ${(0, workflow_variants_1.getWorkflowPublicLabel)(result.answer_trace.workflow_variant_selection)}.`,
            `Run decision: ${result.run_decision_reason}`,
            `Auto-entry summary: ${result.summary}`,
            `Original operator request: ${request}`,
        ].join('\n');
    }
    const runId = result.run_id ?? 'unknown-run';
    const runLabel = result.run_label ?? runId;
    const firstLine = result.run_selection === 'existing_run_reused'
        ? `Foreman auto-entry attached to existing run ${runLabel}.`
        : `Foreman auto-entry already created run ${runLabel}.`;
    return [
        firstLine,
        'Continue through the persisted Foreman workflow for that run instead of re-scoping the request from scratch.',
        `Workflow path: ${(0, workflow_variants_1.getWorkflowPublicLabel)(result.answer_trace.workflow_variant_selection)}.`,
        `Run decision: ${result.run_decision_reason}`,
        `Auto-entry summary: ${result.summary}`,
        `Original operator request: ${request}`,
    ].join('\n');
}
async function spawnCodexProcess(codexPath, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = (0, node_child_process_1.spawn)(codexPath, args, {
            cwd,
            env: process.env,
            stdio: 'inherit',
        });
        child.on('error', reject);
        child.on('exit', (code, signal) => {
            if (signal) {
                resolve(1);
                return;
            }
            resolve(code ?? 0);
        });
    });
}
async function runCodexLauncher(argv) {
    let parsed;
    try {
        parsed = parseCodexLauncherArgs(argv);
    }
    catch (error) {
        if (error instanceof LauncherUsageError) {
            process.stderr.write(`${error.message}\n`);
            return error.message === usage() ? 0 : 1;
        }
        throw error;
    }
    let launchPrompt = parsed.request;
    if (parsed.request && !parsed.disableForemanAutoEntry) {
        const foremanConfig = await (0, runtime_1.loadForemanConfig)(parsed.cwd);
        if (foremanConfig.entry_policy.mode === 'codex_cli_foreman_first') {
            const session = (0, cli_mutation_lease_1.createCliMutationLeaseSessionContext)();
            const autoEntryResult = await (0, run_command_1.autoEnterForeman)({
                cwd: parsed.cwd,
                request: parsed.request,
                codexPath: parsed.codexPath,
                session,
            });
            process.stderr.write(`Foreman launcher policy=${autoEntryResult.policy_mode} created=${autoEntryResult.created} entrypoint=${autoEntryResult.entrypoint_used ?? 'none'}\n`);
            process.stderr.write(`Foreman launcher boundary=${autoEntryResult.entry_boundary}\n`);
            launchPrompt = buildLauncherPrompt(autoEntryResult, parsed.request);
        }
    }
    const launchArgs = [...parsed.passthroughArgs];
    if (launchPrompt) {
        launchArgs.push(launchPrompt);
    }
    return spawnCodexProcess(parsed.codexPath, launchArgs, parsed.cwd);
}
//# sourceMappingURL=codex-launcher.js.map