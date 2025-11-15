'use client';

/**
 * Renewals Pipeline Page - 120-Day Pipeline View
 * Saudi Store Platform License Renewal Management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  Send
} from 'lucide-react';

const RenewalsPipelinePage = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('120_days');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample renewal pipeline data
  const sampleRenewals = [
    {
      id: 'ren_001',
      tenantId: 'tenant_gulf_bank',
      tenantName: 'Gulf Bank',
      currentLicense: 'professional',
      expiryDate: '2025-11-20',
      daysUntilExpiry: 8,
      annualValue: 9000,
      contactPerson: 'Ahmed Al-Mansouri',
      contactEmail: 'ahmed.mansouri@gulfbank.sa',
      contactPhone: '+966-11-123-4567',
      renewalStage: 'negotiation',
      probability: 85,
      lastContact: '2025-11-10',
      nextAction: 'Follow-up call scheduled',
      notes: 'Considering upgrade to Enterprise. Price sensitive.',
      riskLevel: 'medium',
      autoRenewal: false,
      communicationHistory: [
        { date: '2025-10-15', type: 'email', status: 'sent', subject: '120-day renewal notice' },
        { date: '2025-10-30', type: 'email', status: 'sent', subject: '90-day renewal reminder' },
        { date: '2025-11-05', type: 'call', status: 'completed', subject: 'Initial renewal discussion' },
        { date: '2025-11-10', type: 'email', status: 'sent', subject: 'Renewal proposal with upgrade options' }
      ]
    },
    {
      id: 'ren_002',
      tenantId: 'tenant_riyadh_medical',
      tenantName: 'Riyadh Medical Center',
      currentLicense: 'enterprise',
      expiryDate: '2025-12-15',
      daysUntilExpiry: 33,
      annualValue: 30000,
      contactPerson: 'Dr. Fatima Al-Zahra',
      contactEmail: 'fatima.alzahra@rmc.sa',
      contactPhone: '+966-11-987-6543',
      renewalStage: 'proposal_sent',
      probability: 95,
      lastContact: '2025-11-08',
      nextAction: 'Awaiting signature',
      notes: 'Very satisfied customer. Auto-renewal preferred.',
      riskLevel: 'low',
      autoRenewal: true,
      communicationHistory: [
        { date: '2025-09-15', type: 'email', status: 'sent', subject: '120-day renewal notice' },
        { date: '2025-10-01', type: 'call', status: 'completed', subject: 'Renewal planning call' },
        { date: '2025-11-08', type: 'email', status: 'sent', subject: 'Final renewal contract' }
      ]
    },
    {
      id: 'ren_003',
      tenantId: 'tenant_jeddah_logistics',
      tenantName: 'Jeddah Logistics Solutions',
      currentLicense: 'basic',
      expiryDate: '2026-01-30',
      daysUntilExpiry: 79,
      annualValue: 1800,
      contactPerson: 'Omar Al-Rashid',
      contactEmail: 'omar.rashid@jls.sa',
      contactPhone: '+966-12-555-9999',
      renewalStage: 'initial_contact',
      probability: 65,
      lastContact: '2025-10-20',
      nextAction: 'Schedule upgrade demo',
      notes: 'Interested in Professional tier. Need demo of advanced features.',
      riskLevel: 'medium',
      autoRenewal: false,
      communicationHistory: [
        { date: '2025-10-20', type: 'email', status: 'sent', subject: '120-day renewal notice' }
      ]
    },
    {
      id: 'ren_004',
      tenantId: 'tenant_dammam_oil',
      tenantName: 'Dammam Oil Services',
      currentLicense: 'enterprise',
      expiryDate: '2025-11-25',
      daysUntilExpiry: 13,
      annualValue: 45000,
      contactPerson: 'Mohammed Al-Ghamdi',
      contactEmail: 'mohammed.ghamdi@dos.sa',
      contactPhone: '+966-13-777-8888',
      renewalStage: 'at_risk',
      probability: 40,
      lastContact: '2025-11-05',
      nextAction: 'Urgent: Executive escalation needed',
      notes: 'Budget constraints. Considering downgrade or cancellation.',
      riskLevel: 'high',
      autoRenewal: false,
      communicationHistory: [
        { date: '2025-09-25', type: 'email', status: 'sent', subject: '120-day renewal notice' },
        { date: '2025-10-15', type: 'call', status: 'missed', subject: 'Renewal discussion' },
        { date: '2025-10-20', type: 'email', status: 'opened', subject: 'Flexible renewal options' },
        { date: '2025-11-05', type: 'call', status: 'completed', subject: 'Budget discussion' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRenewals(sampleRenewals);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRenewals = renewals.filter(renewal => {
    const matchesTimeframe = () => {
      switch (selectedTimeframe) {
        case '30_days': return renewal.daysUntilExpiry <= 30;
        case '60_days': return renewal.daysUntilExpiry <= 60;
        case '90_days': return renewal.daysUntilExpiry <= 90;
        case '120_days': return renewal.daysUntilExpiry <= 120;
        default: return true;
      }
    };

    const matchesStatus = filterStatus === 'all' || renewal.renewalStage === filterStatus;
    
    return matchesTimeframe() && matchesStatus;
  });

  const getStagebadge = (stage) => {
    const stageConfig = {
      initial_contact: { color: 'bg-blue-100 text-blue-800', text: 'Initial Contact' },
      proposal_sent: { color: 'bg-purple-100 text-purple-800', text: 'Proposal Sent' },
      negotiation: { color: 'bg-yellow-100 text-yellow-800', text: 'Negotiation' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      at_risk: { color: 'bg-red-100 text-red-800', text: 'At Risk' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };

    const config = stageConfig[stage] || stageConfig.initial_contact;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getRiskBadge = (risk) => {
    const riskConfig = {
      low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      high: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = riskConfig[risk] || riskConfig.medium;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {risk.charAt(0).toUpperCase() + risk.slice(1)}
      </Badge>
    );
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysUntilExpiryColor = (days) => {
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 30) return 'text-orange-600 font-medium';
    if (days <= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTotalPipelineValue = () => {
    return filteredRenewals.reduce((sum, renewal) => sum + renewal.annualValue, 0);
  };

  const getWeightedPipelineValue = () => {
    return filteredRenewals.reduce((sum, renewal) => 
      sum + (renewal.annualValue * renewal.probability / 100), 0);
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
          <h1 className="text-3xl font-bold text-gray-900">Renewals Pipeline</h1>
          <p className="text-gray-600 mt-1">Track and manage license renewals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send size={16} className="mr-2" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${getTotalPipelineValue().toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weighted Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${getWeightedPipelineValue().toLocaleString()}
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
                <p className="text-2xl font-bold text-red-600">
                  {filteredRenewals.filter(r => r.daysUntilExpiry <= 30).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredRenewals.filter(r => r.riskLevel === 'high').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30_days">Next 30 Days</option>
                <option value="60_days">Next 60 Days</option>
                <option value="90_days">Next 90 Days</option>
                <option value="120_days">Next 120 Days</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                <option value="initial_contact">Initial Contact</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="approved">Approved</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Pipeline ({filteredRenewals.length} renewals)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">Tenant</th>
                  <th className="text-left p-4 font-medium text-gray-900">Expires</th>
                  <th className="text-left p-4 font-medium text-gray-900">Value</th>
                  <th className="text-left p-4 font-medium text-gray-900">Probability</th>
                  <th className="text-left p-4 font-medium text-gray-900">Stage</th>
                  <th className="text-left p-4 font-medium text-gray-900">Risk</th>
                  <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left p-4 font-medium text-gray-900">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.map((renewal) => (
                  <tr key={renewal.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{renewal.tenantName}</div>
                        <div className="text-sm text-gray-500">{renewal.currentLicense} license</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm text-gray-900">{renewal.expiryDate}</div>
                        <div className={`text-xs ${getDaysUntilExpiryColor(renewal.daysUntilExpiry)}`}>
                          {renewal.daysUntilExpiry} days
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${renewal.annualValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`text-sm font-medium ${getProbabilityColor(renewal.probability)}`}>
                        {renewal.probability}%
                      </div>
                    </td>
                    <td className="p-4">
                      {getStagebadge(renewal.renewalStage)}
                    </td>
                    <td className="p-4">
                      {getRiskBadge(renewal.riskLevel)}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm text-gray-900">{renewal.contactPerson}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={10} />
                          {renewal.contactEmail}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{renewal.nextAction}</div>
                      <div className="text-xs text-gray-500">Last: {renewal.lastContact}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalsPipelinePage;