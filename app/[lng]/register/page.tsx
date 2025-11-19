'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, Mail, Phone, User, Globe, CreditCard, CheckCircle, AlertCircle, Info, Upload, FileText, CheckSquare, XCircle, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { GlassBackground, GlassContainer, GlassInput, GlassButton } from '@/components/ui/glass-container';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    companyNameAr: '',
    industry: '',
    country: 'Saudi Arabia',
    
    // Contact Information
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    
    // Subscription
    subscriptionPlan: 'professional',
    maxUsers: 25,
    
    // Account Setup
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }

    if (currentStep === 2) {
      if (!formData.contactName) newErrors.contactName = 'Contact name is required';
      if (!formData.contactEmail) newErrors.contactEmail = 'Email is required';
      if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
      if (!formData.contactPhone) newErrors.contactPhone = 'Phone is required';
    }

    if (currentStep === 3) {
      if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
      if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
      if (formData.adminPassword && formData.adminPassword.length < 8) {
        newErrors.adminPassword = 'Password must be at least 8 characters';
      }
      if (formData.adminPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      // Register tenant
      const response = await fetch('/api/platform/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_name: formData.companyName,
          tenant_name_ar: formData.companyNameAr,
          subscription_tier: formData.subscriptionPlan,
          max_users: formData.maxUsers,
          primary_contact_name: formData.contactName,
          primary_contact_email: formData.contactEmail,
          primary_contact_phone: formData.contactPhone,
          country: formData.country,
          admin_email: formData.adminEmail,
          admin_password: formData.adminPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/ar/login');
        }, 3000);
      } else {
        setErrors({ submit: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const params = useParams();
  const lng = (params?.lng as string) || 'ar';
  const isArabic = lng === 'ar';

  if (success) {
    return (
      <GlassBackground>
        <div className="w-full max-w-md">
          <GlassContainer>
            <div className="text-center">
              <div className="mx-auto w-20 h-20 backdrop-blur-xl bg-green-500/20 border border-green-300/30 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <CheckCircle className="w-12 h-12 text-green-200" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-3">
                {isArabic ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
              </h2>
              <p className="text-white/90 mb-4">
                {isArabic 
                  ? 'تم إنشاء حسابك بنجاح. سوف تتلقى بريد التحقق قريباً.'
                  : 'Your account has been created successfully. You will receive a verification email shortly.'}
              </p>
              <p className="text-sm text-white/70">
                {isArabic ? 'جارٍ إعادة التوجيه إلى صفحة تسجيل الدخول...' : 'Redirecting to login page...'}
              </p>
            </div>
          </GlassContainer>
        </div>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 backdrop-blur-xl bg-white/20 rounded-2xl border border-white/30 shadow-2xl">
            <Building2 className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            {isArabic ? 'تسجيل جديد' : 'New Registration'}
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            {isArabic ? 'تسجيل العملاء الجدد' : 'Customer Registration'}
          </p>
        </div>

        <GlassContainer padding="lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border-2 transition-all ${
                step >= 1 
                  ? 'bg-white/30 border-white/50 shadow-lg' 
                  : 'bg-white/10 border-white/20'
              }`}>
                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-white' : 'text-white/60'}`}>
                {isArabic ? 'الشركة' : 'Company'}
              </span>
            </div>
            <div className={`w-16 h-0.5 transition-all ${step >= 2 ? 'bg-white/50' : 'bg-white/20'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border-2 transition-all ${
                step >= 2 
                  ? 'bg-white/30 border-white/50 shadow-lg' 
                  : 'bg-white/10 border-white/20'
              }`}>
                {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-white' : 'text-white/60'}`}>
                {isArabic ? 'جهة الاتصال' : 'Contact'}
              </span>
            </div>
            <div className={`w-16 h-0.5 transition-all ${step >= 3 ? 'bg-white/50' : 'bg-white/20'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border-2 transition-all ${
                step >= 3 
                  ? 'bg-white/30 border-white/50 shadow-lg' 
                  : 'bg-white/10 border-white/20'
              }`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-white' : 'text-white/60'}`}>
                {isArabic ? 'الحساب' : 'Account'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Company Information */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6 text-center">
                  {isArabic ? 'معلومات الشركة' : 'Company Information'}
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'اسم الشركة (بالإنجليزية) *' : 'Company Name (English) *'}
                  </label>
                  <GlassInput
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    icon={<Building2 className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'أدخل اسم الشركة' : 'Enter company name'}
                  />
                  {errors.companyName && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'اسم الشركة (بالعربية)' : 'Company Name (Arabic)'}
                  </label>
                  <GlassInput
                    type="text"
                    name="companyNameAr"
                    value={formData.companyNameAr}
                    onChange={handleChange}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'اسم الشركة بالعربية' : 'Company name in Arabic'}
                    dir="rtl"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'الصناعة *' : 'Industry *'}
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    aria-label="Select Industry"
                    className="w-full py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                  >
                    <option value="" className="bg-gray-800 text-white">{isArabic ? 'اختر الصناعة' : 'Select Industry'}</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                    <option value="government">Government</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.industry}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'الدولة *' : 'Country *'}
                  </label>
                  <div className="relative">
                    <Globe className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70`} />
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      aria-label="Select Country"
                      className={`w-full ${isArabic ? 'pr-12' : 'pl-12'} py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                    >
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="UAE">United Arab Emirates</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Oman">Oman</option>
                    </select>
                  </div>
                  {errors.country && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6 text-center">
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'اسم جهة الاتصال *' : 'Contact Person Name *'}
                  </label>
                  <GlassInput
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    icon={<User className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'الاسم الكامل' : 'Full name'}
                  />
                  {errors.contactName && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'عنوان البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <GlassInput
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    icon={<Mail className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'البريد الإلكتروني' : 'email@company.com'}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <GlassInput
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    icon={<Phone className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                  />
                  {errors.contactPhone && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="subscriptionPlan" className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'خطة الاشتراك *' : 'Subscription Plan *'}
                  </label>
                  <div className="relative">
                    <CreditCard className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70`} />
                    <select
                      id="subscriptionPlan"
                      name="subscriptionPlan"
                      value={formData.subscriptionPlan}
                      onChange={handleChange}
                      aria-label="Select Subscription Plan"
                      className={`w-full ${isArabic ? 'pr-12' : 'pl-12'} py-3 px-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                    >
                      <option value="basic" className="bg-gray-800 text-white">Basic - 10 Users - $99/month</option>
                      <option value="professional" className="bg-gray-800 text-white">Professional - 25 Users - $299/month</option>
                      <option value="enterprise" className="bg-gray-800 text-white">Enterprise - Unlimited - $999/month</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Account Setup */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-6 text-center">
                  {isArabic ? 'إعداد حساب المدير' : 'Admin Account Setup'}
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'بريد المدير الإلكتروني *' : 'Admin Email *'}
                  </label>
                  <GlassInput
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    icon={<Mail className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'admin@company.com' : 'admin@company.com'}
                  />
                  {errors.adminEmail && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.adminEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'كلمة المرور *' : 'Password *'}
                  </label>
                  <GlassInput
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    icon={<Lock className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'الحد الأدنى 8 أحرف' : 'Minimum 8 characters'}
                  />
                  {errors.adminPassword && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.adminPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2 drop-shadow-sm">
                    {isArabic ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
                  </label>
                  <GlassInput
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<Lock className="w-5 h-5" />}
                    iconPosition={isArabic ? 'right' : 'left'}
                    isArabic={isArabic}
                    placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-200 text-sm mt-2 backdrop-blur-md bg-red-500/20 px-3 py-1 rounded-lg">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="backdrop-blur-md bg-blue-500/20 border border-blue-300/30 rounded-xl p-6 shadow-lg">
                  <h4 className="font-semibold text-white mb-4 text-lg">
                    {isArabic ? 'ملخص' : 'Summary'}
                  </h4>
                  <div className="text-sm text-white/90 space-y-2">
                    <p><strong className="text-white">{isArabic ? 'الشركة:' : 'Company:'}</strong> {formData.companyName}</p>
                    <p><strong className="text-white">{isArabic ? 'جهة الاتصال:' : 'Contact:'}</strong> {formData.contactName}</p>
                    <p><strong className="text-white">{isArabic ? 'البريد:' : 'Email:'}</strong> {formData.contactEmail}</p>
                    <p><strong className="text-white">{isArabic ? 'الخطة:' : 'Plan:'}</strong> {formData.subscriptionPlan}</p>
                  </div>
                </div>

                {errors.submit && (
                  <div className="backdrop-blur-md bg-red-500/20 border border-red-300/30 rounded-xl p-4">
                    <p className="text-red-100 text-sm font-medium">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={`flex justify-between mt-8 gap-4 ${step === 1 ? 'justify-end' : ''}`}>
              {step > 1 && (
                <GlassButton
                  type="button"
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                >
                  <ArrowLeft className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'السابق' : 'Back'}
                </GlassButton>
              )}
              
              {step < 3 ? (
                <GlassButton
                  type="button"
                  onClick={handleNext}
                  variant="primary"
                  className={step === 1 ? 'w-full' : 'flex-1'}
                >
                  {isArabic ? 'التالي' : 'Next'}
                  <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                </GlassButton>
              ) : (
                <GlassButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className={isArabic ? 'mr-2' : 'ml-2'}>
                        {isArabic ? 'جارٍ التسجيل...' : 'Registering...'}
                      </span>
                    </>
                  ) : (
                    <>
                      {isArabic ? 'تسجيل' : 'Complete Registration'}
                      <CheckCircle className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                    </>
                  )}
                </GlassButton>
              )}
            </div>
          </form>
        </GlassContainer>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/80 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="drop-shadow-sm">
            {isArabic ? '© 2025 دوجان هب. جميع الحقوق محفوظة.' : '© 2025 DoganHub. All rights reserved.'}
          </p>
          <div className="mt-2 space-x-4">
            <a href={`/${lng}/login`} className="hover:text-white transition-colors underline">
              {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
            </a>
          </div>
        </div>
      </div>
    </GlassBackground>
  );
}
