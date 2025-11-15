-- =====================================================
-- Saudi Store - Seed Data for Multi-tenant System
-- Initial subscription plans, modules, and roles
-- =====================================================

-- =====================================================
-- SUBSCRIPTION PLANS
-- =====================================================

INSERT INTO subscription_plans (name, slug, display_name, description, price_monthly, price_yearly, plan_type, max_users, max_teams, max_storage_gb, max_api_calls_per_month, enabled_modules, features, allow_white_label, allow_custom_branding, allow_reselling) VALUES

-- Free Plan
('Free', 'free', 
 '{"en": "Free", "ar": "مجاني"}'::jsonb,
 '{"en": "Perfect for getting started", "ar": "مثالي للبدء"}'::jsonb,
 0.00, 0.00, 'free',
 3, 1, 5, 1000,
 '["crm", "dashboard"]'::jsonb,
 '{"ai_agents": false, "white_label": false, "custom_domain": false, "advanced_analytics": false}'::jsonb,
 false, false, false),

-- Professional Plan
('Professional', 'professional',
 '{"en": "Professional", "ar": "احترافي"}'::jsonb,
 '{"en": "For growing teams", "ar": "للفرق المتنامية"}'::jsonb,
 499.00, 4990.00, 'professional',
 25, 5, 100, 50000,
 '["crm", "sales", "finance", "hr", "dashboard", "analytics", "reports"]'::jsonb,
 '{"ai_agents": true, "white_label": false, "custom_domain": true, "advanced_analytics": true, "api_access": true}'::jsonb,
 false, true, false),

-- Enterprise Plan
('Enterprise', 'enterprise',
 '{"en": "Enterprise", "ar": "مؤسسات"}'::jsonb,
 '{"en": "For large organizations", "ar": "للمؤسسات الكبرى"}'::jsonb,
 1999.00, 19990.00, 'enterprise',
 100, 20, 500, 500000,
 '["crm", "sales", "finance", "hr", "procurement", "grc", "dashboard", "analytics", "reports", "ai-agents", "workflows", "integrations"]'::jsonb,
 '{"ai_agents": true, "white_label": true, "custom_domain": true, "advanced_analytics": true, "api_access": true, "sso": true, "dedicated_support": true}'::jsonb,
 true, true, false),

-- White-label Reseller Plan
('White-label Reseller', 'whitelabel-reseller',
 '{"en": "White-label Reseller", "ar": "موزع بعلامة تجارية"}'::jsonb,
 '{"en": "Resell under your brand", "ar": "أعد البيع بعلامتك التجارية"}'::jsonb,
 4999.00, 49990.00, 'whitelabel',
 500, 100, 2000, 5000000,
 '["crm", "sales", "finance", "hr", "procurement", "grc", "dashboard", "analytics", "reports", "ai-agents", "workflows", "integrations", "billing", "monitoring"]'::jsonb,
 '{"ai_agents": true, "white_label": true, "custom_domain": true, "advanced_analytics": true, "api_access": true, "sso": true, "dedicated_support": true, "reseller_portal": true, "client_management": true}'::jsonb,
 true, true, true);

-- =====================================================
-- MODULES
-- =====================================================

INSERT INTO modules (name, slug, display_name, description, module_type, category, base_path, monthly_price, is_addon, sort_order) VALUES

-- Core Modules (included in plans)
('Dashboard', 'dashboard', '{"en": "Dashboard", "ar": "لوحة التحكم"}'::jsonb, '{"en": "Overview and metrics", "ar": "نظرة عامة ومقاييس"}'::jsonb, 'core', 'core', '/dashboard', 0, false, 1),
('CRM', 'crm', '{"en": "Customer Relationship Management", "ar": "إدارة علاقات العملاء"}'::jsonb, '{"en": "Manage customers and leads", "ar": "إدارة العملاء والفرص"}'::jsonb, 'core', 'operations', '/crm', 0, false, 2),

