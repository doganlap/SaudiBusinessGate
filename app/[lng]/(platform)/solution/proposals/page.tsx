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
  Eye,
  Edit,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  rfp_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  submitted_date?: string;
}

export default function ProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solution/proposals', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProposals(data.success ? (data.data || []) : []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || proposal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'draft': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: lng === 'ar' ? 'مسودة' : 'Draft' },
      'review': { color: 'bg-orange-100 text-orange-800', icon: BarChart3, label: lng === 'ar' ? 'مراجعة' : 'Review' },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: lng === 'ar' ? 'موافق عليه' : 'Approved' },
      'submitted': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: lng === 'ar' ? 'تم الإرسال' : 'Submitted' },
    };

    const variant = variants[status] || variants.draft;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${variant.color}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    );
  };

  // Calculate summary stats
  const totalProposals = proposals.length;
  const draftProposals = proposals.filter(p => p.status === 'draft').length;
  const reviewProposals = proposals.filter(p => p.status === 'review').length;
  const submittedProposals = proposals.filter(p => p.status === 'submitted' || p.status === 'approved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل الاقتراحات...' : 'Loading proposals...'}</p>
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
            {lng === 'ar' ? 'إدارة الاقتراحات' : 'Proposal Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'عرض وإدارة جميع الاقتراحات' : 'View and manage all proposals'}
          </p>
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
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'إجمالي الاقتراحات' : 'Total Proposals'}</p>
              <p className="text-2xl font-bold text-gray-900">{totalProposals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'مسودات' : 'Drafts'}</p>
              <p className="text-2xl font-bold text-gray-900">{draftProposals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'قيد المراجعة' : 'In Review'}</p>
              <p className="text-2xl font-bold text-gray-900">{reviewProposals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'تم الإرسال' : 'Submitted'}</p>
              <p className="text-2xl font-bold text-gray-900">{submittedProposals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder={lng === 'ar' ? 'البحث في الاقتراحات...' : 'Search proposals...'}
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
            <option value="draft">{lng === 'ar' ? 'مسودة' : 'Draft'}</option>
            <option value="review">{lng === 'ar' ? 'مراجعة' : 'Review'}</option>
            <option value="approved">{lng === 'ar' ? 'موافق عليه' : 'Approved'}</option>
            <option value="submitted">{lng === 'ar' ? 'تم الإرسال' : 'Submitted'}</option>
          </select>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الاقتراح' : 'Proposal'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {lng === 'ar' ? 'لا توجد اقتراحات' : 'No proposals found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-right rtl:text-right">
                        <div className="text-sm font-medium text-gray-900">{proposal.proposal_number}</div>
                        <div className="text-sm text-gray-500">{proposal.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-right">
                      {getStatusBadge(proposal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right rtl:text-right">
                      <Link
                        href={`/${lng}/solution/proposals/${proposal.id}`}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
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

