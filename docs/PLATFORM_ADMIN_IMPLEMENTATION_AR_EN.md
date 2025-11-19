# 🔐 Platform Administration - Complete Implementation Guide

# إدارة المنصة - دليل التنفيذ الشامل

## 📋 Executive Summary | الملخص التنفيذي

**English:**
Complete end-to-end implementation guide for the Platform Administration section of DoganHub. This document covers all steps, processes, security measures, workflows, and technical implementation details for managing multi-tenant platform operations.

**Arabic:**
دليل تنفيذ شامل من البداية إلى النهاية لقسم إدارة المنصة في DoganHub. يغطي هذا المستند جميع الخطوات والعمليات وإجراءات الأمان وسير العمل وتفاصيل التنفيذ الفني لإدارة عمليات المنصة متعددة المستأجرين.

---

## 🎯 Objectives | الأهداف

### English

1. **Multi-Tenant Management** - Complete tenant lifecycle management
2. **User & Role Management** - RBAC with granular permissions
3. **Security & Compliance** - Enterprise-grade security controls
4. **Audit & Monitoring** - Complete audit trail and system monitoring
5. **System Configuration** - Platform-wide settings and customization
6. **White-Label Support** - Tenant-specific branding and customization

### Arabic

1. **إدارة متعددة المستأجرين** - إدارة كاملة لدورة حياة المستأجر
2. **إدارة المستخدمين والأدوار** - RBAC مع صلاحيات دقيقة
3. **الأمان والامتثال** - ضوابط أمان على مستوى المؤسسات
4. **التدقيق والمراقبة** - سجل تدقيق كامل ومراقبة النظام
5. **تكوين النظام** - إعدادات وتخصيص على مستوى المنصة
6. **دعم العلامة البيضاء** - العلامة التجارية والتخصيص الخاص بالمستأجر

---

## 👥 Actors & Roles | الأدوار والمسؤوليات

| Role | English Description | Arabic Description | Permissions |
|------|-------------------|-------------------|-------------|
| **Super Admin** | Platform owner with full access | مالك المنصة مع وصول كامل | All permissions across all tenants |
| **Tenant Admin** | Tenant administrator | مدير المستأجر | Full access within tenant scope |
| **User Manager** | Manages users and roles | مدير المستخدمين | User CRUD, role assignment |
| **Security Officer** | Security and compliance | مسؤول الأمن | Security settings, audit logs |
| **System Monitor** | System health and performance | مراقب النظام | Read-only system metrics |
| **Support Agent** | Customer support | وكيل الدعم | Limited access for support tasks |

---

## 🗄️ Database Schema | مخطط قاعدة البيانات

### Core Tables | الجداول الأساسية

