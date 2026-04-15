export interface ParsedCodexLauncherArgs {
    cwd: string;
    codexPath: string;
    request: string | null;
    disableForemanAutoEntry: boolean;
    passthroughArgs: string[];
}
export declare function parseCodexLauncherArgs(argv: string[]): ParsedCodexLauncherArgs;
export declare function runCodexLauncher(argv: string[]): Promise<number>;
