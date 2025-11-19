import { NextRequest, NextResponse } from 'next/server';
import { PlatformService } from '@/lib/services/platform.service';
import { AccessControlService } from '@/lib/services/access-control.service';
import { query } from '@/lib/db/connection';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const subscription_plan = searchParams.get('subscription_plan') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Get tenants from database
    const tenants = await PlatformService.getTenants({
      status,
      subscription_plan,
      limit,
      offset
    });
    
    // Get tenant statistics
    const stats = await PlatformService.getTenantStats();
    
    return NextResponse.json({
      success: true,
      tenants,
      total: tenants.length,
      stats: {
        totalTenants: parseInt(stats.total_tenants) || 0,
        activeTenants: parseInt(stats.active_tenants) || 0,
        trialTenants: parseInt(stats.trial_tenants) || 0,
        enterpriseTenants: parseInt(stats.enterprise_tenants) || 0,
        professionalTenants: parseInt(stats.professional_tenants) || 0,
        basicTenants: parseInt(stats.basic_tenants) || 0,
        totalUsers: parseInt(stats.total_users) || 0,
        totalStorageUsed: parseFloat(stats.total_storage_used) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    
    // Fallback to sample data if database is not available
    const fallbackTenants = [
      {
        id: '1', tenant_id: 'default-tenant', tenant_name: 'Default Organization',
        status: 'active', subscription_plan: 'enterprise', subscription_status: 'active',
        max_users: 100, current_users: 15, storage_limit_gb: 100, storage_used_gb: 25.5,
        company_name: 'Default Company', contact_email: 'admin@default.com',
        country: 'US', timezone: 'UTC', currency: 'USD', date_format: 'MM/DD/YYYY',
        language: 'en', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2', tenant_id: 'demo-tenant', tenant_name: 'Demo Organization',
        status: 'trial', subscription_plan: 'professional', subscription_status: 'trial',
        max_users: 25, current_users: 5, storage_limit_gb: 50, storage_used_gb: 8.2,
        company_name: 'Demo Company', contact_email: 'demo@demo.com',
        country: 'US', timezone: 'UTC', currency: 'USD', date_format: 'MM/DD/YYYY',
        language: 'en', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
      }
    ];
    
    return NextResponse.json({
      success: true,
      tenants: fallbackTenants,
      total: fallbackTenants.length,
      fallback: true,
      stats: {
        totalTenants: 2, activeTenants: 1, trialTenants: 1,
        enterpriseTenants: 1, professionalTenants: 1, basicTenants: 0,
        totalUsers: 20, totalStorageUsed: 33.7
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate unique tenant ID if not provided
    const tenantId = body.tenant_id || `tenant-${Date.now()}`;
    
    // Map registration form fields to tenant data
    // Support both registration form field names and direct tenant field names
    const subscriptionPlan = body.subscription_plan || body.subscription_tier || 'basic';
    
    // Get max_users based on subscription plan if not provided
    const getMaxUsers = (plan: string) => {
      if (body.max_users) return body.max_users;
      switch (plan) {
        case 'basic': return 10;
        case 'professional': return 25;
        case 'enterprise': return 1000;
        default: return 10;
      }
    };
    
    // Create tenant in database
    const newTenant = await PlatformService.createTenant({
      tenant_id: tenantId,
      tenant_name: body.tenant_name || body.company_name || 'New Tenant',
      domain: body.domain,
      subdomain: body.subdomain,
      status: body.status || 'trial',
      subscription_plan: subscriptionPlan,
      subscription_status: body.subscription_status || 'trial',
      max_users: getMaxUsers(subscriptionPlan),
      current_users: 0,
      storage_limit_gb: body.storage_limit_gb || (subscriptionPlan === 'enterprise' ? 1000 : subscriptionPlan === 'professional' ? 100 : 10),
      storage_used_gb: 0,
      company_name: body.company_name || body.tenant_name || 'New Company',
      contact_email: body.contact_email || body.primary_contact_email,
      contact_phone: body.contact_phone || body.primary_contact_phone,
      billing_email: body.billing_email || body.contact_email || body.primary_contact_email,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country || 'Saudi Arabia',
      postal_code: body.postal_code,
      timezone: body.timezone || 'Asia/Riyadh',
      currency: body.currency || 'SAR',
      date_format: body.date_format || 'DD/MM/YYYY',
      language: body.language || 'ar',
      logo_url: body.logo_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      custom_css: body.custom_css,
      created_by: body.created_by
    });
    
    // Create admin user if admin_email and admin_password are provided
    let adminUser = null;
    if (body.admin_email && body.admin_password) {
      try {
        const passwordHash = await bcrypt.hash(body.admin_password, 10);
        const contactName = body.primary_contact_name || body.contact_name || 'Admin';
        const nameParts = contactName.split(' ');
        const firstName = nameParts[0] || 'Admin';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        
        adminUser = await PlatformService.createUser(tenantId, {
          user_id: `user-${Date.now()}`,
          email: body.admin_email,
          first_name: firstName,
          last_name: lastName,
          full_name: contactName,
          password_hash: passwordHash,
          email_verified: false,
          phone: body.contact_phone || body.primary_contact_phone,
          status: 'active',
          role: 'tenant_admin',
          permissions: ['*'],
          is_super_admin: false,
          accessible_tenants: [tenantId],
          login_count: 0,
          two_factor_enabled: false,
          timezone: body.timezone || 'Asia/Riyadh',
          language: body.language || 'ar',
          theme: 'light',
          created_by: 'system'
        });
        
        // Assign tenant_admin role to the new admin user
        if (adminUser && adminUser.user_id) {
          try {
            // Get tenant_admin role (system role)
            const roles = await AccessControlService.getTenantRoles(tenantId);
            const tenantAdminRole = roles.find((r: any) => r.slug === 'tenant_admin');
            
            if (tenantAdminRole) {
              await AccessControlService.assignRole(
                tenantId,
                adminUser.user_id,
                tenantAdminRole.id,
                'system'
              );
            }
          } catch (roleError) {
            console.error('Error assigning role to admin user:', roleError);
            // Don't fail tenant creation if role assignment fails
          }
        }
      } catch (userError) {
        console.error('Error creating admin user:', userError);
        // Don't fail tenant creation if user creation fails
      }
    }
    
    return NextResponse.json({
      success: true,
      tenant: newTenant,
      adminUser: adminUser,
      message: 'Tenant created successfully'
    });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    const errorMessage = error?.message || 'Failed to create tenant';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('id');
    const body = await request.json();
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    // Update tenant in database
    const updatedTenant = await PlatformService.updateTenant(tenantId, body);
    
    if (!updatedTenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: 'Tenant updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('id');
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    // Delete tenant from database
    const deleted = await PlatformService.deleteTenant(tenantId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}
