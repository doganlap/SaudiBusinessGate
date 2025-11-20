/**
 * Solution Module Type Definitions
 * RFP and Solutioning Platform
 */

export interface RFP {
  id: string;
  tenant_id: string;
  rfp_number: string;
  title: string;
  description?: string;
  client_name: string;
  client_industry?: string;
  sector?: string;
  language: 'ar' | 'en' | 'both';
  received_date: string;
  submission_deadline?: string;
  status: 'intake' | 'qualified' | 'solution_design' | 'proposal' | 'review' | 'approved' | 'submitted' | 'won' | 'lost';
  qualification_score?: number;
  win_probability?: number;
  tags?: string[];
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface RFPTag {
  sector?: string;
  industry?: string;
  language?: string;
  complexity?: 'low' | 'medium' | 'high';
  revenue_potential?: 'low' | 'medium' | 'high';
  strategic_fit?: 'low' | 'medium' | 'high';
}

export interface SolutionDesign {
  id: string;
  rfp_id: string;
  tenant_id: string;
  selected_modules: string[]; // e.g., ['finance', 'sales', 'hr', 'procurement']
  custom_modules?: string[];
  value_propositions?: string[];
  estimated_timeline?: string;
  complexity_assessment?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  rfp_id: string;
  solution_design_id: string;
  tenant_id: string;
  proposal_number: string;
  title: string;
  content_blocks: ContentBlock[];
  pricing?: PricingSection;
  compliance?: ComplianceSection;
  localization?: LocalizationSection;
  status: 'draft' | 'review' | 'approved' | 'submitted';
  submitted_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  type: 'executive_summary' | 'solution_overview' | 'module_description' | 'pricing' | 'timeline' | 'compliance' | 'custom';
  title: string;
  content: string;
  language: 'ar' | 'en' | 'both';
  order: number;
  template_id?: string;
}

export interface PricingSection {
  base_price: number;
  currency: string;
  modules: {
    module_name: string;
    price: number;
    quantity?: number;
  }[];
  total_price: number;
  payment_terms?: string;
}

export interface ComplianceSection {
  standards: string[]; // e.g., ['ISO 27001', 'SOC 2', 'GDPR']
  certifications: string[];
  data_residency?: string;
  security_requirements?: string[];
}

export interface LocalizationSection {
  languages: string[];
  rtl_support: boolean;
  currency: string;
  date_format: string;
  timezone: string;
}

export interface ProposalReview {
  id: string;
  proposal_id: string;
  reviewer_id: string;
  section: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  comments?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface RFPAnalytics {
  total_rfps: number;
  active_rfps: number;
  qualified_rfps: number;
  submitted_proposals: number;
  win_rate: number;
  avg_qualification_score: number;
  avg_win_probability: number;
  by_sector: { sector: string; count: number; win_rate: number }[];
  by_status: { status: string; count: number }[];
  by_module: { module: string; usage_count: number; win_rate: number }[];
  recent_activity: RFP[];
}

export interface ContentTemplate {
  id: string;
  tenant_id: string;
  name: string;
  type: 'executive_summary' | 'solution_overview' | 'module_description' | 'pricing' | 'timeline' | 'compliance' | 'custom';
  content: string;
  language: 'ar' | 'en' | 'both';
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QualificationCriteria {
  strategic_fit_weight: number;
  revenue_potential_weight: number;
  delivery_complexity_weight: number;
  client_size_weight: number;
  timeline_feasibility_weight: number;
}

export interface SolutionSuggestion {
  module: string;
  confidence: number;
  reasoning: string;
  past_wins: number;
}

