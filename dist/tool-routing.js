"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultForemanToolRoutingConfig = createDefaultForemanToolRoutingConfig;
exports.normalizeForemanToolRoutingConfig = normalizeForemanToolRoutingConfig;
exports.summarizeConfiguredToolRoutes = summarizeConfiguredToolRoutes;
exports.deriveCompanionRoutingDecision = deriveCompanionRoutingDecision;
const GIT_MUTATION_KEYWORDS = ['commit', 'push', 'add', 'stage', '커밋', '푸시', '스테이지', '브랜치에 반영'];
const GIT_KEYWORDS = ['git', 'branch', 'status', 'diff', 'log', 'commit', 'push', 'pull', 'rebase', 'stash', '커밋', '푸시', '브랜치'];
const DOCS_KEYWORDS = ['context7', 'docs', 'documentation', 'reference', 'api', 'sdk', '문서', '레퍼런스', 'reference'];
const FETCH_KEYWORDS = ['fetch', 'url', 'http://', 'https://', 'remote', 'download', '웹', '원격'];
const FILESYSTEM_KEYWORDS = [
    'filesystem',
    'file',
    'files',
    'directory',
    'folder',
    'tree',
    'repo',
    'repository',
    'codebase',
    'path',
    'readme',
    '파일',
    '디렉토리',
    '폴더',
    '코드베이스',
    '경로',
    '탐색',
    '조사',
    '검색',
];
function includesAnyKeyword(normalizedRequest, keywords) {
    return keywords.some((keyword) => normalizedRequest.includes(keyword));
}
function dedupeToolNames(toolNames) {
    return Array.from(new Set(toolNames));
}
function createDefaultForemanToolRoutingConfig() {
    const createEntry = (ownerRole, model, variant, allowedOperations, fallbackMode) => ({
        owner_role: ownerRole,
        model,
        variant,
        allowed_operations: [...allowedOperations],
        fallback_mode: fallbackMode,
    });
    return {
        default_model: 'gpt-5.4-mini',
        default_variant: 'medium',
        fallback_mode: 'visible_degraded_host_fallback',
        tools: {
            filesystem: createEntry('explorer', 'gpt-5.4-mini', 'medium', ['read'], 'visible_degraded_host_fallback'),
            git: createEntry('explorer', 'gpt-5.4-mini', 'medium', ['read', 'mutation'], 'visible_degraded_host_fallback'),
            context7: createEntry('explorer', 'gpt-5.4-mini', 'medium', ['read'], 'visible_degraded_host_fallback'),
            fetch: createEntry('explorer', 'gpt-5.4-mini', 'medium', ['read'], 'visible_degraded_host_fallback'),
            openaiDeveloperDocs: createEntry('explorer', 'gpt-5.4-mini', 'medium', ['read'], 'visible_degraded_host_fallback'),
        },
    };
}
function normalizeAllowedOperations(candidate, fallback) {
    if (!Array.isArray(candidate)) {
        return [...fallback];
    }
    const filtered = candidate.filter((entry) => entry === 'read' || entry === 'mutation');
    return filtered.length > 0 ? [...filtered] : [...fallback];
}
function normalizeForemanToolRoutingConfig(candidate) {
    const defaults = createDefaultForemanToolRoutingConfig();
    const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
    if (!isRecord(candidate)) {
        return defaults;
    }
    const toolsCandidate = isRecord(candidate.tools) ? candidate.tools : {};
    const normalizeTool = (tool) => {
        const toolDefaults = defaults.tools[tool];
        const entry = isRecord(toolsCandidate[tool]) ? toolsCandidate[tool] : {};
        const ownerRole = typeof entry.owner_role === 'string' ? entry.owner_role : toolDefaults.owner_role;
        const model = typeof entry.model === 'string' || entry.model === null ? entry.model : toolDefaults.model;
        const variant = entry.variant === 'low' || entry.variant === 'medium' || entry.variant === 'high' || entry.variant === 'xhigh' || entry.variant === null
            ? entry.variant
            : toolDefaults.variant;
        const fallbackMode = entry.fallback_mode === 'visible_degraded_host_fallback' || entry.fallback_mode === 'deny_host_fallback'
            ? entry.fallback_mode
            : toolDefaults.fallback_mode;
        return {
            owner_role: ownerRole,
            model,
            variant,
            allowed_operations: normalizeAllowedOperations(entry.allowed_operations, toolDefaults.allowed_operations),
            fallback_mode: fallbackMode,
        };
    };
    return {
        default_model: typeof candidate.default_model === 'string' || candidate.default_model === null
            ? candidate.default_model
            : defaults.default_model,
        default_variant: candidate.default_variant === 'low' ||
            candidate.default_variant === 'medium' ||
            candidate.default_variant === 'high' ||
            candidate.default_variant === 'xhigh' ||
            candidate.default_variant === null
            ? candidate.default_variant
            : defaults.default_variant,
        fallback_mode: candidate.fallback_mode === 'visible_degraded_host_fallback' || candidate.fallback_mode === 'deny_host_fallback'
            ? candidate.fallback_mode
            : defaults.fallback_mode,
        tools: {
            filesystem: normalizeTool('filesystem'),
            git: normalizeTool('git'),
            context7: normalizeTool('context7'),
            fetch: normalizeTool('fetch'),
            openaiDeveloperDocs: normalizeTool('openaiDeveloperDocs'),
        },
    };
}
function summarizeConfiguredToolRoutes(toolRouting) {
    const entries = Object.keys(toolRouting.tools).map((tool) => {
        const policy = toolRouting.tools[tool];
        return `${tool}->${policy.owner_role}/${policy.model ?? toolRouting.default_model ?? 'none'}/${policy.variant ?? toolRouting.default_variant ?? 'none'}`;
    });
    return `Configured companion routing keeps tool work under specialist ownership: ${entries.join(', ')}.`;
}
function deriveCompanionRoutingDecision(input) {
    const normalizedRequest = input.request.trim().toLowerCase();
    const hasGit = includesAnyKeyword(normalizedRequest, GIT_KEYWORDS);
    const hasGitMutation = includesAnyKeyword(normalizedRequest, GIT_MUTATION_KEYWORDS);
    const hasDocs = includesAnyKeyword(normalizedRequest, DOCS_KEYWORDS);
    const hasFetch = includesAnyKeyword(normalizedRequest, FETCH_KEYWORDS);
    const hasFilesystem = includesAnyKeyword(normalizedRequest, FILESYSTEM_KEYWORDS) ||
        /\b[\w./-]+\.[A-Za-z0-9]+\b/u.test(input.request);
    const toolNames = dedupeToolNames([
        ...(hasFilesystem ? ['filesystem'] : []),
        ...(hasGit ? ['git'] : []),
        ...(hasDocs ? ['context7', 'openaiDeveloperDocs'] : []),
        ...(hasFetch ? ['fetch'] : []),
    ]);
    if (toolNames.length === 0) {
        return {
            routeClass: 'none',
            toolNames: [],
            operation: 'none',
            ownerRole: null,
            model: null,
            variant: null,
            fallbackMode: input.toolRouting.fallback_mode,
        };
    }
    const operation = hasGit && (hasGitMutation || input.mutationIntent === 'explicit_or_strong') ? 'mutation' : 'read';
    const routeClass = toolNames.length > 1
        ? 'multi_source_evidence'
        : hasGit
            ? operation === 'mutation'
                ? 'git_mutation'
                : 'git_inspection'
            : hasDocs || hasFetch
                ? 'docs_lookup'
                : 'workspace_inspection';
    const primaryTool = routeClass === 'multi_source_evidence'
        ? (toolNames.includes('filesystem')
            ? 'filesystem'
            : toolNames.includes('context7')
                ? 'context7'
                : toolNames[0]) ?? 'filesystem'
        : toolNames[0] ?? 'filesystem';
    const policy = input.toolRouting.tools[primaryTool] ?? createDefaultForemanToolRoutingConfig().tools[primaryTool];
    return {
        routeClass,
        toolNames,
        operation,
        ownerRole: policy.owner_role,
        model: policy.model ?? input.toolRouting.default_model,
        variant: policy.variant ?? input.toolRouting.default_variant,
        fallbackMode: policy.fallback_mode ?? input.toolRouting.fallback_mode,
    };
}
//# sourceMappingURL=tool-routing.js.map