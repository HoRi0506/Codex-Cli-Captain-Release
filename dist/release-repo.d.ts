export interface BuildInstallOnlyReleaseRepoOptions {
    sourceRoot: string;
    outputDir: string;
}
export interface BuildInstallOnlyReleaseRepoResult {
    outputDir: string;
    packageName: string;
    packageVersion: string;
    sourceGitCommit: string | null;
    managedPaths: string[];
}
export declare function buildInstallOnlyReleaseRepo(options: BuildInstallOnlyReleaseRepoOptions): Promise<BuildInstallOnlyReleaseRepoResult>;
export declare function listReleaseRepoFiles(outputDir: string): Promise<string[]>;
