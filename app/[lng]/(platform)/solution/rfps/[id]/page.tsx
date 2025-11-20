'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  FileText,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  Map,
  Settings,
  BarChart3,
  Loader2,
  Play,
  Eye,
  Edit,
  Tag,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface RFP {
  id: string;
  rfp_number: string;
  title: string;
  description?: string;
  client_name: string;
  client_industry?: string;
  sector?: string;
  language: 'ar' | 'en' | 'both';
  status: string;
  qualification_score?: number;
  win_probability?: number;
  received_date: string;
  submission_deadline?: string;
  tags?: string[];
  assigned_to?: string;
}

interface ModuleSuggestion {
  module: string;
  confidence: number;
  reasoning: string;
  past_wins: number;
}

interface SolutionDesign {
  id: string;
  selected_modules: string[];
  custom_modules?: string[];
  value_propositions?: string[];
  estimated_timeline?: string;
  complexity_assessment?: string;
}

interface EvaluationResult {
  score: number;
  win_probability: number;
  reasoning?: string;
  breakdown: {
    strategic_fit: number;
    revenue_potential: number;
    delivery_complexity: number;
    timeline_feasibility: number;
  };
}

export default function RFPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  const rfpId = params?.id as string;

  const [rfp, setRfp] = useState<RFP | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [moduleSuggestions, setModuleSuggestions] = useState<ModuleSuggestion[]>([]);
  const [solutionDesign, setSolutionDesign] = useState<SolutionDesign | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluation' | 'mapping' | 'proposal'>('overview');

  useEffect(() => {
    if (rfpId) {
      fetchRFP();
    }
  }, [rfpId]);

  useEffect(() => {
    if (rfp && rfp.status === 'intake' && !evaluation) {
      // Auto-qualify on load
      handleQualify();
    }
  }, [rfp]);

  const fetchRFP = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/solution/rfps/${rfpId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRfp(data.success ? data.data : null);

      // Fetch existing solution design if any
      if (data.data) {
        fetchSolutionDesign(data.data.id);
      }
    } catch (error) {
      console.error('Error fetching RFP:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutionDesign = async (rfpId: string) => {
    try {
      const response = await fetch(`/api/solution/designs?rfp_id=${rfpId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setSolutionDesign(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching solution design:', error);
    }
  };

  // AI-powered qualification and evaluation
  const handleQualify = async () => {
    if (!rfp) return;

    setEvaluating(true);
    setError(null);

    try {
      const response = await fetch(`/api/solution/rfps/${rfpId}/qualify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Fetch updated RFP
        await fetchRFP();

        // Get detailed evaluation
        const evalResponse = await fetch(`/api/solution/rfps/${rfpId}/evaluation`, {
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'default-tenant',
          },
        });

        const evalData = await evalResponse.json();
        if (evalData.success) {
          setEvaluation(evalData.data);
        }

        // Auto-suggest modules
        await handleMapModules();
      } else {
        throw new Error(data.error || 'Failed to qualify RFP');
      }
    } catch (error) {
      console.error('Error qualifying RFP:', error);
      setError(error instanceof Error ? error.message : 'Failed to qualify RFP');
    } finally {
      setEvaluating(false);
    }
  };

  // AI-powered module mapping
  const handleMapModules = async () => {
    if (!rfp) return;

    setMapping(true);

    try {
      const response = await fetch(`/api/solution/suggestions/${rfpId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();

      if (data.success) {
        setModuleSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error mapping modules:', error);
    } finally {
      setMapping(false);
    }
  };

  const handleCreateSolutionDesign = async (selectedModules: string[]) => {
    if (!rfp) return;

    try {
      const response = await fetch('/api/solution/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          rfp_id: rfpId,
          selected_modules: selectedModules,
          value_propositions: moduleSuggestions
            .filter(m => selectedModules.includes(m.module))
            .map(m => m.reasoning)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSolutionDesign(data.data);
        setActiveTab('proposal');
        router.push(`/${lng}/solution/proposals/create?rfp_id=${rfpId}&design_id=${data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating solution design:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'intake': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: lng === 'ar' ? 'قيد الاستلام' : 'Intake' },
      'qualified': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: lng === 'ar' ? 'مؤهل' : 'Qualified' },
      'solution_design': { color: 'bg-purple-100 text-purple-800', icon: Target, label: lng === 'ar' ? 'تصميم الحل' : 'Solution Design' },
      'proposal': { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: lng === 'ar' ? 'اقتراح' : 'Proposal' },
      'review': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: lng === 'ar' ? 'مراجعة' : 'Review' },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: lng === 'ar' ? 'موافق عليه' : 'Approved' },
      'submitted': { color: 'bg-indigo-100 text-indigo-800', icon: FileText, label: lng === 'ar' ? 'تم الإرسال' : 'Submitted' },
      'won': { color: 'bg-green-200 text-green-900', icon: CheckCircle, label: lng === 'ar' ? 'فاز' : 'Won' },
      'lost': { color: 'bg-red-100 text-red-800', icon: XCircle, label: lng === 'ar' ? 'خسر' : 'Lost' },
    };

    const variant = variants[status] || variants.intake;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${variant.color}`}>
        <Icon className="h-4 w-4" />
        {variant.label}
      </span>
    );
  };

  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل RFP...' : 'Loading RFP...'}</p>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">{lng === 'ar' ? 'RFP غير موجود' : 'RFP not found'}</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{rfp.rfp_number}</h1>
              {getStatusBadge(rfp.status)}
            </div>
            <p className="mt-1 text-lg text-gray-600">{rfp.title}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(rfp.status === 'intake' || rfp.status === 'qualified') && !evaluation && (
            <button
              onClick={handleQualify}
              disabled={evaluating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {evaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lng === 'ar' ? 'جاري التقييم...' : 'Evaluating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {lng === 'ar' ? 'تأهيل وتقييم' : 'Qualify & Evaluate'}
                </>
              )}
            </button>
          )}
          {rfp.status === 'qualified' && !solutionDesign && (
            <button
              onClick={handleMapModules}
              disabled={mapping}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {mapping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lng === 'ar' ? 'جاري تحليل الوحدات...' : 'Analyzing Modules...'}
                </>
              ) : (
                <>
                  <Map className="h-4 w-4" />
                  {lng === 'ar' ? 'تحليل الوحدات' : 'Map Modules'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {[
            { id: 'overview', label: lng === 'ar' ? 'نظرة عامة' : 'Overview', icon: Eye },
            { id: 'evaluation', label: lng === 'ar' ? 'التقييم' : 'Evaluation', icon: BarChart3 },
            { id: 'mapping', label: lng === 'ar' ? 'الوحدات' : 'Modules', icon: Map },
            { id: 'proposal', label: lng === 'ar' ? 'الاقتراح' : 'Proposal', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {lng === 'ar' ? 'معلومات RFP' : 'RFP Information'}
                </h2>
                <dl className="space-y-4">
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      {lng === 'ar' ? 'العميل:' : 'Client:'}
                    </dt>
                    <dd className="text-sm text-gray-900 flex-1">{rfp.client_name}</dd>
                  </div>
                  {rfp.client_industry && (
                    <div className="flex items-start">
                      <dt className="text-sm font-medium text-gray-500 w-32">
                        {lng === 'ar' ? 'الصناعة:' : 'Industry:'}
                      </dt>
                      <dd className="text-sm text-gray-900 flex-1">{rfp.client_industry}</dd>
                    </div>
                  )}
                  {rfp.sector && (
                    <div className="flex items-start">
                      <dt className="text-sm font-medium text-gray-500 w-32">
                        {lng === 'ar' ? 'القطاع:' : 'Sector:'}
                      </dt>
                      <dd className="text-sm text-gray-900 flex-1">{rfp.sector}</dd>
                    </div>
                  )}
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      {lng === 'ar' ? 'اللغة:' : 'Language:'}
                    </dt>
                    <dd className="text-sm text-gray-900 flex-1">
                      {rfp.language === 'ar' ? (lng === 'ar' ? 'العربية' : 'Arabic') :
                       rfp.language === 'en' ? (lng === 'ar' ? 'الإنجليزية' : 'English') :
                       (lng === 'ar' ? 'كلاهما' : 'Both')}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 w-32">
                      {lng === 'ar' ? 'تاريخ الاستلام:' : 'Received:'}
                    </dt>
                    <dd className="text-sm text-gray-900 flex-1">
                      {new Date(rfp.received_date).toLocaleDateString()}
                    </dd>
                  </div>
                  {rfp.submission_deadline && (
                    <div className="flex items-start">
                      <dt className="text-sm font-medium text-gray-500 w-32">
                        {lng === 'ar' ? 'موعد التسليم:' : 'Deadline:'}
                      </dt>
                      <dd className="text-sm text-gray-900 flex-1">
                        {new Date(rfp.submission_deadline).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Description */}
              {rfp.description && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {lng === 'ar' ? 'الوصف والمتطلبات' : 'Description & Requirements'}
                  </h2>
                  <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">
                    {rfp.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              {rfp.tags && rfp.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {lng === 'ar' ? 'العلامات' : 'Tags'}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {rfp.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Score Card */}
              {rfp.qualification_score !== undefined && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {lng === 'ar' ? 'نقاط التأهيل' : 'Qualification Score'}
                  </h3>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${
                      rfp.qualification_score >= 70 ? 'text-green-600' :
                      rfp.qualification_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rfp.qualification_score}
                    </div>
                    <div className="text-sm text-gray-500">/ 100</div>
                  </div>
                </div>
              )}

              {/* Win Probability */}
              {rfp.win_probability !== undefined && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {lng === 'ar' ? 'احتمالية الفوز' : 'Win Probability'}
                  </h3>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${
                      rfp.win_probability >= 60 ? 'text-green-600' :
                      rfp.win_probability >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {rfp.win_probability.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {evaluation ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {lng === 'ar' ? 'تقييم تفصيلي' : 'Detailed Evaluation'}
                    </h2>
                  </div>
                  
                  {evaluation.reasoning && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">
                        {lng === 'ar' ? 'التحليل' : 'Analysis'}
                      </h3>
                      <p className="text-sm text-blue-800">{evaluation.reasoning}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {lng === 'ar' ? 'الملاءمة الاستراتيجية' : 'Strategic Fit'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {evaluation.breakdown?.strategic_fit || 0}/30
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {lng === 'ar' ? 'إمكانية الإيرادات' : 'Revenue Potential'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {evaluation.breakdown?.revenue_potential || 0}/30
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {lng === 'ar' ? 'تعقيد التسليم' : 'Delivery Complexity'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {evaluation.breakdown?.delivery_complexity || 0}/20
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        {lng === 'ar' ? 'جدوى الجدول الزمني' : 'Timeline Feasibility'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {evaluation.breakdown?.timeline_feasibility || 0}/20
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {lng === 'ar' ? 'لم يتم التقييم بعد' : 'No evaluation yet'}
                </p>
                <button
                  onClick={handleQualify}
                  disabled={evaluating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {lng === 'ar' ? 'جاري التقييم...' : 'Evaluating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {lng === 'ar' ? 'بدء التقييم بالذكاء الاصطناعي' : 'Start AI Evaluation'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Module Mapping Tab */}
        {activeTab === 'mapping' && (
          <div className="space-y-6">
            {moduleSuggestions.length > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Map className="h-6 w-6 text-purple-600" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        {lng === 'ar' ? 'اقتراحات الوحدات' : 'Module Suggestions'}
                      </h2>
                    </div>
                    {!solutionDesign && (
                      <button
                        onClick={() => {
                          const selected = moduleSuggestions
                            .filter(m => m.confidence >= 0.5)
                            .map(m => m.module);
                          handleCreateSolutionDesign(selected);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {lng === 'ar' ? 'إنشاء تصميم الحل' : 'Create Solution Design'}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {moduleSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-lg ${
                          suggestion.confidence >= 0.7 ? 'border-green-200 bg-green-50' :
                          suggestion.confidence >= 0.5 ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {suggestion.module.replace('-', ' ')}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              suggestion.confidence >= 0.7 ? 'bg-green-200 text-green-800' :
                              suggestion.confidence >= 0.5 ? 'bg-yellow-200 text-yellow-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {(suggestion.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>
                        {suggestion.past_wins > 0 && (
                          <div className="text-xs text-gray-500">
                            {lng === 'ar' ? 'فوز سابق:' : 'Past wins:'} {suggestion.past_wins}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {solutionDesign && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {lng === 'ar' ? 'تصميم الحل المختار' : 'Selected Solution Design'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {solutionDesign.selected_modules?.map((module, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                        >
                          {module.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {lng === 'ar' ? 'لم يتم تحليل الوحدات بعد' : 'No module analysis yet'}
                </p>
                <button
                  onClick={handleMapModules}
                  disabled={mapping}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {mapping ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {lng === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {lng === 'ar' ? 'تحليل الوحدات بالذكاء الاصطناعي' : 'Analyze Modules with AI'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Proposal Tab */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            {solutionDesign ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {lng === 'ar' ? 'إنشاء الاقتراح' : 'Create Proposal'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {lng === 'ar' ? 'تم تحديد تصميم الحل. يمكنك الآن إنشاء الاقتراح.' : 'Solution design is ready. You can now create the proposal.'}
                </p>
                <Link
                  href={`/${lng}/solution/proposals/create?rfp_id=${rfpId}&design_id=${solutionDesign.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  {lng === 'ar' ? 'إنشاء الاقتراح' : 'Create Proposal'}
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {lng === 'ar' ? 'يرجى إنشاء تصميم الحل أولاً' : 'Please create solution design first'}
                </p>
                <button
                  onClick={() => setActiveTab('mapping')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {lng === 'ar' ? 'انتقل إلى الوحدات' : 'Go to Modules'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

