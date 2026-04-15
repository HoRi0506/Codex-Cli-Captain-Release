import type { AlwaysOnModeOptions, AutoEnterForemanOptions, AdviseRunOptions, AdvanceRunOptions, CheckCodexMcpInstallOptions, ContinueRunOptions, RecommendForemanEntryOptions, PlanRunOptions, ReplanRunOptions, ResolveRunOptions, RetryRunOptions, RunCommandOptions, SetupCodexMcpOptions, StartRunOptions, VerifyRunOptions, WatchStatusOptions } from './types';
type ParsedCliCommand = {
    command: 'plan';
    options: PlanRunOptions;
} | {
    command: 'start';
    options: StartRunOptions;
} | {
    command: 'auto-entry';
    options: AutoEnterForemanOptions;
} | {
    command: 'advise';
    options: AdviseRunOptions;
} | {
    command: 'advance';
    options: AdvanceRunOptions;
} | {
    command: 'continue';
    options: ContinueRunOptions;
} | {
    command: 'watch';
    options: WatchStatusOptions;
} | {
    command: 'always-on';
    options: AlwaysOnModeOptions;
} | {
    command: 'verify';
    options: VerifyRunOptions;
} | {
    command: 'retry';
    options: RetryRunOptions;
} | {
    command: 'replan';
    options: ReplanRunOptions;
} | {
    command: 'recommend-entry';
    options: RecommendForemanEntryOptions;
} | {
    command: 'resolve';
    options: ResolveRunOptions;
} | {
    command: 'setup';
    options: SetupCodexMcpOptions;
} | {
    command: 'check-install';
    options: CheckCodexMcpInstallOptions;
} | {
    command: 'run';
    options: RunCommandOptions;
};
export declare function parseCliArgs(argv: string[]): ParsedCliCommand;
export declare function runCli(argv: string[]): Promise<number>;
export {};