```sql
-- Tenants (المستأجرون)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_name_ar VARCHAR(255),
    
    -- Subscription
    subscription_tier VARCHAR(50) NOT NULL, -- basic, professional, enterprise
    subscription_status VARCHAR(50) NOT NULL, -- active, suspended, cancelled
    subscription_start_date DATE NOT NULL,
    subscription_end_date DATE,
    
    -- Limits
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 50,
    max_api_calls_per_day INTEGER DEFAULT 10000,
    
    -- White-Label
    custom_domain VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    custom_css TEXT,
    
    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    INDEX idx_tenants_code (tenant_code),
    INDEX idx_tenants_status (subscription_status),
    INDEX idx_tenants_tier (subscription_tier)
);

-- Users (المستخدمون)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    password_hash TEXT NOT NULL,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    
    -- Role & Permissions
    role VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '[]',
    department VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Security
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret TEXT,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    must_change_password BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Session
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT uk_user_email UNIQUE(tenant_id, email),
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (is_active)
);

-- Roles (الأدوار)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Role Definition
    role_code VARCHAR(100) NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_name_ar VARCHAR(255),
    role_description TEXT,
    role_description_ar TEXT,
    
    -- Permissions
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    is_custom_role BOOLEAN DEFAULT true,
    
    -- Hierarchy
    parent_role_id UUID REFERENCES roles(id),
    role_level INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_role_code UNIQUE(tenant_id, role_code),
    INDEX idx_roles_tenant (tenant_id),
    INDEX idx_roles_system (is_system_role)
);

-- Permissions (الصلاحيات)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Permission Definition
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    permission_name_ar VARCHAR(255),
    permission_category VARCHAR(100) NOT NULL,
    
    -- Scope
    resource_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- view, create, edit, delete, approve, export
    
    -- Description
    description TEXT,
    description_ar TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_permissions_category (permission_category),
    INDEX idx_permissions_resource (resource_type)
);

-- Audit Logs (سجلات التدقيق)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Actor
    user_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) NOT NULL, -- user, system, api, agent
    actor_name VARCHAR(255),
    
    -- Action
    action_type VARCHAR(100) NOT NULL,
    action_category VARCHAR(100) NOT NULL,
    action_description TEXT,
    
    -- Target
    target_type VARCHAR(100),
    target_id VARCHAR(255),
    target_name VARCHAR(255),
    
    -- Changes
    old_value JSONB,
    new_value JSONB,
    changes JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Result
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_date (created_at),
    INDEX idx_audit_target (target_type, target_id)
);

-- System Settings (إعدادات النظام)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Setting
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_category VARCHAR(100) NOT NULL,
    
    -- Metadata
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_system_setting BOOLEAN DEFAULT false,
    
    -- Audit
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    
    CONSTRAINT uk_setting UNIQUE(tenant_id, setting_key),
    INDEX idx_settings_tenant (tenant_id),
    INDEX idx_settings_category (setting_category)
);

-- API Keys (مفاتيح API)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Key
    key_name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    
    -- Permissions
    scopes JSONB DEFAULT '[]',
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    INDEX idx_api_keys_tenant (tenant_id),
    INDEX idx_api_keys_user (user_id),
    INDEX idx_api_keys_prefix (key_prefix)
);

-- Sessions (الجلسات)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    
    -- Device
    device_type VARCHAR(50),
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    
    -- Location
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sessions_tenant (tenant_id),
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_active (is_active, expires_at)
);
```

---

## 🔐 Security Implementation | تنفيذ الأمان

### 1. Authentication | المصادقة

**English:**

- **Multi-Factor Authentication (MFA)** - TOTP-based 2FA
- **Password Policy** - Minimum 12 characters, complexity requirements
- **Session Management** - JWT tokens with refresh mechanism
- **SSO Integration** - SAML 2.0 and OAuth 2.0 support

**Arabic:**

- **المصادقة متعددة العوامل (MFA)** - 2FA على أساس TOTP
- **سياسة كلمة المرور** - 12 حرفًا كحد أدنى، متطلبات التعقيد
- **إدارة الجلسات** - رموز JWT مع آلية التحديث
- **تكامل SSO** - دعم SAML 2.0 و OAuth 2.0

### 2. Authorization | التفويض

**RBAC Matrix:**

| Resource | Super Admin | Tenant Admin | User Manager | Security Officer | User | Viewer |
|----------|-------------|--------------|--------------|------------------|------|--------|
| Tenants | CRUD | R | - | R | - | - |
| Users | CRUD | CRUD | CRUD | R | R (self) | R |
| Roles | CRUD | CRUD | CRUD | R | R | R |
| Settings | CRUD | CRUD | R | CRUD | R | R |
| Audit Logs | R | R | R | R | - | - |
| API Keys | CRUD | CRUD | CRUD | R | CRUD (own) | - |

### 3. Data Isolation | عزل البيانات

**English:**

- **Row-Level Security (RLS)** - PostgreSQL RLS policies
- **Tenant Isolation** - All queries filtered by tenant_id
- **Data Encryption** - At-rest and in-transit encryption
- **Backup Isolation** - Separate backups per tenant

**Arabic:**

- **أمان مستوى الصف (RLS)** - سياسات RLS في PostgreSQL
- **عزل المستأجر** - جميع الاستعلامات مصفاة حسب tenant_id
- **تشفير البيانات** - التشفير أثناء الراحة والنقل
- **عزل النسخ الاحتياطي** - نسخ احتياطية منفصلة لكل مستأجر

---

## 🔄 Workflows | سير العمل

### Workflow 1: Tenant Onboarding | تأهيل المستأجر

**English Steps:**

1. **Registration** - Tenant submits registration form
2. **Verification** - Email verification and document review
3. **Subscription** - Select plan and payment
4. **Provisioning** - Create tenant database schema
5. **Configuration** - Set up initial settings
6. **Admin Creation** - Create tenant admin user
7. **Welcome Email** - Send onboarding materials
8. **Activation** - Tenant goes live

