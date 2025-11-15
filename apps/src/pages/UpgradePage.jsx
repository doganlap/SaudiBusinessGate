'use client';

/**
 * Upgrade Page - Upsell and Upgrade Flow
 * Saudi Store Platform License Upgrade Management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  Users, 
  HardDrive, 
  Activity, 
  BarChart3, 
  Shield, 
  Headphones,
  ArrowRight,
  Crown,
  Zap,
  Globe
} from 'lucide-react';

const UpgradePage = () => {
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [selectedPlan, setSelectedPlan] = useState('enterprise');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);

  // License tiers configuration
  const licenseTiers = {
    basic: {
      name: 'Basic',
      price: { monthly: 150, annual: 1500 },
      features: [
        { name: 'Up to 5 users', included: true },
        { name: '1GB storage', included: true },
        { name: 'Basic dashboard', included: true },
        { name: '10 KPIs', included: true },
        { name: '1K API calls/month', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom reports', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced security', included: false }
      ],
      limits: {
        users: 5,
        storage: 1,
        kpis: 10,
        apiCalls: 1000
      },
      recommended: false
    },
    professional: {
      name: 'Professional',
      price: { monthly: 750, annual: 7500 },
      features: [
        { name: 'Up to 25 users', included: true },
        { name: '10GB storage', included: true },
        { name: 'Business dashboard', included: true },
        { name: '50 KPIs', included: true },
        { name: '10K API calls/month', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom reports', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced security', included: false }
      ],
      limits: {
        users: 25,
        storage: 10,
        kpis: 50,
        apiCalls: 10000
      },
      recommended: false
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 2500, annual: 25000 },
      features: [
        { name: 'Up to 100 users', included: true },
        { name: '100GB storage', included: true },
        { name: 'Enterprise dashboard', included: true },
        { name: '500 KPIs', included: true },
        { name: '100K API calls/month', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom reports', included: true },
        { name: 'Priority support', included: true },
        { name: 'Advanced security', included: true }
      ],
      limits: {
        users: 100,
        storage: 100,
        kpis: 500,
        apiCalls: 100000
      },
      recommended: true
    },
    platform: {
      name: 'Platform',
      price: { monthly: 5000, annual: 50000 },
      features: [
        { name: 'Unlimited users', included: true },
        { name: '1TB storage', included: true },
        { name: 'Platform dashboard', included: true },
        { name: 'Unlimited KPIs', included: true },
        { name: 'Unlimited API calls', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom reports', included: true },
        { name: 'Priority support', included: true },
        { name: 'Advanced security', included: true },
        { name: 'Cross-tenant admin', included: true },
        { name: 'White-label options', included: true }
      ],
      limits: {
        users: 'Unlimited',
        storage: 1024,
        kpis: 'Unlimited',
        apiCalls: 'Unlimited'
      },
      recommended: false
    }
  };

  // Sample current usage data
  const currentUsage = {
    users: 23,
    storage: 8.5,
    kpis: 47,
    apiCalls: 8500
  };

  const getDiscountPercentage = () => {
    return billingPeriod === 'annual' ? 17 : 0;
  };

  const getPriceWithDiscount = (tier) => {
    const basePrice = tier.price[billingPeriod];
    const discount = getDiscountPercentage();
    return billingPeriod === 'annual' ? basePrice * (1 - discount / 100) : basePrice;
  };

  const isUpgrade = (tierKey) => {
    const tierOrder = ['basic', 'professional', 'enterprise', 'platform'];
    return tierOrder.indexOf(tierKey) > tierOrder.indexOf(currentPlan);
  };

  const isCurrentPlan = (tierKey) => {
    return tierKey === currentPlan;
  };

  const getUsageWarning = (tierKey) => {
    const tier = licenseTiers[tierKey];
    const warnings = [];

    if (tier.limits.users !== 'Unlimited' && currentUsage.users > tier.limits.users) {
      warnings.push('Current user count exceeds limit');
    }
    if (tier.limits.storage !== 'Unlimited' && currentUsage.storage > tier.limits.storage) {
      warnings.push('Current storage usage exceeds limit');
    }
    if (tier.limits.kpis !== 'Unlimited' && currentUsage.kpis > tier.limits.kpis) {
      warnings.push('Current KPI count exceeds limit');
    }
    if (tier.limits.apiCalls !== 'Unlimited' && currentUsage.apiCalls > tier.limits.apiCalls) {
      warnings.push('Current API usage exceeds limit');
    }

    return warnings;
  };

  const getPlanIcon = (tierKey) => {
    const icons = {
      basic: Users,
      professional: BarChart3,
      enterprise: Shield,
      platform: Crown
    };
    return icons[tierKey] || Users;
  };

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate upgrade process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Upgrade to ${licenseTiers[selectedPlan].name} plan initiated!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mt-2">
          Upgrade your license to unlock more features and capabilities
        </p>
      </div>

      {/* Current Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentUsage.users}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentUsage.storage}GB</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentUsage.kpis}</div>
              <div className="text-sm text-gray-600">KPIs Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{currentUsage.apiCalls.toLocaleString()}</div>
              <div className="text-sm text-gray-600">API Calls/Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'annual'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            {getDiscountPercentage() > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800">
                Save {getDiscountPercentage()}%
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* License Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(licenseTiers).map(([tierKey, tier]) => {
          const IconComponent = getPlanIcon(tierKey);
          const warnings = getUsageWarning(tierKey);
          const isCurrentTier = isCurrentPlan(tierKey);
          const isUpgradeTier = isUpgrade(tierKey);
          const price = getPriceWithDiscount(tier);

          return (
            <Card
              key={tierKey}
              className={`relative ${
                tier.recommended
                  ? 'border-blue-500 border-2'
                  : isCurrentTier
                  ? 'border-green-500'
                  : selectedPlan === tierKey
                  ? 'border-purple-500 border-2'
                  : 'border-gray-200'
              } ${isCurrentTier ? 'bg-green-50' : ''}`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    <Star size={12} className="mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentTier && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    tier.recommended ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      tier.recommended ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ${price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-600">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billingPeriod === 'annual' && getDiscountPercentage() > 0 && (
                  <div className="text-sm text-gray-500 line-through">
                    ${tier.price.annual.toLocaleString()}/yr
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs font-medium text-red-800 mb-1">Usage Warnings:</div>
                    {warnings.map((warning, index) => (
                      <div key={index} className="text-xs text-red-700">
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {feature.included ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrentTier ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : isUpgradeTier ? (
                  <Button
                    onClick={() => setSelectedPlan(tierKey)}
                    variant={selectedPlan === tierKey ? "default" : "outline"}
                    className={`w-full ${
                      selectedPlan === tierKey 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : tier.recommended 
                        ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                        : ''
                    }`}
                  >
                    {selectedPlan === tierKey ? 'Selected' : 'Select Plan'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Downgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && selectedPlan !== currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">You're upgrading from:</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{licenseTiers[currentPlan].name}</span>
                    <span>${licenseTiers[currentPlan].price[billingPeriod].toLocaleString()}/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {licenseTiers[currentPlan].limits.users} users • {licenseTiers[currentPlan].limits.storage}GB storage
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">To:</h4>
                <div className="border border-purple-500 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{licenseTiers[selectedPlan].name}</span>
                    <span className="text-purple-600 font-bold">
                      ${getPriceWithDiscount(licenseTiers[selectedPlan]).toLocaleString()}/{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    {licenseTiers[selectedPlan].limits.users} users • {licenseTiers[selectedPlan].limits.storage}GB storage
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">What you'll get with this upgrade:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                {licenseTiers[selectedPlan].features
                  .filter(f => f.included && !licenseTiers[currentPlan].features.find(cf => cf.name === f.name && cf.included))
                  .map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Zap className="h-3 w-3 mr-2 text-blue-600" />
                      {feature.name}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Processing...' : `Upgrade to ${licenseTiers[selectedPlan].name}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ or Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help Choosing?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Our team can help you find the perfect plan for your organization's needs.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                <Headphones className="h-4 w-4 mr-2" />
                Contact Sales
              </Button>
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePage;