// Database type definitions
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  subscription_tier: 'free' | 'basic' | 'business' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'expired';
  max_users: number;
  max_storage_gb: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  username?: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  license_tier: 'basic' | 'business' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  started_at: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}