"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampOrchestrationLoopMaxSteps = clampOrchestrationLoopMaxSteps;
exports.loadOrchestrationLoopSnapshot = loadOrchestrationLoopSnapshot;
exports.resolveOrchestrationLoopCommand = resolveOrchestrationLoopCommand;
exports.runBoundedOrchestrationLoop = runBoundedOrchestrationLoop;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:timers/promises");
const node_util_1 = require("node:util");
const orchestrator_1 = require("./orchestrator");
const run_command_1 = require("./run-command");
const runtime_1 = require("./runtime");
function selectCurrentStageDelegations(run, taskCard, taskDelegations) {
    if (run.stage === 'execution' && taskCard.owner_role === 'code specialist') {
        return taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id && delegation.child_agent.role === 'code specialist');
    }
    if (run.stage === 'verification' && taskCard.owner_role === 'verifier' && taskCard.verification_state === 'pending') {
        return taskDelegations.filter((delegation) => delegation.task_card_id === taskCard.task_card_id &&
            delegation.child_agent.role === 'verifier' &&
            delegation.review_round === taskCard.review_pass_count);
    }
    return [];
}
const DEFAULT_ORCHESTRATION_LOOP_MAX_STEPS = 2;
const MIN_ORCHESTRATION_LOOP_MAX_STEPS = 1;
const MAX_ORCHESTRATION_LOOP_MAX_STEPS = 12;
const DEFAULT_PROCESS_WATCH_TIMEOUT_MS = 9_000;
const DEFAULT_PROCESS_WATCH_INTERVAL_MS = 500;
const PROCESS_EXIT_FOLD_GRACE_MS = 2_000;
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const DEFAULT_DISPATCHERS = {
    advance: run_command_1.advanceForemanRun,
    verify: run_command_1.verifyForemanRun,
    retry: run_command_1.retryForemanRun,
    replan: run_command_1.replanForemanRun,
    resolve: run_command_1.resolveForemanRun,
};
function cloneAttemptRecord(attempt) {
    return structuredClone(attempt);
}
async function persistAttemptRecord(options, paths, attempt) {
    await (0, runtime_1.persistOrchestrationAttemptArtifact)(paths, attempt);
    if (options.onPersist) {
        await options.onPersist(cloneAttemptRecord(attempt));
    }
}
function requireCodexPath(command, codexPath) {
    if (codexPath) {
        return codexPath;
    }
    throw new Error(`Orchestration loop requires codexPath when dispatching ${command}.`);
}
function requireReplanPrompt(replanPrompt) {
    if (replanPrompt && replanPrompt.trim().length > 0) {
        return replanPrompt;
    }
    return 'Replan narrowly for the current verification-blocked run using the persisted blocked-task context.';
}
function requireResolveInputs(resolveOutcome, resolveSummary) {
    const hasOutcome = resolveOutcome !== undefined;
    const hasSummary = resolveSummary !== undefined;
    if (hasOutcome && hasSummary) {
        return {
            outcome: resolveOutcome,
            summary: resolveSummary,
        };
    }
    throw new Error('Orchestration loop requires both resolveOutcome and resolveSummary when next_step=await_verification.');
}
function clampOrchestrationLoopMaxSteps(maxSteps) {
    if (maxSteps === undefined) {
        return DEFAULT_ORCHESTRATION_LOOP_MAX_STEPS;
    }
    const normalized = Number.isFinite(maxSteps) ? Math.trunc(maxSteps) : DEFAULT_ORCHESTRATION_LOOP_MAX_STEPS;
    return Math.min(MAX_ORCHESTRATION_LOOP_MAX_STEPS, Math.max(MIN_ORCHESTRATION_LOOP_MAX_STEPS, normalized));
}
function clampProcessWatchMs(value) {
    if (value === undefined) {
        return DEFAULT_PROCESS_WATCH_TIMEOUT_MS;
    }
    if (!Number.isFinite(value)) {
        return DEFAULT_PROCESS_WATCH_TIMEOUT_MS;
    }
    return Math.max(0, Math.trunc(value));
}
function clampProcessWatchIntervalMs(value) {
    if (value === undefined) {
        return DEFAULT_PROCESS_WATCH_INTERVAL_MS;
    }
    if (!Number.isFinite(value)) {
        return DEFAULT_PROCESS_WATCH_INTERVAL_MS;
    }
    return Math.max(50, Math.trunc(value));
}
function isProcessAliveBySignal(processId) {
    try {
        process.kill(processId, 0);
        return true;
    }
    catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'EPERM') {
            return true;
        }
        return false;
    }
}
async function isProcessAliveByPs(processId) {
    try {
        const { stdout } = await execFileAsync('ps', ['-p', String(processId), '-o', 'pid='], {
            timeout: 1_000,
            maxBuffer: 16 * 1024,
        });
        return stdout
            .split(/\s+/)
            .filter(Boolean)
            .some((entry) => Number.parseInt(entry, 10) === processId);
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT') {
            return isProcessAliveBySignal(processId);
        }
        return false;
    }
}
async function loadOrchestrationLoopSnapshot(options) {
    const runPaths = (0, runtime_1.createRunPaths)(options.cwd, options.runId);
    const { run, taskCard, orchestratorState } = await (0, runtime_1.loadHotRunContext)(runPaths);
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, taskCard.task_card_id);
    const currentStageDelegationSummary = (0, runtime_1.summarizeTaskDelegations)(taskCard.task_card_id, selectCurrentStageDelegations(run, taskCard, taskDelegationSummary.delegations));
    const decision = (0, orchestrator_1.decideOrchestratorNextStep)(run, taskCard, {
        verificationRequestAvailable: orchestratorState.verification_request !== null,
        orchestrationPolicy: orchestratorState.orchestration_policy,
        activeTaskDelegationCounts: currentStageDelegationSummary,
    });
    const routingMetadata = (0, orchestrator_1.derivePolicyAwareRoutingMetadata)(run, taskCard, orchestratorState.orchestration_policy, decision);
    const reviewMetadata = (0, orchestrator_1.derivePolicyAwareReviewMetadata)(run, taskCard, orchestratorState.orchestration_policy, decision, taskDelegationSummary.delegations);
    const runStateProjection = await (0, runtime_1.loadRunStateProjectionIfPresent)(runPaths);
    return {
        runId: run.run_id,
        runDirectory: runPaths.runDir,
        snapshot: {
            task_card_id: taskCard.task_card_id,
            status: run.status,
            stage: run.stage,
            verification_state: taskCard.verification_state,
            next_step: decision.next_step,
            can_advance: decision.can_advance,
            thread_id: run.active_thread_id,
            ...routingMetadata,
            ...reviewMetadata,
            reducer_next_action: runStateProjection?.next_action ?? null,
        },
    };
}
async function loadProcessBackedCurrentStageDelegations(options) {
    const runPaths = (0, runtime_1.createRunPaths)(options.cwd, options.runId);
    const { run, taskCard } = await (0, runtime_1.loadHotRunContext)(runPaths);
    const taskDelegationSummary = await (0, runtime_1.loadTaskDelegationSummary)(runPaths, taskCard.task_card_id);
    return selectCurrentStageDelegations(run, taskCard, taskDelegationSummary.delegations)
        .filter((delegation) => delegation.child_agent.status === 'running' &&
        typeof delegation.worker_lifecycle?.process_id === 'number' &&
        delegation.worker_lifecycle.process_id > 0)
        .map((delegation) => ({
        delegationId: delegation.delegation_id,
        processId: delegation.worker_lifecycle?.process_id,
    }));
}
async function waitForProcessBackedFanInProgress(options, currentState) {
    if (currentState.snapshot.next_step !== 'await_fan_in') {
        return currentState;
    }
    const watchMs = clampProcessWatchMs(options.processWatchMs);
    if (watchMs <= 0) {
        return currentState;
    }
    const intervalMs = clampProcessWatchIntervalMs(options.processWatchIntervalMs);
    const deadline = Date.now() + watchMs;
    let watchedDelegations = await loadProcessBackedCurrentStageDelegations({
        cwd: options.cwd,
        runId: options.runId,
    });
    if (watchedDelegations.length === 0) {
        return currentState;
    }
    let latestState = currentState;
    while (Date.now() <= deadline) {
        latestState = await loadOrchestrationLoopSnapshot({
            cwd: options.cwd,
            runId: options.runId,
        });
        if (latestState.snapshot.next_step !== 'await_fan_in' || latestState.snapshot.can_advance) {
            return latestState;
        }
        watchedDelegations = await loadProcessBackedCurrentStageDelegations({
            cwd: options.cwd,
            runId: options.runId,
        });
        if (watchedDelegations.length === 0) {
            return latestState;
        }
        const aliveWorkers = [];
        for (const delegation of watchedDelegations) {
            if (await isProcessAliveByPs(delegation.processId)) {
                aliveWorkers.push(delegation);
            }
        }
        if (aliveWorkers.length === 0) {
            const foldDeadline = Math.min(Date.now() + PROCESS_EXIT_FOLD_GRACE_MS, deadline);
            while (Date.now() <= foldDeadline) {
                latestState = await loadOrchestrationLoopSnapshot({
                    cwd: options.cwd,
                    runId: options.runId,
                });
                if (latestState.snapshot.next_step !== 'await_fan_in' || latestState.snapshot.can_advance) {
                    return latestState;
                }
                await (0, promises_1.setTimeout)(Math.min(intervalMs, Math.max(0, foldDeadline - Date.now())));
            }
            return latestState;
        }
        await (0, promises_1.setTimeout)(Math.min(intervalMs, Math.max(0, deadline - Date.now())));
    }
    return latestState;
}
function resolveOrchestrationLoopCommand(snapshot, inputs) {
    switch (snapshot.next_step) {
        case 'await_repair_decision':
            if (!inputs.repairAction && inputs.autoPolicy === 'bounded_repair') {
                if (snapshot.review_trace.reviewer_swarm_state === 'needs_work') {
                    return {
                        command: snapshot.review_trace.remaining_review_passes > 0 ? 'retry' : 'replan',
                        stopReason: null,
                        requiresExplicitInput: false,
                    };
                }
                if (snapshot.review_trace.reviewer_swarm_state === 'blocked') {
                    return {
                        command: null,
                        stopReason: 'await_operator',
                        requiresExplicitInput: false,
                    };
                }
            }
            if (!inputs.repairAction) {
                return {
                    command: null,
                    stopReason: 'await_repair_decision',
                    requiresExplicitInput: true,
                };
            }
            return {
                command: inputs.repairAction,
                stopReason: null,
                requiresExplicitInput: false,
            };
        case 'await_verification': {
            const hasOutcome = inputs.resolveOutcome !== undefined;
            const hasSummary = inputs.resolveSummary !== undefined;
            if (!hasOutcome && !hasSummary) {
                return {
                    command: null,
                    stopReason: 'await_verification',
                    requiresExplicitInput: true,
                };
            }
            return {
                command: 'resolve',
                stopReason: null,
                requiresExplicitInput: false,
            };
        }
        default: {
            const classification = (0, orchestrator_1.classifyContinueStep)(snapshot);
            if (classification.command) {
                return {
                    command: classification.command,
                    stopReason: null,
                    requiresExplicitInput: false,
                };
            }
            return {
                command: null,
                stopReason: classification.stopReason,
                requiresExplicitInput: false,
            };
        }
    }
}
async function dispatchOrchestrationCommand(command, snapshot, options, dispatchers) {
    switch (command) {
        case 'advance':
            await dispatchers.advance({
                cwd: options.cwd,
                runId: options.runId,
                codexPath: snapshot.next_step === 'await_fan_in' ? options.codexPath : requireCodexPath('advance', options.codexPath),
            });
            return;
        case 'verify':
            await dispatchers.verify({
                cwd: options.cwd,
                runId: options.runId,
                codexPath: requireCodexPath('verify', options.codexPath),
            });
            return;
        case 'retry':
            await dispatchers.retry({
                cwd: options.cwd,
                runId: options.runId,
            });
            return;
        case 'replan':
            await dispatchers.replan({
                cwd: options.cwd,
                runId: options.runId,
                prompt: requireReplanPrompt(options.replanPrompt),
                codexPath: requireCodexPath('replan', options.codexPath),
            });
            return;
        case 'resolve': {
            const resolveInputs = requireResolveInputs(options.resolveOutcome, options.resolveSummary);
            await dispatchers.resolve({
                cwd: options.cwd,
                runId: options.runId,
                outcome: resolveInputs.outcome,
                summary: resolveInputs.summary,
            });
        }
    }
}
function finalizeAttempt(attempt, stopReason, finalSnapshot) {
    attempt.completed_at = (0, runtime_1.nowTimestamp)();
    attempt.stop = {
        reason: stopReason,
        snapshot: finalSnapshot,
    };
}
async function runBoundedOrchestrationLoop(options) {
    const maxSteps = clampOrchestrationLoopMaxSteps(options.maxSteps);
    const dispatchers = {
        ...DEFAULT_DISPATCHERS,
        ...options.dispatchers,
    };
    const runPaths = (0, runtime_1.createRunPaths)(options.cwd, options.runId);
    const attemptId = await (0, runtime_1.allocateOrchestrationAttemptId)(runPaths);
    const initialState = await loadOrchestrationLoopSnapshot({
        cwd: options.cwd,
        runId: options.runId,
    });
    const attempt = {
        run_id: initialState.runId,
        attempt_id: attemptId,
        entrypoint: options.entrypoint,
        started_at: (0, runtime_1.nowTimestamp)(),
        completed_at: null,
        steps: [],
        stop: null,
    };
    let currentState = initialState;
    let requiresExplicitInput = false;
    await persistAttemptRecord(options, runPaths, attempt);
    for (let stepNumber = 1; stepNumber <= maxSteps; stepNumber += 1) {
        currentState = await waitForProcessBackedFanInProgress(options, currentState);
        const commandResolution = resolveOrchestrationLoopCommand(currentState.snapshot, options);
        if (!commandResolution.command) {
            requiresExplicitInput = commandResolution.requiresExplicitInput;
            finalizeAttempt(attempt, commandResolution.stopReason, currentState.snapshot);
            await persistAttemptRecord(options, runPaths, attempt);
            return {
                attemptId,
                runId: currentState.runId,
                runDirectory: currentState.runDirectory,
                entrypoint: options.entrypoint,
                maxSteps,
                stepsExecuted: attempt.steps.length,
                stopReason: commandResolution.stopReason,
                requiresExplicitInput,
                finalSnapshot: currentState.snapshot,
                attempt,
            };
        }
        await dispatchOrchestrationCommand(commandResolution.command, currentState.snapshot, options, dispatchers);
        const nextState = await loadOrchestrationLoopSnapshot({
            cwd: options.cwd,
            runId: options.runId,
        });
        const nextStepRecord = {
            step_number: stepNumber,
            command: commandResolution.command,
            before: currentState.snapshot,
            after: nextState.snapshot,
        };
        attempt.steps.push(nextStepRecord);
        await persistAttemptRecord(options, runPaths, attempt);
        if (options.stopAtTaskBoundary &&
            commandResolution.command === 'verify' &&
            currentState.snapshot.task_card_id !== nextState.snapshot.task_card_id &&
            nextState.snapshot.next_step === 'execute_task') {
            finalizeAttempt(attempt, 'task_boundary_reached', nextState.snapshot);
            await persistAttemptRecord(options, runPaths, attempt);
            return {
                attemptId,
                runId: nextState.runId,
                runDirectory: nextState.runDirectory,
                entrypoint: options.entrypoint,
                maxSteps,
                stepsExecuted: attempt.steps.length,
                stopReason: 'task_boundary_reached',
                requiresExplicitInput: false,
                finalSnapshot: nextState.snapshot,
                attempt,
            };
        }
        const nextResolution = resolveOrchestrationLoopCommand(nextState.snapshot, options);
        if (!nextResolution.command) {
            finalizeAttempt(attempt, nextResolution.stopReason, nextState.snapshot);
            await persistAttemptRecord(options, runPaths, attempt);
            return {
                attemptId,
                runId: nextState.runId,
                runDirectory: nextState.runDirectory,
                entrypoint: options.entrypoint,
                maxSteps,
                stepsExecuted: attempt.steps.length,
                stopReason: nextResolution.stopReason,
                requiresExplicitInput: nextResolution.requiresExplicitInput,
                finalSnapshot: nextState.snapshot,
                attempt,
            };
        }
        currentState = nextState;
    }
    finalizeAttempt(attempt, 'max_steps_reached', currentState.snapshot);
    await persistAttemptRecord(options, runPaths, attempt);
    return {
        attemptId,
        runId: currentState.runId,
        runDirectory: currentState.runDirectory,
        entrypoint: options.entrypoint,
        maxSteps,
        stepsExecuted: attempt.steps.length,
        stopReason: 'max_steps_reached',
        requiresExplicitInput: false,
        finalSnapshot: currentState.snapshot,
        attempt,
    };
}
//# sourceMappingURL=orchestration-loop.js.map