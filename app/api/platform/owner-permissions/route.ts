import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db/connection';

interface OwnerPermission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'system' | 'users' | 'data' | 'billing' | 'security';
  isEnabled: boolean;
  level: 'full' | 'limited' | 'read_only';
  limits?: {
    maxUsers?: number;
    maxStorage?: number;
    maxApiCalls?: number;
  };
}

const mockPermissions: OwnerPermission[] = [
    {
      id: 'perm-1',
      name: 'Platform Administration',
      nameAr: 'إدارة المنصة',
      description: 'Full platform administration access',
      descriptionAr: 'وصول كامل لإدارة المنصة',
      category: 'system',
      isEnabled: true,
      level: 'full'
    },
    {
      id: 'perm-2',
      name: 'User Management',
      nameAr: 'إدارة المستخدمين',
      description: 'Create, edit, and delete users',
      descriptionAr: 'إنشاء وتعديل وحذف المستخدمين',
      category: 'users',
      isEnabled: true,
      level: 'full',
      limits: { maxUsers: 1000 }
    },
    {
      id: 'perm-3',
      name: 'Database Access',
      nameAr: 'الوصول لقاعدة البيانات',
      description: 'Direct database access and management',
      descriptionAr: 'الوصول المباشر وإدارة قاعدة البيانات',
      category: 'data',
      isEnabled: true,
      level: 'full'
    },
    {
      id: 'perm-4',
      name: 'Billing Management',
      nameAr: 'إدارة الفوترة',
      description: 'Manage billing and subscriptions',
      descriptionAr: 'إدارة الفواتير والاشتراكات',
      category: 'billing',
      isEnabled: true,
      level: 'full'
    },
    {
      id: 'perm-5',
      name: 'Security Settings',
      nameAr: 'إعدادات الأمان',
      description: 'Configure security settings and policies',
      descriptionAr: 'تكوين إعدادات وسياسات الأمان',
      category: 'security',
      isEnabled: true,
      level: 'full'
    },
    {
      id: 'perm-6',
      name: 'API Management',
      nameAr: 'إدارة API',
      description: 'Manage API keys and access levels',
      descriptionAr: 'إدارة مفاتيح API ومستويات الوصول',
      category: 'system',
      isEnabled: false,
      level: 'limited'
    },
    {
      id: 'perm-7',
      name: 'Data Export',
      nameAr: 'تصدير البيانات',
      description: 'Export data from the platform',
      descriptionAr: 'تصدير البيانات من المنصة',
      category: 'data',
      isEnabled: true,
      level: 'read_only'
    },
    {
      id: 'perm-8',
      name: 'System Monitoring',
      nameAr: 'مراقبة النظام',
      description: 'Monitor system health and performance',
      descriptionAr: 'مراقبة صحة وأداء النظام',
      category: 'system',
      isEnabled: true,
      level: 'read_only'
    },
    {
      id: 'perm-9',
      name: 'Tenant Management',
      nameAr: 'إدارة المستأجرين',
      description: 'Create and manage tenant accounts',
      descriptionAr: 'إنشاء وإدارة حسابات المستأجرين',
      category: 'users',
      isEnabled: true,
      level: 'full'
    },
    {
      id: 'perm-10',
      name: 'Backup & Restore',
      nameAr: 'النسخ الاحتياطي والاستعادة',
      description: 'Create backups and restore data',
      descriptionAr: 'إنشاء النسخ الاحتياطية واستعادة البيانات',
      category: 'data',
      isEnabled: true,
      level: 'full'
    }
  ];

export async function GET() {
  try {
    const permissions = await DatabaseService.query('SELECT * FROM owner_permissions');
    return NextResponse.json(permissions.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}