'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, MessageCircle, Headphones, FileText } from 'lucide-react';

interface ContactPageProps {
  params: {
    lng: string;
  };
}

export default function ContactPage({ params: { lng } }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: ''
    });
    alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🇸🇦</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Saudi Business Gate</span>
                <p className="text-xs text-gray-600">من السعودية إلى العالم</p>
              </div>
            </div>

            <Link
              href={`/${lng}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            تواصل معنا
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن هنا لمساعدتك في رحلتك نحو التحول الرقمي. تواصل مع فريقنا المتخصص
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">الدعم الفني</h3>
              <p className="text-gray-600 mb-6">
                احصل على المساعدة الفنية والإجابة على أسئلتك التقنية
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>9200-XXXXX</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>support@saudibusinessgate.com</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>24/7</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">المبيعات</h3>
              <p className="text-gray-600 mb-6">
                استفسر عن حلولنا وخدماتنا لشركتك
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>9200-YYYYY</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>sales@saudibusinessgate.com</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>8:00 - 18:00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">الاستفسارات العامة</h3>
              <p className="text-gray-600 mb-6">
                لأي استفسارات أخرى أو اقتراحات
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@saudibusinessgate.com</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>8:00 - 17:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & Office Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشركة
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="اسم شركتك (اختياري)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موضوع الرسالة *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">اختر الموضوع</option>
                    <option value="support">دعم فني</option>
                    <option value="sales">استفسار مبيعات</option>
                    <option value="partnership">شراكة</option>
                    <option value="feedback">ملاحظات واقتراحات</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  إرسال الرسالة
                </button>
              </form>
            </div>

            {/* Office Information */}
            <div className="space-y-8">
              {/* Headquarters */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">المقر الرئيسي</h3>
                    <p className="text-gray-600 leading-relaxed">
                      برج المملكة، الطابق 45<br />
                      شارع الملك فهد، الرياض<br />
                      المملكة العربية السعودية 12345
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>+966 11 123 4567</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>info@saudibusinessgate.com</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>الأحد - الخميس: 8:00 - 18:00 | الجمعة - السبت: 9:00 - 14:00</span>
                  </div>
                </div>
              </div>

              {/* Regional Offices */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">مكاتبنا الإقليمية</h3>

                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">جدة</h4>
                    <p className="text-sm text-gray-600">
                      مجمع الشاطئ، الطابق 12<br />
                      شارع الأمير سلطان، جدة
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>+966 12 765 4321</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">الدمام</h4>
                    <p className="text-sm text-gray-600">
                      برج الخليج، الطابق 25<br />
                      شارع الملك سعود، الدمام
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>+966 13 987 6543</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">دبي - UAE</h4>
                    <p className="text-sm text-gray-600">
                      برج التجارة، الطابق 18<br />
                      شارع الشيخ زايد، دبي
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>+971 4 123 4567</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Response */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold">استجابة سريعة</h3>
                </div>
                <p className="text-green-100 mb-4">
                  نحن ملتزمون بالرد على جميع الاستفسارات خلال 24 ساعة عمل
                </p>
                <div className="text-sm text-green-200">
                  متوسط وقت الاستجابة: 4 ساعات
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
