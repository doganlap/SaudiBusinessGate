'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  DollarSign,
  Calendar,
  Globe
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: string;
  title: string;
  content: string;
  language: 'ar' | 'en' | 'both';
  order: number;
}

interface ProposalData {
  title: string;
  content_blocks: ContentBlock[];
  pricing?: {
    base_price: number;
    currency: string;
    modules: Array<{ module_name: string; price: number; quantity?: number }>;
    total_price: number;
  };
  compliance?: {
    standards: string[];
    certifications: string[];
    data_residency?: string;
    security_requirements?: string[];
  };
  localization?: {
    languages: string[];
    rtl_support: boolean;
    currency: string;
    date_format: string;
    timezone: string;
  };
}

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lng = (params?.lng as string) || 'en';
  
  const rfpId = searchParams.get('rfp_id');
  const designId = searchParams.get('design_id');

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [rfp, setRfp] = useState<any>(null);
  const [solutionDesign, setSolutionDesign] = useState<any>(null);
  
  const [proposalData, setProposalData] = useState<ProposalData>({
    title: '',
    content_blocks: [],
    pricing: undefined,
    compliance: undefined,
    localization: undefined
  });

  useEffect(() => {
    if (rfpId && designId) {
      fetchRFPData();
      fetchSolutionDesign();
    }
  }, [rfpId, designId]);

  const fetchRFPData = async () => {
    try {
      const response = await fetch(`/api/solution/rfps/${rfpId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();
      if (data.success) {
        setRfp(data.data);
        setProposalData(prev => ({
          ...prev,
          title: `${data.data.title} - Proposal`
        }));
      }
    } catch (error) {
      console.error('Error fetching RFP:', error);
    }
  };

  const fetchSolutionDesign = async () => {
    try {
      const response = await fetch(`/api/solution/designs?rfp_id=${rfpId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const design = data.data.find((d: any) => d.id === designId) || data.data[0];
        setSolutionDesign(design);
        
        // Initialize pricing from modules
        if (design.selected_modules && design.selected_modules.length > 0) {
          const modules = design.selected_modules.map((module: string) => ({
            module_name: module,
            price: 10000, // Default pricing - should be configurable
            quantity: 1
          }));
          
          setProposalData(prev => ({
            ...prev,
            pricing: {
              base_price: 5000,
              currency: 'SAR',
              modules,
              total_price: 5000 + modules.reduce((sum, m) => sum + m.price, 0)
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching solution design:', error);
    }
  };

  // AI-powered content generation
  const generateContentBlock = async (type: 'executive_summary' | 'solution_overview' | 'module_description') => {
    if (!rfp || !designId) return;

    setGenerating(type);
    setError(null);

    try {
      const response = await fetch('/api/solution/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          rfp_id: rfpId,
          solution_design_id: designId,
          content_type: type,
          language: lng === 'ar' ? 'ar' : 'en'
        })
      });

      const data = await response.json();

      if (data.success && data.data.content) {
        const blockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const block: ContentBlock = {
          id: blockId,
          type,
          title: getBlockTitle(type),
          content: data.data.content,
          language: lng === 'ar' ? 'ar' : 'en',
          order: proposalData.content_blocks.length
        };

        setProposalData(prev => ({
          ...prev,
          content_blocks: [...prev.content_blocks, block]
        }));
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGenerating(null);
    }
  };

  const getBlockTitle = (type: string): string => {
    const titles: any = {
      executive_summary: lng === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
      solution_overview: lng === 'ar' ? 'نظرة عامة على الحل' : 'Solution Overview',
      module_description: lng === 'ar' ? 'وصف الوحدات' : 'Module Description',
      pricing: lng === 'ar' ? 'التسعير' : 'Pricing',
      timeline: lng === 'ar' ? 'الجدول الزمني' : 'Timeline',
      compliance: lng === 'ar' ? 'الامتثال' : 'Compliance',
      custom: lng === 'ar' ? 'مخصص' : 'Custom'
    };
    return titles[type] || type;
  };

  const addContentBlock = (type: string) => {
    const blockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const block: ContentBlock = {
      id: blockId,
      type,
      title: getBlockTitle(type),
      content: '',
      language: lng === 'ar' ? 'ar' : 'en',
      order: proposalData.content_blocks.length
    };

    setProposalData(prev => ({
      ...prev,
      content_blocks: [...prev.content_blocks, block]
    }));
  };

  const updateContentBlock = (id: string, field: 'title' | 'content', value: string) => {
    setProposalData(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    }));
  };

  const removeContentBlock = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.filter(block => block.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!rfpId || !designId) {
        throw new Error('Missing RFP ID or Design ID');
      }

      const response = await fetch('/api/solution/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          rfp_id: rfpId,
          solution_design_id: designId,
          ...proposalData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(lng === 'ar' ? 'تم إنشاء الاقتراح بنجاح' : 'Proposal created successfully');
        setTimeout(() => {
          router.push(`/${lng}/solution/proposals/${data.data.id}`);
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError(error instanceof Error ? error.message : 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lng === 'ar' ? 'إنشاء اقتراح جديد' : 'Create New Proposal'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {lng === 'ar' ? 'إنشاء اقتراح مع توليد المحتوى بالذكاء الاصطناعي' : 'Create proposal with AI-powered content generation'}
            </p>
          </div>
        </div>
      </div>

      {/* RFP Info Banner */}
      {rfp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-900">{rfp.title}</div>
              <div className="text-sm text-blue-700">{rfp.client_name}</div>
            </div>
            <div className="text-sm text-blue-600">{rfp.rfp_number}</div>
          </div>
        </div>
      )}

      {/* AI Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {lng === 'ar' ? 'توليد المحتوى بالذكاء الاصطناعي' : 'AI Content Generation'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateContentBlock('executive_summary')}
            disabled={generating !== null || !rfp || !designId}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
          >
            {generating === 'executive_summary' ? (
              <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
            ) : (
              <Zap className="h-6 w-6 text-purple-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {lng === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
            </span>
          </button>
          <button
            onClick={() => generateContentBlock('solution_overview')}
            disabled={generating !== null || !rfp || !designId}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
          >
            {generating === 'solution_overview' ? (
              <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
            ) : (
              <Zap className="h-6 w-6 text-purple-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {lng === 'ar' ? 'نظرة عامة على الحل' : 'Solution Overview'}
            </span>
          </button>
          <button
            onClick={() => generateContentBlock('module_description')}
            disabled={generating !== null || !rfp || !designId}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
          >
            {generating === 'module_description' ? (
              <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
            ) : (
              <Zap className="h-6 w-6 text-purple-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {lng === 'ar' ? 'وصف الوحدات' : 'Module Description'}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proposal Title */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {lng === 'ar' ? 'عنوان الاقتراح *' : 'Proposal Title *'}
          </label>
          <input
            type="text"
            value={proposalData.title}
            onChange={(e) => setProposalData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={lng === 'ar' ? 'عنوان الاقتراح' : 'Proposal title'}
          />
        </div>

        {/* Content Blocks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {lng === 'ar' ? 'محتوى الاقتراح' : 'Proposal Content'}
            </h2>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addContentBlock(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{lng === 'ar' ? 'إضافة قسم' : 'Add Section'}</option>
                <option value="custom">{lng === 'ar' ? 'مخصص' : 'Custom'}</option>
                <option value="pricing">{lng === 'ar' ? 'التسعير' : 'Pricing'}</option>
                <option value="timeline">{lng === 'ar' ? 'الجدول الزمني' : 'Timeline'}</option>
                <option value="compliance">{lng === 'ar' ? 'الامتثال' : 'Compliance'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {proposalData.content_blocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {lng === 'ar' ? 'لا توجد أقسام محتوى. استخدم الأزرار أعلاه لإنشاء المحتوى بالذكاء الاصطناعي أو إضافة أقسام يدوياً.' : 'No content blocks. Use the buttons above to generate AI content or add sections manually.'}
                </p>
              </div>
            ) : (
              proposalData.content_blocks
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updateContentBlock(block.id, 'title', e.target.value)}
                        className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        placeholder={lng === 'ar' ? 'عنوان القسم' : 'Section title'}
                      />
                      <button
                        type="button"
                        onClick={() => removeContentBlock(block.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={block.content}
                      onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={lng === 'ar' ? 'محتوى القسم...' : 'Section content...'}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      {lng === 'ar' ? `النوع: ${block.type}` : `Type: ${block.type}`} | {lng === 'ar' ? `الترتيب: ${index + 1}` : `Order: ${index + 1}`}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Pricing Section */}
        {proposalData.pricing && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {lng === 'ar' ? 'التسعير' : 'Pricing'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lng === 'ar' ? 'السعر الأساسي' : 'Base Price'}
                  </label>
                  <input
                    type="number"
                    value={proposalData.pricing.base_price}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      pricing: prev.pricing ? {
                        ...prev.pricing,
                        base_price: parseFloat(e.target.value) || 0,
                        total_price: (parseFloat(e.target.value) || 0) + (prev.pricing.modules.reduce((sum, m) => sum + m.price * (m.quantity || 1), 0))
                      } : undefined
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lng === 'ar' ? 'العملة' : 'Currency'}
                  </label>
                  <select
                    value={proposalData.pricing.currency}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      pricing: prev.pricing ? { ...prev.pricing, currency: e.target.value } : undefined
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {solutionDesign?.selected_modules && solutionDesign.selected_modules.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {lng === 'ar' ? 'الوحدات' : 'Modules'}
                  </h3>
                  <div className="space-y-2">
                    {proposalData.pricing.modules.map((module, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 capitalize">{module.module_name.replace('-', ' ')}</div>
                        <input
                          type="number"
                          value={module.price}
                          onChange={(e) => {
                            const newModules = [...proposalData.pricing!.modules];
                            newModules[index].price = parseFloat(e.target.value) || 0;
                            setProposalData(prev => ({
                              ...prev,
                              pricing: prev.pricing ? {
                                ...prev.pricing,
                                modules: newModules,
                                total_price: prev.pricing.base_price + newModules.reduce((sum, m) => sum + m.price * (m.quantity || 1), 0)
                              } : undefined
                            }));
                          }}
                          className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={lng === 'ar' ? 'السعر' : 'Price'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                  <span>{lng === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                  <span>{proposalData.pricing.total_price.toLocaleString()} {proposalData.pricing.currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {lng === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {lng === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {lng === 'ar' ? 'حفظ وإنشاء الاقتراح' : 'Save & Create Proposal'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

