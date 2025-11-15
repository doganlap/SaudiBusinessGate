/**
 * GRC Workflow Engines
 * Dynamic workflow management for Control Administration
 */

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  actor: string;
  required_fields: string[];
  next_steps: string[];
  conditions?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  initial_step: string;
}

// WF-C1: New Control Workflow
export const newControlWorkflow: WorkflowDefinition = {
  id: 'new-control',
  name: 'New Control Creation',
  description: 'Complete workflow for creating and approving new controls',
  initial_step: 'draft',
  steps: [
    {
      id: 'draft',
      name: 'Draft Control',
      description: 'Create initial control definition',
      actor: 'control_owner',
      required_fields: ['code', 'title_en', 'objective_en', 'domain', 'control_type', 'control_nature', 'frequency'],
      next_steps: ['submit_review']
    },
    {
      id: 'submit_review',
      name: 'Submit for Review',
      description: 'Submit control for design review',
      actor: 'control_owner',
      required_fields: ['evidence_requirements', 'test_strategy'],
      next_steps: ['design_review']
    },
    {
      id: 'design_review',
      name: 'Design Review',
      description: 'Compliance officer reviews control design',
      actor: 'compliance_officer',
      required_fields: ['review_comments'],
      next_steps: ['approve_design', 'reject_design']
    },
    {
      id: 'approve_design',
      name: 'Approve Design',
      description: 'Control design approved',
      actor: 'compliance_officer',
      required_fields: [],
      next_steps: ['implementation_plan']
    },
    {
      id: 'reject_design',
      name: 'Reject Design',
      description: 'Control design rejected, return to draft',
      actor: 'compliance_officer',
      required_fields: ['rejection_reason'],
      next_steps: ['draft']
    },
    {
      id: 'implementation_plan',
      name: 'Create Implementation Plan',
      description: 'Define implementation tasks and schedule',
      actor: 'control_owner',
      required_fields: ['implementation_tasks', 'schedule'],
      next_steps: ['ready']
    },
    {
      id: 'ready',
      name: 'Ready for Operation',
      description: 'Control is ready to operate',
      actor: 'system',
      required_fields: [],
      next_steps: ['operating']
    }
  ]
};

// WF-C2: Evidence & Attestation Workflow
export const evidenceAttestationWorkflow: WorkflowDefinition = {
  id: 'evidence-attestation',
  name: 'Evidence Collection & Attestation',
  description: 'Workflow for collecting and validating control evidence',
  initial_step: 'schedule_event',
  steps: [
    {
      id: 'schedule_event',
      name: 'Schedule Evidence Collection',
      description: 'System schedules evidence collection based on control frequency',
      actor: 'system',
      required_fields: ['due_date'],
      next_steps: ['notify_owner']
    },
    {
      id: 'notify_owner',
      name: 'Notify Control Owner',
      description: 'Send notification to control owner',
      actor: 'system',
      required_fields: [],
      next_steps: ['collect_evidence']
    },
    {
      id: 'collect_evidence',
      name: 'Collect Evidence',
      description: 'Control owner uploads evidence',
      actor: 'control_owner',
      required_fields: ['evidence_files'],
      next_steps: ['auto_validation']
    },
    {
      id: 'auto_validation',
      name: 'Auto Validation',
      description: 'System performs automatic validation checks',
      actor: 'system',
      required_fields: [],
      next_steps: ['attest', 'validation_failed']
    },
    {
      id: 'validation_failed',
      name: 'Validation Failed',
      description: 'Evidence failed validation, return to collection',
      actor: 'system',
      required_fields: ['validation_errors'],
      next_steps: ['collect_evidence']
    },
    {
      id: 'attest',
      name: 'Owner Attestation',
      description: 'Control owner attests to evidence completeness',
      actor: 'control_owner',
      required_fields: ['attestation', 'comments'],
      next_steps: ['reviewer_accept']
    },
    {
      id: 'reviewer_accept',
      name: 'Reviewer Acceptance',
      description: 'Reviewer accepts evidence',
      actor: 'reviewer',
      required_fields: ['acceptance_decision'],
      next_steps: ['complete', 'request_additional']
    },
    {
      id: 'request_additional',
      name: 'Request Additional Evidence',
      description: 'Reviewer requests additional evidence',
      actor: 'reviewer',
      required_fields: ['additional_requirements'],
      next_steps: ['collect_evidence']
    },
    {
      id: 'complete',
      name: 'Evidence Complete',
      description: 'Evidence collection completed successfully',
      actor: 'system',
      required_fields: [],
      next_steps: []
    }
  ]
};

