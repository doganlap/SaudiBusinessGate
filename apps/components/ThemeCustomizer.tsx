"use client";
import { useState } from 'react';
import { Palette, Type, Layout, Sparkles, Save, Eye, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

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
  branding: {
    companyName: string;
    companyNameAr: string;
    tagline?: string;
    taglineAr?: string;
  };
}

interface ThemeCustomizerProps {
  theme: Theme;
  onSave?: (theme: Theme) => void;
  onPreview?: (theme: Theme) => void;
  onReset?: () => void;
  locale?: 'ar' | 'en';
}

export default function ThemeCustomizer({ 
  theme, 
  onSave, 
  onPreview, 
  onReset, 
  locale = 'ar' 
}: ThemeCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'branding'>('colors');

  const t = {
    ar: {
      title: 'مخصص المظهر',
      colors: 'الألوان',
      typography: 'الطباعة',
      branding: 'العلامة التجارية',
      primary: 'اللون الأساسي',
      secondary: 'اللون الثانوي',
      accent: 'لون التمييز',
      background: 'الخلفية',
      surface: 'السطح',
      text: 'النص',
      textSecondary: 'النص الثانوي',
      border: 'الحدود',
      success: 'النجاح',
      warning: 'التحذير',
      error: 'الخطأ',
      info: 'المعلومات',
      fontFamily: 'عائلة الخط',
      fontSize: 'حجم الخط',
      fontWeight: 'وزن الخط',
      companyName: 'اسم الشركة',
      companyNameAr: 'اسم الشركة بالعربية',
      tagline: 'الشعار',
      taglineAr: 'الشعار بالعربية',
      save: 'حفظ',
      preview: 'معاينة',
      reset: 'إعادة تعيين',
      previewMode: 'وضع المعاينة',
      customTheme: 'مظهر مخصص'
    },
    en: {
      title: 'Theme Customizer',
      colors: 'Colors',
      typography: 'Typography',
      branding: 'Branding',
      primary: 'Primary',
      secondary: 'Secondary',
      accent: 'Accent',
      background: 'Background',
      surface: 'Surface',
      text: 'Text',
      textSecondary: 'Text Secondary',
      border: 'Border',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      info: 'Info',
      fontFamily: 'Font Family',
      fontSize: 'Font Size',
      fontWeight: 'Font Weight',
      companyName: 'Company Name',
      companyNameAr: 'Company Name (Arabic)',
      tagline: 'Tagline',
      taglineAr: 'Tagline (Arabic)',
      save: 'Save',
      preview: 'Preview',
      reset: 'Reset',
      previewMode: 'Preview Mode',
      customTheme: 'Custom Theme'
    }
  }[locale];

  const updateTheme = (path: string, value: any) => {
    const keys = path.split('.');
    const newTheme = { ...currentTheme };
    let current: any = newTheme;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setCurrentTheme(newTheme);
    onPreview?.(newTheme);
  };

  const ColorInput = ({ label, path, value }: { label: string; path: string; value: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => updateTheme(path, e.target.value)}
          className="w-12 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => updateTheme(path, e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-mono"
        />
      </div>
    </div>
  );

  const TextInput = ({ label, path, value, placeholder }: { 
    label: string; 
    path: string; 
    value: string; 
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => updateTheme(path, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
      />
    </div>
  );

  const SelectInput = ({ label, path, value, options }: { 
    label: string; 
    path: string; 
    value: string; 
    options: { value: string; label: string }[];
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => updateTheme(path, e.target.value)}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const fontFamilyOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'Roboto, system-ui, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, system-ui, sans-serif', label: 'Open Sans' },
    { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
    { value: 'Montserrat, system-ui, sans-serif', label: 'Montserrat' },
    { value: 'system-ui, sans-serif', label: 'System UI' }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t.title}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t.customTheme}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onReset?.()}
              className="px-3 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPreview?.(currentTheme)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Eye className="h-4 w-4" />
              {t.preview}
            </button>
            <button
              onClick={() => onSave?.(currentTheme)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              <Save className="h-4 w-4" />
              {t.save}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        {[
          { id: 'colors', label: t.colors, icon: Palette },
          { id: 'typography', label: t.typography, icon: Type },
          { id: 'branding', label: t.branding, icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === tab.id
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'colors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <ColorInput label={t.primary} path="colors.primary" value={currentTheme.colors.primary} />
            <ColorInput label={t.secondary} path="colors.secondary" value={currentTheme.colors.secondary} />
            <ColorInput label={t.accent} path="colors.accent" value={currentTheme.colors.accent} />
            <ColorInput label={t.background} path="colors.background" value={currentTheme.colors.background} />
            <ColorInput label={t.surface} path="colors.surface" value={currentTheme.colors.surface} />
            <ColorInput label={t.text} path="colors.text" value={currentTheme.colors.text} />
            <ColorInput label={t.textSecondary} path="colors.textSecondary" value={currentTheme.colors.textSecondary} />
            <ColorInput label={t.border} path="colors.border" value={currentTheme.colors.border} />
            <ColorInput label={t.success} path="colors.success" value={currentTheme.colors.success} />
            <ColorInput label={t.warning} path="colors.warning" value={currentTheme.colors.warning} />
            <ColorInput label={t.error} path="colors.error" value={currentTheme.colors.error} />
            <ColorInput label={t.info} path="colors.info" value={currentTheme.colors.info} />
          </motion.div>
        )}

        {activeTab === 'typography' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SelectInput
              label={t.fontFamily}
              path="typography.fontFamily"
              value={currentTheme.typography.fontFamily}
              options={fontFamilyOptions}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">{t.fontSize}</h3>
                <TextInput label="XS" path="typography.fontSize.xs" value={currentTheme.typography.fontSize.xs} />
                <TextInput label="SM" path="typography.fontSize.sm" value={currentTheme.typography.fontSize.sm} />
                <TextInput label="Base" path="typography.fontSize.base" value={currentTheme.typography.fontSize.base} />
                <TextInput label="LG" path="typography.fontSize.lg" value={currentTheme.typography.fontSize.lg} />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">{t.fontWeight}</h3>
                <TextInput label="Normal" path="typography.fontWeight.normal" value={currentTheme.typography.fontWeight.normal.toString()} />
                <TextInput label="Medium" path="typography.fontWeight.medium" value={currentTheme.typography.fontWeight.medium.toString()} />
                <TextInput label="Semibold" path="typography.fontWeight.semibold" value={currentTheme.typography.fontWeight.semibold.toString()} />
                <TextInput label="Bold" path="typography.fontWeight.bold" value={currentTheme.typography.fontWeight.bold.toString()} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'branding' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TextInput
              label={t.companyName}
              path="branding.companyName"
              value={currentTheme.branding.companyName}
              placeholder="Company Name"
            />
            <TextInput
              label={t.companyNameAr}
              path="branding.companyNameAr"
              value={currentTheme.branding.companyNameAr}
              placeholder="اسم الشركة"
            />
            <TextInput
              label={t.tagline}
              path="branding.tagline"
              value={currentTheme.branding.tagline || ''}
              placeholder="Your tagline"
            />
            <TextInput
              label={t.taglineAr}
              path="branding.taglineAr"
              value={currentTheme.branding.taglineAr || ''}
              placeholder="شعارك"
            />
          </motion.div>
        )}
      </div>

      {/* Preview */}
      <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
          {t.previewMode}
        </h3>
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          <div 
            className="text-2xl font-bold mb-2"
            style={{ 
              color: currentTheme.colors.text,
              fontWeight: currentTheme.typography.fontWeight.bold
            }}
          >
            {locale === 'ar' ? currentTheme.branding.companyNameAr : currentTheme.branding.companyName}
          </div>
          <div 
            className="text-sm mb-4"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {locale === 'ar' ? currentTheme.branding.taglineAr : currentTheme.branding.tagline}
          </div>
          <div className="flex gap-2">
            <div 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Primary Button
            </div>
            <div 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: currentTheme.colors.secondary }}
            >
              Secondary Button
            </div>
            <div 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: currentTheme.colors.accent }}
            >
              Accent Button
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
