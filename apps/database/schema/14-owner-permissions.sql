-- =================================================================
-- 14-owner-permissions.sql
-- =================================================================

-- Create owner_permissions table
CREATE TABLE IF NOT EXISTS owner_permissions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('system', 'users', 'data', 'billing', 'security')),
    is_enabled BOOLEAN DEFAULT true,
    level VARCHAR(50) NOT NULL CHECK (level IN ('full', 'limited', 'read_only')),
    limits JSONB
);

-- Insert initial data
INSERT INTO owner_permissions (id, name, name_ar, description, description_ar, category, is_enabled, level, limits) VALUES
('perm-1', 'Platform Administration', 'إدارة المنصة', 'Full platform administration access', 'وصول كامل لإدارة المنصة', 'system', true, 'full', NULL),
('perm-2', 'User Management', 'إدارة المستخدمين', 'Create, edit, and delete users', 'إنشاء وتعديل وحذف المستخدمين', 'users', true, 'full', '{"maxUsers": 1000}'),
('perm-3', 'Database Access', 'الوصول لقاعدة البيانات', 'Direct database access and management', 'الوصول المباشر وإدارة قاعدة البيانات', 'data', true, 'full', NULL),
('perm-4', 'Billing Management', 'إدارة الفوترة', 'Manage billing and subscriptions', 'إدارة الفواتير والاشتراكات', 'billing', true, 'full', NULL),
('perm-5', 'Security Settings', 'إعدادات الأمان', 'Configure security settings and policies', 'تكوين إعدادات وسياسات الأمان', 'security', true, 'full', NULL),
('perm-6', 'API Management', 'إدارة API', 'Manage API keys and access levels', 'إدارة مفاتيح API ومستويات الوصول', 'system', false, 'limited', NULL),
('perm-7', 'Data Export', 'تصدير البيانات', 'Export data from the platform', 'تصدير البيانات من المنصة', 'data', true, 'read_only', NULL),
('perm-8', 'System Monitoring', 'مراقبة النظام', 'Monitor system health and performance', 'مراقبة صحة وأداء النظام', 'system', true, 'read_only', NULL),
('perm-9', 'Tenant Management', 'إدارة المستأجرين', 'Create and manage tenant accounts', 'إنشاء وإدارة حسابات المستأجرين', 'users', true, 'full', NULL),
('perm-10', 'Backup & Restore', 'النسخ الاحتياطي والاستعادة', 'Create backups and restore data', 'إنشاء النسخ الاحتياطية واستعادة البيانات', 'data', true, 'full', NULL)
ON CONFLICT (id) DO NOTHING;