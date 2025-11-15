import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, demoMode, trackingId } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Demo mode credentials
    if (demoMode && email === 'demo@doganhub.com' && password === 'Demo123456') {
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@doganhub.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'tenant_admin',
        tenantId: 'demo-tenant-id'
      };

      const demoTenant = {
        id: 'demo-tenant-id',
        tenantCode: 'DEMO-001',
        tenantName: 'Demo Company',
        subscriptionTier: 'professional',
        isActive: true
      };

      const token = jwt.sign(
        { userId: demoUser.id, tenantId: demoUser.tenantId, role: demoUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Track demo login
      if (trackingId) {
        await query(`
          UPDATE demo_tracking 
          SET login_count = login_count + 1, 
              last_login_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [trackingId]).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        token,
        user: demoUser,
        tenant: demoTenant,
        demoMode: true
      });
    }

    // Real authentication
    try {
      // Find user by email
      const userResult = await query(`
        SELECT 
          u.id, u.tenant_id, u.email, u.password_hash,
          u.first_name, u.last_name, u.role,
          u.is_active, u.is_verified, u.email_verified,
          t.tenant_code, t.tenant_name, t.subscription_tier,
          t.is_active as tenant_active, t.is_verified as tenant_verified
        FROM platform_users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = $1
      `, [email.toLowerCase()]);

      if (userResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password'
        }, { status: 401 });
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json({
          success: false,
          error: 'Account is not active. Please contact support.'
        }, { status: 403 });
      }

      // Check if tenant is active
      if (!user.tenant_active) {
        return NextResponse.json({
          success: false,
          error: 'Your organization account is not active. Please contact support.'
        }, { status: 403 });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        // Log failed attempt
        await query(`
          INSERT INTO platform_audit_logs (
            id, tenant_id, action_type, action_category,
            action_description, actor_type, actor_id,
            ip_address, success, created_at
          ) VALUES (
            gen_random_uuid(), $1, 'login_failed', 'authentication',
            'Failed login attempt', 'user', $2,
            $3, false, CURRENT_TIMESTAMP
          )
        `, [user.tenant_id, user.id, request.headers.get('x-forwarded-for') || 'unknown']);

        return NextResponse.json({
          success: false,
          error: 'Invalid email or password'
        }, { status: 401 });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenant_id, 
          role: user.role,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await query(`
        UPDATE platform_users 
        SET last_login_at = CURRENT_TIMESTAMP,
            login_count = COALESCE(login_count, 0) + 1
        WHERE id = $1
      `, [user.id]);

      // Log successful login
      await query(`
        INSERT INTO platform_audit_logs (
          id, tenant_id, action_type, action_category,
          action_description, actor_type, actor_id,
          ip_address, success, created_at
        ) VALUES (
          gen_random_uuid(), $1, 'login_success', 'authentication',
          'Successful login', 'user', $2,
          $3, true, CURRENT_TIMESTAMP
        )
      `, [user.tenant_id, user.id, request.headers.get('x-forwarded-for') || 'unknown']);

      // Return user data
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          tenantId: user.tenant_id,
          isVerified: user.is_verified,
          emailVerified: user.email_verified
        },
        tenant: {
          id: user.tenant_id,
          tenantCode: user.tenant_code,
          tenantName: user.tenant_name,
          subscriptionTier: user.subscription_tier,
          isActive: user.tenant_active,
          isVerified: user.tenant_verified
        },
        demoMode: false
      });

    } catch (dbError) {
      console.error('Database error during login:', dbError);
      
      // Fallback to demo mode if database unavailable
      if (email === 'demo@doganhub.com') {
        const demoUser = {
          id: 'demo-user-id',
          email: 'demo@doganhub.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'tenant_admin',
          tenantId: 'demo-tenant-id'
        };

        const token = jwt.sign(
          { userId: demoUser.id, tenantId: demoUser.tenantId, role: demoUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return NextResponse.json({
          success: true,
          token,
          user: demoUser,
          tenant: {
            id: 'demo-tenant-id',
            tenantCode: 'DEMO-001',
            tenantName: 'Demo Company',
            subscriptionTier: 'professional',
            isActive: true
          },
          demoMode: true,
          fallback: true
        });
      }

      throw dbError;
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login. Please try again.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login endpoint',
    method: 'POST',
    requiredFields: ['email', 'password'],
    optionalFields: ['demoMode', 'trackingId']
  });
}
