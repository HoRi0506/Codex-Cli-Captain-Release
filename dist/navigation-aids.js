"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNavigationBundleHint = resolveNavigationBundleHint;
exports.generateNavigationBundle = generateNavigationBundle;
exports.validateNavigationBundle = validateNavigationBundle;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const SUPPORTED_SOURCE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.json',
    '.md',
]);
const FUNCTION_SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const EXCLUDED_DIRECTORY_NAMES = new Set([
    '.git',
    '.foreman',
    'node_modules',
    'dist',
    'coverage',
    '.next',
    '.turbo',
]);
const NAVIGATION_DIRECTORY_NAME = 'navigation';
function pathExistsSync(targetPath) {
    try {
        (0, node_fs_1.statSync)(targetPath);
        return true;
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}
function createDefaultOutputDir(cwd, relativeTargetDir) {
    const slug = relativeTargetDir.replace(/[\\/]+/g, '__').replace(/[^A-Za-z0-9._-]/g, '_') || 'root';
    return node_path_1.default.join(cwd, '.foreman', NAVIGATION_DIRECTORY_NAME, slug);
}
function assertTargetInsideWorkspace(cwd, targetDir) {
    const absoluteCwd = node_path_1.default.resolve(cwd);
    const absoluteTargetDir = node_path_1.default.resolve(targetDir);
    const relativeTargetDir = node_path_1.default.relative(absoluteCwd, absoluteTargetDir);
    if (relativeTargetDir.length === 0 ||
        (!relativeTargetDir.startsWith('..') && !node_path_1.default.isAbsolute(relativeTargetDir))) {
        return {
            absoluteTargetDir,
            relativeTargetDir: relativeTargetDir.length === 0 ? '.' : relativeTargetDir,
        };
    }
    throw new Error(`Target directory ${absoluteTargetDir} must stay inside workspace ${absoluteCwd}.`);
}
function normalizeNodeId(value) {
    return `node_${value.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'root'}`;
}
function toPosixRelativePath(from, to) {
    return node_path_1.default.relative(from, to).split(node_path_1.default.sep).join('/');
}
async function collectSourceFiles(targetDir) {
    const collected = [];
    async function visitDirectory(directoryPath) {
        const entries = await (0, promises_1.readdir)(directoryPath, { withFileTypes: true });
        for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
            const absolutePath = node_path_1.default.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRECTORY_NAMES.has(entry.name)) {
                    await visitDirectory(absolutePath);
                }
                continue;
            }
            if (!entry.isFile()) {
                continue;
            }
            const extension = node_path_1.default.extname(entry.name);
            if (!SUPPORTED_SOURCE_EXTENSIONS.has(extension)) {
                continue;
            }
            const [fileContent, fileStat] = await Promise.all([(0, promises_1.readFile)(absolutePath, 'utf8'), (0, promises_1.stat)(absolutePath)]);
            collected.push({
                absolutePath,
                relativePath: toPosixRelativePath(targetDir, absolutePath),
                extension,
                content: fileContent,
                updatedAt: fileStat.mtime.toISOString(),
            });
        }
    }
    await visitDirectory(targetDir);
    return collected;
}
function collectSourceFilesSync(targetDir) {
    const collected = [];
    function visitDirectory(directoryPath) {
        const entries = (0, node_fs_1.readdirSync)(directoryPath, { withFileTypes: true });
        for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
            const absolutePath = node_path_1.default.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRECTORY_NAMES.has(entry.name)) {
                    visitDirectory(absolutePath);
                }
                continue;
            }
            if (!entry.isFile()) {
                continue;
            }
            const extension = node_path_1.default.extname(entry.name);
            if (!SUPPORTED_SOURCE_EXTENSIONS.has(extension)) {
                continue;
            }
            const fileStat = (0, node_fs_1.statSync)(absolutePath);
            collected.push({
                absolutePath,
                relativePath: toPosixRelativePath(targetDir, absolutePath),
                extension,
                content: (0, node_fs_1.readFileSync)(absolutePath, 'utf8'),
                updatedAt: fileStat.mtime.toISOString(),
            });
        }
    }
    visitDirectory(targetDir);
    return collected;
}
function listDirectoryNodes(relativeFilePaths) {
    const directories = new Set(['.']);
    for (const relativeFilePath of relativeFilePaths) {
        const segments = relativeFilePath.split('/').slice(0, -1);
        let current = '';
        for (const segment of segments) {
            current = current.length === 0 ? segment : `${current}/${segment}`;
            directories.add(current);
        }
    }
    return [...directories].sort((left, right) => left.localeCompare(right));
}
function buildDirectoryFileMap(relativeTargetDir, files) {
    const directoryNodes = listDirectoryNodes(files.map((file) => file.relativePath));
    const lines = [
        '%% derived_non_canonical=true',
        '%% confidence=exact',
        `%% target_dir=${relativeTargetDir}`,
        'graph TD',
        `  ${normalizeNodeId(relativeTargetDir)}["${relativeTargetDir}"]`,
    ];
    for (const directoryNode of directoryNodes) {
        if (directoryNode === '.') {
            continue;
        }
        const parentDirectory = node_path_1.default.posix.dirname(directoryNode);
        const parentId = normalizeNodeId(parentDirectory === '.' ? relativeTargetDir : `${relativeTargetDir}/${parentDirectory}`);
        const directoryId = normalizeNodeId(`${relativeTargetDir}/${directoryNode}`);
        lines.push(`  ${directoryId}["${directoryNode}/"]`);
        lines.push(`  ${parentId} --> ${directoryId}`);
    }
    for (const file of files) {
        const parentDirectory = node_path_1.default.posix.dirname(file.relativePath);
        const parentId = parentDirectory === '.'
            ? normalizeNodeId(relativeTargetDir)
            : normalizeNodeId(`${relativeTargetDir}/${parentDirectory}`);
        const fileId = normalizeNodeId(`${relativeTargetDir}/${file.relativePath}`);
        lines.push(`  ${fileId}["${file.relativePath}"]`);
        lines.push(`  ${parentId} --> ${fileId}`);
    }
    return `${lines.join('\n')}\n`;
}
function tryResolveRelativeImport(fromFile, importPath, knownFiles) {
    if (!importPath.startsWith('.')) {
        return null;
    }
    const directory = node_path_1.default.posix.dirname(fromFile);
    const base = node_path_1.default.posix.normalize(node_path_1.default.posix.join(directory, importPath));
    const candidates = [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        `${base}.jsx`,
        `${base}.mjs`,
        `${base}.cjs`,
        `${base}.json`,
        `${base}.md`,
        node_path_1.default.posix.join(base, 'index.ts'),
        node_path_1.default.posix.join(base, 'index.tsx'),
        node_path_1.default.posix.join(base, 'index.js'),
        node_path_1.default.posix.join(base, 'index.jsx'),
        node_path_1.default.posix.join(base, 'index.mjs'),
        node_path_1.default.posix.join(base, 'index.cjs'),
    ];
    for (const candidate of candidates) {
        if (knownFiles.has(candidate)) {
            return candidate;
        }
    }
    return null;
}
function extractFileDependencies(files) {
    const fileLookup = new Set(files.map((file) => file.relativePath));
    const dependencyMap = new Map();
    const importPattern = /(?:import\s+(?:[^'"]+?\s+from\s+)?|export\s+[^'"]*from\s+|require\()\s*['"]([^'"]+)['"]/gu;
    for (const file of files) {
        const dependencies = new Set();
        for (const match of file.content.matchAll(importPattern)) {
            const importPath = match[1];
            if (!importPath) {
                continue;
            }
            const resolvedImport = tryResolveRelativeImport(file.relativePath, importPath, fileLookup);
            if (resolvedImport) {
                dependencies.add(resolvedImport);
            }
        }
        dependencyMap.set(file.relativePath, dependencies);
    }
    return dependencyMap;
}
function buildFileDependencyMap(relativeTargetDir, files, dependencies) {
    const lines = [
        '%% derived_non_canonical=true',
        '%% confidence=partial',
        `%% target_dir=${relativeTargetDir}`,
        'graph LR',
    ];
    for (const file of files) {
        const fileId = normalizeNodeId(`${relativeTargetDir}/${file.relativePath}`);
        lines.push(`  ${fileId}["${file.relativePath}"]`);
    }
    for (const [filePath, importedFiles] of dependencies.entries()) {
        const fromId = normalizeNodeId(`${relativeTargetDir}/${filePath}`);
        for (const importedFile of [...importedFiles].sort((left, right) => left.localeCompare(right))) {
            const toId = normalizeNodeId(`${relativeTargetDir}/${importedFile}`);
            lines.push(`  ${fromId} --> ${toId}`);
        }
    }
    return `${lines.join('\n')}\n`;
}
function extractFunctions(files) {
    const functions = [];
    const functionPatterns = [
        /\bexport\s+async\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gu,
        /\bexport\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gu,
        /\basync\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gu,
        /(?<![.\w$])function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gu,
        /\bexport\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gu,
        /\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gu,
    ];
    for (const file of files) {
        if (!FUNCTION_SOURCE_EXTENSIONS.has(file.extension)) {
            continue;
        }
        const seenNames = new Set();
        for (const pattern of functionPatterns) {
            for (const match of file.content.matchAll(pattern)) {
                const functionName = match[1];
                if (!functionName || seenNames.has(functionName)) {
                    continue;
                }
                seenNames.add(functionName);
                functions.push({
                    id: `${file.relativePath}::${functionName}`,
                    name: functionName,
                    fileRelativePath: file.relativePath,
                    summaryPath: '',
                });
            }
        }
    }
    return functions;
}
function buildFunctionMap(relativeTargetDir, files, functions) {
    const uniqueNameCounts = new Map();
    const fileByRelativePath = new Map(files.map((file) => [file.relativePath, file]));
    for (const fn of functions) {
        uniqueNameCounts.set(fn.name, (uniqueNameCounts.get(fn.name) ?? 0) + 1);
    }
    const lines = [
        '%% derived_non_canonical=true',
        '%% confidence=heuristic',
        `%% target_dir=${relativeTargetDir}`,
        'graph LR',
    ];
    for (const fn of functions) {
        lines.push(`  ${normalizeNodeId(fn.id)}["${fn.name}\\n${fn.fileRelativePath}"]`);
    }
    for (const sourceFunction of functions) {
        const file = fileByRelativePath.get(sourceFunction.fileRelativePath);
        if (!file) {
            continue;
        }
        for (const targetFunction of functions) {
            if (sourceFunction.id === targetFunction.id) {
                continue;
            }
            if ((uniqueNameCounts.get(targetFunction.name) ?? 0) !== 1) {
                continue;
            }
            const invocationPattern = new RegExp(`\\b${targetFunction.name}\\s*\\(`, 'u');
            if (!invocationPattern.test(file.content)) {
                continue;
            }
            lines.push(`  ${normalizeNodeId(sourceFunction.id)} --> ${normalizeNodeId(targetFunction.id)}`);
        }
    }
    return `${lines.join('\n')}\n`;
}
function summarizeFileRecord(file, dependencies, functions) {
    const functionNames = functions.filter((fn) => fn.fileRelativePath === file.relativePath).map((fn) => fn.name);
    const likelyNextFiles = [...dependencies].sort((left, right) => left.localeCompare(right));
    const purpose = functionNames.length > 0
        ? `Primary responsibility is implemented through ${functionNames.length} named function${functionNames.length === 1 ? '' : 's'}.`
        : 'Primary responsibility is inferred from file position and dependency edges only.';
    return [
        `# ${file.relativePath}`,
        '',
        '- Derived status: non-canonical',
        '- Confidence: partial',
        `- Updated at: ${file.updatedAt}`,
        `- Responsibility: ${purpose}`,
        `- Functions: ${functionNames.length > 0 ? functionNames.join(', ') : 'none detected'}`,
        `- Likely next files: ${likelyNextFiles.length > 0 ? likelyNextFiles.join(', ') : 'none detected'}`,
    ].join('\n');
}
function summarizeFunctionRecord(fn, files, functions) {
    const file = files.find((candidate) => candidate.relativePath === fn.fileRelativePath);
    const siblingFunctions = functions
        .filter((candidate) => candidate.fileRelativePath === fn.fileRelativePath && candidate.id !== fn.id)
        .map((candidate) => candidate.name);
    const likelyCalledFunctions = functions
        .filter((candidate) => candidate.id !== fn.id && file && new RegExp(`\\b${candidate.name}\\s*\\(`, 'u').test(file.content))
        .map((candidate) => candidate.name)
        .filter((name, index, values) => values.indexOf(name) === index);
    return [
        `# ${fn.name}`,
        '',
        '- Derived status: non-canonical',
        '- Confidence: heuristic',
        `- File: ${fn.fileRelativePath}`,
        '- Responsibility: likely entry or helper function inside this file family.',
        `- Sibling functions: ${siblingFunctions.length > 0 ? siblingFunctions.join(', ') : 'none detected'}`,
        `- Likely adjacent functions: ${likelyCalledFunctions.length > 0 ? likelyCalledFunctions.join(', ') : 'none detected'}`,
    ].join('\n');
}
async function readWorkspaceRevision(cwd) {
    try {
        const gitDir = node_path_1.default.join(cwd, '.git');
        const head = (await (0, promises_1.readFile)(node_path_1.default.join(gitDir, 'HEAD'), 'utf8')).trim();
        if (head.startsWith('ref: ')) {
            const refPath = head.slice('ref: '.length).trim();
            return (await (0, promises_1.readFile)(node_path_1.default.join(gitDir, refPath), 'utf8')).trim();
        }
        return head.length > 0 ? head : null;
    }
    catch {
        return null;
    }
}
function compareSourceFilesAgainstMetadata(files, metadata) {
    const currentEntries = files
        .map((file) => ({ relative_path: file.relativePath, updated_at: file.updatedAt }))
        .sort((left, right) => left.relative_path.localeCompare(right.relative_path));
    const storedEntries = [...metadata.source_files].sort((left, right) => left.relative_path.localeCompare(right.relative_path));
    const currentLatestMtime = currentEntries.reduce((latest, entry) => (latest === null || entry.updated_at > latest ? entry.updated_at : latest), null);
    if (currentEntries.length !== storedEntries.length) {
        return {
            stale: true,
            staleReason: 'file set changed since the last navigation generation pass',
            sourceLatestMtime: currentLatestMtime,
        };
    }
    for (let index = 0; index < currentEntries.length; index += 1) {
        const currentEntry = currentEntries[index];
        const storedEntry = storedEntries[index];
        if (!currentEntry || !storedEntry) {
            continue;
        }
        if (currentEntry.relative_path !== storedEntry.relative_path || currentEntry.updated_at !== storedEntry.updated_at) {
            return {
                stale: true,
                staleReason: 'source timestamps or relative paths changed since the last navigation generation pass',
                sourceLatestMtime: currentLatestMtime,
            };
        }
    }
    return {
        stale: false,
        staleReason: null,
        sourceLatestMtime: currentLatestMtime,
    };
}
function compareSourceFilesAgainstMetadataSync(files, metadata) {
    const currentEntries = files
        .map((file) => ({ relative_path: file.relativePath, updated_at: file.updatedAt }))
        .sort((left, right) => left.relative_path.localeCompare(right.relative_path));
    const storedEntries = [...metadata.source_files].sort((left, right) => left.relative_path.localeCompare(right.relative_path));
    const currentLatestMtime = currentEntries.reduce((latest, entry) => (latest === null || entry.updated_at > latest ? entry.updated_at : latest), null);
    if (currentEntries.length !== storedEntries.length) {
        return {
            stale: true,
            staleReason: 'file set changed since the last navigation generation pass',
            sourceLatestMtime: currentLatestMtime,
        };
    }
    for (let index = 0; index < currentEntries.length; index += 1) {
        const currentEntry = currentEntries[index];
        const storedEntry = storedEntries[index];
        if (!currentEntry || !storedEntry) {
            continue;
        }
        if (currentEntry.relative_path !== storedEntry.relative_path || currentEntry.updated_at !== storedEntry.updated_at) {
            return {
                stale: true,
                staleReason: 'source timestamps or relative paths changed since the last navigation generation pass',
                sourceLatestMtime: currentLatestMtime,
            };
        }
    }
    return {
        stale: false,
        staleReason: null,
        sourceLatestMtime: currentLatestMtime,
    };
}
function sanitizeTaskToken(token) {
    return token.replace(/^[`"'([{<]+/u, '').replace(/[`"',.;:)\]}>]+$/u, '').trim();
}
function addCandidateDirectoryAndAncestors(cwd, absoluteDirectoryPath, candidates) {
    const absoluteCwd = node_path_1.default.resolve(cwd);
    let current = node_path_1.default.resolve(absoluteDirectoryPath);
    while (true) {
        const relative = node_path_1.default.relative(absoluteCwd, current);
        if (relative.startsWith('..') || node_path_1.default.isAbsolute(relative)) {
            return;
        }
        candidates.add(relative.length === 0 ? '.' : relative.split(node_path_1.default.sep).join('/'));
        if (current === absoluteCwd) {
            return;
        }
        const parent = node_path_1.default.dirname(current);
        if (parent === current) {
            return;
        }
        current = parent;
    }
}
function collectNavigationCandidateDirectories(cwd, taskTexts) {
    const absoluteCwd = node_path_1.default.resolve(cwd);
    const candidates = new Set();
    for (const taskText of taskTexts) {
        for (const rawToken of taskText.split(/\s+/u)) {
            const token = sanitizeTaskToken(rawToken);
            if (token.length === 0 || token.length > 180) {
                continue;
            }
            const absoluteCandidatePath = node_path_1.default.resolve(absoluteCwd, token);
            const relativeCandidatePath = node_path_1.default.relative(absoluteCwd, absoluteCandidatePath);
            if (relativeCandidatePath.startsWith('..') || node_path_1.default.isAbsolute(relativeCandidatePath) || !pathExistsSync(absoluteCandidatePath)) {
                continue;
            }
            const candidateStat = (0, node_fs_1.statSync)(absoluteCandidatePath);
            const directoryPath = candidateStat.isDirectory() ? absoluteCandidatePath : node_path_1.default.dirname(absoluteCandidatePath);
            addCandidateDirectoryAndAncestors(absoluteCwd, directoryPath, candidates);
        }
    }
    return [...candidates].sort((left, right) => {
        const depthDelta = right.split('/').length - left.split('/').length;
        return depthDelta !== 0 ? depthDelta : left.localeCompare(right);
    });
}
function resolveNavigationBundleHint(input) {
    const absoluteCwd = node_path_1.default.resolve(input.cwd);
    const candidateDirectories = collectNavigationCandidateDirectories(absoluteCwd, input.taskTexts);
    for (const relativeTargetDir of candidateDirectories) {
        const outputDir = createDefaultOutputDir(absoluteCwd, relativeTargetDir);
        const metadataPath = node_path_1.default.join(outputDir, 'navigation-bundle.json');
        const readmePath = node_path_1.default.join(outputDir, 'README.md');
        if (!pathExistsSync(metadataPath) || !pathExistsSync(readmePath)) {
            continue;
        }
        const absoluteTargetDir = node_path_1.default.resolve(absoluteCwd, relativeTargetDir);
        if (!pathExistsSync(absoluteTargetDir)) {
            continue;
        }
        const metadata = JSON.parse((0, node_fs_1.readFileSync)(metadataPath, 'utf8'));
        const comparison = compareSourceFilesAgainstMetadataSync(collectSourceFilesSync(absoluteTargetDir), metadata);
        const artifactConfidences = [...new Set(metadata.artifacts.map((artifact) => artifact.confidence))];
        const bundleConfidence = comparison.stale ? 'stale' : 'exact';
        const outputRelativePath = toPosixRelativePath(absoluteCwd, outputDir);
        const readmeRelativePath = toPosixRelativePath(absoluteCwd, readmePath);
        return {
            relative_target_dir: relativeTargetDir,
            output_dir: outputDir,
            output_relative_path: outputRelativePath,
            readme_path: readmePath,
            readme_relative_path: readmeRelativePath,
            metadata_path: metadataPath,
            bundle_confidence: bundleConfidence,
            artifact_confidences: artifactConfidences,
            stale: comparison.stale,
            stale_reason: comparison.staleReason,
            summary: comparison.stale
                ? `Navigation bundle ${readmeRelativePath} is stale for ${relativeTargetDir}: ${comparison.staleReason}.`
                : `Navigation bundle ${readmeRelativePath} is available for ${relativeTargetDir} with artifact confidences ${artifactConfidences.join('/')}.`,
        };
    }
    return null;
}
function buildBundleReadme(input) {
    return [
        '# Navigation Bundle',
        '',
        '- Derived status: non-canonical',
        `- Target directory: ${input.result.relativeTargetDir}`,
        `- Output directory: ${input.result.outputDir}`,
        `- Run id: ${input.result.runId ?? 'none'}`,
        `- Revision: ${input.result.revision ?? 'unknown'}`,
        `- Generated at: ${input.result.generatedAt}`,
        `- File count: ${input.result.fileCount}`,
        `- Function count: ${input.result.functionCount}`,
        `- Source latest mtime: ${input.result.sourceLatestMtime ?? 'unknown'}`,
        `- Stale: ${input.result.stale}${input.result.staleReason ? ` (${input.result.staleReason})` : ''}`,
        '',
        '## Artifact index',
        '',
        `- exact: ${node_path_1.default.basename(input.directoryMapPath)}`,
        `- partial: ${node_path_1.default.basename(input.dependencyMapPath)}`,
        `- heuristic: ${node_path_1.default.basename(input.functionMapPath)}`,
        `- metadata: ${node_path_1.default.basename(input.metadataPath)}`,
        '',
        '## Intended consumers',
        '',
        '- captain: reference aid before choosing the next bounded investigation step',
        '- tactician: scoping aid for narrowing likely files or directories',
        '- scout: starting survey artifact for repository-local investigation',
    ].join('\n');
}
async function generateNavigationBundle(options) {
    const { absoluteTargetDir, relativeTargetDir } = assertTargetInsideWorkspace(options.cwd, options.targetDir);
    const outputDir = node_path_1.default.resolve(options.outputDir ?? createDefaultOutputDir(options.cwd, relativeTargetDir));
    const files = await collectSourceFiles(absoluteTargetDir);
    const functions = extractFunctions(files).map((fn) => ({
        ...fn,
        summaryPath: node_path_1.default.join(outputDir, 'functions', `${normalizeNodeId(fn.id)}.md`),
    }));
    const dependencies = extractFileDependencies(files);
    const generatedAt = new Date().toISOString();
    const revision = await readWorkspaceRevision(options.cwd);
    const sourceLatestMtime = files.reduce((latest, file) => (latest === null || file.updatedAt > latest ? file.updatedAt : latest), null);
    const stale = false;
    const staleReason = null;
    await (0, promises_1.mkdir)(outputDir, { recursive: true });
    await (0, promises_1.mkdir)(node_path_1.default.join(outputDir, 'files'), { recursive: true });
    await (0, promises_1.mkdir)(node_path_1.default.join(outputDir, 'functions'), { recursive: true });
    const directoryMapPath = node_path_1.default.join(outputDir, 'directory-file-map.mmd');
    const dependencyMapPath = node_path_1.default.join(outputDir, 'file-dependency-map.mmd');
    const functionMapPath = node_path_1.default.join(outputDir, 'function-map.mmd');
    const metadataPath = node_path_1.default.join(outputDir, 'navigation-bundle.json');
    const readmePath = node_path_1.default.join(outputDir, 'README.md');
    await (0, promises_1.writeFile)(directoryMapPath, buildDirectoryFileMap(relativeTargetDir, files), 'utf8');
    await (0, promises_1.writeFile)(dependencyMapPath, buildFileDependencyMap(relativeTargetDir, files, dependencies), 'utf8');
    await (0, promises_1.writeFile)(functionMapPath, buildFunctionMap(relativeTargetDir, files, functions), 'utf8');
    const artifacts = [
        {
            kind: 'directory_file_map',
            path: directoryMapPath,
            confidence: 'exact',
            summary: 'Exact directory-to-file relationship map for the bounded target directory.',
        },
        {
            kind: 'file_dependency_map',
            path: dependencyMapPath,
            confidence: 'partial',
            summary: 'Relative import dependency map across files in the bounded target directory.',
        },
        {
            kind: 'function_map',
            path: functionMapPath,
            confidence: 'heuristic',
            summary: 'Heuristic function-family map derived from named functions and likely invocations.',
        },
    ];
    for (const file of files) {
        const summaryPath = node_path_1.default.join(outputDir, 'files', `${normalizeNodeId(file.relativePath)}.md`);
        await (0, promises_1.writeFile)(summaryPath, `${summarizeFileRecord(file, dependencies.get(file.relativePath) ?? new Set(), functions)}\n`, 'utf8');
        artifacts.push({
            kind: 'file_summary',
            path: summaryPath,
            confidence: 'partial',
            summary: `Short derived file summary for ${file.relativePath}.`,
        });
    }
    for (const fn of functions) {
        await (0, promises_1.writeFile)(fn.summaryPath, `${summarizeFunctionRecord(fn, files, functions)}\n`, 'utf8');
        artifacts.push({
            kind: 'function_summary',
            path: fn.summaryPath,
            confidence: 'heuristic',
            summary: `Short derived function-family summary for ${fn.name}.`,
        });
    }
    const metadata = {
        version: 1,
        target_dir: absoluteTargetDir,
        relative_target_dir: relativeTargetDir,
        output_dir: outputDir,
        run_id: options.runId ?? null,
        generated_at: generatedAt,
        revision,
        source_latest_mtime: sourceLatestMtime,
        source_files: files.map((file) => ({
            relative_path: file.relativePath,
            updated_at: file.updatedAt,
        })),
        file_count: files.length,
        function_count: functions.length,
        artifacts: artifacts
            .filter((artifact) => artifact.kind !== 'bundle_metadata' && artifact.kind !== 'bundle_readme')
            .map((artifact) => ({
            kind: artifact.kind,
            path: artifact.path,
            confidence: artifact.confidence === 'stale' ? 'partial' : artifact.confidence,
            summary: artifact.summary,
        })),
    };
    const result = {
        status: 'generated',
        cwd: node_path_1.default.resolve(options.cwd),
        targetDir: absoluteTargetDir,
        relativeTargetDir,
        outputDir,
        runId: options.runId ?? null,
        revision,
        generatedAt,
        fileCount: files.length,
        functionCount: functions.length,
        artifactCount: 0,
        stale,
        staleReason,
        sourceLatestMtime,
        artifacts: [],
        summary: `Generated a derived navigation bundle for ${relativeTargetDir} with ${files.length} file` +
            `${files.length === 1 ? '' : 's'} and ${functions.length} named function${functions.length === 1 ? '' : 's'}.`,
    };
    await (0, promises_1.writeFile)(readmePath, `${buildBundleReadme({
        result,
        metadataPath,
        directoryMapPath,
        dependencyMapPath,
        functionMapPath,
    })}\n`, 'utf8');
    await (0, promises_1.writeFile)(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
    result.artifacts = [
        {
            kind: 'bundle_readme',
            path: readmePath,
            confidence: stale ? 'stale' : 'exact',
            summary: 'Top-level derived navigation bundle guide and artifact index.',
        },
        {
            kind: 'bundle_metadata',
            path: metadataPath,
            confidence: stale ? 'stale' : 'exact',
            summary: 'Machine-readable navigation bundle metadata, source file set, and generation linkage.',
        },
        ...artifacts,
    ];
    result.artifactCount = result.artifacts.length;
    return result;
}
async function validateNavigationBundle(options) {
    const { absoluteTargetDir, relativeTargetDir } = assertTargetInsideWorkspace(options.cwd, options.targetDir);
    const outputDir = node_path_1.default.resolve(options.outputDir ?? createDefaultOutputDir(options.cwd, relativeTargetDir));
    const metadataPath = node_path_1.default.join(outputDir, 'navigation-bundle.json');
    const metadata = JSON.parse(await (0, promises_1.readFile)(metadataPath, 'utf8'));
    const files = await collectSourceFiles(absoluteTargetDir);
    const comparison = compareSourceFilesAgainstMetadata(files, metadata);
    return {
        status: 'validated',
        cwd: node_path_1.default.resolve(options.cwd),
        targetDir: absoluteTargetDir,
        relativeTargetDir,
        outputDir,
        runId: metadata.run_id,
        revision: metadata.revision,
        generatedAt: metadata.generated_at,
        fileCount: metadata.file_count,
        functionCount: metadata.function_count,
        artifactCount: metadata.artifacts.length + 2,
        stale: comparison.stale,
        staleReason: comparison.staleReason,
        sourceLatestMtime: comparison.sourceLatestMtime,
        artifacts: [
            {
                kind: 'bundle_readme',
                path: node_path_1.default.join(outputDir, 'README.md'),
                confidence: comparison.stale ? 'stale' : 'exact',
                summary: 'Top-level derived navigation bundle guide and artifact index.',
            },
            {
                kind: 'bundle_metadata',
                path: metadataPath,
                confidence: comparison.stale ? 'stale' : 'exact',
                summary: 'Machine-readable navigation bundle metadata, source file set, and generation linkage.',
            },
            ...metadata.artifacts.map((artifact) => ({
                kind: artifact.kind,
                path: artifact.path,
                confidence: comparison.stale ? 'stale' : artifact.confidence,
                summary: artifact.summary,
            })),
        ],
        summary: comparison.stale
            ? `Navigation bundle at ${outputDir} is stale: ${comparison.staleReason}.`
            : `Navigation bundle at ${outputDir} still matches the current bounded source file set.`,
    };
}
//# sourceMappingURL=navigation-aids.js.map