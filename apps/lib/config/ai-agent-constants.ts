// AI Finance Agent Configuration Constants
// All layers, roles, capabilities, and configurations defined in code

export const AI_AGENT_LAYERS = {
  PERCEPTION: {
    code: 'PERCEPTION_LAYER',
    name: 'Financial Data Perception Layer',
    type: 'perception' as const,
    order: 1,
    description: 'Captures and interprets multimodal financial data from various sources',
    config: {
      data_sources: ['invoices', 'payments', 'bank_feeds', 'market_data', 'documents'],
      processing_timeout: 30,
      supported_formats: ['pdf', 'csv', 'json', 'xml', 'email'],
      ocr_enabled: true,
      nlp_processing: true,
      data_validation: true
    },
    dependencies: []
  },
  BRAIN: {
    code: 'BRAIN_LAYER',
    name: 'Financial AI Brain Layer',
    type: 'brain' as const,
    order: 2,
    description: 'Core processing unit using LLMs and Chain-of-Thought reasoning',
    config: {
      primary_llm: 'gpt-4',
      fallback_llms: ['gpt-3.5-turbo', 'claude-3'],
      temperature: 0.7,
      max_tokens: 2000,
      chain_of_thought: true,
      reasoning_depth: 3,
      confidence_calculation: true,
      memory_integration: true
    },
    dependencies: ['PERCEPTION_LAYER']
  },
  ACTION: {
    code: 'ACTION_LAYER',
    name: 'Financial Action Execution Layer',
    type: 'action' as const,
    order: 3,
    description: 'Executes decisions and interacts with financial systems',
    config: {
      execution_timeout: 60,
      rollback_enabled: true,
      audit_all_actions: true,
      approval_required_threshold: 10000,
      batch_processing: true,
      error_recovery: true
    },
    dependencies: ['BRAIN_LAYER']
  },
  FOUNDATION: {
    code: 'FOUNDATION_LAYER',
    name: 'LLM Foundation Models Layer',
    type: 'foundation' as const,
    order: 0,
    description: 'Provides access to various LLM models and APIs',
    config: {
      model_registry: {
        'gpt-4': { provider: 'openai', cost_per_token: 0.00003, context_window: 8192 },
        'gpt-3.5-turbo': { provider: 'openai', cost_per_token: 0.000002, context_window: 4096 },
        'claude-3': { provider: 'anthropic', cost_per_token: 0.000015, context_window: 100000 }
      },
      load_balancing: true,
      rate_limiting: true,
      cost_optimization: true
    },
    dependencies: []
  }
} as const;

