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
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const RELEASE_REPO_MANIFEST_FILE = 'release-repo-manifest.json';
const RELEASE_REPO_GITIGNORE_FILE = '.gitignore';
const RELEASE_REPO_GITIGNORE_CONTENT = 'node_modules/\n.DS_Store\n*.tgz\n';
const RELEASE_REPO_URL = 'https://github.com/HoRi0506/Codex-Foreman-release';
const RELEASES_URL = `${RELEASE_REPO_URL}/releases`;
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
    const codexPrompt = `Install ${input.packageName} on this machine from the GitHub release tarball ${releaseTarballUrl}. Do not assume a published npm registry package exists. If this repository is available locally, read \`docs/install.md\` before you start and follow it as the source of truth. Run \`codex-foreman setup\`, then run \`codex-foreman check-install\`. Verify that \`codex-foreman check-install\` reports \`status=ok\`, that the MCP registration matches the installed entrypoint, that the packaged \`$cap\` skill is installed, and that the packaged Codex custom agents are installed. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.`;
    return `# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

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

That step also installs or refreshes the packaged \`$cap\` skill under your local Codex skills directory and the packaged Foreman custom-agent roster under your local Codex agents directory.

Verify the install:

\`\`\`bash
codex-foreman check-install
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
- the skill summary says \`$cap\` matches the packaged Foreman skill content
- the custom-agent summary says the packaged Foreman agent roster matches
- \`foreman_server_identity\` reports the expected MCP build after the next Codex session starts
- after restarting Codex CLI, you can invoke \`$cap\` to enter the captain-first Foreman path

## Notes

- there is no separate \`mcp update\` command today
- \`codex-foreman setup\` handles MCP registration, packaged \`$cap\` skill installation, packaged custom-agent installation, and conflict checks; it is not the package installer
- Codex authentication stays on supported Codex login paths; Foreman does not proxy or scrape OAuth credentials
- install from the GitHub release tarball when you want a no-clone setup

Please restart Codex CLI.
`;
}
function createReleaseReadme(input) {
    const releaseTarballUrl = `${RELEASE_REPO_URL}/releases/download/v${input.packageVersion}/${input.packageName}-${input.packageVersion}.tgz`;
    const codexPrompt = `Install ${input.packageName} on this machine from the GitHub release tarball ${releaseTarballUrl}. Do not assume a published npm registry package exists. If this repository is available locally, read \`docs/install.md\` before you start and follow it as the source of truth. Run \`codex-foreman setup\`, then run \`codex-foreman check-install\`. Verify that \`codex-foreman check-install\` reports \`status=ok\`, that the packaged \`$cap\` skill is installed, and that the packaged Codex custom agents are installed. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.`;
    return `# ${input.packageName}

Captain-first workflow for Codex CLI.

Codex-Foreman lets you send a request into a Foreman-managed path before it falls back to the host Codex session. The main entrypoint is \`$cap\`, which hands the request to \`captain\` first.

## What Captain Does

\`captain\` is the orchestrator. It receives the request, decides whether to continue an existing run or start a new one, breaks work into bounded steps, chooses the right agent role for the next task, and pulls the result back into one visible Foreman run.

## How It Works

- you send a request with \`$cap <request>\`
- \`captain\` reads the request and the current Foreman state
- when the packaged custom-agent roster is available, \`$cap\` hands the Codex-side request to \`foreman_captain\` first
- Foreman routes work to role-shaped agents such as planning, exploration, execution, or review
- results flow back through \`captain\`, which decides whether to continue, reroute, review, or answer

## Packaged Harness Surface

The packaged install surface now ships:

- the public \`$cap\` skill
- a matching Foreman custom-agent roster for Codex-native harness work
- a plugin-era manifest skeleton and MCP placeholder that keep the package aligned with supported Codex extension surfaces

The current supported activation path is still \`codex-foreman setup\`, which installs the skill and custom-agent roster and registers the MCP entrypoint.
The first Codex-native receiver for packaged \`$cap\` work is \`foreman_captain\` when that custom-agent roster is available.

## Install

Copy this text into Codex CLI:

\`\`\`text
${codexPrompt}
\`\`\`

## What To Expect

- a more structured entry path for requests that need orchestration
- visible run state instead of one opaque turn of work
- a captain-led loop that can hand work off and bring it back
- room for planning and review before the final answer is synthesized

## Agent Roles

- \`captain\` leads orchestration
- planning agents shape and scope work
- exploration agents inspect state and gather bounded evidence
- execution agents handle implementation work
- review agents check results before they return to \`captain\`
- ownership helpers classify whether the visible execution path still looks Foreman-managed

## Quick Start

After install and restart:

- use \`$cap <your request>\` when you want the request to enter Foreman through \`captain\`
- use \`codex-foreman check-install\` when you want to confirm the install is healthy
- restart Codex CLI after install or update so the latest MCP session and skill are loaded

Codex authentication remains on supported Codex login paths. Foreman does not proxy or scrape OAuth credentials.

## Config

The shared editable config stays here:

- \`$XDG_CONFIG_HOME/foreman/foreman-config.json\`
- \`~/.config/foreman/foreman-config.json\`

\`codex-foreman setup\` is the primary supported path for creating or reusing that file after install. The shipped bootstrap helper remains available as a manual fallback instead of hiding config inside repository-local state.

## Notes

- This repository is for install and execution, not source development.
- Managed install-surface files may be replaced by the next export run from the source repository.
`;
}
function createReleasePackageJson(rootPackage) {
    return {
        name: rootPackage.name,
        version: rootPackage.version,
        private: false,
        description: rootPackage.description ?? 'Captain-led Foreman harness for Codex CLI.',
        main: rootPackage.main ?? 'dist/index.js',
        bin: rootPackage.bin ?? {
            'codex-foreman': 'dist/cli-main.js',
            'codex-foreman-mcp': 'dist/mcp-main.js',
            'codex-foreman-codex': 'dist/codex-launcher-main.js',
        },
        files: ['dist', 'schemas', 'skills', 'agents', '.codex-plugin', '.mcp.json', 'scripts/bootstrap-foreman-config.cjs', 'README.md', 'docs/install.md', RELEASE_REPO_MANIFEST_FILE],
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
    const pluginManifestDir = node_path_1.default.join(sourceRoot, '.codex-plugin');
    const pluginMcpPath = node_path_1.default.join(sourceRoot, '.mcp.json');
    const rootPackage = await readJsonDocument(packageJsonPath);
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
    await copyDirectory(pluginManifestDir, node_path_1.default.join(outputDir, '.codex-plugin'));
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
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, RELEASE_REPO_GITIGNORE_FILE), RELEASE_REPO_GITIGNORE_CONTENT, 'utf8');
    await (0, promises_1.writeFile)(node_path_1.default.join(outputDir, 'docs', 'install.md'), createReleaseInstallGuide({
        packageName: rootPackage.name,
        packageVersion: rootPackage.version,
    }), 'utf8');
    const manifest = {
        generated_at: new Date().toISOString(),
        source_repo_path: sourceRoot,
        source_git_commit: sourceGitCommit,
        package_name: rootPackage.name,
        package_version: rootPackage.version,
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