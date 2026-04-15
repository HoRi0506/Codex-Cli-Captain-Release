export type CliRunMutationAction = 'advance' | 'continue' | 'verify' | 'retry' | 'replan' | 'resolve' | 'always_on_start' | 'always_on_stop' | 'always_on_tick' | 'always_on_loop';
export interface CliMutationLeaseSessionContext {
    sessionId: string;
    processId: number | null;
    startedAt: string;
}
export declare function createCliMutationLeaseSessionContext(env?: NodeJS.ProcessEnv): CliMutationLeaseSessionContext;
export declare function acquireCliRunMutationLease(input: {
    cwd: string;
    runId: string;
    session: CliMutationLeaseSessionContext;
    action: CliRunMutationAction;
}): Promise<void>;
