'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Download,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
}

interface Customer {
  id: string;
  email: string;
  name?: string;
}

interface BillingData {
  tenant: {
    id: string;
    status: string;
  };
  customer: Customer | null;
  subscriptions: Subscription[];
  upcomingInvoice: any;
  availablePlans: any[];
}

interface BillingDashboardProps {
  tenantId: string;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}

export default function BillingDashboard({
  tenantId,
  onUpgrade,
  onManageBilling
}: BillingDashboardProps) {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, [tenantId]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch real billing data from API
      const response = await fetch(`/api/billing/subscription/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const data = await response.json();
      
      if (data.success) {
        setBillingData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load billing data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'trialing':
        return 'text-blue-600 bg-blue-50';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-50';
      case 'canceled':
      case 'unpaid':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'past_due':
      case 'unpaid':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId }),
      });

      const data = await response.json();
      
      if (data.success) {
        window.open(data.data.portalUrl, '_blank');
      } else {
        throw new Error(data.message || 'Failed to open billing portal');
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      if (onManageBilling) {
        onManageBilling();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Billing Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBillingData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return null;
  }

  const activeSubscription = billingData.subscriptions.find(sub => sub.status === 'active');
  const hasActiveSubscription = !!activeSubscription;

  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Account Status</h3>
              <p className="text-sm text-gray-600">Current account state</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(billingData.tenant.status)}`}>
            {getStatusIcon(billingData.tenant.status)}
            {billingData.tenant.status.charAt(0).toUpperCase() + billingData.tenant.status.slice(1)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Current Plan</h3>
              <p className="text-sm text-gray-600">Active subscription</p>
            </div>
          </div>
          {activeSubscription ? (
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(activeSubscription.amount, activeSubscription.currency)}
              </div>
              <div className="text-sm text-gray-600">
                per {activeSubscription.interval}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No active subscription</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Next Billing</h3>
              <p className="text-sm text-gray-600">Upcoming charge</p>
            </div>
          </div>
          {activeSubscription ? (
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(activeSubscription.currentPeriodEnd)}
              </div>
              {activeSubscription.cancelAtPeriodEnd && (
                <div className="text-sm text-red-600 mt-1">
                  Cancels at period end
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No upcoming billing</div>
          )}
        </div>
      </div>

      {/* Subscription Details */}
      {billingData.subscriptions.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Subscription Details</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {billingData.subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(subscription.status)}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatPrice(subscription.amount, subscription.currency)} / {subscription.interval}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Information */}
      {billingData.customer && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{billingData.customer.email}</div>
              </div>
              {billingData.customer.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-gray-900">{billingData.customer.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {hasActiveSubscription && (
          <button
            onClick={handleManageBilling}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Manage Billing
          </button>
        )}
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            {hasActiveSubscription ? 'Change Plan' : 'Choose Plan'}
          </button>
        )}
      </div>

      {/* No Subscription State */}
      {!hasActiveSubscription && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-6">
            Choose a plan to get started with our premium features
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Plans
            </button>
          )}
        </div>
      )}
    </div>
  );
}
