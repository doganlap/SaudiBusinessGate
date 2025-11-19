import { NextRequest, NextResponse } from 'next/server';
import { PlatformService } from '@/lib/services/platform.service';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Get users from database
    const users = await PlatformService.getUsers(tenantId, {
      status,
      role,
      limit,
      offset
    });
    
    // Get user statistics
    const stats = await PlatformService.getUserStats(tenantId);
    
    return NextResponse.json({
      success: true,
      users,
      total: users.length,
      stats: {
        totalUsers: parseInt(stats.total_users) || 0,
        activeUsers: parseInt(stats.active_users) || 0,
        adminUsers: parseInt(stats.admin_users) || 0,
        superAdminUsers: parseInt(stats.super_admin_users) || 0,
        usersWith2FA: parseInt(stats.users_with_2fa) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to sample data if database is not available
    const fallbackTenantId = 'default-tenant';
    const fallbackUsers = [
      {
        id: '1', tenant_id: fallbackTenantId, user_id: 'admin-001', email: 'admin@default.com',
        first_name: 'System', last_name: 'Administrator', full_name: 'System Administrator',
        email_verified: true, status: 'active', role: 'super_admin', permissions: ['*'],
        is_super_admin: true, accessible_tenants: ['*'], login_count: 25,
        two_factor_enabled: true, language: 'en', theme: 'light',
        created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2', tenant_id: fallbackTenantId, user_id: 'user-001', email: 'sarah.johnson@default.com',
        first_name: 'Sarah', last_name: 'Johnson', full_name: 'Sarah Johnson',
        email_verified: true, status: 'active', role: 'tenant_admin', permissions: ['tenant:*'],
        is_super_admin: false, accessible_tenants: [fallbackTenantId], login_count: 45,
        two_factor_enabled: false, language: 'en', theme: 'light',
        created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '3', tenant_id: fallbackTenantId, user_id: 'user-002', email: 'mike.chen@default.com',
        first_name: 'Mike', last_name: 'Chen', full_name: 'Mike Chen',
        email_verified: true, status: 'active', role: 'manager', permissions: ['read:*', 'write:sales'],
        is_super_admin: false, accessible_tenants: [fallbackTenantId], login_count: 32,
        two_factor_enabled: true, language: 'en', theme: 'dark',
        created_at: '2024-01-08T00:00:00Z', updated_at: '2024-01-15T00:00:00Z'
      }
    ];
    
    return NextResponse.json({
      success: true,
      users: fallbackUsers,
      total: fallbackUsers.length,
      fallback: true,
      stats: {
        totalUsers: 3, activeUsers: 3, adminUsers: 2,
        superAdminUsers: 1, usersWith2FA: 2
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    // Generate unique user ID if not provided
    const userId = body.user_id || `user-${Date.now()}`;
    
    // Create user in database
    const newUser = await PlatformService.createUser(tenantId, {
      user_id: userId,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      password_hash: body.password_hash, // Should be hashed before this point
      email_verified: body.email_verified || false,
      avatar_url: body.avatar_url,
      phone: body.phone,
      title: body.title,
      department: body.department,
      status: body.status || 'pending',
      role: body.role || 'user',
      permissions: body.permissions || [],
      is_super_admin: body.is_super_admin || false,
      accessible_tenants: body.accessible_tenants || [tenantId],
      login_count: 0,
      two_factor_enabled: body.two_factor_enabled || false,
      timezone: body.timezone,
      language: body.language || 'ar',
      theme: body.theme || 'light',
      created_by: body.created_by
    });
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Update user in database
    const updatedUser = await PlatformService.updateUser(tenantId, userId, body);
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Delete user from database
    const deleted = await PlatformService.deleteUser(tenantId, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
