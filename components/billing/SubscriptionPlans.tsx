'use client';

import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
  loading?: boolean;
}

export default function SubscriptionPlans({
  onSelectPlan,
  currentPlan,
  loading = false
}: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/billing/plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data);
      } else {
        throw new Error(data.message || 'Failed to load plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Fallback to default plans
      setPlans(getDefaultPlans());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPlans = (): SubscriptionPlan[] => [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Perfect for small teams getting started',
      priceId: 'price_basic',
      price: 29,
      currency: 'usd',
      interval: 'month',
      features: [
        'Up to 5 users',
        'Basic reporting',
        'Email support',
        '10GB storage',
        'Standard integrations'
      ],
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      description: 'Best for growing businesses',
      priceId: 'price_pro',
      price: 99,
      currency: 'usd',
      interval: 'month',
      isPopular: true,
      features: [
        'Up to 25 users',
        'Advanced reporting',
        'Priority support',
        '100GB storage',
        'API access',
        'Custom integrations',
        'Advanced analytics'
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'For large organizations with advanced needs',
      priceId: 'price_enterprise',
      price: 299,
      currency: 'usd',
      interval: 'month',
      features: [
        'Unlimited users',
        'Custom reporting',
        'Dedicated support',
        'Unlimited storage',
        'Advanced API access',
        'Custom integrations',
        'SSO integration',
        'Advanced security',
        'Custom workflows'
      ],
    },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Users className="h-8 w-8 text-blue-600" />;
      case 'professional':
        return <Zap className="h-8 w-8 text-purple-600" />;
      case 'enterprise':
        return <Shield className="h-8 w-8 text-green-600" />;
      default:
        return <Star className="h-8 w-8 text-gray-600" />;
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Plans</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPlans}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-200 hover:shadow-lg ${
              plan.isPopular
                ? 'border-purple-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              currentPlan === plan.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.id)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-6">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-gray-600 ml-2">
                  /{plan.interval}
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={currentPlan === plan.id}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                currentPlan === plan.id
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.isPopular
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {currentPlan === plan.id ? 'Current Plan' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <span>✓ Cancel anytime</span>
          <span>✓ 24/7 support</span>
          <span>✓ Secure payments</span>
        </div>
      </div>
    </div>
  );
}
