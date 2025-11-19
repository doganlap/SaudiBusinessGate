'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Star,
  ChevronDown
} from 'lucide-react';

export default function LangHomePage() {
  const router = useRouter();
  const params = useParams();
  const lng = params.lng as string || 'en';
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show landing page for 3 seconds, then redirect
    setShowContent(true);
    const timer = setTimeout(() => {
      router.push(`/${lng}/(platform)/dashboard`);
    }, 4000);

    return () => clearTimeout(timer);
  }, [router, lng]);

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Saudi Business Gate Enterprise</h1>
          <p className="text-blue-100 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Saudi Business Gate Enterprise</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/${lng}/(platform)/dashboard`} className="text-white hover:text-blue-200 transition-colors">
              {lng === 'ar' ? 'الدخول إلى النظام' : 'Enter Platform'}
            </Link>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Pioneering Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-sm mb-8 shadow-lg">
              <Star className="h-4 w-4 mr-2" />
              {lng === 'ar' ? 'أول بوابة أعمال ذاتية التشغيل في المنطقة' : 'The 1st Autonomous Business Gate in the Region'}
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {lng === 'ar' ? (
                <span>
                  بوابة الأعمال السعودية<br />
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    المؤسسية
                  </span>
                </span>
              ) : (
                <span>
                  Saudi Business Gate<br />
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Enterprise
                  </span>
                </span>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {lng === 'ar'
                ? 'من السعودية إلى العالم - أول منصة إدارة أعمال مؤسسية ذاتية التشغيل بالذكاء الاصطناعي في المنطقة'
                : 'From Saudi Arabia to the World - The 1st Autonomous AI-Powered Enterprise Business Management Platform in the Region'
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href={`/${lng}/(platform)/dashboard`}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
              >
                {lng === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                <ArrowRight className={`h-5 w-5 ml-2 ${lng === 'ar' ? 'transform rotate-180' : ''}`} />
              </Link>
              <Link
                href={`/${lng}/(platform)/motivation`}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                {lng === 'ar' ? 'اكتشف الذكاء الاصطناعي' : 'Discover AI'}
              </Link>
            </div>

            {/* Auto-redirect indicator */}
            <div className="text-blue-200 text-sm animate-pulse">
              {lng === 'ar' ? 'سيتم توجيهك تلقائياً إلى لوحة التحكم...' : 'Auto-redirecting to dashboard...'}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {lng === 'ar' ? 'ذاتية التشغيل' : 'Autonomous'}
              </h3>
              <p className="text-blue-100">
                {lng === 'ar' ? 'عمليات أعمال ذكية تعمل بنفسها' : 'Smart business operations that run themselves'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {lng === 'ar' ? 'مؤسسية' : 'Enterprise'}
              </h3>
              <p className="text-blue-100">
                {lng === 'ar' ? 'حلول على مستوى المؤسسات' : 'Enterprise-grade solutions'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {lng === 'ar' ? 'رائدة' : 'Pioneering'}
              </h3>
              <p className="text-blue-100">
                {lng === 'ar' ? 'أول منصة في المنطقة' : 'First in the region'}
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/60" />
        </div>
      </div>
    </div>
  );
}
