"use client";
import { useState, useEffect } from 'react';
import { Crown, Shield, Users, Settings, Database, Key, Lock, Unlock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper functions for category styling
function getCategoryColor(category: string) {
  const colors = {
    system: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    users: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    data: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    billing: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
    security: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
}

function getCategoryIcon(category: string) {
  const icons = {
    system: <Settings className="h-5 w-5" />,
    users: <Users className="h-5 w-5" />,
    data: <Database className="h-5 w-5" />,
    billing: <Crown className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />,
  };
  return icons[category as keyof typeof icons] || <Settings className="h-5 w-5" />;
}

function getLevelColor(level: string) {
  const colors = {
    full: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    limited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    read_only: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

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

export default function OwnerPermissionsPage({ params }: { params: Promise<{ lng: string }> }) {
  const [permissions, setPermissions] = useState<OwnerPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/platform/owner-permissions');
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error(error);
        // Handle error, maybe set some default permissions or show an error message
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [params]);

  const togglePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/platform/owner-permissions/${permissionId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle permission');
      }

      // Update local state
      setPermissions(prev => 
        prev.map(permission => 
          permission.id === permissionId 
            ? { ...permission, isEnabled: !permission.isEnabled }
            : permission
        )
      );
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  const t = {
    ar: {
      title: 'صلاحيات المالك',
      subtitle: 'إدارة صلاحيات وحدود المالك للمنصة',
      systemPermissions: 'صلاحيات النظام',
      userPermissions: 'صلاحيات المستخدمين',
      dataPermissions: 'صلاحيات البيانات',
      billingPermissions: 'صلاحيات الفوترة',
      securityPermissions: 'صلاحيات الأمان',
      enabled: 'مفعل',
      disabled: 'معطل',
      full: 'كامل',
      limited: 'محدود',
      readOnly: 'قراءة فقط',
      maxUsers: 'الحد الأقصى للمستخدمين',
      maxStorage: 'الحد الأقصى للتخزين',
      maxApiCalls: 'الحد الأقصى لاستدعاءات API',
      save: 'حفظ التغييرات',
      reset: 'إعادة تعيين'
    },
    en: {
      title: 'Owner Permissions',
      subtitle: 'Manage owner permissions and platform limits',
      systemPermissions: 'System Permissions',
      userPermissions: 'User Permissions',
      dataPermissions: 'Data Permissions',
      billingPermissions: 'Billing Permissions',
      securityPermissions: 'Security Permissions',
      enabled: 'Enabled',
      disabled: 'Disabled',
      full: 'Full',
      limited: 'Limited',
      readOnly: 'Read Only',
      maxUsers: 'Max Users',
      maxStorage: 'Max Storage',
      maxApiCalls: 'Max API Calls',
      save: 'Save Changes',
      reset: 'Reset'
    }
  }[locale];

  // Mock permissions data is now removed

  const handleToggle = (id: string) => {
    setPermissions(prev => prev.map(perm => 
      perm.id === id ? { ...perm, isEnabled: !perm.isEnabled } : perm
    ));
  };

  const updatePermissionLevel = (id: string, level: 'full' | 'limited' | 'read_only') => {
    setPermissions(prev => prev.map(perm => 
      perm.id === id ? { ...perm, level } : perm
    ));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, OwnerPermission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions by Category */}
        <div className="space-y-8">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {t[`${category}Permissions` as keyof typeof t]}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {perms.map((permission) => (
                  <div
                    key={permission.id}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {locale === 'ar' ? permission.nameAr : permission.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {locale === 'ar' ? permission.descriptionAr : permission.description}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => togglePermission(permission.id)}
                        className={`p-2 rounded-lg transition ${
                          permission.isEnabled
                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                            : 'text-red-600 bg-red-50 hover:bg-red-100'
                        }`}
                      >
                        {permission.isEnabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </div>

                    {permission.isEnabled && (
                      <div className="space-y-3">
                        {/* Permission Level */}
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1">
                            Access Level
                          </label>
                          <select
                            value={permission.level}
                            onChange={(e) => updatePermissionLevel(permission.id, e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                          >
                            <option value="full">{t.full}</option>
                            <option value="limited">{t.limited}</option>
                            <option value="read_only">{t.readOnly}</option>
                          </select>
                        </div>

                        {/* Limits */}
                        {permission.limits && (
                          <div className="grid grid-cols-1 gap-2">
                            {permission.limits.maxUsers && (
                              <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">
                                  {t.maxUsers}
                                </label>
                                <input
                                  type="number"
                                  defaultValue={permission.limits.maxUsers}
                                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                              </div>
                            )}
                            {permission.limits.maxApiCalls && (
                              <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">
                                  {t.maxApiCalls}
                                </label>
                                <input
                                  type="number"
                                  defaultValue={permission.limits.maxApiCalls}
                                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getLevelColor(permission.level)}`}>
                          <span>{t[permission.level as keyof typeof t]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
            <Check className="h-4 w-4" />
            {t.save}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition">
            <X className="h-4 w-4" />
            {t.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
