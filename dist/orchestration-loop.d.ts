import type { AdvanceRunResult, OrchestrationAttemptRecord, OrchestrationAttemptSnapshot, OrchestrationCommand, OrchestrationEntrypoint, OrchestrationStopReason, ReplanRunResult, ResolveRunResult, RetryRunResult, VerificationResolutionOutcome, VerifyRunResult } from './types';
export interface OrchestrationLoopInputs {
    repairAction?: 'retry' | 'replan';
    replanPrompt?: string;
    resolveOutcome?: VerificationResolutionOutcome;
    resolveSummary?: string;
    autoPolicy?: 'off' | 'bounded_repair';
}
export interface LoadedOrchestrationLoopSnapshot {
    runId: string;
    runDirectory: string;
    snapshot: OrchestrationAttemptSnapshot;
}
export type OrchestrationLoopCommandResolution = {
    command: OrchestrationCommand;
    stopReason: null;
    requiresExplicitInput: false;
} | {
    command: null;
    stopReason: Exclude<OrchestrationStopReason, 'max_steps_reached'>;
    requiresExplicitInput: boolean;
};
export interface OrchestrationLoopDispatchers {
    advance: (options: {
        cwd: string;
        runId: string;
        codexPath?: string;
    }) => Promise<AdvanceRunResult>;
    verify: (options: {
        cwd: string;
        runId: string;
        codexPath: string;
    }) => Promise<VerifyRunResult>;
    retry: (options: {
        cwd: string;
        runId: string;
    }) => Promise<RetryRunResult>;
    replan: (options: {
        cwd: string;
        runId: string;
        prompt: string;
        codexPath: string;
    }) => Promise<ReplanRunResult>;
    resolve: (options: {
        cwd: string;
        runId: string;
        outcome: VerificationResolutionOutcome;
        summary: string;
    }) => Promise<ResolveRunResult>;
}
export interface RunOrchestrationLoopOptions extends OrchestrationLoopInputs {
    cwd: string;
    runId: string;
    entrypoint: OrchestrationEntrypoint;
    codexPath?: string;
    maxSteps?: number;
    stopAtTaskBoundary?: boolean;
    dispatchers?: Partial<OrchestrationLoopDispatchers>;
    onPersist?: (attempt: OrchestrationAttemptRecord) => void | Promise<void>;
}
export interface OrchestrationLoopResult {
    attemptId: string;
    runId: string;
    runDirectory: string;
    entrypoint: OrchestrationEntrypoint;
    maxSteps: number;
    stepsExecuted: number;
    stopReason: OrchestrationStopReason;
    requiresExplicitInput: boolean;
    finalSnapshot: OrchestrationAttemptSnapshot;
    attempt: OrchestrationAttemptRecord;
}
export declare function clampOrchestrationLoopMaxSteps(maxSteps: number | undefined): number;
export declare function loadOrchestrationLoopSnapshot(options: {
    cwd: string;
    runId: string;
}): Promise<LoadedOrchestrationLoopSnapshot>;
export declare function resolveOrchestrationLoopCommand(snapshot: Pick<OrchestrationAttemptSnapshot, 'next_step' | 'can_advance' | 'review_trace'>, inputs: OrchestrationLoopInputs): OrchestrationLoopCommandResolution;
export declare function runBoundedOrchestrationLoop(options: RunOrchestrationLoopOptions): Promise<OrchestrationLoopResult>;
