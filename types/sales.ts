export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: string;
  score: number;
  estimated_value: number;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  lead_id?: string;
  title: string;
  description?: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  customer_name?: string;
  customer_email?: string;
  customer_company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  tenant_id: string;
  deal_id?: string;
  customer_id: string;
  quote_number: string;
  status: string;
  total_amount: number;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface RFQ {
  id: string;
  tenant_id: string;
  customer_id: string;
  rfq_number: string;
  status: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  tenant_id: string;
  quote_id?: string;
  deal_id?: string;
  lead_id?: string;
  title: string;
  content?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalSection {
  id: string;
  proposal_id: string;
  title: string;
  content?: string;
  sort_order: number;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  content?: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  deal_id?: string;
  title: string;
  content?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  quote_id?: string;
  contract_id?: string;
  order_number: string;
  status: string;
  total_amount: number;
  order_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}