**Arabic Steps:**

1. **التسجيل** - يقدم المستأجر نموذج التسجيل
2. **التحقق** - التحقق من البريد الإلكتروني ومراجعة المستندات
3. **الاشتراك** - اختيار الخطة والدفع
4. **التوفير** - إنشاء مخطط قاعدة بيانات المستأجر
5. **التكوين** - إعداد الإعدادات الأولية
6. **إنشاء المسؤول** - إنشاء مستخدم مسؤول المستأجر
7. **بريد الترحيب** - إرسال مواد التأهيل
8. **التفعيل** - يصبح المستأجر نشطًا

### Workflow 2: User Management | إدارة المستخدمين

**Create User:**

```
1. Tenant Admin creates user
2. System validates email uniqueness
3. Generate temporary password
4. Send invitation email
5. User accepts and sets password
6. Assign role and permissions
7. User activated
```

**Deactivate User:**

```
1. Admin initiates deactivation
2. Revoke all active sessions
3. Disable API keys
4. Mark user as inactive
5. Audit log entry
6. Notification sent
```

### Workflow 3: Role & Permission Management | إدارة الأدوار والصلاحيات

**Create Custom Role:**

```
1. Define role name and description
2. Select permissions from catalog
3. Set role hierarchy
4. Review and approve
5. Activate role
6. Assign to users
```

---

## 📊 API Endpoints | نقاط نهاية API

### Tenant Management | إدارة المستأجرين

```typescript
// List tenants
GET /api/platform/tenants
Query: page, limit, status, tier

// Get tenant details
GET /api/platform/tenants/:id

// Create tenant
POST /api/platform/tenants
Body: {
  tenant_code, tenant_name, subscription_tier,
  primary_contact_email, max_users
}

// Update tenant
PUT /api/platform/tenants/:id
Body: { tenant_name, subscription_tier, max_users, ... }

// Suspend tenant
POST /api/platform/tenants/:id/suspend
Body: { reason, suspended_until }

// Delete tenant
DELETE /api/platform/tenants/:id
```

### User Management | إدارة المستخدمين

```typescript
// List users
GET /api/platform/users
Query: tenant_id, role, status, search

// Get user details
GET /api/platform/users/:id

// Create user
POST /api/platform/users
Body: {
  tenant_id, email, first_name, last_name,
  role, permissions
}

// Update user
PUT /api/platform/users/:id
Body: { first_name, last_name, role, permissions, ... }

// Deactivate user
POST /api/platform/users/:id/deactivate

// Reset password
POST /api/platform/users/:id/reset-password

// Enable MFA
POST /api/platform/users/:id/enable-mfa
```

### Role Management | إدارة الأدوار

```typescript
// List roles
GET /api/platform/roles
Query: tenant_id, is_system_role

// Create role
POST /api/platform/roles
Body: {
  tenant_id, role_code, role_name,
  permissions, parent_role_id
}

// Update role
PUT /api/platform/roles/:id
Body: { role_name, permissions, ... }

// Delete role
DELETE /api/platform/roles/:id
```

### Audit Logs | سجلات التدقيق

```typescript
// List audit logs
GET /api/platform/audit-logs
Query: tenant_id, user_id, action_type, date_from, date_to

// Get audit log details
GET /api/platform/audit-logs/:id

// Export audit logs
POST /api/platform/audit-logs/export
Body: { filters, format: 'csv' | 'json' }
```

---

## 🎨 UI Components | مكونات الواجهة

### 1. Tenant Management Dashboard

```
- Tenant List (table with filters)
- Tenant Card (overview, stats, actions)
- Subscription Management
- Usage Metrics
- Billing Information
```

### 2. User Management Interface

```
- User List (DataGrid with search/filter)
- User Profile (view/edit)
- Role Assignment
- Permission Matrix
- Activity Log
```

### 3. Role & Permission Builder

```
- Role List
- Permission Catalog
- Drag-and-drop Permission Assignment
- Role Hierarchy Visualizer
- Permission Testing Tool
```

### 4. Audit Log Viewer

```
- Timeline View
- Filter Panel
- Detail Drawer
- Export Options
- Real-time Updates
```

### 5. System Settings

