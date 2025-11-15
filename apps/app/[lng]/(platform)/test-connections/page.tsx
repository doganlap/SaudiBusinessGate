'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ConnectionTest {
  name: string;
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  responseTime?: number;
}

export default function TestConnectionsPage() {
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { name: 'Dashboard Stats', endpoint: '/api/dashboard/stats' },
    { name: 'Dashboard Activity', endpoint: '/api/dashboard/activity' },
    { name: 'Authentication', endpoint: '/api/auth/me' },
    { name: 'Billing Plans', endpoint: '/api/billing/plans' },
    { name: 'Finance Stats', endpoint: '/api/finance/stats' },
    { name: 'Finance Accounts', endpoint: '/api/finance/accounts' },
    { name: 'Finance Transactions', endpoint: '/api/finance/transactions' },
    { name: 'Analytics KPIs', endpoint: '/api/analytics/kpis/business' },
    { name: 'Theme Management', endpoint: '/api/themes/demo-org' }
  ];

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);
    const initialTests = endpoints.map(endpoint => ({
      ...endpoint,
      status: 'pending' as const
    }));
    setTests(initialTests);

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const response = await fetch(endpoint.endpoint);
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            return {
              ...endpoint,
              status: 'success' as const,
              response: data,
              responseTime
            };
          } else {
            return {
              ...endpoint,
              status: 'error' as const,
              error: `HTTP ${response.status}: ${response.statusText}`,
              responseTime
            };
          }
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            ...endpoint,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
          };
        }
      })
    );

    const finalTests = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          ...endpoints[index],
          status: 'error' as const,
          error: 'Test failed to complete'
        };
      }
    });

    setTests(finalTests);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Connection Tests</h1>
              <p className="mt-1 text-sm text-gray-500">
                Test all API endpoints and database connections
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Run Tests'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{successCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Connection Test Results</h2>
            <p className="text-sm text-gray-600">Status of all API endpoints and services</p>
          </div>
          <div className="divide-y divide-gray-200">
            {tests.map((test, index) => (
              <div key={index} className={`p-6 ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500">{test.endpoint}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {test.responseTime && (
                      <div className="text-sm text-gray-500">{test.responseTime}ms</div>
                    )}
                    {test.status === 'success' && (
                      <div className="text-sm text-green-600 font-medium">Connected</div>
                    )}
                    {test.status === 'error' && (
                      <div className="text-sm text-red-600 font-medium">Failed</div>
                    )}
                    {test.status === 'pending' && (
                      <div className="text-sm text-yellow-600 font-medium">Testing...</div>
                    )}
                  </div>
                </div>
                
                {test.error && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Error:</p>
                    <p className="text-sm text-red-600">{test.error}</p>
                  </div>
                )}
                
                {test.response && test.status === 'success' && (
                  <div className="mt-3">
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        View Response Data
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overall Status */}
        <div className="mt-8 text-center">
          {errorCount === 0 && successCount === tests.length && (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              All connections are working properly!
            </div>
          )}
          {errorCount > 0 && (
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              <XCircle className="h-5 w-5 mr-2" />
              {errorCount} connection{errorCount > 1 ? 's' : ''} failed - check the logs above
            </div>
          )}
          {pendingCount > 0 && (
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <Clock className="h-5 w-5 mr-2" />
              {pendingCount} test{pendingCount > 1 ? 's' : ''} still running...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
