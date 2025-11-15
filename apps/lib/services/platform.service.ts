import { query, transaction, PoolClient } from '@/lib/db/connection';

export interface PlatformTenant {
  id: string;
  tenant_id: string;
  tenant_name: string;
  domain?: string;
  subdomain?: string;
  status: 'active' | 'suspended' | 'inactive' | 'trial';
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at?: string;
  subscription_ends_at?: string;
  max_users: number;
  current_users: number;
  storage_limit_gb: number;
  storage_used_gb: number;
  company_name?: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  timezone: string;
  currency: string;
  date_format: string;
  language: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_css?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PlatformUser {
  id: string;
  tenant_id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  password_hash?: string;
  email_verified: boolean;
  email_verified_at?: string;
  avatar_url?: string;
  phone?: string;
  title?: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  is_super_admin: boolean;
  accessible_tenants: string[];
  last_login_at?: string;
  last_login_ip?: string;
  login_count: number;
  two_factor_enabled: boolean;
  timezone?: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PlatformSetting {
  id: string;
  tenant_id: string;
  category: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  is_encrypted: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export class PlatformService {
  // TENANT MANAGEMENT
  
  static async getTenants(filters?: {
    status?: string;
    subscription_plan?: string;
    limit?: number;
    offset?: number;
  }): Promise<PlatformTenant[]> {
    let sql = 'SELECT * FROM platform_tenants WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.subscription_plan) {
      sql += ` AND subscription_plan = $${paramIndex}`;
      params.push(filters.subscription_plan);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<PlatformTenant>(sql, params);
    return result.rows;
  }

  static async getTenantById(tenantId: string): Promise<PlatformTenant | null> {
    const result = await query<PlatformTenant>(
      'SELECT * FROM platform_tenants WHERE tenant_id = $1',
      [tenantId]
    );
    return result.rows[0] || null;
  }

  static async createTenant(tenantData: Omit<PlatformTenant, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformTenant> {
    const result = await query<PlatformTenant>(
      `INSERT INTO platform_tenants (
        tenant_id, tenant_name, domain, subdomain, status, subscription_plan, 
        subscription_status, max_users, current_users, storage_limit_gb, storage_used_gb,
        company_name, contact_email, contact_phone, billing_email, address, city, state, 
        country, postal_code, timezone, currency, date_format, language, logo_url,
        primary_color, secondary_color, custom_css, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *`,
      [
        tenantData.tenant_id, tenantData.tenant_name, tenantData.domain, tenantData.subdomain,
        tenantData.status, tenantData.subscription_plan, tenantData.subscription_status,
        tenantData.max_users, tenantData.current_users, tenantData.storage_limit_gb, tenantData.storage_used_gb,
        tenantData.company_name, tenantData.contact_email, tenantData.contact_phone, tenantData.billing_email,
        tenantData.address, tenantData.city, tenantData.state, tenantData.country, tenantData.postal_code,
        tenantData.timezone, tenantData.currency, tenantData.date_format, tenantData.language,
        tenantData.logo_url, tenantData.primary_color, tenantData.secondary_color, tenantData.custom_css,
        tenantData.created_by
      ]
    );
    return result.rows[0];
  }

  static async updateTenant(tenantId: string, updates: Partial<PlatformTenant>): Promise<PlatformTenant | null> {
    const setClause = [];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'tenant_id' && key !== 'created_at' && key !== 'updated_at') {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) return null;

    const sql = `
      UPDATE platform_tenants 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1
      RETURNING *
    `;

    const result = await query<PlatformTenant>(sql, params);
    return result.rows[0] || null;
  }

  static async deleteTenant(tenantId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM platform_tenants WHERE tenant_id = $1',
      [tenantId]
    );
    return (result.rowCount || 0) > 0;
  }

  // USER MANAGEMENT

  static async getUsers(tenantId: string, filters?: {
    status?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<PlatformUser[]> {
    let sql = 'SELECT * FROM platform_users WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.role) {
      sql += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<PlatformUser>(sql, params);
    return result.rows;
  }

  static async getUserById(tenantId: string, userId: string): Promise<PlatformUser | null> {
    const result = await query<PlatformUser>(
      'SELECT * FROM platform_users WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId]
    );
    return result.rows[0] || null;
  }

  static async createUser(tenantId: string, userData: Omit<PlatformUser, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<PlatformUser> {
    const result = await query<PlatformUser>(
      `INSERT INTO platform_users (
        tenant_id, user_id, email, first_name, last_name, password_hash, email_verified,
        avatar_url, phone, title, department, status, role, permissions, is_super_admin,
        accessible_tenants, two_factor_enabled, timezone, language, theme, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        tenantId, userData.user_id, userData.email, userData.first_name, userData.last_name,
        userData.password_hash, userData.email_verified, userData.avatar_url, userData.phone,
        userData.title, userData.department, userData.status, userData.role, userData.permissions,
        userData.is_super_admin, userData.accessible_tenants, userData.two_factor_enabled,
        userData.timezone, userData.language, userData.theme, userData.created_by
      ]
    );
    return result.rows[0];
  }

  static async updateUser(tenantId: string, userId: string, updates: Partial<PlatformUser>): Promise<PlatformUser | null> {
    const setClause = [];
    const params: any[] = [tenantId, userId];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'tenant_id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) return null;

    const sql = `
      UPDATE platform_users 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query<PlatformUser>(sql, params);
    return result.rows[0] || null;
  }

  static async deleteUser(tenantId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM platform_users WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  // SETTINGS MANAGEMENT

  static async getSettings(tenantId: string, category?: string): Promise<PlatformSetting[]> {
    let sql = 'SELECT * FROM platform_settings WHERE tenant_id = $1';
    const params: any[] = [tenantId];

    if (category) {
      sql += ' AND category = $2';
      params.push(category);
    }

    sql += ' ORDER BY category, setting_key';

    const result = await query<PlatformSetting>(sql, params);
    return result.rows;
  }

  static async getSetting(tenantId: string, category: string, key: string): Promise<PlatformSetting | null> {
    const result = await query<PlatformSetting>(
      'SELECT * FROM platform_settings WHERE tenant_id = $1 AND category = $2 AND setting_key = $3',
      [tenantId, category, key]
    );
    return result.rows[0] || null;
  }

  static async setSetting(tenantId: string, category: string, key: string, value: string, type: string = 'string'): Promise<PlatformSetting> {
    const result = await query<PlatformSetting>(
      `INSERT INTO platform_settings (tenant_id, category, setting_key, setting_value, setting_type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id, category, setting_key)
       DO UPDATE SET setting_value = $4, setting_type = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [tenantId, category, key, value, type]
    );
    return result.rows[0];
  }

  // ANALYTICS AND REPORTING

  static async getTenantStats(): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
        COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_tenants,
        COUNT(CASE WHEN subscription_plan = 'enterprise' THEN 1 END) as enterprise_tenants,
        COUNT(CASE WHEN subscription_plan = 'professional' THEN 1 END) as professional_tenants,
        COUNT(CASE WHEN subscription_plan = 'basic' THEN 1 END) as basic_tenants,
        SUM(current_users) as total_users,
        SUM(storage_used_gb) as total_storage_used
      FROM platform_tenants
    `);
    return result.rows[0];
  }

  static async getUserStats(tenantId: string): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'tenant_admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN is_super_admin = true THEN 1 END) as super_admin_users,
        COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as users_with_2fa
      FROM platform_users 
      WHERE tenant_id = $1
    `, [tenantId]);
    return result.rows[0];
  }
}
