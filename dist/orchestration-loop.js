"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampOrchestrationLoopMaxSteps = clampOrchestrationLoopMaxSteps;
exports.loadOrchestrationLoopSnapshot = loadOrchestrationLoopSnapshot;
exports.resolveOrchestrationLoopCommand = resolveOrchestrationLoopCommand;
exports.runBoundedOrchestrationLoop = runBoundedOrchestrationLoop;
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