import { NextRequest, NextResponse } from 'next/server';

// Demo page data and features
const demoPageData = {
  hero: {
    title: 'Saudi Business Gate Demo',
    titleAr: 'عرض بوابة الأعمال السعودية',
    subtitle: 'Experience our comprehensive business management platform',
    subtitleAr: 'اختبر منصة إدارة الأعمال الشاملة الخاصة بنا',
    features: [
      {
        icon: '🚀',
        title: 'Fast & Reliable',
        titleAr: 'سريع وموثوق',
        description: 'Built with modern technologies for optimal performance',
        descriptionAr: 'مبني بتقنيات حديثة لأداء مثالي'
      },
      {
        icon: '🔒',
        title: 'Secure & Compliant',
        titleAr: 'آمن ومتوافق',
        description: 'Enterprise-grade security and regulatory compliance',
        descriptionAr: 'أمان على مستوى المؤسسات والامتثال التنظيمي'
      },
      {
        icon: '🌍',
        title: 'Multi-language Support',
        titleAr: 'دعم متعدد اللغات',
        description: 'Full Arabic and English language support',
        descriptionAr: 'دعم كامل للغة العربية والإنجليزية'
      },
      {
        icon: '📱',
        title: 'Mobile Responsive',
        titleAr: 'متجاوب مع الهواتف',
        description: 'Optimized for all devices and screen sizes',
        descriptionAr: 'محسن لجميع الأجهزة وأحجام الشاشات'
      }
    ]
  },
  modules: [
    {
      id: 'crm',
      name: 'Customer Relationship Management',
      nameAr: 'إدارة علاقات العملاء',
      description: 'Manage customer interactions and relationships effectively',
      descriptionAr: 'إدارة تفاعلات العملاء وعلاقاتهم بفعالية',
      icon: '👥',
      features: ['Contact Management', 'Lead Tracking', 'Deal Pipeline', 'Customer Analytics'],
      featuresAr: ['إدارة الاتصالات', 'تتبع العملاء المحتملين', 'خط أنابيب الصفقات', 'تحليلات العملاء'],
      color: 'bg-blue-500'
    },
    {
      id: 'sales',
      name: 'Sales Management',
      nameAr: 'إدارة المبيعات',
      description: 'Track quotes, deals, and sales performance',
      descriptionAr: 'تتبع عروض الأسعار والصفقات وأداء المبيعات',
      icon: '💰',
      features: ['Quote Management', 'Deal Tracking', 'Sales Analytics', 'Commission Management'],
      featuresAr: ['إدارة عروض الأسعار', 'تتبع الصفقات', 'تحليلات المبيعات', 'إدارة العمولات'],
      color: 'bg-green-500'
    },
    {
      id: 'finance',
      name: 'Financial Management',
      nameAr: 'إدارة المالية',
      description: 'Comprehensive financial tracking and reporting',
      descriptionAr: 'تتبع مالي شامل وإعداد التقارير',
      icon: '📊',
      features: ['Invoice Management', 'Expense Tracking', 'Financial Reports', 'Budget Planning'],
      featuresAr: ['إدارة الفواتير', 'تتبع المصروفات', 'التقارير المالية', 'تخطيط الميزانية'],
      color: 'bg-purple-500'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      nameAr: 'الموارد البشرية',
      description: 'Employee management and HR operations',
      descriptionAr: 'إدارة الموظفين وعمليات الموارد البشرية',
      icon: '👔',
      features: ['Employee Records', 'Payroll Management', 'Attendance Tracking', 'Performance Reviews'],
      featuresAr: ['سجلات الموظفين', 'إدارة الرواتب', 'تتبع الحضور', 'مراجعات الأداء'],
      color: 'bg-orange-500'
    },
    {
      id: 'procurement',
      name: 'Procurement Management',
      nameAr: 'إدارة المشتريات',
      description: 'Vendor management and purchase ordering',
      descriptionAr: 'إدارة الموردين وطلبات الشراء',
      icon: '🛒',
      features: ['Vendor Management', 'Purchase Orders', 'Inventory Control', 'Supplier Analytics'],
      featuresAr: ['إدارة الموردين', 'أوامر الشراء', 'مراقبة المخزون', 'تحليلات الموردين'],
      color: 'bg-teal-500'
    },
    {
      id: 'grc',
      name: 'Governance, Risk & Compliance',
      nameAr: 'الحوكمة والمخاطر والامتثال',
      description: 'Regulatory compliance and risk management',
      descriptionAr: 'الامتثال التنظيمي وإدارة المخاطر',
      icon: '🛡️',
      features: ['Compliance Monitoring', 'Risk Assessment', 'Audit Trails', 'Policy Management'],
      featuresAr: ['مراقبة الامتثال', 'تقييم المخاطر', 'مسارات التدقيق', 'إدارة السياسات'],
      color: 'bg-red-500'
    }
  ],
  testimonials: [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الراشد',
      company: 'Saudi Tech Solutions',
      companyAr: 'حلول التقنية السعودية',
      role: 'CEO',
      roleAr: 'الرئيس التنفيذي',
      content: 'Saudi Business Gate has transformed how we manage our operations. The Arabic support is exceptional.',
      contentAr: 'غيرت بوابة الأعمال السعودية طريقة إدارة عملياتنا. دعم اللغة العربية استثنائي.',
      rating: 5
    },
    {
      id: 2,
      name: 'Fatima Al-Zahra',
      nameAr: 'فاطمة الزهراء',
      company: 'Riyadh Trading Co.',
      companyAr: 'شركة الرياض التجارية',
      role: 'Operations Manager',
      roleAr: 'مدير العمليات',
      content: 'The platform is intuitive and powerful. Our team productivity has increased significantly.',
      contentAr: 'المنصة بديهية وقوية. زادت إنتاجية فريقنا بشكل ملحوظ.',
      rating: 5
    },
    {
      id: 3,
      name: 'Mohammed Al-Harbi',
      nameAr: 'محمد الحربي',
      company: 'Jeddah Logistics',
      companyAr: 'الخدمات اللوجستية بجدة',
      role: 'IT Director',
      roleAr: 'مدير تقنية المعلومات',
      content: 'Excellent customer support and comprehensive feature set. Highly recommended for Saudi businesses.',
      contentAr: 'دعم عملاء ممتاز ومجموعة ميزات شاملة. موصى به بشدة للشركات السعودية.',
      rating: 5
    }
  ],
  stats: {
    totalUsers: 1250,
    totalCompanies: 450,
    countriesServed: 25,
    modulesAvailable: 8,
    languagesSupported: 2,
    uptime: 99.9
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const lng = searchParams.get('lng') || 'en';

    let data = demoPageData;

    // Filter by section if specified
    if (section) {
      switch (section) {
        case 'hero':
          data = { hero: demoPageData.hero } as any;
          break;
        case 'modules':
          data = { modules: demoPageData.modules } as any;
          break;
        case 'testimonials':
          data = { testimonials: demoPageData.testimonials } as any;
          break;
        case 'stats':
          data = { stats: demoPageData.stats } as any;
          break;
      }
    }

    // Transform for Arabic if requested
    if (lng === 'ar') {
      if (data.hero) {
        data.hero.title = data.hero.titleAr;
        data.hero.subtitle = data.hero.subtitleAr;
        data.hero.features = data.hero.features.map(f => ({
          ...f,
          title: f.titleAr,
          description: f.descriptionAr
        }));
      }

      if (data.modules) {
        data.modules = data.modules.map(m => ({
          ...m,
          name: m.nameAr,
          description: m.descriptionAr,
          features: m.featuresAr
        }));
      }

      if (data.testimonials) {
        data.testimonials = data.testimonials.map(t => ({
          ...t,
          name: t.nameAr,
          company: t.companyAr,
          role: t.roleAr,
          content: t.contentAr
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        language: lng,
        section: section || 'all',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching demo page data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch demo page data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, message, lng = 'en' } = body;

    // Handle different demo page actions
    switch (action) {
      case 'contact':
        // Process contact form submission
        console.log('Contact form submission:', { email, message, lng });

        // Here you would typically send an email or save to database
        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' : 'Your message has been sent successfully. We will contact you soon.',
          data: { email, timestamp: new Date().toISOString() }
        });
        break;

      case 'newsletter':
        // Process newsletter subscription
        console.log('Newsletter subscription:', { email, lng });

        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم الاشتراك في النشرة الإخبارية بنجاح.' : 'Successfully subscribed to newsletter.',
          data: { email, timestamp: new Date().toISOString() }
        });
        break;

      case 'demo_request':
        // Process demo request
        console.log('Demo request:', { email, message, lng });

        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم طلب العرض التوضيحي بنجاح. سنتواصل معك خلال 24 ساعة.' : 'Demo request submitted successfully. We will contact you within 24 hours.',
          data: { email, message, timestamp: new Date().toISOString() }
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: lng === 'ar' ? 'إجراء غير صالح' : 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing demo page action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 });
  }
}
