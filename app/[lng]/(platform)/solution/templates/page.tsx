'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Tag,
  Globe,
  Settings
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  language: 'ar' | 'en' | 'both';
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function TemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // TODO: Create API endpoint for templates
      // For now, use mock data
      setTemplates([
        {
          id: '1',
          name: 'Executive Summary Template',
          type: 'executive_summary',
          content: 'Sample executive summary content...',
          language: 'both',
          tags: ['standard', 'enterprise'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesLanguage = filterLanguage === 'all' || template.language === filterLanguage || template.language === 'both';
    return matchesSearch && matchesType && matchesLanguage;
  });

  const getTypeLabel = (type: string) => {
    const labels: any = {
      'executive_summary': lng === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
      'solution_overview': lng === 'ar' ? 'نظرة عامة على الحل' : 'Solution Overview',
      'module_description': lng === 'ar' ? 'وصف الوحدات' : 'Module Description',
      'pricing': lng === 'ar' ? 'التسعير' : 'Pricing',
      'timeline': lng === 'ar' ? 'الجدول الزمني' : 'Timeline',
      'compliance': lng === 'ar' ? 'الامتثال' : 'Compliance',
      'custom': lng === 'ar' ? 'مخصص' : 'Custom',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل القوالب...' : 'Loading templates...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lng === 'ar' ? 'إدارة قوالب المحتوى' : 'Content Templates Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'إدارة قوالب المحتوى والاقتراحات' : 'Manage content and proposal templates'}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${lng}/solution/templates/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 rtl:flex-row-reverse"
        >
          <Plus className="h-4 w-4" />
          {lng === 'ar' ? 'قالب جديد' : 'New Template'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder={lng === 'ar' ? 'البحث في القوالب...' : 'Search templates...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl:pl-4 rtl:pr-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={lng === 'ar' ? 'تصفية حسب النوع' : 'Filter by type'}
          >
            <option value="all">{lng === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="executive_summary">{lng === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}</option>
            <option value="solution_overview">{lng === 'ar' ? 'نظرة عامة على الحل' : 'Solution Overview'}</option>
            <option value="module_description">{lng === 'ar' ? 'وصف الوحدات' : 'Module Description'}</option>
            <option value="pricing">{lng === 'ar' ? 'التسعير' : 'Pricing'}</option>
            <option value="timeline">{lng === 'ar' ? 'الجدول الزمني' : 'Timeline'}</option>
            <option value="compliance">{lng === 'ar' ? 'الامتثال' : 'Compliance'}</option>
            <option value="custom">{lng === 'ar' ? 'مخصص' : 'Custom'}</option>
          </select>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={lng === 'ar' ? 'تصفية حسب اللغة' : 'Filter by language'}
          >
            <option value="all">{lng === 'ar' ? 'جميع اللغات' : 'All Languages'}</option>
            <option value="ar">{lng === 'ar' ? 'العربية' : 'Arabic'}</option>
            <option value="en">{lng === 'ar' ? 'الإنجليزية' : 'English'}</option>
            <option value="both">{lng === 'ar' ? 'كلاهما' : 'Both'}</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {lng === 'ar' ? 'لا توجد قوالب' : 'No templates found'}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Tag className="h-3 w-3" />
                    <span>{getTypeLabel(template.type)}</span>
                    <Globe className="h-3 w-3 ml-2" />
                    <span>
                      {template.language === 'ar' ? (lng === 'ar' ? 'عربي' : 'Arabic') :
                       template.language === 'en' ? (lng === 'ar' ? 'إنجليزي' : 'English') :
                       (lng === 'ar' ? 'كلاهما' : 'Both')}
                    </span>
                  </div>
                </div>
                {template.is_active && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    {lng === 'ar' ? 'نشط' : 'Active'}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content.substring(0, 150)}...</p>
              
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/${lng}/solution/templates/${template.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {lng === 'ar' ? 'عرض' : 'View'}
                </button>
                <button
                  onClick={() => router.push(`/${lng}/solution/templates/${template.id}/edit`)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => {}}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

