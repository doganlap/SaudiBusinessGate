'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

export default function AuthPage() {
  const params = useParams() as any;
  const router = useRouter();
  const lng = (params?.lng as string) || 'en';
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // محاكاة تسجيل الدخول
    setTimeout(() => {
      setLoading(false);
      // توجيه للوحة التحكم
      router.push(`/${lng}/dashboard`);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-primary-50 via-white to-neutral-50">
      <section className="w-full max-w-md">
        {/* شعار التطبيق */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">د</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DoganHub Store</h1>
          <p className="text-gray-600">منصة إدارة الأعمال المتكاملة</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="rounded-2xl bg-white/70 shadow-glass backdrop-blur-sm border border-white/20 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بعودتك</h2>
            <p className="text-sm text-gray-600">
              أدخل بياناتك للوصول للوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 pr-10 pl-3 py-3 text-right placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="you@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 pr-10 pl-12 py-3 text-right placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* رابط نسيت كلمة المرور */}
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 ml-2"
                />
                <span className="text-sm text-gray-600">تذكرني</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* معلومات تجريبية */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-center text-gray-600 mb-2 font-medium">
              🚀 حساب تجريبي للاختبار
            </p>
            <div className="text-xs text-gray-500 space-y-1 font-mono text-center" dir="ltr">
              <div>Email: demo@doganhubstore.com</div>
              <div>Password: demo123</div>
            </div>
          </div>

          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                إنشاء حساب جديد
              </a>
            </p>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 DoganHub Store. جميع الحقوق محفوظة.
          </p>
        </div>
      </section>
    </main>
  );
}
