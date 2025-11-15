import { NextRequest, NextResponse } from 'next/server';
import { AIAgentConfigService } from '@/lib/services/ai-agent-config.service';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const configType = searchParams.get('type') || 'all';
    
    let configData: any = {};
    
    switch (configType) {
      case 'layers':
        configData.layers = await AIAgentConfigService.getLayers(tenantId);
        break;
        
      case 'capabilities':
        const capabilityFilters = {
          category: searchParams.get('category') || undefined,
          processing_method: searchParams.get('processing_method') || undefined,
          is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined
        };
        configData.capabilities = await AIAgentConfigService.getCapabilities(tenantId, capabilityFilters);
        break;
        
      case 'roles':
        configData.roles = await AIAgentConfigService.getRoles(tenantId);
        break;
        
      case 'prompts':
        const promptFilters = {
          category: searchParams.get('category') || undefined,
          language: searchParams.get('language') || undefined,
          is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined
        };
        configData.prompts = await AIAgentConfigService.getPrompts(tenantId, promptFilters);
        break;
        
      case 'business_rules':
        const ruleFilters = {
          category: searchParams.get('category') || undefined,
          rule_type: searchParams.get('rule_type') || undefined,
          applicable_role: searchParams.get('applicable_role') || undefined,
          is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined
        };
        configData.business_rules = await AIAgentConfigService.getBusinessRules(tenantId, ruleFilters);
        break;
        
      case 'integrations':
        const integrationType = searchParams.get('integration_type') || undefined;
        configData.integrations = await AIAgentConfigService.getIntegrations(tenantId, integrationType);
        break;
        
      case 'validation':
        const agentCode = searchParams.get('agent_code');
        if (agentCode) {
          configData.validation = await AIAgentConfigService.validateAgentConfiguration(tenantId, agentCode);
        } else {
          return NextResponse.json(
            { success: false, error: 'agent_code required for validation' },
            { status: 400 }
          );
        }
        break;
        
      default:
        // Return all configurations
        configData = {
          layers: await AIAgentConfigService.getLayers(tenantId),
          capabilities: await AIAgentConfigService.getCapabilities(tenantId),
          roles: await AIAgentConfigService.getRoles(tenantId),
          prompts: await AIAgentConfigService.getPrompts(tenantId),
          business_rules: await AIAgentConfigService.getBusinessRules(tenantId),
          integrations: await AIAgentConfigService.getIntegrations(tenantId)
        };
        break;
    }
    
    return NextResponse.json({
      success: true,
      data: configData,
      config_type: configType
    });
  } catch (error) {
    console.error('Error fetching AI agent configurations:', error);
    
    // Fallback sample configurations
    const fallbackConfig = {
      layers: [
        {
          id: '1',
          layer_code: 'PERCEPTION_LAYER',
          layer_name: 'Financial Data Perception Layer',
          layer_type: 'perception',
          layer_order: 1,
          is_active: true,
          processing_timeout: 30,
          retry_attempts: 3,
          parallel_processing: false,
          default_config: {
            data_sources: ['invoices', 'payments', 'bank_feeds'],
            processing_timeout: 30
          }
        },
        {
          id: '2',
          layer_code: 'BRAIN_LAYER',
          layer_name: 'Financial AI Brain Layer',
          layer_type: 'brain',
          layer_order: 2,
          is_active: true,
          processing_timeout: 60,
          retry_attempts: 2,
          parallel_processing: true,
          default_config: {
            llm_model: 'gpt-4',
            temperature: 0.7,
            max_tokens: 2000,
            chain_of_thought: true
          }
        }
      ],
      capabilities: [
        {
          id: '1',
          capability_code: 'INVOICE_PROCESSING',
          capability_name: 'Invoice Processing',
          capability_category: 'financial',
          processing_method: 'llm',
          llm_model: 'gpt-4',
          approval_required: false,
          max_processing_time: 30,
          confidence_threshold: 0.85,
          is_active: true
        },
        {
          id: '2',
          capability_code: 'PAYMENT_APPROVAL',
          capability_name: 'Payment Approval',
          capability_category: 'financial',
          processing_method: 'rule_based',
          approval_required: true,
          approval_threshold: 10000,
          max_processing_time: 15,
          confidence_threshold: 0.95,
          is_active: true
        }
      ],
      roles: [
        {
          id: '1',
          role_code: 'CFO_AGENT',
          role_name_en: 'Chief Financial Officer',
          role_name_ar: 'المدير المالي التنفيذي',
          role_level: 10,
          primary_capabilities: ['strategic_planning', 'financial_oversight'],
          decision_authority: { approval_limit: 1000000 },
          availability_24_7: true,
          expected_response_time: 30,
          is_active: true
        }
      ],
      business_rules: [
        {
          id: '1',
          rule_code: 'AUTO_APPROVE_SMALL_INVOICES',
          rule_name: 'Auto Approve Small Invoices',
          rule_category: 'approval',
          rule_conditions: { amount: { less_than: 1000 } },
          rule_actions: { action: 'approve', create_journal_entry: true },
          applicable_roles: ['AP_SPECIALIST_AGENT'],
          priority: 5,
          is_active: true
        }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackConfig,
      fallback: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();
    
    if (action === 'evaluate_rule') {
      // Evaluate a business rule
      const { rule_code, context } = body;
      
      if (!rule_code || !context) {
        return NextResponse.json(
          { success: false, error: 'Missing rule_code or context' },
          { status: 400 }
        );
      }
      
      const result = await AIAgentConfigService.evaluateBusinessRule(tenantId, rule_code, context);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Business rule evaluated successfully'
      });
    }
    
    if (action === 'update_layer_config') {
      // Update layer configuration
      const { layer_code, config } = body;
      
      if (!layer_code || !config) {
        return NextResponse.json(
          { success: false, error: 'Missing layer_code or config' },
          { status: 400 }
        );
      }
      
      const updatedLayer = await AIAgentConfigService.updateLayerConfig(tenantId, layer_code, config);
      
      return NextResponse.json({
        success: true,
        data: updatedLayer,
        message: 'Layer configuration updated successfully'
      });
    }
    
    if (action === 'update_prompt_usage') {
      // Update prompt usage statistics
      const { prompt_id, response_time, success } = body;
      
      if (!prompt_id || response_time === undefined || success === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing prompt_id, response_time, or success' },
          { status: 400 }
        );
      }
      
      await AIAgentConfigService.updatePromptUsage(tenantId, prompt_id, response_time, success);
      
      return NextResponse.json({
        success: true,
        message: 'Prompt usage updated successfully'
      });
    }
    
    if (action === 'update_integration_health') {
      // Update integration health status
      const { integration_code, health_status } = body;
      
      if (!integration_code || !health_status) {
        return NextResponse.json(
          { success: false, error: 'Missing integration_code or health_status' },
          { status: 400 }
        );
      }
      
      await AIAgentConfigService.updateIntegrationHealth(tenantId, integration_code, health_status);
      
      return NextResponse.json({
        success: true,
        message: 'Integration health status updated successfully'
      });
    }
    
    if (action === 'record_integration_usage') {
      // Record integration usage
      const { integration_code, success, response_time } = body;
      
      if (!integration_code || success === undefined || response_time === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing integration_code, success, or response_time' },
          { status: 400 }
        );
      }
      
      await AIAgentConfigService.recordIntegrationUsage(tenantId, integration_code, success, response_time);
      
      return NextResponse.json({
        success: true,
        message: 'Integration usage recorded successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in AI agent config API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process configuration request' },
      { status: 500 }
    );
  }
}
