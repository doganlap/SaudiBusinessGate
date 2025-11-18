'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  BarChart3, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Target
} from 'lucide-react';

interface ComplianceReport {
  framework_code: string;
  framework_name: string;
  compliance_percentage: number;
  total_controls: number;
  effective_controls: number;
  ineffective_controls: number;
  partially_effective_controls: number;
}

interface ControlStatusReport {
  id: string;
  code: string;
  title_en: string;
  domain: string;
  criticality: string;
  status: string;
  control_effectiveness_score: number;
  latest_test_result?: string;
  latest_test_date?: string;
  evidence_count: number;
  approved_evidence_count: number;
  active_exceptions_count: number;
}

export default function ReportsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  
  const [complianceData, setComplianceData] = useState<ComplianceReport[]>([]);
  const [controlStatusData, setControlStatusData] = useState<ControlStatusReport[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [selectedReport]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/grc/analytics?type=${selectedReport}`, {
        headers: {
          'x-tenant-id': 'default-tenant',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (selectedReport === 'overview') {
          setComplianceData(data.data.framework_compliance || []);
          setControlStatusData(data.data.control_status || []);
          setKpiData(data.data.kpis || {});
        } else if (selectedReport === 'framework-compliance') {
          setComplianceData(data.data || []);
        } else if (selectedReport === 'control-status') {
          setControlStatusData(data.data || []);
        } else if (selectedReport === 'kpis') {
          setKpiData(data.data || {});
        }
      } else {
        setError('Failed to load report data');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implement export functionality
    console.log(`Exporting report as ${format}`);
    // This would typically call an API endpoint to generate and download the report
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEffectivenessBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-48"></div>
              ))}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GRC Reports & Analytics</h1>
            <p className="text-gray-600">Compliance reports and control effectiveness analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview Report</option>
              <option value="framework-compliance">Framework Compliance</option>
              <option value="control-status">Control Status</option>
              <option value="kpis">KPI Dashboard</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            {kpiData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Controls</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {kpiData.controlsByStatus?.reduce((sum: number, item: any) => sum + item.count, 0) || 0}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Test Coverage</p>
                      <p className="text-2xl font-bold text-green-600">
                        {kpiData.testCoverage ? 
                          Math.round((kpiData.testCoverage.tested_controls / kpiData.testCoverage.total_controls) * 100) 
                          : 0}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Exceptions</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {kpiData.activeExceptions || 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                      <p className="text-2xl font-bold text-red-600">
                        {kpiData.overdueAttestations || 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Framework Compliance Report */}
            {complianceData.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Framework Compliance Report
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {complianceData.map((framework, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{framework.framework_code}</h3>
                            <p className="text-sm text-gray-600">{framework.framework_name}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getEffectivenessColor(framework.compliance_percentage)}`}>
                              {framework.compliance_percentage}%
                            </p>
                            <p className="text-sm text-gray-600">Compliance Score</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{framework.effective_controls}</p>
                            <p className="text-sm text-gray-600">Effective</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{framework.partially_effective_controls}</p>
                            <p className="text-sm text-gray-600">Partial</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{framework.ineffective_controls}</p>
                            <p className="text-sm text-gray-600">Ineffective</p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${framework.compliance_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Control Status Report */}
            {controlStatusData.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Control Effectiveness Report
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Control
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criticality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Effectiveness Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latest Test
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exceptions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {controlStatusData.slice(0, 20).map((control) => (
                        <tr key={control.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{control.code}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{control.title_en}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {control.domain}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              control.criticality === 'Critical' ? 'bg-red-100 text-red-800' :
                              control.criticality === 'High' ? 'bg-orange-100 text-orange-800' :
                              control.criticality === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {control.criticality}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-16 h-2 rounded-full mr-2 ${getEffectivenessBackground(control.control_effectiveness_score)}`}>
                                <div 
                                  className="h-2 rounded-full bg-current" 
                                  style={{ width: `${control.control_effectiveness_score}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${getEffectivenessColor(control.control_effectiveness_score)}`}>
                                {Math.round(control.control_effectiveness_score)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {control.latest_test_result ? (
                              <div className="flex items-center">
                                {control.latest_test_result === 'pass' ? 
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> :
                                  control.latest_test_result === 'fail' ?
                                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" /> :
                                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                                }
                                <span className="capitalize">{control.latest_test_result}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Not tested</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {control.approved_evidence_count}/{control.evidence_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {control.active_exceptions_count > 0 ? (
                              <span className="text-orange-600 font-medium">{control.active_exceptions_count}</span>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Report Generation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Report Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Report Type:</strong> {selectedReport.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <p><strong>Data Source:</strong> Real-time GRC database</p>
                  <p><strong>Tenant:</strong> Default Organization</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
