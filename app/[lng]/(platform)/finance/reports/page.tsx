'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Calendar, TrendingUp, 
  BarChart3, PieChart, DollarSign, Building2 
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'compliance';
  icon: React.ComponentType<any>;
  lastGenerated: string;
  frequency: string;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const reports: Report[] = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Comprehensive income statement showing revenue, expenses, and net profit',
      type: 'financial',
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      frequency: 'Monthly'
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Statement of financial position showing assets, liabilities, and equity',
      type: 'financial',
      icon: BarChart3,
      lastGenerated: '2024-01-15',
      frequency: 'Monthly'
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Analysis of cash inflows and outflows from operations, investing, and financing',
      type: 'financial',
      icon: DollarSign,
      lastGenerated: '2024-01-15',
      frequency: 'Monthly'
    },
    {
      id: 'expense-analysis',
      name: 'Expense Analysis',
      description: 'Detailed breakdown of expenses by category, department, and cost center',
      type: 'operational',
      icon: PieChart,
      lastGenerated: '2024-01-14',
      frequency: 'Weekly'
    },
    {
      id: 'budget-variance',
      name: 'Budget Variance Report',
      description: 'Comparison of actual vs budgeted amounts with variance analysis',
      type: 'operational',
      icon: BarChart3,
      lastGenerated: '2024-01-14',
      frequency: 'Monthly'
    },
    {
      id: 'accounts-receivable',
      name: 'Accounts Receivable Aging',
      description: 'Outstanding customer invoices categorized by age',
      type: 'operational',
      icon: Building2,
      lastGenerated: '2024-01-13',
      frequency: 'Weekly'
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId} for period: ${selectedPeriod}`);
    // Here you would typically call an API to generate the report
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    // Here you would typically download the pre-generated report
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-gray-600">
            Generate and download comprehensive financial reports
          </p>
        </div>
        
        {/* Period Selection */}
        <div className="flex items-center space-x-4">
          <label htmlFor="period" className="text-sm font-medium text-gray-700">
            Report Period:
          </label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="current-year">Current Year</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-gray-500">Available reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-gray-500">Reports generated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-gray-500">Auto-scheduled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">12</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(report.type)}`}>
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span>{report.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Generated:</span>
                    <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex-1 flex items-center justify-center space-x-2"
                    size="sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate</span>
                  </Button>
                  <Button
                    onClick={() => handleDownloadReport(report.id)}
                    variant="outline"
                    className="flex items-center justify-center"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.slice(0, 3).map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500">
                        Generated on {new Date(report.lastGenerated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