```
- General Settings
- Security Settings
- Email Configuration
- API Configuration
- White-Label Settings
```

---

## 📈 Monitoring & Metrics | المراقبة والمقاييس

### Key Performance Indicators (KPIs)

**English:**

1. **Active Tenants** - Number of active tenants
2. **Total Users** - Total users across all tenants
3. **API Usage** - API calls per day/hour
4. **Storage Usage** - Total storage consumed
5. **Session Count** - Active user sessions
6. **Failed Logins** - Failed login attempts
7. **System Uptime** - Platform availability
8. **Response Time** - Average API response time

**Arabic:**

1. **المستأجرون النشطون** - عدد المستأجرين النشطين
2. **إجمالي المستخدمين** - إجمالي المستخدمين عبر جميع المستأجرين
3. **استخدام API** - مكالمات API في اليوم/الساعة
4. **استخدام التخزين** - إجمالي التخزين المستهلك
5. **عدد الجلسات** - جلسات المستخدم النشطة
6. **عمليات تسجيل الدخول الفاشلة** - محاولات تسجيل الدخول الفاشلة
7. **وقت تشغيل النظام** - توفر المنصة
8. **وقت الاستجابة** - متوسط وقت استجابة API

---

## 🚀 Implementation Steps | خطوات التنفيذ

### Phase 1: Database Setup (Week 1)

- [ ] Create all database tables
- [ ] Set up RLS policies
- [ ] Create indexes and constraints
- [ ] Insert seed data
- [ ] Test data isolation

### Phase 2: Authentication & Authorization (Week 2)

- [ ] Implement JWT authentication
- [ ] Build MFA system
- [ ] Create RBAC middleware
- [ ] Implement permission checking
- [ ] Test security controls

### Phase 3: API Development (Week 3-4)

- [ ] Tenant management APIs
- [ ] User management APIs
- [ ] Role & permission APIs
- [ ] Audit log APIs
- [ ] System settings APIs

### Phase 4: UI Development (Week 5-6)

- [ ] Tenant management dashboard
- [ ] User management interface
- [ ] Role builder
- [ ] Audit log viewer
- [ ] System settings panel

### Phase 5: Testing & QA (Week 7)

- [ ] Unit tests
- [ ] Integration tests
- [ ] Security testing
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 6: Documentation & Training (Week 8)

- [ ] API documentation
- [ ] User guides
- [ ] Admin training materials
- [ ] Video tutorials
- [ ] FAQ and troubleshooting

### Phase 7: Deployment & Monitoring (Week 9)

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup configuration
- [ ] Alert configuration
- [ ] Performance tuning

---

## ✅ Checklist | قائمة التحقق

### Security Checklist | قائمة التحقق الأمني

- [ ] Password policy enforced
- [ ] MFA available for all users
- [ ] Session timeout configured
- [ ] API rate limiting enabled
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] Audit logging enabled
- [ ] Backup encryption
- [ ] Disaster recovery plan

### Compliance Checklist | قائمة التحقق من الامتثال

- [ ] GDPR compliance
- [ ] Data retention policies
- [ ] Right to deletion
- [ ] Data portability
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] Data processing agreements

---

## 📝 Notes | ملاحظات

**English:**

- All timestamps in UTC
- All monetary values in SAR
- Support for Arabic (RTL) and English (LTR)
- Mobile-responsive design required
- Accessibility (WCAG 2.1 AA) compliance
- Browser support: Chrome, Firefox, Safari, Edge (latest 2 versions)

**Arabic:**

- جميع الطوابع الزمنية بتوقيت UTC
- جميع القيم النقدية بالريال السعودي
- دعم العربية (RTL) والإنجليزية (LTR)
- تصميم متجاوب مع الأجهزة المحمولة مطلوب
- الامتثال لإمكانية الوصول (WCAG 2.1 AA)
- دعم المتصفحات: Chrome و Firefox و Safari و Edge (أحدث إصدارين)

---

## 📚 References | المراجع

- OWASP Top 10 Security Risks
- NIST Cybersecurity Framework
- ISO 27001 Information Security
- GDPR Compliance Guidelines
- Saudi Data & AI Authority (SDAIA) Guidelines
- Multi-Tenant SaaS Best Practices

---

**Version:** 1.0.0  
**Last Updated:** November 11, 2025  
**Status:** Implementation Ready ✅
