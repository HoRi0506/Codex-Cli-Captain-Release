"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMutationIntent = detectMutationIntent;
exports.classifyForemanRequest = classifyForemanRequest;
const PLAN_KEYWORDS = [
    'plan',
    'planner',
    'roadmap',
    'milestone',
    'strategy',
    'architecture',
    'design',
    'migration',
    'phases',
    'step-by-step',
    'step by step',
    'what should',
    'should we',
    'across',
];
const REVIEW_KEYWORDS = ['review', 'verify', 'verification', 'validate', 'validation', 'regression'];
const MUTATION_VERBS = [
    'fix',
    'write',
    'create',
    'edit',
    'update',
    'modify',
    'patch',
    'implement',
    'change',
    'rename',
    'remove',
    'delete',
    'refactor',
    'rewrite',
    'replace',
];
const MUTATION_TARGET_HINTS = [
    'readme',
    '.md',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.yaml',
    '.yml',
    '.toml',
    '.css',
    '.html',
    '.py',
    '.go',
    '.rs',
    '.java',
    '.swift',
];
const LOOKUP_KEYWORDS = ['locate', 'find', 'where', 'which file', 'which function', 'lookup', 'look up'];
const SURVEY_KEYWORDS = ['inspect', 'trace', 'map', 'survey', 'overview', 'structure', 'flow', 'codebase'];
const DIAGNOSIS_KEYWORDS = ['why', 'cause', 'root cause', 'failing', 'failure', 'error', 'bug', 'issue', 'problem'];
const SYNTHESIS_KEYWORDS = ['summarize', 'summary', 'explain', 'what does', 'how does', 'describe'];
function includesAnyKeyword(normalizedRequest, keywords) {
    return keywords.some((keyword) => normalizedRequest.includes(keyword));
}
function extractFilePathMentions(request) {
    const matches = request.match(/\b[\w./-]+\.[A-Za-z0-9]+\b/g);
    if (!matches) {
        return [];
    }
    return Array.from(new Set(matches));
}
function detectMutationIntent(request) {
    const normalizedRequest = request.trim().toLowerCase();
    const hasMutationVerb = includesAnyKeyword(normalizedRequest, MUTATION_VERBS);
    const hasMutationTargetHint = includesAnyKeyword(normalizedRequest, MUTATION_TARGET_HINTS) ||
        /(?:^|[\s`'"])(?:src|docs|tests|readme)[/a-z0-9_.-]*/u.test(normalizedRequest) ||
        /\b[a-z0-9_.-]+\.(?:md|ts|tsx|js|jsx|json|yaml|yml|toml|css|html|py|go|rs|java|swift)\b/u.test(normalizedRequest);
    const explicitlyReadOnly = normalizedRequest.includes('do not change') ||
        normalizedRequest.includes("don't change") ||
        normalizedRequest.includes('without changing') ||
        normalizedRequest.includes('read-only') ||
        normalizedRequest.includes('read only');
    return hasMutationVerb && hasMutationTargetHint && !explicitlyReadOnly ? 'explicit_or_strong' : 'none';
}
function looksLikeExistenceCheck(normalizedRequest, filePathMentions) {
    return (filePathMentions.length > 0 &&
        (normalizedRequest.includes(' exist') ||
            normalizedRequest.startsWith('does ') ||
            normalizedRequest.includes('is there ') ||
            normalizedRequest.includes('present') ||
            normalizedRequest.includes('available')));
}
function looksLikePlanningRequest(normalizedRequest, filePathMentions) {
    const planSignals = PLAN_KEYWORDS.filter((keyword) => normalizedRequest.includes(keyword)).length;
    return planSignals >= 2 || filePathMentions.length >= 4;
}
function classifyForemanRequest(input) {
    const normalizedRequest = input.request.trim().toLowerCase();
    const filePathMentions = extractFilePathMentions(input.request);
    const mutationIntent = detectMutationIntent(input.request);
    if (looksLikePlanningRequest(normalizedRequest, filePathMentions)) {
        return {
            requestShape: 'planning',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'plan',
            taskShape: 'multi_step_or_unclear',
        };
    }
    if (includesAnyKeyword(normalizedRequest, REVIEW_KEYWORDS) && mutationIntent === 'none') {
        return {
            requestShape: 'verification',
            mutationIntent,
            recommendedTaskKind: 'review',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (mutationIntent === 'explicit_or_strong') {
        return {
            requestShape: 'mutation',
            mutationIntent,
            recommendedTaskKind: 'execution',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (looksLikeExistenceCheck(normalizedRequest, filePathMentions)) {
        return {
            requestShape: 'existence_check',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (includesAnyKeyword(normalizedRequest, DIAGNOSIS_KEYWORDS)) {
        return {
            requestShape: 'diagnosis',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (includesAnyKeyword(normalizedRequest, LOOKUP_KEYWORDS)) {
        return {
            requestShape: 'lookup',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (includesAnyKeyword(normalizedRequest, SURVEY_KEYWORDS)) {
        return {
            requestShape: 'survey',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    if (includesAnyKeyword(normalizedRequest, SYNTHESIS_KEYWORDS)) {
        return {
            requestShape: 'synthesis',
            mutationIntent,
            recommendedTaskKind: 'explore',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
    return {
        requestShape: 'lookup',
        mutationIntent,
        recommendedTaskKind: 'explore',
        recommendedEntrypoint: 'start',
        taskShape: 'single_scoped_task',
    };
}
//# sourceMappingURL=request-shape.js.map