-- Operations Modules
('Sales', 'sales', '{"en": "Sales Management", "ar": "إدارة المبيعات"}'::jsonb, '{"en": "Track sales pipeline", "ar": "تتبع خط المبيعات"}'::jsonb, 'core', 'operations', '/sales', 0, false, 3),
('Finance', 'finance', '{"en": "Financial Management", "ar": "الإدارة المالية"}'::jsonb, '{"en": "Accounting and finance", "ar": "المحاسبة والمالية"}'::jsonb, 'premium', 'finance', '/finance', 99, true, 4),
('HR', 'hr', '{"en": "Human Resources", "ar": "الموارد البشرية"}'::jsonb, '{"en": "Employee management", "ar": "إدارة الموظفين"}'::jsonb, 'core', 'hr', '/hr', 0, false, 5),
('Procurement', 'procurement', '{"en": "Procurement", "ar": "المشتريات"}'::jsonb, '{"en": "Purchase and vendor management", "ar": "إدارة المشتريات والموردين"}'::jsonb, 'premium', 'operations', '/procurement', 79, true, 6),

-- Governance & Compliance
('GRC', 'grc', '{"en": "Governance, Risk & Compliance", "ar": "الحوكمة والمخاطر والامتثال"}'::jsonb, '{"en": "Risk and compliance management", "ar": "إدارة المخاطر والامتثال"}'::jsonb, 'premium', 'governance', '/grc', 149, true, 7),

-- Analytics & Reporting
('Analytics', 'analytics', '{"en": "Analytics", "ar": "التحليلات"}'::jsonb, '{"en": "Business intelligence", "ar": "ذكاء الأعمال"}'::jsonb, 'core', 'analytics', '/analytics', 0, false, 8),
('Reports', 'reports', '{"en": "Reports", "ar": "التقارير"}'::jsonb, '{"en": "Custom reporting", "ar": "تقارير مخصصة"}'::jsonb, 'core', 'analytics', '/reports', 0, false, 9),

-- AI & Automation
('AI Agents', 'ai-agents', '{"en": "AI Agents", "ar": "الوكلاء الذكيون"}'::jsonb, '{"en": "Intelligent automation", "ar": "أتمتة ذكية"}'::jsonb, 'premium', 'ai', '/ai-agents', 199, true, 10),
('Workflows', 'workflows', '{"en": "Workflows", "ar": "سير العمل"}'::jsonb, '{"en": "Automation workflows", "ar": "سير عمل آلي"}'::jsonb, 'premium', 'automation', '/workflows', 99, true, 11),

-- Integration & API
('Integrations', 'integrations', '{"en": "Integrations", "ar": "التكاملات"}'::jsonb, '{"en": "Third-party integrations", "ar": "تكاملات طرف ثالث"}'::jsonb, 'premium', 'integration', '/integrations', 79, true, 12),
('API Dashboard', 'api-dashboard', '{"en": "API Dashboard", "ar": "لوحة API"}'::jsonb, '{"en": "API management", "ar": "إدارة API"}'::jsonb, 'premium', 'developer', '/api-dashboard', 49, true, 13),

-- Billing & Payments
('Billing', 'billing', '{"en": "Billing & Subscriptions", "ar": "الفواتير والاشتراكات"}'::jsonb, '{"en": "Manage billing", "ar": "إدارة الفواتير"}'::jsonb, 'premium', 'finance', '/billing', 0, false, 14),
('Payments', 'payments', '{"en": "Payment Processing", "ar": "معالجة المدفوعات"}'::jsonb, '{"en": "Accept payments", "ar": "قبول المدفوعات"}'::jsonb, 'premium', 'finance', '/payments', 49, true, 15),

-- Monitoring & Tools
('Monitoring', 'monitoring', '{"en": "Monitoring", "ar": "المراقبة"}'::jsonb, '{"en": "System monitoring", "ar": "مراقبة النظام"}'::jsonb, 'enterprise', 'tools', '/monitoring', 99, true, 16),
('Tools', 'tools', '{"en": "Tools & Utilities", "ar": "الأدوات والمرافق"}'::jsonb, '{"en": "Additional tools", "ar": "أدوات إضافية"}'::jsonb, 'core', 'tools', '/tools', 0, false, 17);

-- =====================================================
-- SYSTEM ROLES
-- =====================================================

INSERT INTO roles (tenant_id, name, slug, display_name, description, role_type, role_level, permissions, module_access, is_default, is_system) VALUES

