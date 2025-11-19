'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { defaultLanguage } from '@/lib/i18n';
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  Calendar
} from 'lucide-react';

interface ControlTest {
  id: string;
  control_id: string;
  control_code?: string;
  control_title?: string;
  test_type: 'design_effectiveness' | 'operating_effectiveness';
  test_name_en: string;
  test_name_ar?: string;
  planned_date?: string;
  executed_at?: string;
  executed_by?: string;
  overall_result?: 'pass' | 'partial' | 'fail';
  status: 'planned' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
}

export default function TestingPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || defaultLanguage;
  
  const [tests, setTests] = useState<ControlTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    test_type: '',
    status: '',
    overall_result: ''
  });

  useEffect(() => {
    fetchTests();
  }, [filters]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/grc/tests?${queryParams.toString()}`, {
        headers: {
          'x-tenant-id': 'default-tenant',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.data || []);
      } else {
        setError('Failed to load tests');
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.test_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.control_code && test.control_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (test.control_title && test.control_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'planned': return <Calendar className="h-4 w-4 text-gray-600" />;
      case 'closed': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Control Testing</h1>
            <p className="text-gray-600">Manage control testing and effectiveness assessments</p>
          </div>
          <Link
            href={`/${lng}/grc/testing/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.overall_result === 'pass').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.overall_result === 'fail').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tests by name or control..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  value={filters.test_type}
                  onChange={(e) => setFilters({ ...filters, test_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="design_effectiveness">Design Effectiveness</option>
                  <option value="operating_effectiveness">Operating Effectiveness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                <select
                  value={filters.overall_result}
                  onChange={(e) => setFilters({ ...filters, overall_result: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Results</option>
                  <option value="pass">Pass</option>
                  <option value="partial">Partial</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Showing {filteredTests.length} of {tests.length} tests
            </p>
          </div>

          {/* Tests List */}
          <div className="divide-y divide-gray-200">
            {error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchTests}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tests found matching your criteria</p>
                <Link
                  href={`/${lng}/grc/testing/new`}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Create your first test
                </Link>
              </div>
            ) : (
              filteredTests.map((test) => (
                <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(test.status)}
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">
                          {test.test_name_en}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                          {test.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {test.overall_result && (
                          <div className="flex items-center ml-2">
                            {getResultIcon(test.overall_result)}
                            <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${getResultColor(test.overall_result)}`}>
                              {test.overall_result.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {test.test_name_ar && (
                        <p className="text-gray-600 mb-2 text-right" dir="rtl">{test.test_name_ar}</p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                        <span>Control: {test.control_code}</span>
                        <span>Type: {test.test_type.replace('_', ' ')}</span>
                        {test.planned_date && (
                          <span>Planned: {new Date(test.planned_date).toLocaleDateString()}</span>
                        )}
                        {test.executed_at && (
                          <span>Executed: {new Date(test.executed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {test.control_title && (
                        <p className="text-sm text-gray-600">{test.control_title}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/${lng}/grc/testing/${test.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {test.status === 'planned' && (
                        <Link
                          href={`/${lng}/grc/testing/${test.id}/execute`}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Execute
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
