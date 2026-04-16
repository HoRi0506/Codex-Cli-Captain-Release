"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidRunRecord = assertValidRunRecord;
exports.assertValidAdvisorOutput = assertValidAdvisorOutput;
exports.assertValidDelegationRecord = assertValidDelegationRecord;
exports.assertValidExploreArtifact = assertValidExploreArtifact;
exports.assertValidForemanConfigFile = assertValidForemanConfigFile;
exports.assertValidHandoffRecord = assertValidHandoffRecord;
exports.assertValidOrchestrationAttemptRecord = assertValidOrchestrationAttemptRecord;
exports.assertValidOrchestratorDecision = assertValidOrchestratorDecision;
exports.assertValidOrchestratorState = assertValidOrchestratorState;
exports.assertValidPlanUpdateArtifact = assertValidPlanUpdateArtifact;
exports.assertValidPlanningOutput = assertValidPlanningOutput;
exports.assertValidResumeCheckpointRecord = assertValidResumeCheckpointRecord;
exports.assertValidRoleDefaultsFile = assertValidRoleDefaultsFile;
exports.assertValidTaskCardRecord = assertValidTaskCardRecord;
exports.assertValidSpecialistRoleContractsFile = assertValidSpecialistRoleContractsFile;
exports.assertValidVerificationAutomationOutput = assertValidVerificationAutomationOutput;
const advisor_schema_json_1 = __importDefault(require("../schemas/advisor.schema.json"));
const ajv_1 = __importDefault(require("ajv"));
const delegation_schema_json_1 = __importDefault(require("../schemas/delegation.schema.json"));
const explore_artifact_schema_json_1 = __importDefault(require("../schemas/explore-artifact.schema.json"));
const foreman_config_schema_json_1 = __importDefault(require("../schemas/foreman-config.schema.json"));
const handoff_schema_json_1 = __importDefault(require("../schemas/handoff.schema.json"));
const orchestrator_decision_schema_json_1 = __importDefault(require("../schemas/orchestrator-decision.schema.json"));
const orchestration_attempt_schema_json_1 = __importDefault(require("../schemas/orchestration-attempt.schema.json"));
const orchestrator_state_schema_json_1 = __importDefault(require("../schemas/orchestrator-state.schema.json"));
const plan_update_schema_json_1 = __importDefault(require("../schemas/plan-update.schema.json"));
const planning_schema_json_1 = __importDefault(require("../schemas/planning.schema.json"));
const resume_checkpoint_schema_json_1 = __importDefault(require("../schemas/resume-checkpoint.schema.json"));
const role_defaults_schema_json_1 = __importDefault(require("../schemas/role-defaults.schema.json"));
const run_schema_json_1 = __importDefault(require("../schemas/run.schema.json"));
const specialist_role_contracts_schema_json_1 = __importDefault(require("../schemas/specialist-role-contracts.schema.json"));
const task_card_schema_json_1 = __importDefault(require("../schemas/task-card.schema.json"));
const verification_schema_json_1 = __importDefault(require("../schemas/verification.schema.json"));
const ajv = new ajv_1.default({ allErrors: true, strict: true });
const validateAdvisorOutput = ajv.compile(advisor_schema_json_1.default);
const validateDelegationRecord = ajv.compile(delegation_schema_json_1.default);
const validateExploreArtifact = ajv.compile(explore_artifact_schema_json_1.default);
const validateForemanConfigFile = ajv.compile(foreman_config_schema_json_1.default);
const validateHandoffRecord = ajv.compile(handoff_schema_json_1.default);
const validateOrchestratorDecision = ajv.compile(orchestrator_decision_schema_json_1.default);
const validateOrchestrationAttemptRecord = ajv.compile(orchestration_attempt_schema_json_1.default);
const validateOrchestratorState = ajv.compile(orchestrator_state_schema_json_1.default);
const validatePlanUpdateArtifact = ajv.compile(plan_update_schema_json_1.default);
const validatePlanningOutput = ajv.compile(planning_schema_json_1.default);
const validateResumeCheckpointRecord = ajv.compile(resume_checkpoint_schema_json_1.default);
const validateRoleDefaultsFile = ajv.compile(role_defaults_schema_json_1.default);
const validateRunRecord = ajv.compile(run_schema_json_1.default);
const validateSpecialistRoleContractsFile = ajv.compile(specialist_role_contracts_schema_json_1.default);
const validateTaskCardRecord = ajv.compile(task_card_schema_json_1.default);
const validateVerificationAutomationOutput = ajv.compile(verification_schema_json_1.default);
function formatValidationErrors(errors) {
    if (!errors || errors.length === 0) {
        return 'Unknown validation error.';
    }
    return errors
        .map((error) => {
        const path = error.instancePath.length > 0 ? error.instancePath : '/';
        return `${path} ${error.message}`;
    })
        .join('; ');
}
function assertValidRunRecord(value) {
    if (!validateRunRecord(value)) {
        throw new Error(`Run record failed schema validation: ${formatValidationErrors(validateRunRecord.errors)}`);
    }
}
function assertValidAdvisorOutput(value) {
    if (!validateAdvisorOutput(value)) {
        throw new Error(`Advisor output failed schema validation: ${formatValidationErrors(validateAdvisorOutput.errors)}`);
    }
}
function assertValidDelegationRecord(value) {
    if (!validateDelegationRecord(value)) {
        throw new Error(`Delegation record failed schema validation: ${formatValidationErrors(validateDelegationRecord.errors)}`);
    }
}
function assertValidExploreArtifact(value) {
    if (!validateExploreArtifact(value)) {
        throw new Error(`Explore artifact failed schema validation: ${formatValidationErrors(validateExploreArtifact.errors)}`);
    }
}
function assertValidForemanConfigFile(value) {
    if (!validateForemanConfigFile(value)) {
        throw new Error(`Foreman config file failed schema validation: ${formatValidationErrors(validateForemanConfigFile.errors)}`);
    }
}
function assertValidHandoffRecord(value) {
    if (!validateHandoffRecord(value)) {
        throw new Error(`Handoff record failed schema validation: ${formatValidationErrors(validateHandoffRecord.errors)}`);
    }
}
function assertValidOrchestrationAttemptRecord(value) {
    if (!validateOrchestrationAttemptRecord(value)) {
        throw new Error(`Orchestration attempt record failed schema validation: ${formatValidationErrors(validateOrchestrationAttemptRecord.errors)}`);
    }
}
function assertValidOrchestratorDecision(value) {
    if (!validateOrchestratorDecision(value)) {
        throw new Error(`Orchestrator decision failed schema validation: ${formatValidationErrors(validateOrchestratorDecision.errors)}`);
    }
}
function assertValidOrchestratorState(value) {
    if (!validateOrchestratorState(value)) {
        throw new Error(`Orchestrator state failed schema validation: ${formatValidationErrors(validateOrchestratorState.errors)}`);
    }
}
function assertValidPlanUpdateArtifact(value) {
    if (!validatePlanUpdateArtifact(value)) {
        throw new Error(`Plan update artifact failed schema validation: ${formatValidationErrors(validatePlanUpdateArtifact.errors)}`);
    }
}
function assertValidPlanningOutput(value) {
    if (!validatePlanningOutput(value)) {
        throw new Error(`Planning output failed schema validation: ${formatValidationErrors(validatePlanningOutput.errors)}`);
    }
}
function assertValidResumeCheckpointRecord(value) {
    if (!validateResumeCheckpointRecord(value)) {
        throw new Error(`Resume checkpoint record failed schema validation: ${formatValidationErrors(validateResumeCheckpointRecord.errors)}`);
    }
}
function assertValidRoleDefaultsFile(value) {
    if (!validateRoleDefaultsFile(value)) {
        throw new Error(`Role defaults file failed schema validation: ${formatValidationErrors(validateRoleDefaultsFile.errors)}`);
    }
}
function assertValidTaskCardRecord(value) {
    if (!validateTaskCardRecord(value)) {
        throw new Error(`Task-card record failed schema validation: ${formatValidationErrors(validateTaskCardRecord.errors)}`);
    }
}
function assertValidSpecialistRoleContractsFile(value) {
    if (!validateSpecialistRoleContractsFile(value)) {
        throw new Error(`Specialist role contracts failed schema validation: ${formatValidationErrors(validateSpecialistRoleContractsFile.errors)}`);
    }
}
function assertValidVerificationAutomationOutput(value) {
    if (!validateVerificationAutomationOutput(value)) {
        throw new Error(`Verification output failed schema validation: ${formatValidationErrors(validateVerificationAutomationOutput.errors)}`);
    }
}
//# sourceMappingURL=validation.js.map