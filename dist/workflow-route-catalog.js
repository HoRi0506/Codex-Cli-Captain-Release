"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_ROUTE_COMPATIBILITY_ALIASES = exports.WORKFLOW_ROUTE_CONTRACTS = void 0;
function createLinkedStepSkillIds(workflowSkillId, workflowAgentRoute) {
    return workflowAgentRoute
        .filter((step) => step !== 'captain')
        .map((step) => `${workflowSkillId}__${step}`);
}
function createRouteContract(input) {
    return {
        workflow_variant: input.workflowVariant,
        workflow_skill_id: input.workflowSkillId,
        workflow_agent_route: input.workflowAgentRoute,
        linked_step_skill_ids: createLinkedStepSkillIds(input.workflowSkillId, input.workflowAgentRoute),
        entry_task_kind: input.entryTaskKind,
        execution_mode: input.executionMode,
        release_visibility: 'internal_only',
    };
}
exports.WORKFLOW_ROUTE_CONTRACTS = [
    createRouteContract({
        workflowVariant: 'read_only',
        workflowSkillId: 'captain_read_only',
        workflowAgentRoute: ['captain', 'scout', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'mutation',
        workflowSkillId: 'captain_mutation',
        workflowAgentRoute: ['captain', 'scout', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'planning',
        workflowSkillId: 'captain_planning',
        workflowAgentRoute: ['captain', 'tactician', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'plan',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'verification',
        workflowSkillId: 'captain_verification',
        workflowAgentRoute: ['captain', 'arbiter', 'captain'],
        entryTaskKind: 'review',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'parallel',
        workflowSkillId: 'captain_parallel',
        workflowAgentRoute: ['captain', 'tactician', 'scout', 'raider', 'arbiter', 'captain'],
        entryTaskKind: null,
        executionMode: 'parallel',
    }),
];
exports.WORKFLOW_ROUTE_COMPATIBILITY_ALIASES = [
    createRouteContract({
        workflowVariant: 'investigate_only',
        workflowSkillId: 'captain_investigate_only',
        workflowAgentRoute: ['captain', 'scout', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'investigate_then_document',
        workflowSkillId: 'captain_investigate_then_document',
        workflowAgentRoute: ['captain', 'scout', 'scribe', 'arbiter', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'diagnose_then_fix',
        workflowSkillId: 'captain_diagnose_then_fix',
        workflowAgentRoute: ['captain', 'scout', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'fix_only',
        workflowSkillId: 'captain_fix_only',
        workflowAgentRoute: ['captain', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'execution',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'plan_then_implement',
        workflowSkillId: 'captain_plan_then_implement',
        workflowAgentRoute: ['captain', 'tactician', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'plan',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'implement_then_review',
        workflowSkillId: 'captain_implement_then_review',
        workflowAgentRoute: ['captain', 'raider', 'arbiter', 'captain'],
        entryTaskKind: 'execution',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'verify_only',
        workflowSkillId: 'captain_verify_only',
        workflowAgentRoute: ['captain', 'arbiter', 'captain'],
        entryTaskKind: 'review',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'ownership_drift_check',
        workflowSkillId: 'captain_ownership_drift_check',
        workflowAgentRoute: ['captain', 'scout', 'arbiter', 'captain'],
        entryTaskKind: 'explore',
        executionMode: 'serial',
    }),
    createRouteContract({
        workflowVariant: 'parallel_fanout',
        workflowSkillId: 'captain_parallel_fanout',
        workflowAgentRoute: ['captain', 'tactician', 'scout', 'raider', 'arbiter', 'captain'],
        entryTaskKind: null,
        executionMode: 'parallel',
    }),
];
//# sourceMappingURL=workflow-route-catalog.js.map