// WF-C3: Testing Workflow
export const testingWorkflow: WorkflowDefinition = {
  id: 'control-testing',
  name: 'Control Testing',
  description: 'Workflow for planning and executing control tests',
  initial_step: 'plan_test',
  steps: [
    {
      id: 'plan_test',
      name: 'Plan Test',
      description: 'Create test plan with objectives and procedures',
      actor: 'tester',
      required_fields: ['test_objective', 'test_procedure', 'population_description'],
      next_steps: ['sample_selection']
    },
    {
      id: 'sample_selection',
      name: 'Sample Selection',
      description: 'Select sample for testing',
      actor: 'tester',
      required_fields: ['sample_plan', 'sample_size'],
      next_steps: ['perform_test']
    },
    {
      id: 'perform_test',
      name: 'Perform Test',
      description: 'Execute test procedures on selected samples',
      actor: 'tester',
      required_fields: ['test_results', 'sample_results'],
      next_steps: ['record_results']
    },
    {
      id: 'record_results',
      name: 'Record Results',
      description: 'Document test results and findings',
      actor: 'tester',
      required_fields: ['overall_result', 'findings'],
      next_steps: ['review_results']
    },
    {
      id: 'review_results',
      name: 'Review Results',
      description: 'Independent review of test results (SoD)',
      actor: 'reviewer',
      required_fields: ['review_decision'],
      next_steps: ['approve_results', 'reject_results']
    },
    {
      id: 'approve_results',
      name: 'Approve Results',
      description: 'Test results approved',
      actor: 'reviewer',
      required_fields: [],
      next_steps: ['complete_test']
    },
    {
      id: 'reject_results',
      name: 'Reject Results',
      description: 'Test results rejected, return to testing',
      actor: 'reviewer',
      required_fields: ['rejection_reason'],
      next_steps: ['perform_test']
    },
    {
      id: 'complete_test',
      name: 'Complete Test',
      description: 'Test completed successfully',
      actor: 'system',
      required_fields: [],
      next_steps: []
    }
  ]
};

// WF-C4: Exception Management Workflow
export const exceptionManagementWorkflow: WorkflowDefinition = {
  id: 'exception-management',
  name: 'Exception Management',
  description: 'Workflow for managing control exceptions and compensating controls',
  initial_step: 'create_exception',
  steps: [
    {
      id: 'create_exception',
      name: 'Create Exception',
      description: 'Request control exception with business justification',
      actor: 'control_owner',
      required_fields: ['exception_type', 'reason', 'business_justification', 'start_date'],
      next_steps: ['risk_assessment']
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment',
      description: 'Assess risk impact of exception',
      actor: 'risk_manager',
      required_fields: ['risk_assessment', 'impact_analysis'],
      next_steps: ['define_compensating']
    },
    {
      id: 'define_compensating',
      name: 'Define Compensating Controls',
      description: 'Define compensating controls to mitigate risk',
      actor: 'control_owner',
      required_fields: ['compensating_controls'],
      next_steps: ['approval_gate']
    },
    {
      id: 'approval_gate',
      name: 'Exception Approval',
      description: 'Risk manager or compliance officer approves exception',
      actor: 'risk_manager',
      required_fields: ['approval_decision'],
      next_steps: ['approve_exception', 'reject_exception']
    },
    {
      id: 'approve_exception',
      name: 'Approve Exception',
      description: 'Exception approved and activated',
      actor: 'risk_manager',
      required_fields: ['review_frequency'],
      next_steps: ['active_exception']
    },
    {
      id: 'reject_exception',
      name: 'Reject Exception',
      description: 'Exception rejected',
      actor: 'risk_manager',
      required_fields: ['rejection_reason'],
      next_steps: ['create_exception']
    },
    {
      id: 'active_exception',
      name: 'Active Exception',
      description: 'Exception is active and being monitored',
      actor: 'system',
      required_fields: [],
      next_steps: ['review_exception', 'expire_exception']
    },
    {
      id: 'review_exception',
      name: 'Review Exception',
      description: 'Periodic review of active exception',
      actor: 'risk_manager',
      required_fields: ['review_outcome'],
      next_steps: ['renew_exception', 'close_exception']
    },
    {
      id: 'renew_exception',
      name: 'Renew Exception',
      description: 'Exception renewed for another period',
      actor: 'risk_manager',
      required_fields: ['new_end_date'],
      next_steps: ['active_exception']
    },
    {
      id: 'expire_exception',
      name: 'Exception Expired',
      description: 'Exception has expired automatically',
      actor: 'system',
      required_fields: [],
      next_steps: ['close_exception']
    },
    {
      id: 'close_exception',
      name: 'Close Exception',
      description: 'Exception closed and archived',
      actor: 'system',
      required_fields: ['closure_reason'],
      next_steps: []
    }
  ]
};