export const AI_AGENT_ROLES = {
  CFO: {
    code: 'CFO_AGENT',
    name_en: 'Chief Financial Officer',
    name_ar: 'المدير المالي التنفيذي',
    level: 10,
    type: 'executive' as const,
    reports_to: null,
    supervises: ['CONTROLLER_AGENT', 'ANALYST_AGENT'],
    capabilities: {
      primary: [
        'strategic_financial_planning',
        'board_reporting',
        'risk_management',
        'capital_allocation',
        'investor_relations',
        'regulatory_compliance'
      ],
      secondary: [
        'budget_oversight',
        'performance_analysis',
        'merger_acquisition_analysis'
      ]
    },
    decision_authority: {
      approval_limit: 1000000,
      budget_changes: true,
      policy_creation: true,
      strategic_decisions: true,
      board_recommendations: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 30,
      max_concurrent_tasks: 5,
      escalation_required: false
    }
  },
  CONTROLLER: {
    code: 'CONTROLLER_AGENT',
    name_en: 'Finance Controller',
    name_ar: 'المراقب المالي',
    level: 8,
    type: 'operational' as const,
    reports_to: 'CFO_AGENT',
    supervises: ['SR_ACCOUNTANT_AGENT', 'AR_SPECIALIST_AGENT', 'AP_SPECIALIST_AGENT'],
    capabilities: {
      primary: [
        'financial_reporting',
        'month_end_close',
        'compliance_monitoring',
        'internal_controls',
        'audit_coordination'
      ],
      secondary: [
        'budget_preparation',
        'variance_analysis',
        'process_improvement'
      ]
    },
    decision_authority: {
      approval_limit: 100000,
      reporting_authority: true,
      compliance_enforcement: true,
      process_changes: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 20,
      max_concurrent_tasks: 8,
      escalation_threshold: 50000
    }
  },
  SR_ACCOUNTANT: {
    code: 'SR_ACCOUNTANT_AGENT',
    name_en: 'Senior Accountant',
    name_ar: 'محاسب أول',
    level: 6,
    type: 'operational' as const,
    reports_to: 'CONTROLLER_AGENT',
    supervises: ['BOOKKEEPER_AGENT'],
    capabilities: {
      primary: [
        'journal_entry_preparation',
        'account_reconciliation',
        'financial_analysis',
        'supervision',
        'complex_transactions'
      ],
      secondary: [
        'training',
        'process_documentation',
        'system_administration'
      ]
    },
    decision_authority: {
      approval_limit: 25000,
      journal_entry_approval: true,
      reconciliation_authority: true,
      correction_authority: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 15,
      max_concurrent_tasks: 12,
      escalation_threshold: 15000
    }
  },
  AR_SPECIALIST: {
    code: 'AR_SPECIALIST_AGENT',
    name_en: 'Accounts Receivable Specialist',
    name_ar: 'أخصائي الحسابات المدينة',
    level: 5,
    type: 'specialist' as const,
    reports_to: 'CONTROLLER_AGENT',
    supervises: [],
    capabilities: {
      primary: [
        'invoice_processing',
        'payment_collection',
        'customer_communication',
        'aging_analysis',
        'credit_management'
      ],
      secondary: [
        'customer_onboarding',
        'payment_plan_negotiation',
        'collection_reporting'
      ]
    },
    decision_authority: {
      approval_limit: 10000,
      payment_terms_modification: false,
      collection_actions: true,
      customer_communication: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 10,
      max_concurrent_tasks: 15,
      escalation_threshold: 5000
    }
  },
  AP_SPECIALIST: {
    code: 'AP_SPECIALIST_AGENT',
    name_en: 'Accounts Payable Specialist',
    name_ar: 'أخصائي الحسابات الدائنة',
    level: 5,
    type: 'specialist' as const,
    reports_to: 'CONTROLLER_AGENT',
    supervises: [],
    capabilities: {
      primary: [
        'bill_processing',
        'vendor_payment_processing',
        'expense_management',
        'vendor_relations',
        'purchase_order_matching'
      ],
      secondary: [
        'vendor_onboarding',
        'payment_scheduling',
        'expense_reporting'
      ]
    },
    decision_authority: {
      approval_limit: 10000,
      payment_authorization: true,
      vendor_communication: true,
      expense_approval: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 10,
      max_concurrent_tasks: 20,
      escalation_threshold: 5000
    }
  },
  ANALYST: {
    code: 'ANALYST_AGENT',
    name_en: 'Financial Analyst',
    name_ar: 'محلل مالي',
    level: 4,
    type: 'analytical' as const,
    reports_to: 'CFO_AGENT',
    supervises: [],
    capabilities: {
      primary: [
        'budget_analysis',
        'financial_forecasting',
        'kpi_reporting',
        'variance_analysis',
        'trend_analysis'
      ],
      secondary: [
        'dashboard_creation',
        'data_visualization',
        'business_intelligence'
      ]
    },
    decision_authority: {
      approval_limit: 5000,
      report_publishing: true,
      analysis_recommendations: true,
      data_access: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 20,
      max_concurrent_tasks: 10,
      escalation_threshold: 2500
    }
  },
  PAYROLL_SPECIALIST: {
    code: 'PAYROLL_AGENT',
    name_en: 'Payroll Specialist',
    name_ar: 'أخصائي كشوف الرواتب',
    level: 6,
    type: 'specialist' as const,
    reports_to: 'CONTROLLER_AGENT',
    supervises: [],
    capabilities: {
      primary: [
        'payroll_processing',
        'benefits_administration',
        'tax_compliance',
        'hr_coordination',
        'payroll_reporting'
      ],
      secondary: [
        'employee_onboarding',
        'time_tracking',
        'compliance_reporting'
      ]
    },
    decision_authority: {
      approval_limit: 15000,
      payroll_authorization: true,
      benefits_changes: false,
      tax_filing: true
    },
    working_config: {
      availability_24_7: false,
      working_hours: { start: '08:00', end: '17:00', timezone: 'Asia/Riyadh' },
      expected_response_time: 30,
      max_concurrent_tasks: 8,
      escalation_threshold: 7500
    }
  },
  BOOKKEEPER: {
    code: 'BOOKKEEPER_AGENT',
    name_en: 'Junior Accountant',
    name_ar: 'محاسب مبتدئ',
    level: 3,
    type: 'operational' as const,
    reports_to: 'SR_ACCOUNTANT_AGENT',
    supervises: [],
    capabilities: {
      primary: [
        'data_entry',
        'document_filing',
        'basic_reconciliation',
        'administrative_support',
        'transaction_recording'
      ],
      secondary: [
        'document_scanning',
        'basic_reporting',
        'system_maintenance'
      ]
    },
    decision_authority: {
      approval_limit: 1000,
      data_entry_authority: true,
      basic_corrections: true,
      document_management: true
    },
    working_config: {
      availability_24_7: true,
      expected_response_time: 5,
      max_concurrent_tasks: 25,
      escalation_threshold: 500
    }
  }
} as const;

