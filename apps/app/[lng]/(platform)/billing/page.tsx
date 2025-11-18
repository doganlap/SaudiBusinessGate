'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';

// Import billing components
import SubscriptionPlans from '@/components/billing/SubscriptionPlans';
import BillingDashboard from '@/components/billing/BillingDashboard';
import VisitorActivation from '@/components/billing/VisitorActivation';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  activated: boolean;
  currentPlan?: string;
  stripeCustomerId?: string;
}

export default function BillingPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || 'en';
  
  const [currentView, setCurrentView] = useState<'activation' | 'plans' | 'dashboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user from authentication context
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch current user from authentication API
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/auth/signin';
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user information');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Determine initial view based on user state
    if (currentUser) {
      if (!currentUser.activated) {
        setCurrentView('activation');
      } else if (!currentUser.currentPlan) {
        setCurrentView('plans');
      } else {
        setCurrentView('dashboard');
      }
      setLoading(false);
    }
  }, [currentUser]);

  const handlePlanSelection = async (plan: any) => {
    try {
      setLoading(true);
      
      // Create checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          tenantId: currentUser?.tenantId,
          customerEmail: currentUser?.email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setCurrentView('plans');
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      
      // Create billing portal session
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: currentUser?.stripeCustomerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Stripe billing portal
        window.location.href = data.data.portalUrl;
      } else {
        throw new Error(data.message || 'Failed to create billing portal session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleActivationComplete = (data: any) => {
    console.log('Activation completed:', data);
    // Update user state and redirect to plans
    setCurrentView('plans');
  };

  const handleSendActivation = (email: string, tenantId: string) => {
    console.log('Activation email sent to:', email, 'for tenant:', tenantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              // Retry logic here
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentView === 'activation' && 'Account Activation'}
                {currentView === 'plans' && 'Choose Your Plan'}
                {currentView === 'dashboard' && 'Billing & Subscription'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {currentView === 'activation' && 'Activate your account to get started'}
                {currentView === 'plans' && 'Select the perfect plan for your needs'}
                {currentView === 'dashboard' && 'Manage your subscription and billing'}
              </p>
            </div>
            
            {currentView === 'dashboard' && (
              <div className="flex gap-3">
                <button
                  onClick={handleUpgrade}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={handleManageBilling}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Manage Billing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'activation' && currentUser && (
          <VisitorActivation
            tenantId={currentUser.tenantId}
            onActivationComplete={handleActivationComplete}
            onSendActivation={handleSendActivation}
          />
        )}
        
        {currentView === 'plans' && (
          <SubscriptionPlans
            onSelectPlan={handlePlanSelection}
            currentPlan={currentUser?.currentPlan}
            loading={loading}
          />
        )}
        
        {currentView === 'dashboard' && currentUser && (
          <BillingDashboard
            tenantId={currentUser.tenantId}
            onUpgrade={handleUpgrade}
            onManageBilling={handleManageBilling}
          />
        )}
      </div>

      {/* Navigation */}
      {currentUser?.activated && (
        <div className="fixed bottom-6 right-6">
          <div className="bg-white rounded-lg shadow-lg border p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('plans')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  currentView === 'plans'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
