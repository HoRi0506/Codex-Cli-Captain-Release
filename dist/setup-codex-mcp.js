"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexMcpSetupConflictError = void 0;
exports.resolveInstalledCodexForemanMcpLaunchTarget = resolveInstalledCodexForemanMcpLaunchTarget;
exports.checkCodexMcpInstall = checkCodexMcpInstall;
exports.setupCodexMcp = setupCodexMcp;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = __importDefault(require("node:path"));
const runtime_1 = require("./runtime");
class CodexMcpSetupConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CodexMcpSetupConflictError';
    }
}
exports.CodexMcpSetupConflictError = CodexMcpSetupConflictError;
function defaultPackageRoot() {
    return node_path_1.default.resolve(__dirname, '..');
}
const FOREMAN_CAP_SKILL_NAME = 'cap';
function resolveCodexHome() {
    const configured = process.env.CODEX_HOME?.trim();
    if (configured && configured.length > 0) {
        return configured;
    }
    return node_path_1.default.join((0, node_os_1.homedir)(), '.codex');
}
function resolveCodexSkillPath(skillName) {
    return node_path_1.default.join(resolveCodexHome(), 'skills', skillName);
}
function resolvePackagedForemanCapSkillPath(packageRoot = defaultPackageRoot()) {
    return node_path_1.default.join(packageRoot, 'skills', FOREMAN_CAP_SKILL_NAME, 'SKILL.md');
}
async function readTextIfExists(filePath) {
    try {
        return await (0, promises_1.readFile)(filePath, 'utf8');
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
function createCapSkillSummary(status, skillPath) {
    switch (status) {
        case 'matching_install':
            return `Codex skill $cap is installed at ${skillPath} and matches the packaged Foreman skill content.`;
        case 'missing_install':
            return `Codex skill $cap is missing at ${skillPath}. Run codex-foreman setup, then restart Codex CLI.`;
        case 'outdated_install':
            return `Codex skill $cap exists at ${skillPath} but does not match the packaged Foreman skill content. Re-run codex-foreman setup, then restart Codex CLI.`;
        case 'unreadable_install':
        default:
            return `Codex skill $cap at ${skillPath} could not be inspected reliably.`;
    }
}
async function installPackagedForemanCapSkill(packageRoot = defaultPackageRoot()) {
    const sourceSkillFile = resolvePackagedForemanCapSkillPath(packageRoot);
    const destinationSkillDir = resolveCodexSkillPath(FOREMAN_CAP_SKILL_NAME);
    const destinationSkillFile = node_path_1.default.join(destinationSkillDir, 'SKILL.md');
    const packagedContent = await (0, promises_1.readFile)(sourceSkillFile, 'utf8');
    const installedContent = await readTextIfExists(destinationSkillFile);
    if (installedContent === packagedContent) {
        return {
            skillName: FOREMAN_CAP_SKILL_NAME,
            skillPath: destinationSkillDir,
            status: 'already_installed',
        };
    }
    await (0, promises_1.mkdir)(destinationSkillDir, { recursive: true });
    await (0, promises_1.cp)(sourceSkillFile, destinationSkillFile, { force: true });
    return {
        skillName: FOREMAN_CAP_SKILL_NAME,
        skillPath: destinationSkillDir,
        status: installedContent === null ? 'installed' : 'updated',
    };
}
async function inspectPackagedForemanCapSkill(packageRoot = defaultPackageRoot()) {
    const skillPath = resolveCodexSkillPath(FOREMAN_CAP_SKILL_NAME);
    const packagedSkillFile = resolvePackagedForemanCapSkillPath(packageRoot);
    const installedSkillFile = node_path_1.default.join(skillPath, 'SKILL.md');
    try {
        const [packagedContent, installedContent] = await Promise.all([
            (0, promises_1.readFile)(packagedSkillFile, 'utf8'),
            readTextIfExists(installedSkillFile),
        ]);
        const status = installedContent === null ? 'missing_install' : installedContent === packagedContent ? 'matching_install' : 'outdated_install';
        return {
            skillName: FOREMAN_CAP_SKILL_NAME,
            skillPath,
            status,
            summary: createCapSkillSummary(status, skillPath),
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
        return {
            skillName: FOREMAN_CAP_SKILL_NAME,
            skillPath,
            status: 'unreadable_install',
            summary: `${createCapSkillSummary('unreadable_install', skillPath)} ${message}`,
        };
    }
}
function quoteCommandPart(value) {
    if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
        return value;
    }
    return JSON.stringify(value);
}
function formatCommand(command, args) {
    return [command, ...args].map(quoteCommandPart).join(' ');
}
function formatCommandFailure(command, args, result) {
    const stdout = result.stdout.trim();
    const stderr = result.stderr.trim();
    return [
        `Command failed: ${formatCommand(command, args)}`,
        `exit_code=${String(result.code)} signal=${String(result.signal)}`,
        `STDOUT:\n${stdout.length > 0 ? stdout : '(empty)'}`,
        `STDERR:\n${stderr.length > 0 ? stderr : '(empty)'}`,
    ].join('\n');
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function isMissingRegistration(serverName, result) {
    if (result.code === 0 && result.signal === null) {
        return false;
    }
    const outputLines = `${result.stdout}\n${result.stderr}`
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const expectedPatterns = [
        new RegExp(`^No global MCP server named ${escapeRegex(JSON.stringify(serverName))}\.$`, 'u'),
        new RegExp(`^Error: No MCP server named '${escapeRegex(serverName)}' found\.$`, 'u'),
    ];
    return outputLines.some((line) => expectedPatterns.some((pattern) => pattern.test(line)));
}
function normalizeStringArray(value) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
        return null;
    }
    return [...value];
}
function normalizeOptionalString(value) {
    return typeof value === 'string' ? value : null;
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
function describeRegisteredServer(record) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio' || typeof transport.command !== 'string') {
        return 'a non-stdio or unreadable registration';
    }
    const args = normalizeStringArray(transport.args) ?? [];
    return formatCommand(transport.command, args);
}
async function resolveRegisteredEntrypointPath(record) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio') {
        return null;
    }
    const args = normalizeStringArray(transport.args) ?? [];
    const firstArg = args[0];
    if (!firstArg) {
        return null;
    }
    try {
        return await (0, promises_1.realpath)(firstArg);
    }
    catch {
        return node_path_1.default.isAbsolute(firstArg) ? firstArg : null;
    }
}
async function areEquivalentCommandArgs(registeredArgs, expectedArgs) {
    if (registeredArgs.length !== expectedArgs.length) {
        return false;
    }
    for (let index = 0; index < registeredArgs.length; index += 1) {
        const registeredArg = registeredArgs[index];
        const expectedArg = expectedArgs[index];
        if (registeredArg === undefined || expectedArg === undefined) {
            return false;
        }
        if (registeredArg === expectedArg) {
            continue;
        }
        try {
            const [registeredRealPath, expectedRealPath] = await Promise.all([(0, promises_1.realpath)(registeredArg), (0, promises_1.realpath)(expectedArg)]);
            if (registeredRealPath !== expectedRealPath) {
                return false;
            }
        }
        catch {
            return false;
        }
    }
    return true;
}
async function hasMatchingRegistration(record, command, args) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio' || typeof transport.command !== 'string') {
        return false;
    }
    const registeredArgs = normalizeStringArray(transport.args);
    if (registeredArgs === null) {
        return false;
    }
    if (transport.command !== command) {
        return false;
    }
    return await areEquivalentCommandArgs(registeredArgs, args);
}
async function spawnCommand(command, args) {
    return await new Promise((resolve, reject) => {
        const child = (0, node_child_process_1.spawn)(command, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });
        child.on('error', (error) => {
            reject(error instanceof Error ? error : new Error(`Failed to start ${command}.`));
        });
        child.on('close', (code, signal) => {
            resolve({ code, signal, stdout, stderr });
        });
    });
}
function classifyCompanionMcpServer(name) {
    switch (name) {
        case 'context7':
            return {
                compatibility: 'recommended_companion',
                usageHint: 'Use for current library and framework documentation lookups before planning or implementation.',
            };
        case 'fetch':
            return {
                compatibility: 'recommended_companion',
                usageHint: 'Use for bounded URL fetches when release work needs authoritative remote artifacts or docs.',
            };
        case 'filesystem':
            return {
                compatibility: 'recommended_companion',
                usageHint: 'Use for repository and workspace file inspection when the client exposes filesystem MCP tools.',
            };
        case 'git':
            return {
                compatibility: 'recommended_companion',
                usageHint: 'Use for release provenance, branch state, diffs, and regression-oriented history checks.',
            };
        default:
            return {
                compatibility: 'generic_companion',
                usageHint: 'Registered alongside Foreman as a separate MCP surface that can be used for bounded supporting work.',
            };
    }
}
function summarizeCompanionMcpServers(servers) {
    if (servers.length === 0) {
        return 'No other Codex MCP servers are currently registered alongside Foreman.';
    }
    const recommendedServers = servers.filter((server) => server.compatibility === 'recommended_companion').map((server) => server.name);
    const allNames = servers.map((server) => server.name);
    if (recommendedServers.length === 0) {
        return `Other installed MCP servers: ${allNames.join(', ')}.`;
    }
    return `Other installed MCP servers: ${allNames.join(', ')}. Recommended Foreman companions: ${recommendedServers.join(', ')}.`;
}
function createRegistrationSummary(status, serverName) {
    switch (status) {
        case 'matching_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} matches the installed Foreman launch target.`;
        case 'missing_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} is missing. Run codex-foreman setup to register it.`;
        case 'conflicting_registration':
            return `Codex MCP registration ${JSON.stringify(serverName)} points at a different command than the installed Foreman launch target.`;
        case 'unreadable_registration':
        default:
            return `Codex MCP registration ${JSON.stringify(serverName)} could not be inspected reliably.`;
    }
}
async function resolveInstalledCodexForemanMcpLaunchTarget(packageRoot = defaultPackageRoot()) {
    const entrypointPath = node_path_1.default.join(packageRoot, 'dist', 'mcp-main.js');
    try {
        const resolvedEntrypointPath = await (0, promises_1.realpath)(entrypointPath);
        return {
            command: process.execPath,
            args: [resolvedEntrypointPath],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
        throw new Error(`Unable to resolve the installed codex-foreman MCP entrypoint at ${entrypointPath}. Build or install the package before running setup.\n${message}`);
    }
}
async function checkCodexMcpInstall(options, dependencies = {}) {
    const runCommand = dependencies.runCommand ?? spawnCommand;
    const launchTarget = await resolveInstalledCodexForemanMcpLaunchTarget(dependencies.packageRoot);
    const expectedEntrypointPath = launchTarget.args[0] ?? null;
    const configPath = (0, runtime_1.resolveForemanConfigFilePath)();
    const configExists = await pathExists(configPath);
    let registrationStatus = 'missing_registration';
    let registrationSummary = createRegistrationSummary(registrationStatus, options.serverName);
    let registeredLaunchCommand = null;
    let registeredLaunchArgs = [];
    let registeredEntrypointPath = null;
    const getArgs = ['mcp', 'get', '--json', options.serverName];
    const existingRegistrationResult = await runCommand(options.codexPath, getArgs);
    if (!isMissingRegistration(options.serverName, existingRegistrationResult)) {
        if (existingRegistrationResult.code !== 0 || existingRegistrationResult.signal !== null) {
            registrationStatus = 'unreadable_registration';
            registrationSummary = `${createRegistrationSummary(registrationStatus, options.serverName)} ${formatCommandFailure(options.codexPath, getArgs, existingRegistrationResult)}`;
        }
        else {
            try {
                const existingRegistration = JSON.parse(existingRegistrationResult.stdout);
                const transport = existingRegistration.transport;
                registeredLaunchCommand = transport && typeof transport.command === 'string' ? transport.command : null;
                registeredLaunchArgs = normalizeStringArray(transport?.args) ?? [];
                registeredEntrypointPath = await resolveRegisteredEntrypointPath(existingRegistration);
                registrationStatus = (await hasMatchingRegistration(existingRegistration, launchTarget.command, launchTarget.args))
                    ? 'matching_registration'
                    : 'conflicting_registration';
                registrationSummary =
                    registrationStatus === 'conflicting_registration'
                        ? [
                            createRegistrationSummary(registrationStatus, options.serverName),
                            `Existing: ${describeRegisteredServer(existingRegistration)}`,
                            `Expected: ${formatCommand(launchTarget.command, launchTarget.args)}`,
                        ].join('\n')
                        : createRegistrationSummary(registrationStatus, options.serverName);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
                registrationStatus = 'unreadable_registration';
                registrationSummary = [
                    createRegistrationSummary(registrationStatus, options.serverName),
                    `Failed to parse Codex MCP registration JSON for ${options.serverName}.`,
                    message,
                ].join('\n');
            }
        }
    }
    let registryInspectionStatus = 'unavailable';
    let registryInspectionSummary = 'Unable to inspect the full Codex MCP registry.';
    let otherInstalledMcpServers = [];
    const listArgs = ['mcp', 'list', '--json'];
    const listResult = await runCommand(options.codexPath, listArgs);
    if (listResult.code === 0 && listResult.signal === null) {
        try {
            const records = JSON.parse(listResult.stdout);
            registryInspectionStatus = 'listed';
            otherInstalledMcpServers = Array.isArray(records)
                ? records
                    .filter((record) => normalizeOptionalString(record.name) !== options.serverName)
                    .map((record) => {
                    const name = normalizeOptionalString(record.name) ?? 'unknown';
                    const args = normalizeStringArray(record.transport?.args) ?? [];
                    const classification = classifyCompanionMcpServer(name);
                    return {
                        name,
                        enabled: record.enabled !== false,
                        disabledReason: normalizeOptionalString(record.disabled_reason),
                        transportType: normalizeOptionalString(record.transport?.type),
                        command: normalizeOptionalString(record.transport?.command),
                        args,
                        authStatus: normalizeOptionalString(record.auth_status),
                        compatibility: classification.compatibility,
                        usageHint: classification.usageHint,
                    };
                })
                : [];
            registryInspectionSummary = summarizeCompanionMcpServers(otherInstalledMcpServers);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
            registryInspectionSummary = `Unable to parse codex mcp list --json output. ${message}`;
        }
    }
    else {
        registryInspectionSummary = `${registryInspectionSummary} ${formatCommandFailure(options.codexPath, listArgs, listResult)}`;
    }
    const capSkill = await inspectPackagedForemanCapSkill(dependencies.packageRoot);
    const status = registrationStatus === 'matching_registration' &&
        configExists &&
        registryInspectionStatus === 'listed' &&
        capSkill.status === 'matching_install'
        ? 'ok'
        : 'warning';
    return {
        status,
        serverName: options.serverName,
        expectedLaunchCommand: launchTarget.command,
        expectedLaunchArgs: [...launchTarget.args],
        expectedEntrypointPath,
        registrationStatus,
        registrationSummary,
        registeredLaunchCommand,
        registeredLaunchArgs,
        registeredEntrypointPath,
        configPath,
        configExists,
        registryInspectionStatus,
        registryInspectionSummary,
        otherInstalledMcpServers,
        companionMcpUsageSummary: summarizeCompanionMcpServers(otherInstalledMcpServers),
        capSkillName: capSkill.skillName,
        capSkillPath: capSkill.skillPath,
        capSkillStatus: capSkill.status,
        capSkillSummary: capSkill.summary,
    };
}
async function setupCodexMcp(options, dependencies = {}) {
    const runCommand = dependencies.runCommand ?? spawnCommand;
    const launchTarget = await resolveInstalledCodexForemanMcpLaunchTarget(dependencies.packageRoot);
    const getArgs = ['mcp', 'get', '--json', options.serverName];
    const existingRegistrationResult = await runCommand(options.codexPath, getArgs);
    if (!isMissingRegistration(options.serverName, existingRegistrationResult)) {
        if (existingRegistrationResult.code !== 0 || existingRegistrationResult.signal !== null) {
            throw new Error(formatCommandFailure(options.codexPath, getArgs, existingRegistrationResult));
        }
        let existingRegistration;
        try {
            existingRegistration = JSON.parse(existingRegistrationResult.stdout);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown JSON parse error.';
            throw new Error(`Failed to parse Codex MCP registration JSON for ${options.serverName}.\n${message}\nSTDOUT:\n${existingRegistrationResult.stdout.trim() || '(empty)'}\nSTDERR:\n${existingRegistrationResult.stderr.trim() || '(empty)'}`);
        }
        if (await hasMatchingRegistration(existingRegistration, launchTarget.command, launchTarget.args)) {
            const configResult = await (0, runtime_1.ensureForemanConfig)(options.cwd);
            const capSkill = await installPackagedForemanCapSkill(dependencies.packageRoot);
            return {
                status: 'already_registered',
                serverName: options.serverName,
                launchCommand: launchTarget.command,
                launchArgs: [...launchTarget.args],
                configPath: configResult.configPath,
                configCreated: configResult.configCreated,
                capSkillName: capSkill.skillName,
                capSkillPath: capSkill.skillPath,
                capSkillStatus: capSkill.status,
                restartRequired: capSkill.status !== 'already_installed',
            };
        }
        throw new CodexMcpSetupConflictError([
            `Codex MCP server ${JSON.stringify(options.serverName)} is already registered to a different command.`,
            `Existing: ${describeRegisteredServer(existingRegistration)}`,
            `Expected: ${formatCommand(launchTarget.command, launchTarget.args)}`,
            'Remove or rename the existing registration before running codex-foreman setup again.',
        ].join('\n'));
    }
    const addArgs = ['mcp', 'add', options.serverName, '--', launchTarget.command, ...launchTarget.args];
    const addResult = await runCommand(options.codexPath, addArgs);
    if (addResult.code !== 0 || addResult.signal !== null) {
        throw new Error(formatCommandFailure(options.codexPath, addArgs, addResult));
    }
    const configResult = await (0, runtime_1.ensureForemanConfig)(options.cwd);
    const capSkill = await installPackagedForemanCapSkill(dependencies.packageRoot);
    return {
        status: 'registered',
        serverName: options.serverName,
        launchCommand: launchTarget.command,
        launchArgs: [...launchTarget.args],
        configPath: configResult.configPath,
        configCreated: configResult.configCreated,
        capSkillName: capSkill.skillName,
        capSkillPath: capSkill.skillPath,
        capSkillStatus: capSkill.status,
        restartRequired: true,
    };
}
//# sourceMappingURL=setup-codex-mcp.js.map