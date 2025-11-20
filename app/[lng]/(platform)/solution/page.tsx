'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface RFP {
  id: string;
  rfp_number: string;
  title: string;
  description?: string;
  client_name: string;
  sector?: string;
  status: string;
  qualification_score?: number;
  win_probability?: number;
  received_date: string;
  submission_deadline?: string;
  tags?: string[];
}

export default function SolutionPage() {
  const params = useParams();
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solution/rfps', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRfps(data.success ? (data.data || []) : []);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      setRfps([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.rfp_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || rfp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${variant.color}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    );
  };

  // Calculate summary stats
  const totalRFPs = rfps.length;
  const activeRFPs = rfps.filter(r => ['intake', 'qualified', 'solution_design', 'proposal', 'review'].includes(r.status)).length;
  const qualifiedRFPs = rfps.filter(r => r.qualification_score && r.qualification_score > 0).length;
  const wonRFPs = rfps.filter(r => r.status === 'won').length;
  const submittedRFPs = rfps.filter(r => ['submitted', 'won', 'lost'].includes(r.status)).length;
  const winRate = submittedRFPs > 0 ? ((wonRFPs / submittedRFPs) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل RFPs...' : 'Loading RFPs...'}</p>
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
            {lng === 'ar' ? 'منصة الحلول و RFPs' : 'Solution & RFP Platform'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'إدارة طلبات العروض وتصميم الحلول' : 'Manage RFPs and design solutions'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${lng}/solution/analytics`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {lng === 'ar' ? 'التحليلات' : 'Analytics'}
          </Link>
          <button
            onClick={() => router.push(`/${lng}/solution/rfps/new`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 rtl:flex-row-reverse"
          >
            <Plus className="h-4 w-4" />
            {lng === 'ar' ? 'RFP جديد' : 'New RFP'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'إجمالي RFPs' : 'Total RFPs'}</p>
              <p className="text-2xl font-bold text-gray-900">{totalRFPs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'RFPs النشطة' : 'Active RFPs'}</p>
              <p className="text-2xl font-bold text-gray-900">{activeRFPs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'مؤهل' : 'Qualified'}</p>
              <p className="text-2xl font-bold text-gray-900">{qualifiedRFPs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'معدل الفوز' : 'Win Rate'}</p>
              <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/${lng}/solution/rfps`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'RFPs' : 'RFPs'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'عرض وإدارة جميع طلبات العروض' : 'View and manage all RFPs'}
          </p>
        </Link>

        <Link
          href={`/${lng}/solution/proposals`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'الاقتراحات' : 'Proposals'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'عرض وإدارة جميع الاقتراحات' : 'View and manage all proposals'}
          </p>
        </Link>

        <Link
          href={`/${lng}/solution/templates`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'القوالب' : 'Templates'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'إدارة قوالب المحتوى والاقتراحات' : 'Manage content and proposal templates'}
          </p>
        </Link>
      </div>

      {/* RFPs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {lng === 'ar' ? 'RFPs الأخيرة' : 'Recent RFPs'}
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  placeholder={lng === 'ar' ? 'البحث في RFPs...' : 'Search RFPs...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl:pl-4 rtl:pr-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={lng === 'ar' ? 'تصفية حسب الحالة' : 'Filter by status'}
              >
                <option value="all">{lng === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="intake">{lng === 'ar' ? 'قيد الاستلام' : 'Intake'}</option>
                <option value="qualified">{lng === 'ar' ? 'مؤهل' : 'Qualified'}</option>
                <option value="solution_design">{lng === 'ar' ? 'تصميم الحل' : 'Solution Design'}</option>
                <option value="proposal">{lng === 'ar' ? 'اقتراح' : 'Proposal'}</option>
                <option value="review">{lng === 'ar' ? 'مراجعة' : 'Review'}</option>
                <option value="submitted">{lng === 'ar' ? 'تم الإرسال' : 'Submitted'}</option>
                <option value="won">{lng === 'ar' ? 'فاز' : 'Won'}</option>
                <option value="lost">{lng === 'ar' ? 'خسر' : 'Lost'}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'RFP' : 'RFP'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'العميل' : 'Client'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'النقاط' : 'Score'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'احتمالية الفوز' : 'Win Probability'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRFPs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {lng === 'ar' ? 'لا توجد RFPs' : 'No RFPs found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRFPs.map((rfp) => (
                  <tr key={rfp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-right rtl:text-right">
                        <div className="text-sm font-medium text-gray-900">{rfp.rfp_number}</div>
                        <div className="text-sm text-gray-500">{rfp.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-right">
                      <div className="text-sm font-medium text-gray-900">{rfp.client_name}</div>
                      {rfp.sector && (
                        <div className="text-sm text-gray-500">{rfp.sector}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-right">
                      {getStatusBadge(rfp.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {rfp.qualification_score ? (
                        <span className={`font-semibold ${rfp.qualification_score >= 70 ? 'text-green-600' : rfp.qualification_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {rfp.qualification_score}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {rfp.win_probability ? (
                        <span className={`font-semibold ${rfp.win_probability >= 60 ? 'text-green-600' : rfp.win_probability >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {rfp.win_probability.toFixed(0)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right rtl:text-right">
                      <Link
                        href={`/${lng}/solution/rfps/${rfp.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {lng === 'ar' ? 'عرض' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

