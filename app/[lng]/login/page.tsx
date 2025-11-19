'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, 
  Loader2, Building2, User, ArrowRight
} from 'lucide-react';
import { defaultLanguage } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || defaultLanguage;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo with Glass Effect */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 backdrop-blur-xl bg-white/20 rounded-2xl border border-white/30 shadow-2xl">
            <Building2 className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            {isArabic ? 'دوجان هب' : 'DoganHub'}
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            {isArabic ? 'منصة إدارة الأعمال المتكاملة' : 'Enterprise Business Management Platform'}
          </p>
        </div>

        {/* Already Logged In Banner */}
        {isLoggedIn && (
          <div className="mb-4 p-4 backdrop-blur-xl bg-green-500/20 border border-green-300/30 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-green-200 mr-2" />
                <span className="text-sm text-green-100 font-medium">
                  {isArabic ? 'أنت مسجل الدخول بالفعل' : 'You are already logged in'}
                </span>
              </div>
              <button
                onClick={() => router.push(`/${lng}/dashboard`)}
                className="ml-4 px-4 py-2 backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 border border-green-300/30 rounded-lg text-white text-sm font-semibold transition-all duration-300 flex items-center"
              >
                {isArabic ? 'الذهاب للتطبيق' : 'Go to App'}
                <ArrowRight className={`w-4 h-4 ${isArabic ? 'mr-2' : 'ml-2'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Demo Mode Banner with Glass */}
        {demoMode && (
          <div className="mb-4 p-4 backdrop-blur-xl bg-yellow-500/20 border border-yellow-300/30 rounded-xl shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-200 mr-2" />
              <span className="text-sm text-yellow-100 font-medium">
                {isArabic ? 'وضع التجربة - تتبع النشاط مفعل' : 'Demo Mode - Activity Tracking Enabled'}
              </span>
            </div>
          </div>
        )}

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </h2>
            <p className="text-center text-white/80 mt-2 text-sm">
              {isArabic ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account'}
            </p>
          </div>

          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    className={`w-full ${isArabic ? 'pr-12' : 'pl-12'} py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                    className={`w-full ${isArabic ? 'pr-24' : 'pl-24'} py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center p-4 backdrop-blur-md bg-red-500/20 border border-red-300/30 rounded-xl shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-200 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-100 font-medium">{error}</span>
                </div>
              )}

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 w-4 h-4 accent-white/50" />
                  <span className="text-sm text-white/90">
                    {isArabic ? 'تذكرني' : 'Remember me'}
                  </span>
                </label>
                <a href={`/${lng}/forgot-password`} className="text-sm text-white/90 hover:text-white underline transition-colors">
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 backdrop-blur-md bg-white/30 hover:bg-white/40 border border-white/40 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className={isArabic ? 'mr-2' : 'ml-2'}>
                      {isArabic ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}
                    </span>
                  </>
                ) : (
                  <>
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 backdrop-blur-md bg-white/10 text-white/80 rounded-full">
                    {isArabic ? 'أو' : 'OR'}
                  </span>
                </div>
              </div>

              {/* Microsoft Login */}
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full py-3 px-6 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                {isArabic ? 'تسجيل الدخول عبر Microsoft' : 'Sign in with Microsoft'}
              </button>

              {/* Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 px-6 backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 border border-green-300/30 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mt-3"
              >
                <User className="w-5 h-5 mr-2" />
                {isArabic ? 'تجربة النظام (حساب تجريبي)' : 'Try Demo Account'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/80">
                {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}
                {' '}
                <a 
                  href={`/${lng}/register`} 
                  className="text-white hover:text-white/80 underline font-semibold transition-colors"
                >
                  {isArabic ? 'سجل الآن' : 'Register now'}
                </a>
              </p>
            </div>

            {/* Go to App Link */}
            <div className="mt-4 text-center">
              <a 
                href={`/${lng}/dashboard`}
                className="text-sm text-white/80 hover:text-white underline transition-colors inline-flex items-center"
              >
                {isArabic ? 'الذهاب إلى التطبيق' : 'Go to App'}
                <ArrowRight className={`w-4 h-4 ${isArabic ? 'mr-2' : 'ml-2'}`} />
              </a>
            </div>

            {/* Demo Tracking Info */}
            {demoTracking && (
              <div className="mt-4 p-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl text-xs text-white/80">
                <p className="font-semibold">{isArabic ? 'معرف التتبع:' : 'Tracking ID:'} {demoTracking.id}</p>
                <p>{isArabic ? 'الجلسة:' : 'Session:'} {demoTracking.sessionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/80 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="drop-shadow-sm">
            {isArabic ? '© 2025 دوجان هب. جميع الحقوق محفوظة.' : '© 2025 DoganHub. All rights reserved.'}
          </p>
          <div className="mt-2 space-x-4">
            <a href={`/${lng}/privacy`} className="hover:text-white transition-colors underline">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <span className="text-white/60">•</span>
            <a href={`/${lng}/terms`} className="hover:text-white transition-colors underline">
              {isArabic ? 'الشروط والأحكام' : 'Terms of Service'}
            </a>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
