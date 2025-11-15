import { NextRequest, NextResponse } from 'next/server';

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

// Mock database - في الإنتاج سيتم استبداله بقاعدة البيانات الحقيقية
const mockUsers: DatabaseUser[] = [
  {
    id: 'user-1',
    microsoftId: 'ms-user-1',
    email: 'admin@saudistore.com',
    name: 'أحمد محمد المدير',
    nameAr: 'أحمد محمد المدير',
    role: 'super_admin',
    tenantId: 'saudi-store-main',
    department: 'IT',
    jobTitle: 'مدير تقنية المعلومات',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    permissions: [
      'platform.admin',
      'users.manage',
      'tenants.manage',
      'billing.manage',
      'security.manage',
      'data.export',
      'system.monitor',
      'api.manage',
      'backup.restore',
      'audit.view'
    ]
  },
  {
    id: 'user-2',
    microsoftId: 'ms-user-2',
    email: 'manager@saudistore.com',
    name: 'فاطمة علي المديرة',
    nameAr: 'فاطمة علي المديرة',
    role: 'tenant_admin',
    tenantId: 'saudi-store-main',
    department: 'Operations',
    jobTitle: 'مديرة العمليات',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    permissions: [
      'users.manage',
      'licensing.manage',
      'red_flags.manage',
      'ai_agents.manage',
      'workflows.manage',
      'audit.view',
      'reports.generate'
    ]
  },
  {
    id: 'user-3',
    microsoftId: 'ms-user-3',
    email: 'user@saudistore.com',
    name: 'محمد سالم المستخدم',
    nameAr: 'محمد سالم المستخدم',
    role: 'user',
    tenantId: 'saudi-store-main',
    department: 'Finance',
    jobTitle: 'محاسب',
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    permissions: [
      'red_flags.view',
      'licensing.view',
      'ai_agents.view',
      'workflows.view',
      'reports.view'
    ]
  }
];

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
    let existingUser = mockUsers.find(user => 
      user.microsoftId === microsoftId || user.email === email
    );

    if (existingUser) {
      // Update existing user
      existingUser.lastLogin = new Date().toISOString();
      existingUser.updatedAt = new Date().toISOString();
      existingUser.name = name;
      existingUser.jobTitle = jobTitle;
      existingUser.department = department;

      console.log(`✅ User updated: ${existingUser.email} (${existingUser.role})`);
      
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User updated successfully'
      });
    }

    // Create new user
    const role = determineUserRole(email, jobTitle);
    const tenantId = determineTenant(email);
    const permissions = rolePermissions[role] || [];

    const newUser: DatabaseUser = {
      id: `user-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions
    };

    // Add to mock database
    mockUsers.push(newUser);

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

    const user = mockUsers.find(user => 
      (microsoftId && user.microsoftId === microsoftId) ||
      (email && user.email === email)
    );

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
