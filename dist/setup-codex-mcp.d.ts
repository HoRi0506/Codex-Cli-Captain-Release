import type { CheckCodexMcpInstallOptions, CheckCodexMcpInstallResult, SetupCodexMcpOptions, SetupCodexMcpResult } from './types';
interface CommandResult {
    code: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
}
interface SetupCodexMcpDependencies {
    packageRoot?: string;
    runCommand?: (command: string, args: string[]) => Promise<CommandResult>;
}
export declare class CodexMcpSetupConflictError extends Error {
    constructor(message: string);
}
export declare function resolveInstalledCodexForemanMcpLaunchTarget(packageRoot?: string): Promise<{
    command: string;
    args: [string];
}>;
export declare function checkCodexMcpInstall(options: CheckCodexMcpInstallOptions, dependencies?: SetupCodexMcpDependencies): Promise<CheckCodexMcpInstallResult>;
export declare function setupCodexMcp(options: SetupCodexMcpOptions, dependencies?: SetupCodexMcpDependencies): Promise<SetupCodexMcpResult>;
export {};
