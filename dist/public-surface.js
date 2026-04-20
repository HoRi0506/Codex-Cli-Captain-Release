"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOREMAN_PACKAGED_CUSTOM_AGENT_NAMES = exports.FOREMAN_PACKAGED_CUSTOM_AGENT_FILES = exports.FOREMAN_NAMED_AGENT_SURFACES = exports.FOREMAN_SOURCE_REPO_URL = exports.FOREMAN_RELEASE_REPO_URL = exports.FOREMAN_PUBLIC_ENTRY_LABEL = exports.FOREMAN_PUBLIC_ENTRY_SKILL_NAME = exports.FOREMAN_PACKAGE_DESCRIPTION = exports.FOREMAN_PACKAGE_NAME = void 0;
exports.createCodexPluginManifest = createCodexPluginManifest;
exports.FOREMAN_PACKAGE_NAME = 'codex-foreman';
exports.FOREMAN_PACKAGE_DESCRIPTION = 'Captain-led Foreman harness for Codex CLI';
exports.FOREMAN_PUBLIC_ENTRY_SKILL_NAME = 'cap';
exports.FOREMAN_PUBLIC_ENTRY_LABEL = '$cap';
exports.FOREMAN_RELEASE_REPO_URL = 'https://github.com/HoRi0506/Codex-Foreman-release';
exports.FOREMAN_SOURCE_REPO_URL = 'https://github.com/HoRi0506/Codex-Foreman';
exports.FOREMAN_NAMED_AGENT_SURFACES = [
    {
        rosterName: 'captain',
        customAgentName: 'foreman_captain',
        packagedFileName: 'foreman-captain.toml',
    },
    {
        rosterName: 'tactician',
        customAgentName: 'foreman_tactician',
        packagedFileName: 'foreman-tactician.toml',
    },
    {
        rosterName: 'scout',
        customAgentName: 'foreman_scout',
        packagedFileName: 'foreman-scout.toml',
    },
    {
        rosterName: 'raider',
        customAgentName: 'foreman_raider',
        packagedFileName: 'foreman-raider.toml',
    },
    {
        rosterName: 'scribe',
        customAgentName: 'foreman_scribe',
        packagedFileName: 'foreman-scribe.toml',
    },
    {
        rosterName: 'arbiter',
        customAgentName: 'foreman_arbiter',
        packagedFileName: 'foreman-arbiter.toml',
    },
    {
        rosterName: 'sentinel',
        customAgentName: 'foreman_sentinel',
        packagedFileName: 'foreman-sentinel.toml',
    },
    {
        rosterName: 'companion_reader',
        customAgentName: 'foreman_companion_reader',
        packagedFileName: 'foreman-companion-reader.toml',
    },
    {
        rosterName: 'companion_operator',
        customAgentName: 'foreman_companion_operator',
        packagedFileName: 'foreman-companion-operator.toml',
    },
];
exports.FOREMAN_PACKAGED_CUSTOM_AGENT_FILES = exports.FOREMAN_NAMED_AGENT_SURFACES.map((entry) => entry.packagedFileName);
exports.FOREMAN_PACKAGED_CUSTOM_AGENT_NAMES = exports.FOREMAN_NAMED_AGENT_SURFACES.map((entry) => entry.packagedFileName.replace(/\.toml$/, ''));
function createCodexPluginManifest(packageName, packageVersion) {
    return {
        name: packageName,
        version: packageVersion,
        description: 'Captain-led Foreman harness entrypoint for Codex CLI.',
        author: {
            name: 'HoRi0506',
        },
        homepage: exports.FOREMAN_RELEASE_REPO_URL,
        repository: exports.FOREMAN_SOURCE_REPO_URL,
        license: 'UNLICENSED',
        keywords: ['codex', 'foreman', 'harness', 'agents', 'mcp'],
        skills: './skills/',
        mcpServers: './.mcp.json',
        interface: {
            displayName: 'Codex Foreman',
            shortDescription: 'Captain-first harness entrypoint for Codex CLI',
            longDescription: 'Enter a bounded captain-led Foreman workflow through $cap while keeping worker routing and review internal.',
            developerName: 'HoRi0506',
            category: 'Productivity',
            capabilities: ['Read', 'Write'],
            defaultPrompt: [
                `Use ${exports.FOREMAN_PUBLIC_ENTRY_LABEL} to route this coding task through captain first.`,
                `Use ${exports.FOREMAN_PUBLIC_ENTRY_LABEL} when you want bounded worker routing and review.`,
                `Use ${exports.FOREMAN_PUBLIC_ENTRY_LABEL} when you want a Foreman-managed run instead of one opaque turn.`,
            ],
            brandColor: '#1F7A8C',
        },
    };
}
//# sourceMappingURL=public-surface.js.map