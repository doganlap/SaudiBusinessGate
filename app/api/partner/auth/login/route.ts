/**
 * Saudi Store - Partner Authentication API
 * POST /api/partner/auth/login
 * 
 * Partner login endpoint using invitation code
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validation schema
const partnerLoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  invitation_code: z.string().min(6, 'رمز الدعوة غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').optional(),
  create_account: z.boolean().default(false),
  full_name: z.string().min(2).max(255).optional(),
});

type PartnerLoginInput = z.infer<typeof partnerLoginSchema>;

/**
 * POST /api/partner/auth/login
 * Partner login with invitation code
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validatedData = partnerLoginSchema.parse(body);
    
    // Check invitation code
    const invitationResult = await pool.query(
      `SELECT 
        id, invitation_code, partner_email, partner_name, partner_company,
        status, partnership_tier, commission_rate, expires_at,
        invited_by, accepted_at, created_tenant_id, terms_accepted
       FROM partner_invitations 
       WHERE invitation_code = $1 
       AND partner_email = $2
       AND deleted_at IS NULL`,
      [validatedData.invitation_code, validatedData.email]
    );
    
    if (invitationResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'رمز الدعوة أو البريد الإلكتروني غير صحيح',
        message_en: 'Invalid invitation code or email',
      }, { status: 401 });
    }
    
    const invitation = invitationResult.rows[0];
    
    // Check invitation status
    if (invitation.status === 'expired') {
      return NextResponse.json({
        success: false,
        message: 'رمز الدعوة منتهي الصلاحية',
        message_en: 'Invitation code has expired',
      }, { status: 401 });
    }
    
    if (invitation.status === 'revoked') {
      return NextResponse.json({
        success: false,
        message: 'رمز الدعوة ملغي',
        message_en: 'Invitation code has been revoked',
      }, { status: 401 });
    }
    
    if (invitation.status === 'rejected') {
      return NextResponse.json({
        success: false,
        message: 'تم رفض الدعوة',
        message_en: 'Invitation has been rejected',
      }, { status: 401 });
    }
    
    // Check expiration date
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await pool.query(
        `UPDATE partner_invitations SET status = 'expired' WHERE id = $1`,
        [invitation.id]
      );
      
      return NextResponse.json({
        success: false,
        message: 'رمز الدعوة منتهي الصلاحية',
        message_en: 'Invitation code has expired',
      }, { status: 401 });
    }
    
    // Check if partner already accepted (has tenant)
    if (invitation.status === 'accepted' && invitation.created_tenant_id) {
      // Partner already has account, check password
      const userResult = await pool.query(
        `SELECT id, email, password_hash, full_name, role, tenant_id, is_active
         FROM users 
         WHERE email = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
        [validatedData.email, invitation.created_tenant_id]
      );
      
      if (userResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'حساب الشريك غير موجود',
          message_en: 'Partner account not found',
        }, { status: 404 });
      }
      
      const user = userResult.rows[0];
      
      if (!user.is_active) {
        return NextResponse.json({
          success: false,
          message: 'الحساب غير نشط',
          message_en: 'Account is not active',
        }, { status: 403 });
      }
      
      // Verify password
      if (!validatedData.password) {
        return NextResponse.json({
          success: false,
          message: 'كلمة المرور مطلوبة',
          message_en: 'Password is required',
        }, { status: 400 });
      }
      
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password_hash
      );
      
      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'كلمة المرور غير صحيحة',
          message_en: 'Invalid password',
        }, { status: 401 });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          tenantId: user.tenant_id,
          role: user.role,
          type: 'partner',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Update last login
      await pool.query(
        `UPDATE users 
         SET last_login_at = NOW(), 
             login_count = login_count + 1,
             last_login_ip = $1
         WHERE id = $2`,
        [request.headers.get('x-forwarded-for') || 'unknown', user.id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        message_en: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            tenant_id: user.tenant_id,
          },
          partnership: {
            tier: invitation.partnership_tier,
            commission_rate: invitation.commission_rate,
          },
        },
      });
    }
    
    // New partner - create account
    if (validatedData.create_account) {
      if (!validatedData.password) {
        return NextResponse.json({
          success: false,
          message: 'كلمة المرور مطلوبة لإنشاء الحساب',
          message_en: 'Password is required to create account',
        }, { status: 400 });
      }
      
      if (!validatedData.full_name) {
        return NextResponse.json({
          success: false,
          message: 'الاسم الكامل مطلوب',
          message_en: 'Full name is required',
        }, { status: 400 });
      }
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Create tenant for partner
        const tenantResult = await client.query(
          `INSERT INTO tenants (
            name,
            slug,
            subscription_tier,
            subscription_status,
            business_type,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, slug`,
          [
            invitation.partner_company || invitation.partner_name,
            `partner-${invitation.invitation_code.toLowerCase()}`,
            'partner',
            'active',
            'enterprise',
            JSON.stringify({
              partner_program: true,
              invitation_id: invitation.id,
              partnership_tier: invitation.partnership_tier,
            }),
          ]
        );
        
        const tenant = tenantResult.rows[0];
        
        // Hash password
        const password_hash = await bcrypt.hash(validatedData.password, 10);
        
        // Create user
        const userResult = await client.query(
          `INSERT INTO users (
            tenant_id,
            email,
            password_hash,
            full_name,
            role,
            user_type,
            email_verified,
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, email, full_name, role, tenant_id`,
          [
            tenant.id,
            validatedData.email,
            password_hash,
            validatedData.full_name,
            'owner',
            'partner',
            true, // Auto-verify partner emails
            true,
          ]
        );
        
        const user = userResult.rows[0];
        
        // Update invitation
        await client.query(
          `UPDATE partner_invitations 
           SET status = 'accepted',
               accepted_at = NOW(),
               accepted_by = $1,
               created_tenant_id = $2
           WHERE id = $3`,
          [user.id, tenant.id, invitation.id]
        );
        
        await client.query('COMMIT');
        
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            tenantId: user.tenant_id,
            role: user.role,
            type: 'partner',
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return NextResponse.json({
          success: true,
          message: 'تم إنشاء الحساب بنجاح',
          message_en: 'Account created successfully',
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              tenant_id: user.tenant_id,
            },
            tenant: {
              id: tenant.id,
              slug: tenant.slug,
            },
            partnership: {
              tier: invitation.partnership_tier,
              commission_rate: invitation.commission_rate,
            },
          },
        }, { status: 201 });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    // First time login - return invitation details
    return NextResponse.json({
      success: true,
      needs_account_creation: true,
      message: 'مرحباً! يرجى إنشاء حساب للمتابعة',
      message_en: 'Welcome! Please create an account to continue',
      data: {
        invitation: {
          partner_name: invitation.partner_name,
          partner_company: invitation.partner_company,
          partnership_tier: invitation.partnership_tier,
          commission_rate: invitation.commission_rate,
        },
      },
    });
    
  } catch (error) {
    console.error('Partner login error:', error);
    
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'بيانات غير صحيحة',
        message_en: 'Invalid data',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }
    
    // Generic error
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
      message_en: 'An error occurred during login',
    }, { status: 500 });
  }
}
