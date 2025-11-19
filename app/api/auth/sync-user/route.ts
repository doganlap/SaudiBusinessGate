import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';

interface SyncUserRequest {
  microsoftId: string;
  email: string;
  name: string;
  jobTitle?: string;
  department?: string;
  preferredLanguage?: string;
}

interface DatabaseUser {
  id: string;
  microsoftId: string;
  email: string;
  name: string;
  nameAr?: string;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'user' | 'viewer';
  tenantId: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

// Database functions for user management
async function findUserByMicrosoftIdOrEmail(microsoftId: string, email: string): Promise<DatabaseUser | null> {
  try {
    const result = await query(
      `SELECT u.*, t.slug as tenant_slug 
       FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1 OR u.microsoft_id = $2 
       LIMIT 1`,
      [email, microsoftId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      microsoftId: row.microsoft_id,
      email: row.email,
      name: row.full_name,
      nameAr: row.full_name_ar,
      role: row.role,
      tenantId: row.tenant_id,
      department: row.department,
      jobTitle: row.job_title,
      isActive: row.is_active,
      lastLogin: row.last_login_at?.toISOString() || new Date().toISOString(),
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
      permissions: JSON.parse(row.permissions || '[]')
    };
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

async function updateUser(user: DatabaseUser): Promise<DatabaseUser | null> {
  try {
    const result = await query(
      `UPDATE users 
       SET full_name = $1, job_title = $2, department = $3, last_login_at = NOW(), updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [user.name, user.jobTitle, user.department, user.id]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...user,
      lastLogin: row.last_login_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

async function createUser(userData: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseUser | null> {
  try {
    // First, ensure tenant exists or create it
    let tenantResult = await query(
      'SELECT id FROM tenants WHERE id = $1',
      [userData.tenantId]
    );
    
    if (tenantResult.rows.length === 0) {
      // Create tenant if it doesn't exist
      await query(
        `INSERT INTO tenants (id, name, slug, contact_email, is_active) 
         VALUES ($1, $2, $3, $4, true)`,
        [userData.tenantId, userData.tenantId, userData.tenantId, userData.email]
      );
    }
    
    // Create user
    const result = await query(
      `INSERT INTO users (
         tenant_id, email, microsoft_id, full_name, full_name_ar, role, 
         department, job_title, permissions, is_active, last_login_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
       RETURNING *`,
      [
        userData.tenantId,
        userData.email,
        userData.microsoftId,
        userData.name,
        userData.nameAr,
        userData.role,
        userData.department,
        userData.jobTitle,
        JSON.stringify(userData.permissions)
      ]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      microsoftId: row.microsoft_id,
      email: row.email,
      name: row.full_name,
      nameAr: row.full_name_ar,
      role: row.role,
      tenantId: row.tenant_id,
      department: row.department,
      jobTitle: row.job_title,
      isActive: row.is_active,
      lastLogin: row.last_login_at?.toISOString() || new Date().toISOString(),
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
      permissions: JSON.parse(row.permissions || '[]')
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Role-based permissions mapping
const rolePermissions = {
  super_admin: [
    'platform.admin',
    'users.manage',
    'tenants.manage',
    'billing.manage',
    'security.manage',
    'data.export',
    'system.monitor',
    'api.manage',
    'backup.restore',
    'audit.view',
    'licensing.manage',
    'red_flags.manage',
    'ai_agents.manage',
    'workflows.manage',
    'vectorize.manage',
    'themes.manage'
  ],
  tenant_admin: [
    'users.manage',
    'licensing.manage',
    'red_flags.manage',
    'ai_agents.manage',
    'workflows.manage',
    'audit.view',
    'reports.generate',
    'vectorize.view',
    'themes.view'
  ],
  manager: [
    'red_flags.manage',
    'licensing.view',
    'ai_agents.view',
    'workflows.manage',
    'reports.generate',
    'audit.view'
  ],
  user: [
    'red_flags.view',
    'licensing.view',
    'ai_agents.view',
    'workflows.view',
    'reports.view'
  ],
  viewer: [
    'red_flags.view',
    'licensing.view',
    'ai_agents.view',
    'workflows.view'
  ]
};

// Determine user role based on email domain and job title
function determineUserRole(email: string, jobTitle?: string): 'super_admin' | 'tenant_admin' | 'manager' | 'user' | 'viewer' {
  // Super admin emails
  const superAdminEmails = ['admin@saudistore.com', 'superadmin@saudistore.com'];
  if (superAdminEmails.includes(email.toLowerCase())) {
    return 'super_admin';
  }

  // Admin emails or job titles
  const adminTitles = ['مدير', 'manager', 'director', 'مدير عام', 'ceo', 'cto', 'cfo'];
  if (jobTitle && adminTitles.some(title => jobTitle.toLowerCase().includes(title.toLowerCase()))) {
    return 'tenant_admin';
  }

  // Manager titles
  const managerTitles = ['مشرف', 'supervisor', 'lead', 'رئيس قسم', 'team lead'];
  if (jobTitle && managerTitles.some(title => jobTitle.toLowerCase().includes(title.toLowerCase()))) {
    return 'manager';
  }

  // Default to user
  return 'user';
}

// Determine tenant based on email domain
function determineTenant(email: string): string {
  const domain = email.split('@')[1];
  
  // Map domains to tenants
  const domainTenantMap: Record<string, string> = {
    'saudistore.com': 'saudi-store-main',
    'company.com': 'company-tenant',
    'organization.org': 'org-tenant'
  };

  return domainTenantMap[domain] || 'default-tenant';
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncUserRequest = await request.json();
    const { microsoftId, email, name, jobTitle, department, preferredLanguage } = body;

    // Validate required fields
    if (!microsoftId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: microsoftId, email, name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser = await findUserByMicrosoftIdOrEmail(microsoftId, email);

    if (existingUser) {
      // Update existing user
      existingUser.name = name;
      existingUser.jobTitle = jobTitle;
      existingUser.department = department;
      
      const updatedUser = await updateUser(existingUser);
      
      if (!updatedUser) {
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      console.log(`✅ User updated: ${updatedUser.email} (${updatedUser.role})`);
      
      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    }

    // Create new user
    const role = determineUserRole(email, jobTitle);
    const tenantId = determineTenant(email);
    const permissions = rolePermissions[role] || [];

    const newUserData = {
      microsoftId,
      email,
      name,
      nameAr: name, // يمكن تحسينه لاحقاً لترجمة الأسماء
      role,
      tenantId,
      department,
      jobTitle,
      isActive: true,
      lastLogin: new Date().toISOString(),
      permissions
    };

    // Create user in database
    const newUser = await createUser(newUserData);
    
    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log(`✅ New user created: ${newUser.email} (${newUser.role})`);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error syncing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}

// Get user by Microsoft ID or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const microsoftId = searchParams.get('microsoftId');
    const email = searchParams.get('email');

    if (!microsoftId && !email) {
      return NextResponse.json(
        { error: 'Either microsoftId or email is required' },
        { status: 400 }
      );
    }

    const user = await findUserByMicrosoftIdOrEmail(microsoftId || '', email || '');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('❌ Error getting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}
