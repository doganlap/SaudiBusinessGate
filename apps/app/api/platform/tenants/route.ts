import { NextRequest, NextResponse } from 'next/server';
import { PlatformService } from '@/lib/services/platform.service';

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
    
    // Create tenant in database
    const newTenant = await PlatformService.createTenant({
      tenant_id: tenantId,
      tenant_name: body.tenant_name,
      domain: body.domain,
      subdomain: body.subdomain,
      status: body.status || 'trial',
      subscription_plan: body.subscription_plan || 'basic',
      subscription_status: body.subscription_status || 'trial',
      max_users: body.max_users || 10,
      current_users: 0,
      storage_limit_gb: body.storage_limit_gb || 10,
      storage_used_gb: 0,
      company_name: body.company_name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      billing_email: body.billing_email,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country || 'US',
      postal_code: body.postal_code,
      timezone: body.timezone || 'UTC',
      currency: body.currency || 'USD',
      date_format: body.date_format || 'MM/DD/YYYY',
      language: body.language || 'ar',
      logo_url: body.logo_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      custom_css: body.custom_css,
      created_by: body.created_by
    });
    
    return NextResponse.json({
      success: true,
      tenant: newTenant,
      message: 'Tenant created successfully'
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant' },
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
