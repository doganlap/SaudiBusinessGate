'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap,
  Eye,
  Tag
} from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  client_name: string;
  client_industry: string;
  sector: string;
  language: 'ar' | 'en' | 'both';
  received_date: string;
  submission_deadline: string;
  notes: string;
}

interface AISuggestions {
  sector?: string;
  industry?: string;
  language?: 'ar' | 'en' | 'both';
  tags?: string[];
  complexity?: 'low' | 'medium' | 'high';
  isAnalyzing: boolean;
}

export default function NewRFPage() {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({ isAnalyzing: false });
  const [documentText, setDocumentText] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    client_name: '',
    client_industry: '',
    sector: '',
    language: 'both',
    received_date: new Date().toISOString().split('T')[0],
    submission_deadline: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Trigger AI analysis on description change
    if (name === 'description' && value.length > 100) {
      analyzeWithAI(value);
    }
  };

  // AI-powered document analysis
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      setError(lng === 'ar' ? 'يُرجى تحميل ملف PDF أو TXT أو DOCX' : 'Please upload PDF, TXT, or DOCX file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/solution/rfps/upload', {
        method: 'POST',
        headers: {
          'x-tenant-id': 'default-tenant'
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setDocumentText(data.text);
        
        // Auto-fill form fields from extracted text
        if (data.extracted) {
          setFormData(prev => ({
            ...prev,
            title: data.extracted.title || prev.title,
            description: data.extracted.description || prev.description,
            client_name: data.extracted.client_name || prev.client_name,
            client_industry: data.extracted.industry || prev.client_industry,
            sector: data.extracted.sector || prev.sector,
            language: data.extracted.language || prev.language,
          }));
        }

        // Analyze with AI
        if (data.text) {
          await analyzeWithAI(data.text);
        }
      } else {
        throw new Error(data.error || 'Failed to process document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // AI-powered analysis of RFP content
  const analyzeWithAI = async (text: string) => {
    setAnalyzing(true);
    setAiSuggestions({ isAnalyzing: true });

    try {
      const response = await fetch('/api/solution/ai/analyze-rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant'
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success && data.suggestions) {
        setAiSuggestions({
          sector: data.suggestions.sector,
          industry: data.suggestions.industry,
          language: data.suggestions.language,
          tags: data.suggestions.tags,
          complexity: data.suggestions.complexity,
          isAnalyzing: false
        });

        // Auto-apply suggestions if fields are empty
        if (data.suggestions.sector && !formData.sector) {
          setFormData(prev => ({ ...prev, sector: data.suggestions.sector }));
        }
        if (data.suggestions.industry && !formData.client_industry) {
          setFormData(prev => ({ ...prev, client_industry: data.suggestions.industry }));
        }
        if (data.suggestions.language && formData.language === 'both') {
          setFormData(prev => ({ ...prev, language: data.suggestions.language }));
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Continue without AI suggestions
    } finally {
      setAnalyzing(false);
      setAiSuggestions(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  // Apply AI suggestions
  const applyAISuggestions = () => {
    if (aiSuggestions.sector) {
      setFormData(prev => ({ ...prev, sector: aiSuggestions.sector || prev.sector }));
    }
    if (aiSuggestions.industry) {
      setFormData(prev => ({ ...prev, client_industry: aiSuggestions.industry || prev.client_industry }));
    }
    if (aiSuggestions.language) {
      setFormData(prev => ({ ...prev, language: aiSuggestions.language || prev.language }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/solution/rfps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(lng === 'ar' ? 'تم إنشاء RFP بنجاح' : 'RFP created successfully');
        
        // Auto-qualify and analyze if description exists
        if (formData.description) {
          setTimeout(() => {
            router.push(`/${lng}/solution/rfps/${data.data.id}`);
          }, 1000);
        } else {
          router.push(`/${lng}/solution/rfps/${data.data.id}`);
        }
      } else {
        throw new Error(data.error || 'Failed to create RFP');
      }
    } catch (error) {
      console.error('Error creating RFP:', error);
      setError(error instanceof Error ? error.message : 'Failed to create RFP');
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
              {lng === 'ar' ? 'إضافة RFP جديد' : 'New RFP Intake'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {lng === 'ar' ? 'إضافة طلب عرض أسعار جديد مع التحليل التلقائي بالذكاء الاصطناعي' : 'Add new RFP with AI-powered automatic analysis'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Suggestions Banner */}
      {aiSuggestions.isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-800">
            {lng === 'ar' ? 'جاري التحليل بالذكاء الاصطناعي...' : 'AI is analyzing the RFP...'}
          </span>
        </div>
      )}

      {!aiSuggestions.isAnalyzing && (aiSuggestions.sector || aiSuggestions.tags?.length) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  {lng === 'ar' ? 'اقتراحات الذكاء الاصطناعي' : 'AI Suggestions'}
                </h3>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                {aiSuggestions.sector && (
                  <div>
                    <span className="font-medium">{lng === 'ar' ? 'القطاع:' : 'Sector:'}</span> {aiSuggestions.sector}
                  </div>
                )}
                {aiSuggestions.industry && (
                  <div>
                    <span className="font-medium">{lng === 'ar' ? 'الصناعة:' : 'Industry:'}</span> {aiSuggestions.industry}
                  </div>
                )}
                {aiSuggestions.complexity && (
                  <div>
                    <span className="font-medium">{lng === 'ar' ? 'التعقيد:' : 'Complexity:'}</span> {aiSuggestions.complexity}
                  </div>
                )}
                {aiSuggestions.tags && aiSuggestions.tags.length > 0 && (
                  <div>
                    <span className="font-medium">{lng === 'ar' ? 'العلامات:' : 'Tags:'}</span>{' '}
                    {aiSuggestions.tags.map(tag => (
                      <span key={tag} className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs mr-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={applyAISuggestions}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              {lng === 'ar' ? 'تطبيق الاقتراحات' : 'Apply Suggestions'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {lng === 'ar' ? 'تحميل مستند RFP' : 'Upload RFP Document'}
            </h2>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="document-upload"
              onChange={handleDocumentUpload}
              accept=".pdf,.txt,.docx"
              className="hidden"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploading 
                  ? (lng === 'ar' ? 'جاري التحميل...' : 'Uploading...')
                  : (lng === 'ar' ? 'انقر للتحميل أو اسحب الملف هنا (PDF, TXT, DOCX)' : 'Click to upload or drag file here (PDF, TXT, DOCX)')
                }
              </span>
              {uploading && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
            </label>
          </div>
          {documentText && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {lng === 'ar' ? 'المحتوى المستخرج:' : 'Extracted Content:'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{documentText.substring(0, 300)}...</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'عنوان RFP *' : 'RFP Title *'}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={lng === 'ar' ? 'أدخل عنوان RFP' : 'Enter RFP title'}
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'اسم العميل *' : 'Client Name *'}
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={lng === 'ar' ? 'اسم العميل' : 'Client name'}
              />
            </div>

            {/* Client Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'الصناعة' : 'Industry'}
                {aiSuggestions.industry && (
                  <span className="ml-2 text-xs text-green-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {lng === 'ar' ? 'موصى به' : 'AI Suggested'}
                  </span>
                )}
              </label>
              <input
                type="text"
                name="client_industry"
                value={formData.client_industry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={lng === 'ar' ? 'الصناعة' : 'Industry'}
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'القطاع' : 'Sector'}
                {aiSuggestions.sector && (
                  <span className="ml-2 text-xs text-green-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {lng === 'ar' ? 'موصى به' : 'AI Suggested'}
                  </span>
                )}
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{lng === 'ar' ? 'اختر القطاع' : 'Select sector'}</option>
                <option value="finance">{lng === 'ar' ? 'المالية' : 'Finance'}</option>
                <option value="healthcare">{lng === 'ar' ? 'الرعاية الصحية' : 'Healthcare'}</option>
                <option value="retail">{lng === 'ar' ? 'التجزئة' : 'Retail'}</option>
                <option value="government">{lng === 'ar' ? 'الحكومة' : 'Government'}</option>
                <option value="education">{lng === 'ar' ? 'التعليم' : 'Education'}</option>
                <option value="manufacturing">{lng === 'ar' ? 'التصنيع' : 'Manufacturing'}</option>
                <option value="technology">{lng === 'ar' ? 'التكنولوجيا' : 'Technology'}</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'اللغة' : 'Language'}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="both">{lng === 'ar' ? 'كلاهما' : 'Both'}</option>
                <option value="ar">{lng === 'ar' ? 'العربية' : 'Arabic'}</option>
                <option value="en">{lng === 'ar' ? 'الإنجليزية' : 'English'}</option>
              </select>
            </div>

            {/* Received Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'تاريخ الاستلام' : 'Received Date'}
              </label>
              <input
                type="date"
                name="received_date"
                value={formData.received_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submission Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lng === 'ar' ? 'موعد التسليم' : 'Submission Deadline'}
              </label>
              <input
                type="date"
                name="submission_deadline"
                value={formData.submission_deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lng === 'ar' ? 'الوصف / المتطلبات *' : 'Description / Requirements *'}
              {analyzing && (
                <span className="ml-2 text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {lng === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                </span>
              )}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={lng === 'ar' ? 'أدخل وصف RFP والمتطلبات. سيتم تحليلها تلقائياً بالذكاء الاصطناعي.' : 'Enter RFP description and requirements. Will be automatically analyzed by AI.'}
            />
            <p className="mt-1 text-xs text-gray-500">
              {lng === 'ar' ? '💡 نصيحة: كلما كان الوصف أكثر تفصيلاً، كانت التحليلات والاقتراحات أفضل' : '💡 Tip: More detailed description = better AI analysis and suggestions'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lng === 'ar' ? 'ملاحظات' : 'Notes'}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={lng === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
            />
          </div>
        </div>

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
                {lng === 'ar' ? 'حفظ وإنشاء RFP' : 'Save & Create RFP'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

