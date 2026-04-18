"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRosterNameForRole = getRosterNameForRole;
exports.getRoleConfigForRole = getRoleConfigForRole;
exports.getCompanionAgentName = getCompanionAgentName;
exports.getCompanionAgentConfig = getCompanionAgentConfig;
exports.getOwnershipTargetName = getOwnershipTargetName;
exports.getOwnershipTargetConfig = getOwnershipTargetConfig;
exports.normalizePublicAgentName = normalizePublicAgentName;
const constants_1 = require("./constants");
function getRosterNameForRole(role, foremanConfig) {
    if (foremanConfig) {
        switch (role) {
            case 'orchestrator':
                return foremanConfig.agents.orchestrator.name;
            case 'planner':
                return foremanConfig.agents.planner.name;
            case 'explorer':
                return (foremanConfig.agents.explorer?.name ?? constants_1.FOREMAN_AGENT_ROSTER.explorer);
            case 'code specialist':
                return foremanConfig.agents['code specialist'].name;
            case 'verifier':
                return foremanConfig.agents.verifier.name;
        }
    }
    switch (role) {
        case 'orchestrator':
            return constants_1.FOREMAN_AGENT_ROSTER.orchestrator;
        case 'planner':
            return constants_1.FOREMAN_AGENT_ROSTER.planner;
        case 'explorer':
            return constants_1.FOREMAN_AGENT_ROSTER.explorer;
        case 'code specialist':
            return constants_1.FOREMAN_AGENT_ROSTER.codeSpecialist;
        case 'verifier':
            return constants_1.FOREMAN_AGENT_ROSTER.verifier;
    }
}
function getRoleConfigForRole(role, foremanConfig) {
    if (!foremanConfig) {
        return {
            model: null,
            variant: null,
        };
    }
    switch (role) {
        case 'orchestrator':
            return foremanConfig.agents.orchestrator;
        case 'planner':
            return foremanConfig.agents.planner;
        case 'explorer':
            return foremanConfig.agents.explorer ?? { name: 'scout', profile: null, model: null, variant: null, config_entries: [] };
        case 'code specialist':
            return foremanConfig.agents['code specialist'];
        case 'verifier':
            return foremanConfig.agents.verifier;
    }
}
function getCompanionAgentName(agentId, foremanConfig) {
    if (foremanConfig?.companion_agents) {
        return foremanConfig.companion_agents[agentId]?.name === agentId
            ? agentId
            : agentId;
    }
    return agentId;
}
function getCompanionAgentConfig(agentId, foremanConfig) {
    if (!foremanConfig?.companion_agents) {
        return {
            model: null,
            variant: null,
        };
    }
    return foremanConfig.companion_agents[agentId] ?? { model: null, variant: null };
}
function getOwnershipTargetName(target, foremanConfig) {
    if (target === 'companion_reader' || target === 'companion_operator') {
        return getCompanionAgentName(target, foremanConfig);
    }
    return getRosterNameForRole(target, foremanConfig);
}
function getOwnershipTargetConfig(target, foremanConfig) {
    if (target === 'companion_reader' || target === 'companion_operator') {
        return getCompanionAgentConfig(target, foremanConfig);
    }
    return getRoleConfigForRole(target, foremanConfig);
}
function normalizePublicAgentName(value) {
    switch (value) {
        case 'captain':
        case 'tactician':
        case 'scout':
        case 'raider':
        case 'arbiter':
        case 'sentinel':
        case 'companion_reader':
        case 'companion_operator':
            return value;
        case 'orchestrator':
            return 'captain';
        case 'planner':
            return 'tactician';
        case 'explorer':
            return 'scout';
        case 'code specialist':
            return 'raider';
        case 'verifier':
            return 'arbiter';
        default:
            return null;
    }
}
//# sourceMappingURL=role-roster.js.map