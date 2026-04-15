"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexMcpSetupConflictError = void 0;
exports.resolveInstalledCodexForemanMcpLaunchTarget = resolveInstalledCodexForemanMcpLaunchTarget;
exports.setupCodexMcp = setupCodexMcp;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
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
function describeRegisteredServer(record) {
    const transport = record.transport;
    if (!transport || transport.type !== 'stdio' || typeof transport.command !== 'string') {
        return 'a non-stdio or unreadable registration';
    }
    const args = normalizeStringArray(transport.args) ?? [];
    return formatCommand(transport.command, args);
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
            return {
                status: 'already_registered',
                serverName: options.serverName,
                launchCommand: launchTarget.command,
                launchArgs: [...launchTarget.args],
                configPath: configResult.configPath,
                configCreated: configResult.configCreated,
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
    return {
        status: 'registered',
        serverName: options.serverName,
        launchCommand: launchTarget.command,
        launchArgs: [...launchTarget.args],
        configPath: configResult.configPath,
        configCreated: configResult.configCreated,
    };
}
//# sourceMappingURL=setup-codex-mcp.js.map