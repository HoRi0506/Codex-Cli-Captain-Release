"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERSISTED_TASK_CARD_ASSIGNED_AGENT_IDS = exports.PERSISTED_RUN_ACTIVE_AGENT_IDS = exports.FOREMAN_WORKER_TIMEOUT_AFTER_MS = exports.FOREMAN_WORKER_STALE_AFTER_MS = exports.FOREMAN_ACTIVE_TASK_MAX_WORKERS = exports.FOREMAN_VERIFIER_AGENT_ID = exports.FOREMAN_CODE_SPECIALIST_AGENT_ID = exports.FOREMAN_EXPLORER_AGENT_ID = exports.FOREMAN_PLANNER_AGENT_ID = exports.FOREMAN_ORCHESTRATOR_AGENT_ID = exports.FOREMAN_AGENT_ROSTER = exports.ORCHESTRATOR_DECISION_STEPS = exports.HANDOFF_OUTCOMES = exports.WORKER_RECLAIM_STATES = exports.WORKER_LIFECYCLE_STATES = exports.CHILD_AGENT_STATUSES = exports.VERIFICATION_STATES = exports.ROLE_DEFAULT_ROLES = exports.ROLES = exports.FAILURE_REASONS = exports.WORKFLOW_STAGES = exports.TASK_CARD_STATUSES = exports.RUN_STATUSES = void 0;
exports.RUN_STATUSES = [
    'queued',
    'active',
    'blocked',
    'completed',
    'failed',
    'cancelled',
];
exports.TASK_CARD_STATUSES = [
    'queued',
    'active',
    'in_handoff',
    'blocked',
    'completed',
    'failed',
    'cancelled',
];
exports.WORKFLOW_STAGES = [
    'planning',
    'handoff',
    'execution',
    'verification',
    'compatibility',
];
exports.FAILURE_REASONS = [
    'surface_mismatch',
    'invalid_output',
    'timeout',
    'cancelled',
    'blocked_dependency',
    'verification_failed',
    'unknown',
];
exports.ROLES = ['orchestrator', 'planner', 'explorer', 'code specialist', 'verifier'];
exports.ROLE_DEFAULT_ROLES = ['planner', 'explorer', 'code specialist', 'verifier'];
exports.VERIFICATION_STATES = ['pending', 'passed', 'needs_work', 'blocked'];
exports.CHILD_AGENT_STATUSES = [
    'queued',
    'running',
    'completed',
    'failed',
    'cancelled',
];
exports.WORKER_LIFECYCLE_STATES = [
    'queued',
    'launching',
    'running',
    'returned',
    'failed',
    'cancelled',
    'stale',
    'timed_out',
];
exports.WORKER_RECLAIM_STATES = [
    'not_needed',
    'reclaim_needed',
    'resumable',
    'reclaimed',
];
exports.HANDOFF_OUTCOMES = ['accepted'];
exports.ORCHESTRATOR_DECISION_STEPS = [
    'execute_task',
    'verify_task',
    'await_fan_in',
    'await_verification',
    'await_repair_decision',
    'halt_completed',
    'halt_failed',
    'halt_cancelled',
    'await_operator',
];
exports.FOREMAN_AGENT_ROSTER = {
    orchestrator: 'captain',
    planner: 'tactician',
    explorer: 'scout',
    codeSpecialist: 'raider',
    verifier: 'arbiter',
};
exports.FOREMAN_ORCHESTRATOR_AGENT_ID = exports.FOREMAN_AGENT_ROSTER.orchestrator;
exports.FOREMAN_PLANNER_AGENT_ID = exports.FOREMAN_AGENT_ROSTER.planner;
exports.FOREMAN_EXPLORER_AGENT_ID = exports.FOREMAN_AGENT_ROSTER.explorer;
exports.FOREMAN_CODE_SPECIALIST_AGENT_ID = exports.FOREMAN_AGENT_ROSTER.codeSpecialist;
exports.FOREMAN_VERIFIER_AGENT_ID = exports.FOREMAN_AGENT_ROSTER.verifier;
exports.FOREMAN_ACTIVE_TASK_MAX_WORKERS = 2;
exports.FOREMAN_WORKER_STALE_AFTER_MS = 5 * 60 * 1000;
exports.FOREMAN_WORKER_TIMEOUT_AFTER_MS = 15 * 60 * 1000;
exports.PERSISTED_RUN_ACTIVE_AGENT_IDS = [
    exports.FOREMAN_ORCHESTRATOR_AGENT_ID,
    exports.FOREMAN_PLANNER_AGENT_ID,
    exports.FOREMAN_EXPLORER_AGENT_ID,
    exports.FOREMAN_CODE_SPECIALIST_AGENT_ID,
    exports.FOREMAN_VERIFIER_AGENT_ID,
];
exports.PERSISTED_TASK_CARD_ASSIGNED_AGENT_IDS = [
    exports.FOREMAN_PLANNER_AGENT_ID,
    exports.FOREMAN_EXPLORER_AGENT_ID,
    exports.FOREMAN_CODE_SPECIALIST_AGENT_ID,
    exports.FOREMAN_VERIFIER_AGENT_ID,
];
//# sourceMappingURL=constants.js.map