// WF-C5: Change Control Workflow
export const changeControlWorkflow: WorkflowDefinition = {
  id: 'change-control',
  name: 'Control Change Management',
  description: 'Workflow for managing changes to existing controls',
  initial_step: 'create_change_request',
  steps: [
    {
      id: 'create_change_request',
      name: 'Create Change Request',
      description: 'Submit request to change existing control',
      actor: 'control_owner',
      required_fields: ['change_description', 'change_justification', 'proposed_changes'],
      next_steps: ['impact_analysis']
    },
    {
      id: 'impact_analysis',
      name: 'Impact Analysis',
      description: 'Analyze impact on frameworks, assessments, and reports',
      actor: 'compliance_officer',
      required_fields: ['impact_matrix', 'affected_frameworks'],
      next_steps: ['approval_chain']
    },
    {
      id: 'approval_chain',
      name: 'Approval Chain',
      description: 'Multi-level approval based on change impact',
      actor: 'approver',
      required_fields: ['approval_decision'],
      next_steps: ['approve_change', 'reject_change']
    },
    {
      id: 'approve_change',
      name: 'Approve Change',
      description: 'Change request approved',
      actor: 'approver',
      required_fields: [],
      next_steps: ['implement_change']
    },
    {
      id: 'reject_change',
      name: 'Reject Change',
      description: 'Change request rejected',
      actor: 'approver',
      required_fields: ['rejection_reason'],
      next_steps: ['create_change_request']
    },
    {
      id: 'implement_change',
      name: 'Implement Change',
      description: 'Apply changes to control',
      actor: 'control_owner',
      required_fields: ['implementation_notes'],
      next_steps: ['version_bump']
    },
    {
      id: 'version_bump',
      name: 'Version Control',
      description: 'Update control version and maintain history',
      actor: 'system',
      required_fields: [],
      next_steps: ['notify_stakeholders']
    },
    {
      id: 'notify_stakeholders',
      name: 'Notify Stakeholders',
      description: 'Notify affected stakeholders of changes',
      actor: 'system',
      required_fields: [],
      next_steps: ['complete_change']
    },
    {
      id: 'complete_change',
      name: 'Complete Change',
      description: 'Change implementation completed',
      actor: 'system',
      required_fields: [],
      next_steps: []
    }
  ]
};

// Workflow Engine Class
export class GRCWorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();

  constructor() {
    // Register all workflows
    this.registerWorkflow(newControlWorkflow);
    this.registerWorkflow(evidenceAttestationWorkflow);
    this.registerWorkflow(testingWorkflow);
    this.registerWorkflow(exceptionManagementWorkflow);
    this.registerWorkflow(changeControlWorkflow);
  }

  registerWorkflow(workflow: WorkflowDefinition) {
    this.workflows.set(workflow.id, workflow);
  }

  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  getNextSteps(workflowId: string, currentStep: string): WorkflowStep[] {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return [];

    const step = workflow.steps.find(s => s.id === currentStep);
    if (!step) return [];

    return workflow.steps.filter(s => step.next_steps.includes(s.id));
  }

  validateStepTransition(workflowId: string, fromStep: string, toStep: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    const step = workflow.steps.find(s => s.id === fromStep);
    if (!step) return false;

    return step.next_steps.includes(toStep);
  }

  getRequiredFields(workflowId: string, stepId: string): string[] {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return [];

    const step = workflow.steps.find(s => s.id === stepId);
    return step?.required_fields || [];
  }

  getStepActor(workflowId: string, stepId: string): string | undefined {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return undefined;

    const step = workflow.steps.find(s => s.id === stepId);
    return step?.actor;
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }
}

// Export singleton instance
export const grcWorkflowEngine = new GRCWorkflowEngine();
