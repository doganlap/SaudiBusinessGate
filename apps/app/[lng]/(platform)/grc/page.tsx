'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Users,
  Settings,
  BarChart3,
  Activity,
  AlertCircle,
  Target
} from 'lucide-react';

interface GRCOverview {
  summary: {
    total_controls: number;
    effective_controls: number;
    critical_controls: number;
    frameworks_count: number;
    avg_compliance: number;
  };
  kpis: {
    controlsByStatus: Array<{ status: string; count: number }>;
    controlsByCriticality: Array<{ criticality: string; count: number }>;
    testCoverage: { total_controls: number; tested_controls: number };
    activeExceptions: number;
    overdueAttestations: number;
  };
  framework_compliance: Array<{
    framework_code: string;
    framework_name: string;
    compliance_percentage: number;
    total_controls: number;
    effective_controls: number;
  }>;
}

export default function GRCDashboard() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  
  const [overview, setOverview] = useState<GRCOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grc/analytics?type=overview', {
        headers: {
          'x-tenant-id': 'default-tenant',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data.data);
      } else {
        setError('Failed to load GRC overview');
      }
    } catch (err) {
      console.error('Error fetching GRC overview:', err);
      setError('Failed to load GRC overview');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operating': return 'text-green-600 bg-green-50';
      case 'ready': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'changed': return 'text-yellow-600 bg-yellow-50';
      case 'retired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GRC Control Administration
          </h1>
          <p className="text-gray-600">
            Governance, Risk & Compliance Management Dashboard
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Controls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.summary.total_controls || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Effective Controls</p>
                <p className="text-2xl font-bold text-green-600">
                  {overview?.summary.effective_controls || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Controls</p>
                <p className="text-2xl font-bold text-red-600">
                  {overview?.summary.critical_controls || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overview?.summary.avg_compliance || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href={`/${lng}/grc/controls`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Control Management</h3>
                <p className="text-gray-600">Manage control lifecycle and implementations</p>
              </div>
            </div>
          </Link>

          <Link href={`/${lng}/grc/frameworks`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Frameworks</h3>
                <p className="text-gray-600">Regulatory frameworks and mappings</p>
              </div>
            </div>
          </Link>

          <Link href={`/${lng}/grc/testing`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Testing</h3>
                <p className="text-gray-600">Control testing and effectiveness</p>
              </div>
            </div>
          </Link>

          <Link href={`/${lng}/grc/exceptions`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Exceptions</h3>
                <p className="text-gray-600">Control exceptions and compensating controls</p>
              </div>
            </div>
          </Link>

          <Link href={`/${lng}/grc/monitoring`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">CCM Monitoring</h3>
                <p className="text-gray-600">Continuous control monitoring and alerts</p>
              </div>
            </div>
          </Link>

          <Link href={`/${lng}/grc/reports`} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-teal-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="text-gray-600">Compliance reports and analytics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Controls by Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls by Status</h3>
            <div className="space-y-3">
              {overview?.kpis.controlsByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls by Criticality */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls by Criticality</h3>
            <div className="space-y-3">
              {overview?.kpis.controlsByCriticality.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(item.criticality)}`}>
                      {item.criticality.toUpperCase()}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Framework Compliance */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Compliance</h3>
          <div className="space-y-4">
            {overview?.framework_compliance.map((framework, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{framework.framework_code}</h4>
                    <p className="text-sm text-gray-600">{framework.framework_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{framework.compliance_percentage}%</p>
                    <p className="text-sm text-gray-600">
                      {framework.effective_controls}/{framework.total_controls} controls
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${framework.compliance_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.kpis.testCoverage ? 
                    Math.round((overview.kpis.testCoverage.tested_controls / overview.kpis.testCoverage.total_controls) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  {overview?.kpis.testCoverage.tested_controls || 0} of {overview?.kpis.testCoverage.total_controls || 0} tested
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exceptions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {overview?.kpis.activeExceptions || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Attestations</p>
                <p className="text-2xl font-bold text-red-600">
                  {overview?.kpis.overdueAttestations || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
