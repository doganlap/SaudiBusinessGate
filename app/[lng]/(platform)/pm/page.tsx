'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Timer
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export default function PMPage() {
  const params = useParams();
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pm/projects', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'not_started': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: lng === 'ar' ? 'لم يبدأ' : 'Not Started' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: lng === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
      'on_hold': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: lng === 'ar' ? 'متوقف' : 'On Hold' },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: lng === 'ar' ? 'مكتمل' : 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle, label: lng === 'ar' ? 'ملغي' : 'Cancelled' },
    };

    const variant = variants[status as keyof typeof variants] || variants.not_started;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${variant.color}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    );
  };

  // Calculate summary stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</p>
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
            {lng === 'ar' ? 'إدارة المشاريع' : 'Project Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {lng === 'ar' ? 'إدارة وتتبع المشاريع والمهام' : 'Manage and track projects and tasks'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${lng}/pm/analytics`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {lng === 'ar' ? 'التحليلات' : 'Analytics'}
          </Link>
          <button
            onClick={() => router.push(`/${lng}/pm/projects`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 rtl:flex-row-reverse"
          >
            <Plus className="h-4 w-4" />
            {lng === 'ar' ? 'مشروع جديد' : 'New Project'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'المشاريع النشطة' : 'Active Projects'}</p>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'المشاريع المكتملة' : 'Completed'}</p>
              <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 rtl:ml-0 rtl:mr-4">
              <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'متوقفة' : 'On Hold'}</p>
              <p className="text-2xl font-bold text-gray-900">{onHoldProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/${lng}/pm/projects`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'المشاريع' : 'Projects'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'عرض وإدارة جميع المشاريع' : 'View and manage all projects'}
          </p>
        </Link>

        <Link
          href={`/${lng}/pm/tasks`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'المهام' : 'Tasks'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'عرض وإدارة جميع المهام' : 'View and manage all tasks'}
          </p>
        </Link>

        <Link
          href={`/${lng}/pm/timesheets`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900 rtl:ml-0 rtl:mr-4">
              {lng === 'ar' ? 'سجلات الوقت' : 'Timesheets'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {lng === 'ar' ? 'تسجيل وتتبع الوقت المستغرق' : 'Log and track time spent'}
          </p>
        </Link>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {lng === 'ar' ? 'المشاريع الأخيرة' : 'Recent Projects'}
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  placeholder={lng === 'ar' ? 'البحث في المشاريع...' : 'Search projects...'}
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
                <option value="not_started">{lng === 'ar' ? 'لم يبدأ' : 'Not Started'}</option>
                <option value="in_progress">{lng === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="on_hold">{lng === 'ar' ? 'متوقف' : 'On Hold'}</option>
                <option value="completed">{lng === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="cancelled">{lng === 'ar' ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'المشروع' : 'Project'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                </th>
                <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {lng === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {lng === 'ar' ? 'لا توجد مشاريع' : 'No projects found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-right rtl:text-right">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-right">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right rtl:text-right">
                      <Link
                        href={`/${lng}/pm/projects`}
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

