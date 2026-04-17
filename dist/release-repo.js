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
const RELEASE_REPO_GITIGNORE_CONTENT = 'node_modules/\n.DS_Store\n*.tgz\nforeman-smoke-*/\nforeman-sweep-*/\n';
const RELEASE_REPO_URL = public_surface_1.FOREMAN_RELEASE_REPO_URL;
const RELEASES_URL = `${RELEASE_REPO_URL}/releases`;
function createHealthyCheckInstallExample(packageVersion) {
    return [
        `Foreman install check: status=ok version=${packageVersion} entry=${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} registration=matching_registration config=present skill=matching_install agents=matching_install package_surface=coherent_surface companion_mcps=0 model_policy=coherent run_hygiene=clean`,
        `Current package: codex-foreman@${packageVersion}`,
        `Public entry: ${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} (skill=${public_surface_1.FOREMAN_PUBLIC_ENTRY_SKILL_NAME})`,
        'Model policy: Configured role-model policy: captain=gpt-5.4/high tactician=gpt-5.4/medium scout=gpt-5.4-mini/medium raider=gpt-5.3-codex/high arbiter=gpt-5.4/high',
        'Run hygiene: Run hygiene: clean; fresh=0 stale=0 resume=none.',
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

To update an existing install on this machine, rerun the same three commands against the newer release tarball for the target version:

\`\`\`bash
npm install -g ${releaseTarballUrl}
codex-foreman setup
codex-foreman check-install
\`\`\`

The tarball command refreshes the installed package version, and \`setup\` refreshes the MCP registration, packaged skill, and packaged custom agents.

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

Codex-Foreman is for requests that benefit from a more structured path than one opaque Codex turn. It adds a captain-first entry, visible run state, role-shaped specialist routing, an explicit review lane, and honest install/runtime audit without replacing Codex as the orchestrator.

Beta warning: this release surface is still beta. Expect changes, fixes, and update cadence to stay relatively fast and sometimes irregular while the harness contract continues to harden.

The public entrypoint is \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\`. That entry hands the request to \`captain\` first.

## What It Is For

Use Codex-Foreman when you want one or more of these:

- a captain-led intake before work begins
- visible run, delegation, and fallback state
- derived navigation bundles that captain, tactician, and scout can use as bounded read-first aids
- role-shaped planning, exploration, implementation, or review
- routing that explains whether the current bounded path is light, medium, or heavy and why
- install diagnostics that expose configured role-model policy and active-run hygiene
- a bounded path that can stop, reroute, review, or continue instead of flattening everything into one response
- clearer proof about whether work stayed local or used a configured specialist path

It is most useful for multi-step work, repository investigation, scoped implementation, verification-sensitive tasks, and any request where you want the path of work to stay inspectable.

It is also useful when you want read-heavy repository questions, doc lookups, or bounded explanation work to stay on a cheaper explorer-first path unless mutation is explicitly requested.

For trivial answers or short conversational turns, the normal Codex path is often enough.

## What Captain Does

\`captain\` is the orchestrator. It receives the request, checks the current Foreman state, decides whether to stay local or choose a specialist role, keeps the work bounded, and pulls the result back into one visible run.

The packaged routing pass is request-shape-aware before it becomes mutation-shaped. Existence checks, lookup, survey, diagnosis, planning, verification, and synthesis can stay on cheaper \`captain\`, \`scout\`, or \`tactician\` routes, while \`raider\` stays behind an explicit mutation-intent gate.

Auto-entry is also reuse-first for lightweight read-heavy work. If one active run is clearly the safe continuation target, captain can reuse it; if not, a bounded read-only request can stay on a no-run path instead of creating another fresh run that only falls back to the host session.

Within one Codex CLI session, Foreman now keeps one current run by default. The same session keeps reusing that run until the operator explicitly asks for a new run or closes it, and the bound run is closed when that session ends. Operator-facing surfaces can now show a readable current-run label in date-time-task form instead of only a raw run id.

Default operator views now prefer named roster labels such as \`captain\`, \`scout\`, \`raider\`, and \`arbiter\` over opaque worker ids, and the compact answer trace explains request shape, selected role, execution path, and why a heavier specialist route did or did not win.

The MCP auto-entry surface can now report bounded elapsed timing as part of the operator-facing diagnostic path, which makes it easier to tell whether slowdown came from Foreman work itself or from outer session transport.

\`codex-foreman status --run-id <id>\` is the one-shot CLI snapshot surface for that same truth. It uses the compact watch contract without the polling mental model and can show the latest answer path separately from the persisted current task when a reused implementation run receives a read-only follow-up.

## How It Behaves

- you send a request with \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} <request>\`
- \`captain\` reads the request and current Foreman state
- \`captain\` chooses the next bounded loop stage and path variant before specialist routing
- Codex decides whether to answer locally or use a specialist role inside that bounded stage
- Foreman provides the run state, role metadata, model policy, playbook mapping, wrapper contract, and evidence surfaces
- the routing surface can explain workload class, path weight, model-tier budget, reasoning-effort budget, and review requirement for the current bounded route
- the answer trace can explain request shape, selected role, execution path, and why a heavier specialist path did or did not win
- \`codex-foreman status --run-id <id>\` can show the latest answer path separately from the persisted current task when those truths differ
- read-heavy repository questions can stay on a cheaper explorer-first path instead of silently normalizing into heavy implementation routing
- bounded read-only auto-entry can prefer safe reuse or suppress a needless new run instead of accumulating throwaway active runs
- one Codex CLI session can keep one current run until the operator explicitly closes it or asks for a new run
- \`codex-foreman check-install\` can also report configured role-model policy and whether run buildup is making auto-entry reuse ambiguous
- when a bundled directory is named clearly enough, planner and scout prompts can inherit a compact non-canonical navigation hint instead of starting cold
- when the packaged custom-agent roster is available, the first Codex-native receiver for packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` work is \`foreman_captain\`
- specialist results return through \`captain\`, which decides whether to continue, review, reroute, stop, or answer

## Canonical Loop

The default bounded loop is:

\`intake -> scoped -> investigating -> implementing -> reviewing -> verifying_execution_truth -> synthesizing -> completed\`

The main shorter variants are:

- \`light\`
- \`investigate_only\`
- \`implementation\`
- \`verify_only\`
- \`blocked_manual\`

Packaged status and activity surfaces expose loop stage and path variant so the current bounded path stays visible.

## Public And Internal Boundary

The public harness surface is:

- \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\`

The internal support surfaces are:

- the packaged custom-agent roster
- the role wrappers and playbook mappings
- the bounded review and ownership helpers

Those internal pieces help \`captain\` route and supervise work. They are not public operator commands.

## When To Reach For It

Reach for Codex-Foreman when:

- you want \`captain\` to inspect the request before execution begins
- you want planning, exploration, implementation, and review to stay visible as one run
- you care which role and model were selected
- you want bounded fallback behavior instead of silent drift
- you want bounded repo investigation to start from a cheap derived map instead of a full cold scan

## Recommended MCPs

- \`context7\` for current library and framework docs before planning or implementation
- \`filesystem\` for bounded repository inspection when the client exposes filesystem MCP tools
- \`git\` for provenance, diffs, branch state, and regression-oriented history checks
- \`fetch\` for authoritative remote artifacts or docs during release and install work

These remain companion surfaces, not hidden Foreman workers.

## Packaged Harness Surface

The packaged install surface ships:

- the public \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill
- a matching Foreman custom-agent roster for Codex-native harness work
- the captain and specialist wrapper docs that define the internal contract
- packaged declarative specialist role contracts under \`schemas/\`
- a plugin-era manifest skeleton and MCP placeholder that keep the package aligned with supported Codex extension surfaces

The current supported activation path is still \`codex-foreman setup\`, which installs the skill and custom-agent roster and registers the MCP entrypoint.

## Install

Copy this text into Codex CLI:

\`\`\`text
${codexPrompt}
\`\`\`

## Update

To update an existing install, copy the latest release README install block again and rerun it. The direct tarball install refreshes the package version, and \`codex-foreman setup\` refreshes MCP registration plus the packaged \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL}\` skill and custom agents.

## What To Expect

- a more structured entry path for requests that need orchestration
- visible run state instead of one opaque turn of work
- a captain-led loop that can hand work off and bring it back
- derived navigation bundles that captain, tactician, and scout can use as bounded read-first aids
- visible loop stage and path variant on status surfaces
- an active run truth surface that shows owner, selected specialist, boundary state, and resume action at a glance
- explicit specialist protocol contracts that can surface degraded validation state
- compact role framing so navigation and contract guidance stay bounded instead of bloating specialist prompts
- room for planning and review before the final answer is synthesized
- a clearer internal/public boundary for how the harness is meant to be used

## Agent Roles

- \`captain\` leads orchestration
- planning agents shape and scope work
- exploration agents inspect state and gather bounded evidence
- execution agents handle implementation work
- review agents check results before they return to \`captain\`
- ownership helpers classify whether the visible execution path still looks Foreman-managed

## Quick Start

After install and restart:

- use \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} <your request>\` when you want the request to enter Foreman through \`captain\`
- use \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} close current run\` or \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} clear run session\` when you want to clear the current session-bound run
- use \`${public_surface_1.FOREMAN_PUBLIC_ENTRY_LABEL} start a new run <your request>\` when you want to stop reusing the current run and force a fresh one
- use \`codex-foreman check-install\` when you want to confirm the install is healthy
- restart Codex CLI after install or update so the latest MCP session and skill are loaded

Codex remains the orchestrator and authentication stays on supported Codex login paths. Foreman does not proxy or scrape OAuth credentials.

Published release assets live under ${RELEASES_URL}.

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
        description: rootPackage.description ?? public_surface_1.FOREMAN_PACKAGE_DESCRIPTION,
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