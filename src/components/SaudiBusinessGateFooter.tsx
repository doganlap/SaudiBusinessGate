'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, ExternalLink } from 'lucide-react';

export function SaudiBusinessGateFooter() {
  const params = useParams();
  const lng = params.lng as string || 'en';
  const isRTL = lng === 'ar';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                {/* Enterprise AI Circuit Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl"></div>
                <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* AI Brain/Circuit Icon */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  {/* Autonomous indicator dots */}
                  <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse"/>
                  <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.6"/>
                  <circle cx="16" cy="8" r="0.5" fill="currentColor" opacity="0.6"/>
                  <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.6"/>
                  <circle cx="16" cy="16" r="0.5" fill="currentColor" opacity="0.6"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  {lng === 'ar' ? 'بوابة الأعمال السعودية المؤسسية' : 'Saudi Business Gate Enterprise'}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {lng === 'ar' ? 'أول بوابة أعمال ذاتية التشغيل في المنطقة من السعودية إلى العالم' : 'The 1st Autonomous Business Gate in the Region from Saudi Arabia to the World'}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {lng === 'ar'
                ? 'منصة متقدمة لإدارة الأعمال في المملكة العربية السعودية مع دعم كامل للغة العربية ومعايير الامتثال المحلية.'
                : 'Advanced business management platform for Saudi Arabia with full Arabic language support and local compliance standards.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {lng === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/${lng}/(platform)/dashboard`} className="text-gray-300 hover:text-white transition-colors text-sm">
                {lng === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              <Link href={`/${lng}/(platform)/crm`} className="text-gray-300 hover:text-white transition-colors text-sm">
                CRM
              </Link>
              <Link href={`/${lng}/(platform)/finance`} className="text-gray-300 hover:text-white transition-colors text-sm">
                {lng === 'ar' ? 'المالية' : 'Finance'}
              </Link>
              <Link href={`/${lng}/(platform)/sales`} className="text-gray-300 hover:text-white transition-colors text-sm">
                {lng === 'ar' ? 'المبيعات' : 'Sales'}
              </Link>
              <Link href={`/${lng}/(platform)/hr`} className="text-gray-300 hover:text-white transition-colors text-sm">
                HR
              </Link>
              <Link href={`/${lng}/(platform)/motivation`} className="text-gray-300 hover:text-white transition-colors text-sm">
                {lng === 'ar' ? 'التحفيز' : 'Motivation'}
              </Link>
            </div>
          </div>

          {/* Contact & Powered By */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {lng === 'ar' ? 'تواصل معنا' : 'Contact & Support'}
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:support@saudibusinessgate.com"
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>support@saudibusinessgate.com</span>
              </a>
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-400">
                  <span>{lng === 'ar' ? 'مدعوم من' : 'Powered by'}</span>
                  <a
                    href="https://www.doganconsult.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 rtl:space-x-reverse transition-colors"
                  >
                    <span>DoganConsult</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-700">
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="text-gray-400 text-sm">
              © {currentYear} {lng === 'ar' ? 'بوابة الأعمال السعودية. جميع الحقوق محفوظة.' : 'Saudi Business Gate. All rights reserved.'}
            </div>
            <div className={`flex space-x-6 rtl:space-x-reverse text-sm text-gray-400 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <Link href={`/${lng}/privacy`} className="hover:text-white transition-colors">
                {lng === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link href={`/${lng}/terms`} className="hover:text-white transition-colors">
                {lng === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
              </Link>
              <Link href={`/${lng}/support`} className="hover:text-white transition-colors">
                {lng === 'ar' ? 'الدعم' : 'Support'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
