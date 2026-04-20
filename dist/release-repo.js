"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInstallOnlyReleaseRepo = buildInstallOnlyReleaseRepo;
exports.listReleaseRepoFiles = listReleaseRepoFiles;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const public_surface_1 = require("./public-surface");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const RELEASE_REPO_MANIFEST_FILE = 'release-repo-manifest.json';
const RELEASE_REPO_GITIGNORE_FILE = '.gitignore';
const RELEASE_REPO_URL = public_surface_1.FOREMAN_RELEASE_REPO_URL;
const RELEASES_URL = `${RELEASE_REPO_URL}/releases`;
function createHealthyCheckInstallExample(packageVersion) {
    return [
        `Foreman install check: status=ok version=${packageVersion} entry=${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} registration=matching_registration config=present skill=matching_install agents=matching_install package_surface=coherent_surface companion_mcps=0 notebooklm_archive=disabled model_policy=coherent tool_policy=coherent run_hygiene=clean`,
        `Current package: codex-foreman@${packageVersion}`,
        `Public entry: ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} (skill=${public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME})`,
        'Model policy: Configured role-model policy: captain=gpt-5.4/high tactician=gpt-5.4/medium scout=gpt-5.4-mini/medium raider=gpt-5.3-codex/high arbiter=gpt-5.4/medium companion_reader=gpt-5.4-mini/medium companion_operator=gpt-5.4-mini/medium',
        'Companion tool policy: Configured companion routing keeps tool work under specialist ownership: filesystem->companion_reader/gpt-5.4-mini/medium, git(read)->companion_reader/gpt-5.4-mini/medium git(mutation)->companion_operator/gpt-5.4-mini/medium, context7->companion_reader/gpt-5.4-mini/medium, fetch->companion_reader/gpt-5.4-mini/medium, openaiDeveloperDocs->companion_reader/gpt-5.4-mini/medium.',
        'NotebookLM archive: NotebookLM archive target is disabled. To enable it, register notebooklm MCP, complete browser auth, then set archive_targets.notebooklm.enabled=true with notebook_url or notebook_id.',
        'Run hygiene: clean; workspace=<cwd> active=0 blocked=0 fresh=0 stale=0 resumable=none.',
    ].join('\n');
}
function createReleaseRepoGitignore(packageName, packageVersion) {
    return [
        'node_modules/',
        '.DS_Store',
        '.foreman/',
        '.sisyphus/',
        `${packageName}-*.tgz`,
        `!${packageName}-${packageVersion}.tgz`,
        'foreman-smoke-*/',
        'foreman-sweep-*/',
        '',
    ].join('\n');
}
function toPosixRelativePath(filePath) {
    return filePath.split(node_path_1.default.sep).join('/');
}
async function readJsonDocument(filePath) {
    const content = await (0, promises_1.readFile)(filePath, 'utf8');
    return JSON.parse(content);
}
async function pathExists(targetPath) {
    try {
        await (0, promises_1.stat)(targetPath);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
async function removeIfExists(targetPath) {
    if (!(await pathExists(targetPath))) {
        return;
    }
    await (0, promises_1.rm)(targetPath, { force: true, recursive: true });
}
async function resolveSourceGitCommit(sourceRoot) {
    try {
        const { stdout } = await execFileAsync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD']);
        const trimmed = stdout.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    catch {
        return null;
    }
}
function createReleaseInstallGuide(input) {
    const releaseTarballUrl = `${RELEASE_REPO_URL}/releases/download/v${input.packageVersion}/${input.packageName}-${input.packageVersion}.tgz`;
    const codexPrompt = [
        'Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.',
        '',
        `npm install -g ${releaseTarballUrl}`,
        'codex-foreman setup',
        'codex-foreman check-install',
        '',
        `Verify that \`codex-foreman check-install\` reports \`status=ok\`, that the MCP registration matches the installed entrypoint, that the packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill is installed, and that the packaged Codex custom agents are installed.`,
        'Do not ask me to type the shell commands manually.',
        'Finish with exactly: Please restart Codex CLI.',
    ].join('\n');
    return `# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

This is the supported beta install path. Beta releases are distributed through GitHub Release tarballs from the install-only release repository, not through the public npm registry.

## Paste Into Codex CLI

Copy this text into Codex CLI:

\`\`\`text
${codexPrompt}
\`\`\`

If Codex has access to this repository, tell it to read this file before it starts so it follows the documented install and verification flow exactly.

## Shell Reference

Codex should execute these steps for the preferred install path:

Install from the exact release tarball:

\`\`\`bash
npm install -g ${releaseTarballUrl}
\`\`\`

Then register or refresh the MCP entrypoint:

\`\`\`bash
codex-foreman setup
\`\`\`

That step also installs or refreshes the packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill under your local Codex skills directory and the packaged Foreman custom-agent roster under your local Codex agents directory.

Verify the install:

\`\`\`bash
codex-foreman check-install
\`\`\`

## Update

To update an existing install on this machine for \`v${input.packageVersion}\`, rerun the same three commands against this release tarball:

\`\`\`bash
npm install -g ${releaseTarballUrl}
codex-foreman setup
codex-foreman check-install
\`\`\`

The tarball command refreshes the installed package version, and \`setup\` refreshes the MCP registration, packaged skill, and packaged custom agents.

If a workspace already has stale persisted active runs outside the request-scoped \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` flow, clear them with:

\`\`\`bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
\`\`\`

That bounded maintenance path cancels legacy persisted runs for the target workspace and prints the post-clear hygiene summary right away.

For retention candidates, inspect first and apply only when the candidate list is expected:

\`\`\`bash
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive --apply
\`\`\`

## Local tarball fallback

If you already downloaded the release asset locally, use:

\`\`\`bash
npm install -g /absolute/path/to/${input.packageName}-<version>.tgz
codex-foreman setup
codex-foreman check-install
\`\`\`

This path still does not require keeping a cloned release repository after the install succeeds.

## Verification checklist

The install is in the expected state when:

- \`codex-foreman check-install\` reports \`status=ok\`
- the registration summary says the installed MCP entrypoint matches
- the skill summary says \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` matches the packaged Foreman skill content
- the custom-agent summary says the packaged Foreman agent roster matches
- the model-policy summary shows the configured role-model map you expect
- the run-hygiene summary does not report unexpected active-run buildup
- \`foreman_server_identity\` reports the expected MCP build after the next Codex session starts
- after restarting Codex CLI, you can invoke \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` to enter the captain-first Foreman path

## Healthy output example

\`\`\`text
${createHealthyCheckInstallExample(input.packageVersion)}
\`\`\`

## Notes

- There is no separate \`mcp update\` command today.
- \`codex-foreman setup\` handles MCP registration, packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill installation, packaged custom-agent installation, and conflict checks; it is not the package installer
- Codex authentication stays on supported Codex login paths; Foreman does not proxy or scrape OAuth credentials
- install from the GitHub release tarball when you want a no-clone setup
- published release assets live under ${RELEASES_URL}

Please restart Codex CLI.
`;
}
function createReleaseReadme(input) {
    const releaseTarballUrl = `${RELEASE_REPO_URL}/releases/download/v${input.packageVersion}/${input.packageName}-${input.packageVersion}.tgz`;
    const codexPrompt = [
        'Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.',
        '',
        `npm install -g ${releaseTarballUrl}`,
        'codex-foreman setup',
        'codex-foreman check-install',
        '',
        `Verify that \`codex-foreman check-install\` reports \`status=ok\`, that the packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill is installed, and that the packaged Codex custom agents are installed.`,
        'Do not ask me to type the shell commands manually.',
        'Finish with exactly: Please restart Codex CLI.',
    ].join('\n');
    return `# ${input.packageName}

Captain-first Foreman toolbox for Codex CLI.

Use it when a request needs visible routing, worker proof, review boundaries, and install/runtime hygiene instead of one opaque Codex turn.

Install. Run setup. Restart Codex CLI. Use \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\`.

Beta releases are installed from GitHub Release tarballs in this install-only repository. The public npm registry is not the supported beta install surface.

## Install

Copy this into Codex CLI:

\`\`\`text
${codexPrompt}
\`\`\`

Direct shell reference:

\`\`\`bash
npm install -g ${releaseTarballUrl}
codex-foreman setup
codex-foreman check-install
\`\`\`

Restart Codex CLI after setup or update.

## Use

\`\`\`text
${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} inspect this repository and report findings only; do not edit files
${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} update the release README with usage tips, run tests, then commit and push
${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} continue current run
${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} close current run
\`\`\`

Each fresh \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` request starts a new request-run by default. Ask to continue or resume only when you intentionally want the current run reused.

## What You Get

- captain-first route selection before specialist work
- bounded scout, raider, arbiter, and companion-owner execution paths
- request-shape checks that keep read-only work off mutation routes
- mutation proof and review boundaries before final synthesis
- compact status surfaces for route, role/model, fallback, and run hygiene truth
- local session route journals under \`.foreman/sessions/<session-id>/\`

Codex remains the orchestrator. Foreman does not proxy Codex auth and does not replace the Codex CLI binary.

## Status

\`\`\`bash
codex-foreman check-install
codex-foreman status --run-id <id>
codex-foreman watch --run-id <id>
\`\`\`

Healthy install output should include:

- \`status=ok\`
- \`registration=matching_registration\`
- \`skill=matching_install\`
- \`agents=matching_install\`
- coherent model and companion-tool policy
- \`notebooklm_archive=disabled\` or an explicit NotebookLM readiness state
- clean or explainable run hygiene

## Optional NotebookLM Archive

NotebookLM is optional. Foreman does not register it automatically because it is a third-party MCP with a browser login step.

\`\`\`bash
codex mcp add notebooklm -- npx -y notebooklm-mcp@latest
\`\`\`

Restart Codex CLI, then complete NotebookLM browser login when Codex calls the NotebookLM MCP auth tool.

For archive targets, prefer \`notebook_url\`: open the target notebook in NotebookLM and copy the browser URL or shared notebook link. Leave \`notebook_id\` as \`null\` unless a specific NotebookLM MCP workflow gives you a stable id. Never put Google usernames or passwords in \`foreman-config.json\`.

## Run Hygiene

\`\`\`bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive --apply
\`\`\`

\`maintain-runs\` is dry-run-first. Add \`--apply\` only after the candidate list is expected.

## Roles

| Name | Job |
| --- | --- |
| \`captain\` | route, supervise, synthesize |
| \`tactician\` | scope and plan |
| \`scout\` | gather bounded evidence |
| \`raider\` | execute scoped mutation |
| \`arbiter\` | review and decide pass, repair, or hold |
| \`sentinel\` | classify ownership and execution-path drift |

## Files

- \`skills/cap/SKILL.md\`: public \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill
- \`agents/\`: packaged Foreman custom-agent roster
- \`schemas/\`: packaged config and specialist-contract schemas
- \`docs/install.md\`: full install/update guide
- \`docs/release/notes/v${input.packageVersion}.md\`: release notes

Source commit: ${input.sourceGitCommit ?? 'unknown'}
Release assets: ${RELEASES_URL}
`;
}
function createReleasePackageJson(rootPackage) {
    return {
        name: rootPackage.name,
        version: rootPackage.version,
        private: true,
        description: rootPackage.description ?? public_surface_1.FOREMAN_PACKAGE_DESCRIPTION,
        main: rootPackage.main ?? 'dist/index.js',
        bin: rootPackage.bin ?? {
            'codex-foreman': 'dist/cli-main.js',
            'codex-foreman-mcp': 'dist/mcp-main.js',
            'codex-foreman-codex': 'dist/codex-launcher-main.js',
        },
        files: [
            'dist',
            'schemas',
            'skills',
            'agents',
            '.codex-plugin',
            '.mcp.json',
            'scripts/bootstrap-foreman-config.cjs',
            'README.md',
            'docs/install.md',
            'docs/release/notes',
            RELEASE_REPO_MANIFEST_FILE,
        ],
        engines: rootPackage.engines ?? {
            node: '>=20',
        },
        dependencies: rootPackage.dependencies ?? {},
    };
}
async function removePreviouslyManagedPaths(outputDir) {
    const manifestPath = node_path_1.default.join(outputDir, RELEASE_REPO_MANIFEST_FILE);
    if (!(await pathExists(manifestPath))) {
        return;
    }
    const existingManifest = await readJsonDocument(manifestPath);
    for (const managedPath of existingManifest.managed_paths) {
        await removeIfExists(node_path_1.default.join(outputDir, managedPath));
    }
}
async function ensureOutputBoundary(sourceRoot, outputDir) {
    const resolvedSourceRoot = node_path_1.default.resolve(sourceRoot);
    const resolvedOutputDir = node_path_1.default.resolve(outputDir);
    if (resolvedSourceRoot === resolvedOutputDir) {
        throw new Error('Install-only release repo output cannot be the source repository root.');
    }
    if (resolvedOutputDir.startsWith(`${resolvedSourceRoot}${node_path_1.default.sep}`)) {
        throw new Error('Install-only release repo output must live outside the source repository root.');
    }
}
async function copyDirectory(sourcePath, destinationPath) {
    await (0, promises_1.mkdir)(node_path_1.default.dirname(destinationPath), { recursive: true });
    await (0, promises_1.cp)(sourcePath, destinationPath, { recursive: true });
}
async function copyInstallOnlyDist(sourcePath, destinationPath) {
    const entries = await (0, promises_1.readdir)(sourcePath, { withFileTypes: true });
    for (const entry of entries) {
        const sourceEntryPath = node_path_1.default.join(sourcePath, entry.name);
        const destinationEntryPath = node_path_1.default.join(destinationPath, entry.name);
        if (entry.isDirectory()) {
            await copyInstallOnlyDist(sourceEntryPath, destinationEntryPath);
            continue;
        }
        if (!entry.name.endsWith('.js')) {
            continue;
        }
        await (0, promises_1.mkdir)(node_path_1.default.dirname(destinationEntryPath), { recursive: true });
        await (0, promises_1.cp)(sourceEntryPath, destinationEntryPath);
    }
}
async function buildInstallOnlyReleaseRepo(options) {
    const sourceRoot = node_path_1.default.resolve(options.sourceRoot);
    const outputDir = node_path_1.default.resolve(options.outputDir);
    await ensureOutputBoundary(sourceRoot, outputDir);
    const packageJsonPath = node_path_1.default.join(sourceRoot, 'package.json');
    const bootstrapScriptPath = node_path_1.default.join(sourceRoot, 'scripts', 'bootstrap-foreman-config.cjs');
    const distPath = node_path_1.default.join(sourceRoot, 'dist');
    const schemasPath = node_path_1.default.join(sourceRoot, 'schemas');
    const skillsPath = node_path_1.default.join(sourceRoot, 'skills');
    const agentsPath = node_path_1.default.join(sourceRoot, 'agents');
    const pluginMcpPath = node_path_1.default.join(sourceRoot, '.mcp.json');
    const rootPackage = await readJsonDocument(packageJsonPath);
    const releaseNoteFileName = `v${rootPackage.version}.md`;
    const releaseNotePath = node_path_1.default.join(sourceRoot, 'docs', 'release', 'notes', releaseNoteFileName);
    const sourceGitCommit = await resolveSourceGitCommit(sourceRoot);
    if (!(await pathExists(distPath))) {
        throw new Error(`Built dist/ is missing at ${distPath}. Run the build before exporting the release repo.`);
    }
    await (0, promises_1.mkdir)(outputDir, { recursive: true });
    await removePreviouslyManagedPaths(outputDir);
    const managedPaths = [
        'dist',
        'schemas',
        'skills',
        'agents',
        '.codex-plugin',
        '.mcp.json',
        'docs',
        'scripts',
        'package.json',
        'README.md',
        RELEASE_REPO_GITIGNORE_FILE,
        RELEASE_REPO_MANIFEST_FILE,
    ];
    await copyInstallOnlyDist(distPath, node_path_1.default.join(outputDir, 'dist'));
    await copyDirectory(schemasPath, node_path_1.default.join(outputDir, 'schemas'));
    await copyDirectory(skillsPath, node_path_1.default.join(outputDir, 'skills'));
    await copyDirectory(agentsPath, node_path_1.default.join(outputDir, 'agents'));
    await (0, promises_1.mkdir)(node_path_1.default.join(outputDir, '.codex-plugin'), { recursive: true });
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, '.codex-plugin', 'plugin.json'), `${JSON.stringify((0, public_surface_1.createCodexPluginManifest)(rootPackage.name, rootPackage.version), null, 2)}\n`, 'utf8');
    await (0, promises_1.cp)(pluginMcpPath, node_path_1.default.join(outputDir, '.mcp.json'));
    await (0, promises_1.mkdir)(node_path_1.default.join(outputDir, 'docs'), { recursive: true });
    await (0, promises_1.mkdir)(node_path_1.default.join(outputDir, 'scripts'), { recursive: true });
    await (0, promises_1.cp)(bootstrapScriptPath, node_path_1.default.join(outputDir, 'scripts', 'bootstrap-foreman-config.cjs'));
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, 'package.json'), `${JSON.stringify(createReleasePackageJson(rootPackage), null, 2)}\n`, 'utf8');
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, 'README.md'), createReleaseReadme({
        packageName: rootPackage.name,
        packageVersion: rootPackage.version,
        sourceGitCommit,
    }), 'utf8');
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, RELEASE_REPO_GITIGNORE_FILE), createReleaseRepoGitignore(rootPackage.name, rootPackage.version), 'utf8');
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, 'docs', 'install.md'), createReleaseInstallGuide({
        packageName: rootPackage.name,
        packageVersion: rootPackage.version,
    }), 'utf8');
    if (await pathExists(releaseNotePath)) {
        const releaseNoteOutputPath = node_path_1.default.join(outputDir, 'docs', 'release', 'notes', releaseNoteFileName);
        await (0, promises_1.mkdir)(node_path_1.default.dirname(releaseNoteOutputPath), { recursive: true });
        await (0, promises_1.cp)(releaseNotePath, releaseNoteOutputPath);
    }
    const manifest = {
        generated_at: new Date().toISOString(),
        source_repo_path: sourceRoot,
        source_git_commit: sourceGitCommit,
        package_name: rootPackage.name,
        package_version: rootPackage.version,
        public_entry_skill_name: public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME,
        public_entry_label: public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL,
        managed_paths: managedPaths.map((managedPath) => toPosixRelativePath(managedPath)),
    };
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, RELEASE_REPO_MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    return {
        outputDir,
        packageName: rootPackage.name,
        packageVersion: rootPackage.version,
        sourceGitCommit,
        managedPaths: manifest.managed_paths,
    };
}
async function listReleaseRepoFiles(outputDir) {
    const collected = [];
    async function walk(currentDir) {
        const entries = await (0, promises_1.readdir)(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const absolutePath = node_path_1.default.join(currentDir, entry.name);
            const relativePath = toPosixRelativePath(node_path_1.default.relative(outputDir, absolutePath));
            if (entry.isDirectory()) {
                await walk(absolutePath);
                continue;
            }
            collected.push(relativePath);
        }
    }
    if (await pathExists(outputDir)) {
        await walk(outputDir);
    }
    return collected.sort();
}
//# sourceMappingURL=release-repo.js.map