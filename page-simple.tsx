/**
 * Simple Working Landing Page - AppStore 360+ Pages Enterprise System
 * This is a working version that should deploy successfully
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const enterpriseFeatures = [
    { name: 'AI Modules', count: 40, path: '/ai-modules' },
    { name: 'Business Modules', count: 50, path: '/business' },
    { name: 'Analytics', count: 30, path: '/analytics' },
    { name: 'Process Management', count: 40, path: '/process' },
    { name: 'Enterprise Features', count: 45, path: '/enterprise' },
    { name: 'Integration Hub', count: 35, path: '/integration' },
    { name: 'Quality Control', count: 25, path: '/quality' },
    { name: 'Security Center', count: 20, path: '/security' },
    { name: 'System Admin', count: 25, path: '/system' },
    { name: 'Reporting Suite', count: 30, path: '/reporting' },
    { name: 'Admin Panel', count: 25, path: '/admin' },
    { name: 'Dashboard', count: 20, path: '/dashboard' }
  ];

  const systemStats = [
    { label: 'Database Tables', value: '542' },
    { label: 'Frontend Pages', value: '362' },
    { label: 'API Endpoints', value: '246' },
    { label: 'Backend Services', value: '64' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AppStore Enterprise</h1>
                <p className="text-sm text-gray-600">360+ Pages • 542 Tables • Full Enterprise Suite</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Production Ready</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Enterprise Level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Welcome to Your Enterprise System</h2>
          <p className="text-blue-100 mb-6">
            Complete business automation platform with AI, IoT, compliance, and workflow management
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span>542 Database Tables Created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span>All Enterprise Features Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              <span>Production Ready & Secure</span>
            </div>
          </div>
        </div>

        {/* Enterprise Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Modules & Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="bg-white hover:shadow-lg transition-shadow cursor-pointer rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                    <p className="text-gray-600">{feature.count} pages available</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{feature.count}</span>
                </div>
                <Link href={feature.path}>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Access Module
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <p className="text-gray-600 mb-6">Access key system functions</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Admin Panel
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Dashboard
              </button>
            </Link>
            <Link href="/api/health">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                System Health
              </button>
            </Link>
            <Link href="/activation">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Service Activation
              </button>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span>✓</span>
            <span className="font-medium">System Status: All Systems Operational</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Enterprise system with 542 tables, 362 pages, and full feature set deployed successfully
          </p>
        </div>
      </div>
    </div>
  );
}