export const AI_AGENT_CAPABILITIES = {
  // Financial Capabilities
  INVOICE_PROCESSING: {
    code: 'invoice_processing',
    name: 'Invoice Processing',
    category: 'financial' as const,
    method: 'llm' as const,
    config: {
      llm_model: 'gpt-4',
      confidence_threshold: 0.90,
      validation_rules: ['amount_validation', 'vendor_verification', 'duplicate_check'],
      approval_workflow: true,
      auto_posting: false
    }
  },
  PAYMENT_PROCESSING: {
    code: 'payment_processing',
    name: 'Payment Processing',
    category: 'financial' as const,
    method: 'rule_based' as const,
    config: {
      approval_matrix: true,
      fraud_detection: true,
      batch_processing: true,
      settlement_tracking: true
    }
  },
  FINANCIAL_ANALYSIS: {
    code: 'financial_analysis',
    name: 'Financial Analysis',
    category: 'analytical' as const,
    method: 'llm' as const,
    config: {
      llm_model: 'gpt-4',
      analysis_depth: 'comprehensive',
      trend_analysis: true,
      comparative_analysis: true,
      predictive_modeling: true
    }
  },
  COMPLIANCE_MONITORING: {
    code: 'compliance_monitoring',
    name: 'Compliance Monitoring',
    category: 'operational' as const,
    method: 'rule_based' as const,
    config: {
      regulatory_frameworks: ['IFRS', 'GAAP', 'Saudi_SOCPA'],
      real_time_monitoring: true,
      alert_system: true,
      audit_trail: true
    }
  }
} as const;

export const AI_BUSINESS_RULES = {
  // Approval Rules
  AUTO_APPROVE_SMALL_INVOICES: {
    code: 'auto_approve_small_invoices',
    name: 'Auto Approve Small Invoices',
    category: 'approval' as const,
    conditions: {
      amount: { less_than: 1000 },
      vendor: { verified: true },
      budget: { available: true },
      duplicate_check: { passed: true }
    },
    actions: {
      approve: true,
      create_journal_entry: true,
      schedule_payment: true,
      notify_stakeholders: false
    },
    applicable_roles: ['AP_SPECIALIST_AGENT']
  },
  ESCALATE_LARGE_PAYMENTS: {
    code: 'escalate_large_payments',
    name: 'Escalate Large Payments',
    category: 'escalation' as const,
    conditions: {
      amount: { greater_than: 50000 },
      approval_required: true
    },
    actions: {
      escalate_to: 'CONTROLLER_AGENT',
      hold_processing: true,
      notify_approver: true,
      set_priority: 'high'
    },
    applicable_roles: ['AP_SPECIALIST_AGENT', 'AR_SPECIALIST_AGENT']
  },
  OVERDUE_COLLECTION_AUTOMATION: {
    code: 'overdue_collection_automation',
    name: 'Overdue Collection Automation',
    category: 'automation' as const,
    conditions: {
      days_overdue: { greater_than: 30 },
      customer_status: 'active',
      previous_reminders: { less_than: 3 }
    },
    actions: {
      send_reminder: true,
      apply_late_fee: true,
      escalate_after_days: 60,
      update_credit_status: true
    },
    applicable_roles: ['AR_SPECIALIST_AGENT']
  }
} as const;

