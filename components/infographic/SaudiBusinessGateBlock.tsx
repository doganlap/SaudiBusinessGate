import React from 'react';

interface InfographicBlockProps {
  className?: string;
}

export const SaudiBusinessGateInfographic: React.FC<InfographicBlockProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🇸🇦</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Saudi Business Gate</h2>
              <p className="text-green-100">المنصة الأولى لإدارة الأعمال الذكية في السعودية</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-sm font-semibold">L2 → L3 AI</span>
          </div>
        </div>

        <p className="text-lg opacity-90 leading-relaxed">
          منصة متكاملة تجمع بين التكنولوجيا المتقدمة والامتثال التنظيمي، مصممة خصيصاً للشركات السعودية
        </p>
      </div>

      {/* Core Values */}
      <div className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">القيمة الأساسية للمؤسسات</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { icon: '🚀', title: 'عمليات أسرع', desc: 'أتمتة ذكية تقلل المهام اليدوية بنسبة 60%' },
            { icon: '🛡', title: 'امتثال مثالي', desc: '100% التزام بمتطلبات زاتكا واللوائح السعودية' },
            { icon: '📊', title: 'رؤى فورية', desc: 'رؤية شاملة لجميع الوظائف مع تحليلات تنبؤية' },
            { icon: '🤖', title: 'ذكاء أعمالي', desc: 'اتخاذ قرارات مستقلة وتحسين مستمر للأداء' },
            { icon: '🇸🇦', title: 'خبرة سوق سعودية', desc: 'فهم عميق لثقافة الأعمال واللوائح المحلية' }
          ].map((value, index) => (
            <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 rounded-xl p-4">
              <span className="text-2xl">{value.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{value.title}</h4>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">خارطة التطوير</h3>

          <div className="space-y-4">
            {[
              { phase: 'Phase 1', title: 'الأساس المتين', period: '2024 - الآن', status: 'completed', color: 'bg-green-500' },
              { phase: 'Phase 2', title: 'التوسع الذكي', period: '2025', status: 'current', color: 'bg-blue-500' },
              { phase: 'Phase 3', title: 'الأتمتة الذكية', period: '2025-2026', status: 'upcoming', color: 'bg-purple-500' }
            ].map((phase, index) => (
              <div key={index} className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`w-4 h-4 rounded-full ${phase.color} flex-shrink-0`}></div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{phase.title}</h4>
                    <span className="text-sm text-gray-500">{phase.period}</span>
                  </div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    phase.status === 'current' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {phase.status === 'completed' ? 'مكتمل' :
                     phase.status === 'current' ? 'جاري' : 'قادم'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">مؤشرات التأثير</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '⏱️', value: '-60%', label: 'وقت إداري' },
              { icon: '📉', value: '-80%', label: 'أخطاء امتثال' },
              { icon: '📈', value: '+40%', label: 'كفاءة تشغيلية' },
              { icon: '✅', value: '100%', label: 'تتبع القرارات' },
              { icon: '💰', value: '+25%', label: 'نمو إيرادات' },
              { icon: '🛡️', value: '99.9%', label: 'موثوقية النظام' }
            ].map((metric, index) => (
              <div key={index} className="text-center bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4">
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Autonomy Badge */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
              🤖 مستوى الذكاء الاصطناعي
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">L2 – Co-Pilot الآن</div>
            <div className="text-purple-600 font-semibold">الهدف: L3 – Autonomous خلال 2026</div>
          </div>

          <p className="text-gray-600 text-center text-sm leading-relaxed">
            "سنصبح أول منصة في المنطقة تقدم أتمتة كاملة للأعمال بالذكاء الاصطناعي، حيث تتولى المنصة تشغيل أعمالك بشكل مستقل"
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 px-8 py-6">
        <div className="text-center">
          <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            ابدأ الرحلة مجاناً
          </button>
        </div>
      </div>
    </div>
  );
};
