'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, 
  Loader2, Building2, User, ArrowRight
} from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  const isArabic = lng === 'ar';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [demoTracking, setDemoTracking] = useState<any>(null);

  // Track demo mode from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demo = urlParams.get('demo');
    const trackingId = urlParams.get('tracking');
    
    if (demo === 'true') {
      setDemoMode(true);
      // Track demo visit
      trackDemoVisit(trackingId);
    }
  }, []);

  const trackDemoVisit = async (trackingId: string | null) => {
    try {
      const response = await fetch('/api/auth/track-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          page: 'login',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
      
      const data = await response.json();
      setDemoTracking(data.tracking);
    } catch (error) {
      console.error('Demo tracking error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          demoMode,
          trackingId: demoTracking?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store auth token
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('tenant', JSON.stringify(data.tenant));
        
        // Redirect to dashboard
        router.push(`/${lng}/dashboard`);
      } else {
        setError(data.error || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى' : 'An error occurred. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      // Redirect to Microsoft OAuth
      const response = await fetch('/api/auth/microsoft/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoMode,
          trackingId: demoTracking?.id,
          returnUrl: `/${lng}/dashboard`
        })
      });

      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Microsoft login failed:', error);
      setError(isArabic ? 'فشل تسجيل الدخول عبر Microsoft' : 'Microsoft login failed');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Pre-fill demo credentials
    setFormData({
      email: 'demo@doganhub.com',
      password: 'Demo123456'
    });
    setDemoMode(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isArabic ? 'دوجان هب' : 'DoganHub'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isArabic ? 'منصة إدارة الأعمال المتكاملة' : 'Enterprise Business Management Platform'}
          </p>
        </div>

        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                {isArabic ? 'وضع التجربة - تتبع النشاط مفعل' : 'Demo Mode - Activity Tracking Enabled'}
              </span>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    className={`${isArabic ? 'pr-10' : 'pl-10'}`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                    className={`${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">
                    {isArabic ? 'تذكرني' : 'Remember me'}
                  </span>
                </label>
                <a href={`/${lng}/forgot-password`} className="text-sm text-blue-600 hover:underline">
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isArabic ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isArabic ? 'أو' : 'OR'}
                  </span>
                </div>
              </div>

              {/* Microsoft Login */}
              <Button
                type="button"
                onClick={handleMicrosoftLogin}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                {isArabic ? 'تسجيل الدخول عبر Microsoft' : 'Sign in with Microsoft'}
              </Button>

              {/* Demo Login */}
              <Button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <User className="w-5 h-5 mr-2" />
                {isArabic ? 'تجربة النظام (حساب تجريبي)' : 'Try Demo Account'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}
                {' '}
                <a 
                  href={`/${lng}/register`} 
                  className="text-blue-600 hover:underline font-medium"
                >
                  {isArabic ? 'سجل الآن' : 'Register now'}
                </a>
              </p>
            </div>

            {/* Demo Tracking Info */}
            {demoTracking && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p>{isArabic ? 'معرف التتبع:' : 'Tracking ID:'} {demoTracking.id}</p>
                <p>{isArabic ? 'الجلسة:' : 'Session:'} {demoTracking.sessionId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {isArabic ? '© 2025 دوجان هب. جميع الحقوق محفوظة.' : '© 2025 DoganHub. All rights reserved.'}
          </p>
          <div className="mt-2 space-x-4">
            <a href={`/${lng}/privacy`} className="hover:underline">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <span>•</span>
            <a href={`/${lng}/terms`} className="hover:underline">
              {isArabic ? 'الشروط والأحكام' : 'Terms of Service'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
