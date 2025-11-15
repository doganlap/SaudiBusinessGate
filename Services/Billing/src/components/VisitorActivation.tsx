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

const VisitorActivation: React.FC<VisitorActivationProps> = ({
  token,
  tenantId,
  onActivationComplete,
  onSendActivation
}) => {
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
      const response = await fetch('/api/billing/send-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tenantId }),
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
      const response = await fetch('/api/billing/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          tenantId,
          activationToken: token,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActivationData(data.data);
        setStep('success');
        if (onActivationComplete) {
          onActivationComplete(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to activate account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
        <p className="text-gray-600">
          Enter your email to receive an activation link and start your free trial
        </p>
      </div>

      <form onSubmit={handleSendActivation} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Activation Email
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-xs text-gray-600">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 text-yellow-600 mb-2" />
            <span className="text-xs text-gray-600">Instant</span>
          </div>
          <div className="flex flex-col items-center">
            <User className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600">Free Trial</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivating = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Activating Account</h2>
      <p className="text-gray-600">
        Please wait while we activate your account...
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      {activationData ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been successfully activated. You can now access all features.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-green-800">
              <p><strong>Tenant ID:</strong> {activationData.tenantId}</p>
              <p><strong>Status:</strong> {activationData.status}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Email Sent!</h2>
          <p className="text-gray-600 mb-6">
            We've sent an activation link to <strong>{email}</strong>. 
            Please check your inbox and click the link to activate your account.
          </p>
        </>
      )}

      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
        
        {!activationData && (
          <button
            onClick={() => setStep('email')}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Send Another Email
          </button>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>Didn't receive the email? Check your spam folder or try again.</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
      <p className="text-gray-600 mb-6">
        {error || 'Something went wrong during activation. Please try again.'}
      </p>
      
      <div className="space-y-3">
        <button
          onClick={() => {
            setStep('email');
            setError(null);
          }}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/contact'}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'email' && renderEmailForm()}
          {step === 'activating' && renderActivating()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitorActivation;