-- System-wide roles (tenant_id = NULL)
(NULL, 'Super Admin', 'super-admin', '{"en": "Super Admin", "ar": "مدير النظام"}'::jsonb, '{"en": "Full system access", "ar": "وصول كامل للنظام"}'::jsonb, 'system', 10, '["*:*"]'::jsonb, '{"*": "full"}'::jsonb, false, true),
(NULL, 'Reseller', 'reseller', '{"en": "Reseller", "ar": "موزع"}'::jsonb, '{"en": "Can manage clients", "ar": "يمكن إدارة العملاء"}'::jsonb, 'system', 8, '["clients:*", "billing:read", "reports:read"]'::jsonb, '{"billing": "full", "reports": "read", "clients": "full"}'::jsonb, false, true),

-- Tenant-level default roles (tenant_id = NULL means template for all tenants)
(NULL, 'Owner', 'owner', '{"en": "Owner", "ar": "مالك"}'::jsonb, '{"en": "Tenant owner with full control", "ar": "مالك الحساب بصلاحية كاملة"}'::jsonb, 'tenant', 10, '["*:*"]'::jsonb, '{"*": "full"}'::jsonb, true, true),
(NULL, 'Admin', 'admin', '{"en": "Administrator", "ar": "مدير"}'::jsonb, '{"en": "Full administrative access", "ar": "وصول إداري كامل"}'::jsonb, 'tenant', 9, '["users:*", "teams:*", "settings:*", "modules:read"]'::jsonb, '{"*": "full"}'::jsonb, true, true),
(NULL, 'Manager', 'manager', '{"en": "Manager", "ar": "مدير قسم"}'::jsonb, '{"en": "Team/department manager", "ar": "مدير فريق/قسم"}'::jsonb, 'tenant', 7, '["users:read", "teams:manage", "reports:read"]'::jsonb, '{"crm": "full", "sales": "full", "reports": "read"}'::jsonb, true, true),
(NULL, 'Team Lead', 'team-lead', '{"en": "Team Lead", "ar": "قائد فريق"}'::jsonb, '{"en": "Lead a specific team", "ar": "قيادة فريق محدد"}'::jsonb, 'team', 6, '["team:manage", "tasks:*"]'::jsonb, '{"crm": "full", "tasks": "full"}'::jsonb, true, true),
(NULL, 'User', 'user', '{"en": "User", "ar": "مستخدم"}'::jsonb, '{"en": "Standard user access", "ar": "وصول مستخدم عادي"}'::jsonb, 'tenant', 5, '["dashboard:read", "profile:write"]'::jsonb, '{"dashboard": "read", "crm": "read", "tasks": "write"}'::jsonb, true, true),
(NULL, 'Viewer', 'viewer', '{"en": "Viewer", "ar": "مشاهد"}'::jsonb, '{"en": "Read-only access", "ar": "وصول للقراءة فقط"}'::jsonb, 'tenant', 3, '["dashboard:read", "reports:read"]'::jsonb, '{"dashboard": "read", "reports": "read"}'::jsonb, true, true),

-- Specialized roles
(NULL, 'Sales Rep', 'sales-rep', '{"en": "Sales Representative", "ar": "مندوب مبيعات"}'::jsonb, '{"en": "Sales team member", "ar": "عضو فريق المبيعات"}'::jsonb, 'custom', 5, '["crm:read", "sales:*", "customers:read"]'::jsonb, '{"crm": "read", "sales": "full"}'::jsonb, false, true),
(NULL, 'Finance Officer', 'finance-officer', '{"en": "Finance Officer", "ar": "مسؤول مالي"}'::jsonb, '{"en": "Financial operations", "ar": "العمليات المالية"}'::jsonb, 'custom', 6, '["finance:*", "billing:*", "reports:read"]'::jsonb, '{"finance": "full", "billing": "full", "reports": "read"}'::jsonb, false, true),
(NULL, 'HR Manager', 'hr-manager', '{"en": "HR Manager", "ar": "مدير الموارد البشرية"}'::jsonb, '{"en": "Human resources management", "ar": "إدارة الموارد البشرية"}'::jsonb, 'custom', 7, '["hr:*", "users:read", "teams:read"]'::jsonb, '{"hr": "full", "dashboard": "read"}'::jsonb, false, true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Seeded with 4 plans: Free, Professional, Enterprise, White-label Reseller';
COMMENT ON TABLE modules IS 'Seeded with 17 modules across all categories';
COMMENT ON TABLE roles IS 'Seeded with 11 system and default roles';
