import { query, transaction, PoolClient } from '@/lib/db/connection';

// Configuration Interfaces
export interface AIAgentLayer {
  id: string;
  tenant_id: string;
  layer_code: string;
  layer_name: string;
  layer_type: 'perception' | 'brain' | 'action' | 'foundation';
  layer_order: number;
  layer_description?: string;
  is_active: boolean;
  config_schema?: any;
  default_config?: any;
  processing_timeout: number;
  retry_attempts: number;
  parallel_processing: boolean;
  depends_on_layers: string[];
  created_at: string;
  updated_at: string;
}

export interface AIAgentCapability {
  id: string;
  tenant_id: string;
  capability_code: string;
  capability_name: string;
  capability_category: 'financial' | 'analytical' | 'operational' | 'communication';
  description?: string;
  input_schema?: any;
  output_schema?: any;
  processing_method: 'llm' | 'rule_based' | 'calculation' | 'api_call';
  llm_model?: string;
  prompt_template?: string;
  system_prompt?: string;
  business_rules?: any;
  validation_rules?: any;
  approval_required: boolean;
  approval_threshold?: number;
  max_processing_time: number;
  confidence_threshold: number;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgentRole {
  id: string;
  tenant_id: string;
  role_code: string;
  role_name_en: string;
  role_name_ar: string;
  role_level: number;
  reports_to_role?: string;
  supervises_roles: string[];
  primary_capabilities: string[];
  secondary_capabilities: string[];
  restricted_capabilities: string[];
  decision_authority?: any;
  approval_limits?: any;
  escalation_rules?: any;
  working_hours?: any;
  timezone: string;
  availability_24_7: boolean;
  expected_response_time: number;
  expected_accuracy: number;
  max_concurrent_tasks: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIAgentPrompt {
  id: string;
  tenant_id: string;
  prompt_code: string;
  prompt_name: string;
  prompt_category: 'system' | 'task' | 'decision' | 'analysis';
  prompt_template: string;
  system_message?: string;
  context_template?: string;
  language: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  usage_count: number;
  success_rate: number;
  average_response_time: number;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIBusinessRule {
  id: string;
  tenant_id: string;
  rule_code: string;
  rule_name: string;
  rule_category: 'approval' | 'validation' | 'calculation' | 'routing';
  rule_description?: string;
  rule_conditions: any;
  rule_actions: any;
  applicable_roles: string[];
  applicable_capabilities: string[];
  rule_type: 'if_then' | 'threshold' | 'calculation' | 'lookup';
  priority: number;
  is_blocking: boolean;
  error_handling: string;
  execution_count: number;
  success_count: number;
  failure_count: number;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgentIntegration {
  id: string;
  tenant_id: string;
  integration_code: string;
  integration_name: string;
  integration_type: 'llm_api' | 'database' | 'external_api' | 'webhook';
  endpoint_url?: string;
  api_key_encrypted?: string;
  authentication_method?: string;
  connection_config?: any;
  request_headers?: any;
  timeout_seconds: number;
  retry_attempts: number;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  health_check_url?: string;
  health_check_interval: number;
  last_health_check?: string;
  health_status: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AIAgentConfigService {
  // LAYER MANAGEMENT
  
  static async getLayers(tenantId: string, layerType?: string): Promise<AIAgentLayer[]> {
    let sql = 'SELECT * FROM ai_agent_layers WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    
    if (layerType) {
      sql += ' AND layer_type = $2';
      params.push(layerType);
    }
    
    sql += ' ORDER BY layer_order ASC';
    
    const result = await query<AIAgentLayer>(sql, params);
    return result.rows;
  }

  static async getLayerConfig(tenantId: string, layerCode: string): Promise<any> {
    const result = await query<AIAgentLayer>(
      'SELECT default_config FROM ai_agent_layers WHERE tenant_id = $1 AND layer_code = $2',
      [tenantId, layerCode]
    );
    
    return result.rows[0]?.default_config || {};
  }

  static async updateLayerConfig(tenantId: string, layerCode: string, config: any): Promise<AIAgentLayer | null> {
    const result = await query<AIAgentLayer>(
      `UPDATE ai_agent_layers 
       SET default_config = $3, updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = $1 AND layer_code = $2
       RETURNING *`,
      [tenantId, layerCode, config]
    );
    
    return result.rows[0] || null;
  }

  // CAPABILITY MANAGEMENT
  
  static async getCapabilities(tenantId: string, filters?: {
    category?: string;
    processing_method?: string;
    is_active?: boolean;
  }): Promise<AIAgentCapability[]> {
    let sql = 'SELECT * FROM ai_agent_capabilities WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.category) {
      sql += ` AND capability_category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.processing_method) {
      sql += ` AND processing_method = $${paramIndex}`;
      params.push(filters.processing_method);
      paramIndex++;
    }

    if (filters?.is_active !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }

    sql += ' ORDER BY capability_category, capability_name';

    const result = await query<AIAgentCapability>(sql, params);
    return result.rows;
  }

  static async getCapabilityByCode(tenantId: string, capabilityCode: string): Promise<AIAgentCapability | null> {
    const result = await query<AIAgentCapability>(
      'SELECT * FROM ai_agent_capabilities WHERE tenant_id = $1 AND capability_code = $2',
      [tenantId, capabilityCode]
    );
    
    return result.rows[0] || null;
  }

  // ROLE MANAGEMENT
  
  static async getRoles(tenantId: string): Promise<AIAgentRole[]> {
    const result = await query<AIAgentRole>(
      'SELECT * FROM ai_agent_roles WHERE tenant_id = $1 ORDER BY role_level DESC',
      [tenantId]
    );
    
    return result.rows;
  }

  static async getRoleByCode(tenantId: string, roleCode: string): Promise<AIAgentRole | null> {
    const result = await query<AIAgentRole>(
      'SELECT * FROM ai_agent_roles WHERE tenant_id = $1 AND role_code = $2',
      [tenantId, roleCode]
    );
    
    return result.rows[0] || null;
  }

  static async getRoleCapabilities(tenantId: string, roleCode: string): Promise<AIAgentCapability[]> {
    const result = await query<AIAgentCapability>(
      `SELECT ac.* FROM ai_agent_capabilities ac
       JOIN ai_agent_roles ar ON $3 = ANY(ar.primary_capabilities) OR $3 = ANY(ar.secondary_capabilities)
       WHERE ac.tenant_id = $1 AND ar.role_code = $2 AND ac.capability_code = $3`,
      [tenantId, roleCode, 'capability_code']
    );
    
    // This is a simplified query - in practice, you'd need to properly join the arrays
    const role = await this.getRoleByCode(tenantId, roleCode);
    if (!role) return [];
    
    const allCapabilities = [...role.primary_capabilities, ...role.secondary_capabilities];
    const capabilities = await this.getCapabilities(tenantId);
    
    return capabilities.filter(cap => allCapabilities.includes(cap.capability_code));
  }

  // PROMPT MANAGEMENT
  
  static async getPrompts(tenantId: string, filters?: {
    category?: string;
    language?: string;
    is_active?: boolean;
  }): Promise<AIAgentPrompt[]> {
    let sql = 'SELECT * FROM ai_agent_prompts WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.category) {
      sql += ` AND prompt_category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.language) {
      sql += ` AND language = $${paramIndex}`;
      params.push(filters.language);
      paramIndex++;
    }

    if (filters?.is_active !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }

    sql += ' ORDER BY prompt_category, prompt_name';

    const result = await query<AIAgentPrompt>(sql, params);
    return result.rows;
  }

  static async getPromptByCode(tenantId: string, promptCode: string, language: string = 'en'): Promise<AIAgentPrompt | null> {
    const result = await query<AIAgentPrompt>(
      'SELECT * FROM ai_agent_prompts WHERE tenant_id = $1 AND prompt_code = $2 AND language = $3',
      [tenantId, promptCode, language]
    );
    
    return result.rows[0] || null;
  }

  static async updatePromptUsage(tenantId: string, promptId: string, responseTime: number, success: boolean): Promise<void> {
    await query(
      `UPDATE ai_agent_prompts 
       SET usage_count = usage_count + 1,
           average_response_time = (average_response_time * usage_count + $4) / (usage_count + 1),
           success_rate = CASE 
             WHEN $5 THEN (success_rate * usage_count + 100) / (usage_count + 1)
             ELSE (success_rate * usage_count) / (usage_count + 1)
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = $1 AND id = $2`,
      [tenantId, promptId, responseTime, success]
    );
  }

  // BUSINESS RULES MANAGEMENT
  
  static async getBusinessRules(tenantId: string, filters?: {
    category?: string;
    rule_type?: string;
    applicable_role?: string;
    is_active?: boolean;
  }): Promise<AIBusinessRule[]> {
    let sql = 'SELECT * FROM ai_agent_business_rules WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.category) {
      sql += ` AND rule_category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.rule_type) {
      sql += ` AND rule_type = $${paramIndex}`;
      params.push(filters.rule_type);
      paramIndex++;
    }

    if (filters?.applicable_role) {
      sql += ` AND $${paramIndex} = ANY(applicable_roles)`;
      params.push(filters.applicable_role);
      paramIndex++;
    }

    if (filters?.is_active !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }

    sql += ` AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)`;
    sql += ' ORDER BY priority DESC, rule_name';

    const result = await query<AIBusinessRule>(sql, params);
    return result.rows;
  }

  static async evaluateBusinessRule(tenantId: string, ruleCode: string, context: any): Promise<{
    rule_passed: boolean;
    actions_to_take: any[];
    rule_result: any;
  }> {
    const rule = await query<AIBusinessRule>(
      'SELECT * FROM ai_agent_business_rules WHERE tenant_id = $1 AND rule_code = $2 AND is_active = true',
      [tenantId, ruleCode]
    );

    if (rule.rows.length === 0) {
      throw new Error(`Business rule ${ruleCode} not found or inactive`);
    }

    const businessRule = rule.rows[0];
    
    // Evaluate rule conditions (simplified logic)
    const rulePassed = this.evaluateConditions(businessRule.rule_conditions, context);
    
    // Update rule execution statistics
    await query(
      `UPDATE ai_agent_business_rules 
       SET execution_count = execution_count + 1,
           success_count = success_count + CASE WHEN $3 THEN 1 ELSE 0 END,
           failure_count = failure_count + CASE WHEN $3 THEN 0 ELSE 1 END
       WHERE tenant_id = $1 AND rule_code = $2`,
      [tenantId, ruleCode, rulePassed]
    );

    return {
      rule_passed: rulePassed,
      actions_to_take: rulePassed ? businessRule.rule_actions : [],
      rule_result: {
        rule_code: ruleCode,
        conditions_met: rulePassed,
        context_used: context
      }
    };
  }

  private static evaluateConditions(conditions: any, context: any): boolean {
    // Simplified rule evaluation logic
    // In a real implementation, this would be a comprehensive rule engine
    
    if (!conditions || !context) return false;
    
    for (const [key, condition] of Object.entries(conditions)) {
      const contextValue = context[key];
      
      if (typeof condition === 'object' && condition !== null) {
        for (const [operator, value] of Object.entries(condition)) {
          switch (operator) {
            case 'equals':
              if (contextValue !== value) return false;
              break;
            case 'greater_than':
              if (contextValue <= value) return false;
              break;
            case 'less_than':
              if (contextValue >= value) return false;
              break;
            case 'contains':
              if (!contextValue || !contextValue.includes(value)) return false;
              break;
            default:
              // Unknown operator
              return false;
          }
        }
      } else {
        // Direct value comparison
        if (contextValue !== condition) return false;
      }
    }
    
    return true;
  }

  // INTEGRATION MANAGEMENT
  
  static async getIntegrations(tenantId: string, integrationType?: string): Promise<AIAgentIntegration[]> {
    let sql = 'SELECT * FROM ai_agent_integrations WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    
    if (integrationType) {
      sql += ' AND integration_type = $2';
      params.push(integrationType);
    }
    
    sql += ' ORDER BY integration_name';
    
    const result = await query<AIAgentIntegration>(sql, params);
    return result.rows;
  }

  static async getIntegrationByCode(tenantId: string, integrationCode: string): Promise<AIAgentIntegration | null> {
    const result = await query<AIAgentIntegration>(
      'SELECT * FROM ai_agent_integrations WHERE tenant_id = $1 AND integration_code = $2',
      [tenantId, integrationCode]
    );
    
    return result.rows[0] || null;
  }

  static async updateIntegrationHealth(tenantId: string, integrationCode: string, healthStatus: string): Promise<void> {
    await query(
      `UPDATE ai_agent_integrations 
       SET health_status = $3, last_health_check = CURRENT_TIMESTAMP
       WHERE tenant_id = $1 AND integration_code = $2`,
      [tenantId, integrationCode, healthStatus]
    );
  }

  static async recordIntegrationUsage(tenantId: string, integrationCode: string, success: boolean, responseTime: number): Promise<void> {
    await query(
      `UPDATE ai_agent_integrations 
       SET total_requests = total_requests + 1,
           successful_requests = successful_requests + CASE WHEN $3 THEN 1 ELSE 0 END,
           failed_requests = failed_requests + CASE WHEN $3 THEN 0 ELSE 1 END,
           average_response_time = (average_response_time * total_requests + $4) / (total_requests + 1)
       WHERE tenant_id = $1 AND integration_code = $2`,
      [tenantId, integrationCode, success, responseTime]
    );
  }

  // CONFIGURATION VALIDATION
  
  static async validateAgentConfiguration(tenantId: string, agentCode: string): Promise<{
    is_valid: boolean;
    missing_configurations: string[];
    warnings: string[];
  }> {
    const missingConfigs: string[] = [];
    const warnings: string[] = [];

    // Check if agent has a role
    const role = await this.getRoleByCode(tenantId, agentCode);
    if (!role) {
      missingConfigs.push('agent_role');
    }

    // Check if role has capabilities
    if (role && role.primary_capabilities.length === 0) {
      warnings.push('no_primary_capabilities');
    }

    // Check if required layers are configured
    const layers = await this.getLayers(tenantId);
    const requiredLayers = ['PERCEPTION_LAYER', 'BRAIN_LAYER', 'ACTION_LAYER'];
    
    for (const requiredLayer of requiredLayers) {
      if (!layers.find(l => l.layer_code === requiredLayer && l.is_active)) {
        missingConfigs.push(`missing_layer_${requiredLayer}`);
      }
    }

    return {
      is_valid: missingConfigs.length === 0,
      missing_configurations: missingConfigs,
      warnings
    };
  }
}
