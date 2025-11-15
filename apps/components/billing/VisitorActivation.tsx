'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface VisitorActivationProps {
  token?: string;
  tenantId?: string;
  onActivationComplete?: (data: any) => void;
  onSendActivation?: (email: string, tenantId: string) => void;
}

export default function VisitorActivation({
  token,
  tenantId,
  onActivationComplete,
  onSendActivation
}: VisitorActivationProps) {
  const [step, setStep] = useState<'email' | 'activating' | 'success' | 'error'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationData, setActivationData] = useState<any>(null);

  useEffect(() => {
    if (token && tenantId) {
      handleActivation();
    }
  }, [token, tenantId]);

  const handleSendActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !tenantId) {
      setError('Email and tenant ID are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send activation email via API
      const response = await fetch('/api/billing/send-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tenantId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('success');
        if (onSendActivation) {
          onSendActivation(email, tenantId);
        }
      } else {
        throw new Error(data.message || 'Failed to send activation email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async () => {
    if (!token || !tenantId) {
      setError('Invalid activation link');
      setStep('error');
      return;
    }

    setStep('activating');
    setLoading(true);
    setError(null);

    try {
      // Activate account via API
      const response = await fetch('/api/billing/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          tenantId,
          email,
          name
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setActivationData(data);
        setStep('success');
        
        if (onActivationComplete) {
          onActivationComplete(data);
        }
      } else {
        throw new Error(data.message || 'Activation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
        <p className="text-gray-600">
          Enter your email address to receive an activation link and get started with your account.
        </p>
      </div>

      <form onSubmit={handleSendActivation} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Activation Email
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Instant Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>No Credit Card</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivatingStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Activating Your Account</h2>
      <p className="text-gray-600 mb-8">
        Please wait while we set up your account and prepare your workspace.
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Verifying activation token</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-blue-500 animate-spin" />
          <span>Setting up your workspace</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Preparing your dashboard</span>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {activationData ? 'Account Activated!' : 'Email Sent!'}
      </h2>
      <p className="text-gray-600 mb-8">
        {activationData 
          ? 'Your account has been successfully activated. You can now access all features.'
          : 'We\'ve sent an activation link to your email address. Please check your inbox and click the link to activate your account.'
        }
      </p>
      
      {activationData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-green-800">
            <div className="font-medium">Welcome, {activationData.user?.name || activationData.user?.email}!</div>
            <div>Your account is now ready to use.</div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (activationData && onActivationComplete) {
            onActivationComplete(activationData);
          } else {
            setStep('email');
            setEmail('');
            setName('');
            setError(null);
          }
        }}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {activationData ? 'Continue to Dashboard' : 'Send Another Email'}
      </button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Activation Failed</h2>
      <p className="text-gray-600 mb-6">
        {error || 'There was an error activating your account. Please try again or contact support.'}
      </p>
      
      <div className="space-y-3">
        <button
          onClick={() => {
            setStep('email');
            setError(null);
          }}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = 'mailto:support@example.com'}
          className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-96 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        {step === 'email' && renderEmailStep()}
        {step === 'activating' && renderActivatingStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
}