export const AI_WORKFLOW_TEMPLATES = {
  INVOICE_TO_PAYMENT: {
    code: 'invoice_to_payment_workflow',
    name: 'Invoice to Payment Workflow',
    trigger: 'invoice_received',
    steps: [
      {
        step: 1,
        agent: 'AP_SPECIALIST_AGENT',
        action: 'validate_invoice',
        timeout: 300,
        retry_attempts: 2
      },
      {
        step: 2,
        agent: 'SR_ACCOUNTANT_AGENT',
        action: 'create_journal_entry',
        timeout: 180,
        depends_on: [1]
      },
      {
        step: 3,
        agent: 'AP_SPECIALIST_AGENT',
        action: 'schedule_payment',
        timeout: 120,
        depends_on: [2]
      },
      {
        step: 4,
        agent: 'CONTROLLER_AGENT',
        action: 'approve_payment',
        timeout: 600,
        depends_on: [3],
        conditional: { amount: { greater_than: 10000 } }
      }
    ]
  },
  MONTH_END_CLOSE: {
    code: 'month_end_close_workflow',
    name: 'Month End Close Workflow',
    trigger: 'schedule_monthly',
    steps: [
      {
        step: 1,
        agent: 'SR_ACCOUNTANT_AGENT',
        action: 'reconcile_bank_accounts',
        timeout: 1800,
        parallel: true
      },
      {
        step: 2,
        agent: 'AR_SPECIALIST_AGENT',
        action: 'reconcile_ar_accounts',
        timeout: 1200,
        parallel: true
      },
      {
        step: 3,
        agent: 'AP_SPECIALIST_AGENT',
        action: 'reconcile_ap_accounts',
        timeout: 1200,
        parallel: true
      },
      {
        step: 4,
        agent: 'CONTROLLER_AGENT',
        action: 'generate_financial_statements',
        timeout: 3600,
        depends_on: [1, 2, 3]
      },
      {
        step: 5,
        agent: 'CFO_AGENT',
        action: 'review_and_approve',
        timeout: 7200,
        depends_on: [4]
      }
    ]
  }
} as const;

export const AI_PROMPT_TEMPLATES = {
  INVOICE_ANALYSIS: {
    code: 'invoice_analysis_prompt',
    category: 'analysis' as const,
    language: 'en',
    template: `
Analyze the following invoice data and provide a comprehensive assessment:

Invoice Data: {invoice_data}

Please analyze:
1. Invoice validity and completeness
2. Amount accuracy and calculations
3. Vendor verification status
4. Compliance with company policies
5. Potential risks or red flags

Provide your analysis in JSON format with confidence scores for each assessment.
    `,
    config: {
      temperature: 0.3,
      max_tokens: 1000,
      response_format: 'json'
    }
  },
  PAYMENT_DECISION: {
    code: 'payment_decision_prompt',
    category: 'decision' as const,
    language: 'en',
    template: `
As a finance AI agent, evaluate this payment request and make a recommendation:

Payment Details: {payment_data}
Business Rules: {business_rules}
Current Context: {context}

Consider:
1. Amount and approval authority
2. Vendor relationship and history
3. Budget availability
4. Compliance requirements
5. Risk factors

Provide your decision (approve/reject/escalate) with detailed reasoning.
    `,
    config: {
      temperature: 0.2,
      max_tokens: 800,
      response_format: 'structured'
    }
  }
} as const;

// Export all configurations as a single object
export const AI_AGENT_CONFIG = {
  layers: AI_AGENT_LAYERS,
  roles: AI_AGENT_ROLES,
  capabilities: AI_AGENT_CAPABILITIES,
  business_rules: AI_BUSINESS_RULES,
  workflow_templates: AI_WORKFLOW_TEMPLATES,
  prompt_templates: AI_PROMPT_TEMPLATES
} as const;

// Type definitions
export type AIAgentLayerCode = keyof typeof AI_AGENT_LAYERS;
export type AIAgentRoleCode = keyof typeof AI_AGENT_ROLES;
export type AIAgentCapabilityCode = keyof typeof AI_AGENT_CAPABILITIES;
export type AIBusinessRuleCode = keyof typeof AI_BUSINESS_RULES;
export type AIWorkflowTemplateCode = keyof typeof AI_WORKFLOW_TEMPLATES;
export type AIPromptTemplateCode = keyof typeof AI_PROMPT_TEMPLATES;
