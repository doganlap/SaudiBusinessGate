'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

interface Control {
  id: string;
  code: string;
  title_en: string;
  title_ar?: string;
  domain: string;
  control_type: string;
  control_nature: string;
  frequency: string;
  criticality: string;
  status: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export default function ControlsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    domain: '',
    status: '',
    criticality: '',
    control_type: ''
  });

  useEffect(() => {
    fetchControls();
  }, [filters]);

  const fetchControls = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/grc/controls?${queryParams.toString()}`, {
        headers: {
          'x-tenant-id': 'default-tenant',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setControls(data.data || []);
      } else {
        setError('Failed to load controls');
      }
    } catch (err) {
      console.error('Error fetching controls:', err);
      setError('Failed to load controls');
    } finally {
      setLoading(false);
    }
  };

  const filteredControls = controls.filter(control =>
    control.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operating': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'design_review': return 'bg-yellow-100 text-yellow-800';
      case 'changed': return 'bg-orange-100 text-orange-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operating': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ready': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft': return <FileText className="h-4 w-4 text-gray-600" />;
      case 'design_review': return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'changed': return <Edit className="h-4 w-4 text-orange-600" />;
      case 'retired': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
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
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Control Management</h1>
            <p className="text-gray-600">Manage control lifecycle and implementations</p>
          </div>
          <Link
            href={`/${lng}/grc/controls/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Control
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search controls by title, code, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Domains</option>
                  <option value="ITGC">ITGC</option>
                  <option value="Application">Application</option>
                  <option value="Cyber">Cyber Security</option>
                  <option value="Privacy">Privacy</option>
                  <option value="Financial">Financial</option>
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
                  <option value="draft">Draft</option>
                  <option value="design_review">Design Review</option>
                  <option value="ready">Ready</option>
                  <option value="operating">Operating</option>
                  <option value="changed">Changed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
                <select
                  value={filters.criticality}
                  onChange={(e) => setFilters({ ...filters, criticality: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Criticalities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.control_type}
                  onChange={(e) => setFilters({ ...filters, control_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Detective">Detective</option>
                  <option value="Corrective">Corrective</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Showing {filteredControls.length} of {controls.length} controls
            </p>
          </div>

          {/* Controls List */}
          <div className="divide-y divide-gray-200">
            {error ? (
              <div className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchControls}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            ) : filteredControls.length === 0 ? (
              <div className="p-6 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No controls found matching your criteria</p>
                <Link
                  href={`/${lng}/grc/controls/new`}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Create your first control
                </Link>
              </div>
            ) : (
              filteredControls.map((control) => (
                <div key={control.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(control.status)}
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">
                          {control.code}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.status)}`}>
                          {control.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCriticalityColor(control.criticality)}`}>
                          {control.criticality}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2">{control.title_en}</p>
                      {control.title_ar && (
                        <p className="text-gray-600 mb-2 text-right" dir="rtl">{control.title_ar}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>Domain: {control.domain}</span>
                        <span>Type: {control.control_type}</span>
                        <span>Nature: {control.control_nature}</span>
                        <span>Frequency: {control.frequency}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/${lng}/grc/controls/${control.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Control"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/${lng}/grc/controls/${control.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Control"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
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
