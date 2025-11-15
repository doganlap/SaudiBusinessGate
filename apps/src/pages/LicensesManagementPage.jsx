'use client';

/**
 * Licenses Management Page - Platform Admin View
 * Saudi Store Platform License Management System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const LicensesManagementPage = () => {
  const [licenses, setLicenses] = useState([]);
  const [filteredLicenses, setFilteredLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');

  // Sample data - replace with API call
  const sampleLicenses = [
    {
      id: 'lic_001',
      tenantId: 'tenant_saudi_oil',
      tenantName: 'Saudi Oil Company',
      licenseCode: 'enterprise',
      status: 'active',
      validUntil: '2025-12-31',
      features: ['dashboard.advanced', 'analytics.premium', 'reports.custom'],
      maxUsers: 100,
      currentUsers: 87,
      maxStorageGB: 100,
      currentStorageGB: 64,
      monthlyFee: 2500,
      lastUpdated: '2025-11-10'
    },
    {
      id: 'lic_002',
      tenantId: 'tenant_gulf_bank',
      tenantName: 'Gulf Bank',
      licenseCode: 'professional',
      status: 'expiring_soon',
      validUntil: '2025-11-20',
      features: ['dashboard.business', 'analytics.standard'],
      maxUsers: 25,
      currentUsers: 23,
      maxStorageGB: 10,
      currentStorageGB: 8,
      monthlyFee: 750,
      lastUpdated: '2025-11-08'
    },
    {
      id: 'lic_003',
      tenantId: 'tenant_riyadh_tech',
      tenantName: 'Riyadh Tech Solutions',
      licenseCode: 'basic',
      status: 'suspended',
      validUntil: '2025-10-15',
      features: ['dashboard.basic'],
      maxUsers: 5,
      currentUsers: 5,
      maxStorageGB: 1,
      currentStorageGB: 1.2,
      monthlyFee: 150,
      lastUpdated: '2025-10-20'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLicenses(sampleLicenses);
      setFilteredLicenses(sampleLicenses);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterLicenses();
  }, [searchTerm, filterStatus, filterTier, licenses]);

  const filterLicenses = () => {
    let filtered = licenses.filter(license => {
      const matchesSearch = license.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           license.tenantId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
      const matchesTier = filterTier === 'all' || license.licenseCode === filterTier;
      
      return matchesSearch && matchesStatus && matchesTier;
    });
    
    setFilteredLicenses(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      expiring_soon: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Expiring Soon' },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Expired' },
      suspended: { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Suspended' },
      trial: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Trial' }
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {config.text}
      </Badge>
    );
  };

  const getTierBadge = (licenseCode) => {
    const tierColors = {
      basic: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800',
      platform: 'bg-gold-100 text-gold-800'
    };

    return (
      <Badge className={tierColors[licenseCode] || tierColors.basic}>
        {licenseCode.charAt(0).toUpperCase() + licenseCode.slice(1)}
      </Badge>
    );
  };

  const getUsagePercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-600 mt-1">Manage tenant licenses and subscriptions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} className="mr-2" />
          New License
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Licenses</p>
                <p className="text-2xl font-bold text-gray-900">{licenses.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                <p className="text-2xl font-bold text-green-600">
                  {licenses.filter(l => l.status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {licenses.filter(l => l.status === 'expiring_soon').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${ licenses.filter(l => l.status === 'active')
                            .reduce((sum, l) => sum + l.monthlyFee, 0)
                            .toLocaleString() }
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
                <option value="trial">Trial</option>
              </select>

              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="platform">Platform</option>
              </select>

              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Licenses ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">Tenant</th>
                  <th className="text-left p-4 font-medium text-gray-900">License Tier</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Valid Until</th>
                  <th className="text-left p-4 font-medium text-gray-900">Users</th>
                  <th className="text-left p-4 font-medium text-gray-900">Storage</th>
                  <th className="text-left p-4 font-medium text-gray-900">Monthly Fee</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((license) => {
                  const userPercentage = getUsagePercentage(license.currentUsers, license.maxUsers);
                  const storagePercentage = getUsagePercentage(license.currentStorageGB, license.maxStorageGB);
                  
                  return (
                    <tr key={license.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{license.tenantName}</div>
                          <div className="text-sm text-gray-500">{license.tenantId}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getTierBadge(license.licenseCode)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(license.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{license.validUntil}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className={getUsageColor(userPercentage)}>
                            {license.currentUsers}/{license.maxUsers}
                          </span>
                          <div className="text-xs text-gray-500">({userPercentage}%)</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className={getUsageColor(storagePercentage)}>
                            {license.currentStorageGB}GB/{license.maxStorageGB}GB
                          </span>
                          <div className="text-xs text-gray-500">({storagePercentage}%)</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${license.monthlyFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicensesManagementPage;