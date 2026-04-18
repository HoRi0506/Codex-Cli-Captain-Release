"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExplicitlyReadOnlyRequest = isExplicitlyReadOnlyRequest;
exports.countImplementationSignals = countImplementationSignals;
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
    '계획',
    '로드맵',
    '마일스톤',
    '전략',
    '설계',
    '단계',
];
const REVIEW_KEYWORDS = ['review', 'verify', 'verification', 'validate', 'validation', 'regression', '검토', '검증'];
const MUTATION_VERBS = [
    'fix',
    'write',
    'make',
    'author',
    'draft',
    'document',
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
    '수정',
    '변경',
    '작성',
    '추가',
    '삭제',
    '구현',
    '만들',
    '반영',
    '교체',
    '고쳐',
    '업데이트',
];
const MUTATION_TARGET_HINTS = [
    'readme',
    '문서',
    '파일',
    '코드',
    '테스트',
    '설정',
    'release',
    '릴리즈',
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
const LOOKUP_KEYWORDS = ['locate', 'find', 'where', 'which file', 'which function', 'lookup', 'look up', '찾아', '어디', '위치'];
const SURVEY_KEYWORDS = ['inspect', 'trace', 'map', 'survey', 'overview', 'structure', 'flow', 'codebase', '조사', '탐색', '구조', '흐름'];
const DIAGNOSIS_KEYWORDS = ['why', 'cause', 'root cause', 'failing', 'failure', 'error', 'bug', 'issue', 'problem', '왜', '원인', '오류', '문제', '실패', '버그'];
const SYNTHESIS_KEYWORDS = ['summarize', 'summary', 'explain', 'what does', 'how does', 'describe', '요약', '설명', '정리'];
const KOREAN_MUTATION_COMMAND_PATTERNS = [
    /수정해\s*줘/u,
    /변경해\s*줘/u,
    /작성해\s*줘/u,
    /추가해\s*줘/u,
    /반영해\s*줘/u,
    /진행해\s*줘/u,
    /구현해\s*줘/u,
    /만들어\s*줘/u,
    /고쳐\s*줘/u,
    /재설치/u,
    /커밋/u,
    /푸시/u,
    /릴리즈/u,
    /배포/u,
];
const READ_ONLY_PATTERNS = [
    'do not change',
    "don't change",
    'without changing',
    'read-only',
    'read only',
    '수정하지 마',
    '수정하지 말',
    '변경하지 마',
    '변경하지 말',
    '바꾸지 마',
    '바꾸지 말',
    '건드리지 마',
    '건드리지 말',
    '읽기 전용',
    '읽기만',
];
function isExplicitlyReadOnlyRequest(request) {
    return includesAnyKeyword(request.trim().toLowerCase(), READ_ONLY_PATTERNS);
}
function countImplementationSignals(request) {
    const normalizedRequest = request.trim().toLowerCase();
    if (isExplicitlyReadOnlyRequest(request)) {
        return 0;
    }
    let matchCount = 0;
    for (const keyword of MUTATION_VERBS) {
        if (normalizedRequest.includes(keyword)) {
            matchCount += 1;
        }
    }
    return matchCount;
}
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
    const hasKoreanMutationCommand = KOREAN_MUTATION_COMMAND_PATTERNS.some((pattern) => pattern.test(request));
    const hasMutationTargetHint = includesAnyKeyword(normalizedRequest, MUTATION_TARGET_HINTS) ||
        /(?:^|[\s`'"])(?:src|docs|tests|readme)[/a-z0-9_.-]*/u.test(normalizedRequest) ||
        /\b[a-z0-9_.-]+\.(?:md|ts|tsx|js|jsx|json|yaml|yml|toml|css|html|py|go|rs|java|swift)\b/u.test(normalizedRequest);
    const explicitlyReadOnly = isExplicitlyReadOnlyRequest(request);
    return (hasKoreanMutationCommand || (hasMutationVerb && hasMutationTargetHint)) && !explicitlyReadOnly
        ? 'explicit_or_strong'
        : 'none';
}
function looksLikeExistenceCheck(normalizedRequest, filePathMentions) {
    return (filePathMentions.length > 0 &&
        (normalizedRequest.includes(' exist') ||
            normalizedRequest.startsWith('does ') ||
            normalizedRequest.includes('is there ') ||
            normalizedRequest.includes('present') ||
            normalizedRequest.includes('available') ||
            normalizedRequest.includes('있는지') ||
            normalizedRequest.includes('존재')));
}
function looksLikePlanningRequest(normalizedRequest, filePathMentions) {
    const planSignals = PLAN_KEYWORDS.filter((keyword) => normalizedRequest.includes(keyword)).length;
    return planSignals >= 2 || filePathMentions.length >= 4;
}
function classifyForemanRequest(input) {
    const normalizedRequest = input.request.trim().toLowerCase();
    const filePathMentions = extractFilePathMentions(input.request);
    const mutationIntent = detectMutationIntent(input.request);
    if (mutationIntent === 'explicit_or_strong') {
        return {
            requestShape: 'mutation',
            mutationIntent,
            recommendedTaskKind: 'execution',
            recommendedEntrypoint: 'start',
            taskShape: 'single_scoped_task',
        };
    }
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