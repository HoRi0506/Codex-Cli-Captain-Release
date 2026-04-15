import type { ForemanConfigFile, ForemanEntryPolicyConfig, RecommendForemanEntryOptions, RecommendForemanEntryResult } from './types';
export declare function recommendForemanEntry(options: RecommendForemanEntryOptions, policy?: ForemanEntryPolicyConfig, orchestratorConfig?: ForemanConfigFile['agents']['orchestrator']): RecommendForemanEntryResult;
