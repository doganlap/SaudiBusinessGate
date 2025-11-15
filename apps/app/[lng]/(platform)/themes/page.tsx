"use client";
import { useState, useEffect } from 'react';
import { Palette, Eye, Save, Plus, Trash2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeCustomizer from '@/components/ThemeCustomizer';

interface Theme {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isDefault: boolean;
  isActive: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  branding: {
    companyName: string;
    companyNameAr: string;
    tagline?: string;
    taglineAr?: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}

export default function ThemesPage({ params }: { params: Promise<{ lng: string }> }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'إدارة المظاهر',
      subtitle: 'تخصيص مظهر وعلامة المنصة التجارية',
      totalThemes: 'إجمالي المظاهر',
      activeTheme: 'المظهر النشط',
      customThemes: 'المظاهر المخصصة',
      defaultThemes: 'المظاهر الافتراضية',
      newTheme: 'مظهر جديد',
      preview: 'معاينة',
      activate: 'تفعيل',
      edit: 'تحرير',
      delete: 'حذف',
      export: 'تصدير',
      active: 'نشط',
      inactive: 'غير نشط',
      default: 'افتراضي',
      custom: 'مخصص',
      noThemes: 'لا توجد مظاهر',
      createFirst: 'إنشاء أول مظهر مخصص'
    },
    en: {
      title: 'Theme Management',
      subtitle: 'Customize platform appearance and branding',
      totalThemes: 'Total Themes',
      activeTheme: 'Active Theme',
      customThemes: 'Custom Themes',
      defaultThemes: 'Default Themes',
      newTheme: 'New Theme',
      preview: 'Preview',
      activate: 'Activate',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      active: 'Active',
      inactive: 'Inactive',
      default: 'Default',
      custom: 'Custom',
      noThemes: 'No Themes',
      createFirst: 'Create First Custom Theme'
    }
  }[locale];

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/themes', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      const data = await response.json();
      if (data.success) {
        setThemes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async (theme: Theme) => {
    try {
      const response = await fetch(`/api/themes?id=${theme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify(theme)
      });

      if (response.ok) {
        fetchThemes();
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/themes?id=${themeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({ isActive: true })
      });

      if (response.ok) {
        fetchThemes();
      }
    } catch (error) {
      console.error('Failed to activate theme:', error);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      const response = await fetch(`/api/themes?id=${themeId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': 'demo-tenant' }
      });

      if (response.ok) {
        fetchThemes();
        if (selectedTheme?.id === themeId) {
          setSelectedTheme(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
    }
  };

  const stats = {
    total: themes.length,
    active: themes.filter(t => t.isActive).length,
    custom: themes.filter(t => !t.isDefault).length,
    default: themes.filter(t => t.isDefault).length
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </motion.div>
  );

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Palette className="h-8 w-8" />
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
          
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
            <Plus className="h-4 w-4" />
            {t.newTheme}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalThemes}
            value={stats.total}
            icon={<Palette className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 text-purple-700"
          />
          <StatCard
            title={t.activeTheme}
            value={stats.active}
            icon={<Eye className="h-6 w-6" />}
            color="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 text-green-700"
          />
          <StatCard
            title={t.customThemes}
            value={stats.custom}
            icon={<Save className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.defaultThemes}
            value={stats.default}
            icon={<Download className="h-6 w-6" />}
            color="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-200 text-emerald-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Themes List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Available Themes
              </h2>
              
              {themes.length === 0 ? (
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2">{t.noThemes}</p>
                  <button className="text-purple-600 hover:text-purple-700 font-medium">
                    {t.createFirst}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {themes.map((theme, index) => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        selectedTheme?.id === theme.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {locale === 'ar' ? theme.nameAr : theme.name}
                        </h3>
                        <div className="flex gap-1">
                          {theme.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                              {t.active}
                            </span>
                          )}
                          {theme.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              {t.default}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {locale === 'ar' ? theme.descriptionAr : theme.description}
                      </p>
                      
                      {/* Color Preview */}
                      <div className="flex gap-1 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-neutral-200"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-neutral-200"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-neutral-200"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {!theme.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateTheme(theme.id);
                            }}
                            className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition"
                          >
                            {t.activate}
                          </button>
                        )}
                        {!theme.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Theme Customizer */}
          <div className="lg:col-span-2">
            {selectedTheme ? (
              <ThemeCustomizer
                theme={selectedTheme}
                onSave={handleSaveTheme}
                onPreview={(theme) => console.log('Preview theme:', theme)}
                onReset={() => fetchThemes()}
                locale={locale}
              />
            ) : (
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-neutral-700 p-12 text-center">
                <Palette className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Theme Customizer
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Select a theme to start customizing its appearance and branding
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
