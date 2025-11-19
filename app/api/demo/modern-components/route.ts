import { NextRequest, NextResponse } from 'next/server';

// Modern component showcase data
const modernComponents = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism Cards',
    nameAr: 'بطاقات الزجاجية',
    description: 'Beautiful glass-like cards with backdrop blur effects',
    descriptionAr: 'بطاقات جميلة تشبه الزجاج مع تأثيرات الضباب الخلفي',
    category: 'modern',
    preview: '/images/components/glass-card.png',
    features: ['Backdrop blur', 'Transparency effects', 'Border gradients', 'Subtle shadows'],
    featuresAr: ['ضباب الخلفية', 'تأثيرات الشفافية', 'تدرجات الحدود', 'ظلال خفيفة'],
    codeSnippet: `// Glassmorphism Card Example
<div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
  <h3 className="text-white font-semibold mb-2">Glass Card</h3>
  <p className="text-white/80">Beautiful modern design</p>
</div>`,
    difficulty: 'intermediate',
    popularity: 'high'
  },
  {
    id: 'neomorphism',
    name: 'Neomorphism Elements',
    nameAr: 'عناصر النيومورفيزم',
    description: 'Soft, inset button and card designs',
    descriptionAr: 'أزرار وبطاقات ناعمة بتصميم داخلي',
    category: 'modern',
    preview: '/images/components/neomorphism.png',
    features: ['Soft shadows', 'Inset effects', 'Subtle gradients', 'Minimal design'],
    featuresAr: ['ظلال ناعمة', 'تأثيرات داخلية', 'تدرجات خفيفة', 'تصميم بسيط'],
    codeSnippet: `// Neomorphism Button Example
<button className="bg-gray-200 shadow-inner border-l border-t border-gray-300 rounded-lg px-4 py-2">
  Neo Button
</button>`,
    difficulty: 'beginner',
    popularity: 'medium'
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode Components',
    nameAr: 'مكونات الوضع المظلم',
    description: 'Complete dark theme implementation',
    descriptionAr: 'تنفيذ كامل لموضوع الوضع المظلم',
    category: 'themes',
    preview: '/images/components/dark-mode.png',
    features: ['Automatic switching', 'System preference detection', 'Smooth transitions', 'Accessibility compliant'],
    featuresAr: ['التحويل التلقائي', 'كشف تفضيلات النظام', 'انتقالات سلسة', 'متوافق مع إمكانية الوصول'],
    codeSnippet: `// Dark Mode Toggle Example
const [isDark, setIsDark] = useState(false);

<div className={isDark ? 'dark' : ''}>
  <button onClick={() => setIsDark(!isDark)}
          className="dark:bg-gray-800 dark:text-white">
    Toggle Dark Mode
  </button>
</div>`,
    difficulty: 'intermediate',
    popularity: 'high'
  },
  {
    id: 'animations',
    name: 'Micro-interactions',
    nameAr: 'التفاعلات الصغيرة',
    description: 'Subtle animations and hover effects',
    descriptionAr: 'رسوم متحركة وتأثيرات تمرير خفيفة',
    category: 'interactions',
    preview: '/images/components/animations.gif',
    features: ['Hover animations', 'Loading states', 'Transition effects', 'Gesture responses'],
    featuresAr: ['رسوم متحركة عند التمرير', 'حالات التحميل', 'تأثيرات الانتقال', 'استجابات الإيماءات'],
    codeSnippet: `// Hover Animation Example
<div className="transform hover:scale-105 transition-transform duration-200 cursor-pointer">
  Hover me!
</div>`,
    difficulty: 'beginner',
    popularity: 'high'
  },
  {
    id: 'responsive-grid',
    name: 'CSS Grid Layouts',
    nameAr: 'تخطيطات شبكة CSS',
    description: 'Advanced grid systems with auto-fit and minmax',
    descriptionAr: 'أنظمة شبكة متقدمة مع الاحتواء التلقائي والحد الأدنى/الأقصى',
    category: 'layout',
    preview: '/images/components/grid-layout.png',
    features: ['Auto-fit columns', 'Responsive breakpoints', 'Gap controls', 'Alignment options'],
    featuresAr: ['أعمدة الاحتواء التلقائي', 'نقاط توقف متجاوبة', 'عناصر تحكم الفجوات', 'خيارات المحاذاة'],
    codeSnippet: `// CSS Grid Example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
  <div className="bg-blue-500 p-4 rounded">Item 1</div>
  <div className="bg-green-500 p-4 rounded">Item 2</div>
  <div className="bg-purple-500 p-4 rounded">Item 3</div>
</div>`,
    difficulty: 'intermediate',
    popularity: 'high'
  },
  {
    id: 'accessibility',
    name: 'Accessible Components',
    nameAr: 'المكونات الممكنة للوصول',
    description: 'WCAG compliant interactive elements',
    descriptionAr: 'عناصر تفاعلية متوافقة مع WCAG',
    category: 'accessibility',
    preview: '/images/components/accessibility.png',
    features: ['ARIA labels', 'Keyboard navigation', 'Screen reader support', 'Focus management'],
    featuresAr: ['تسميات ARIA', 'التنقل باللوحة المفاتيح', 'دعم قارئات الشاشة', 'إدارة التركيز'],
    codeSnippet: `// Accessible Button Example
<button
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
  onKeyDown={(e) => e.key === 'Enter' && handleClose()}
>
  ✕
</button>`,
    difficulty: 'advanced',
    popularity: 'medium'
  },
  {
    id: 'charts',
    name: 'Interactive Charts',
    nameAr: 'رسوم بيانية تفاعلية',
    description: 'Data visualization with hover interactions',
    descriptionAr: 'تصور البيانات مع تفاعلات التمرير',
    category: 'data',
    preview: '/images/components/charts.png',
    features: ['Hover tooltips', 'Zoom controls', 'Data filtering', 'Export options'],
    featuresAr: ['تلميحات التمرير', 'عناصر تحكم التكبير', 'تصفية البيانات', 'خيارات التصدير'],
    codeSnippet: `// Chart Component Example
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>`,
    difficulty: 'intermediate',
    popularity: 'high'
  },
  {
    id: 'forms',
    name: 'Advanced Form Controls',
    nameAr: 'عناصر تحكم النماذج المتقدمة',
    description: 'Multi-step forms with validation',
    descriptionAr: 'نماذج متعددة الخطوات مع التحقق',
    category: 'forms',
    preview: '/images/components/forms.png',
    features: ['Form validation', 'Step navigation', 'Progress indicators', 'Error handling'],
    featuresAr: ['التحقق من النماذج', 'التنقل بين الخطوات', 'مؤشرات التقدم', 'معالجة الأخطاء'],
    codeSnippet: `// Form with Validation Example
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function MyForm() {
  const { register, handleSubmit, errors } = useForm({ resolver: zodResolver(schema) });
  // Form implementation...
}`,
    difficulty: 'advanced',
    popularity: 'high'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const popularity = searchParams.get('popularity');
    const lng = searchParams.get('lng') || 'en';

    let filteredComponents = modernComponents;

    // Apply filters
    if (category) {
      filteredComponents = filteredComponents.filter(comp => comp.category === category);
    }

    if (difficulty) {
      filteredComponents = filteredComponents.filter(comp => comp.difficulty === difficulty);
    }

    if (popularity) {
      filteredComponents = filteredComponents.filter(comp => comp.popularity === popularity);
    }

    // Transform based on language
    const transformedComponents = filteredComponents.map(comp => ({
      ...comp,
      displayName: lng === 'ar' ? comp.nameAr : comp.name,
      displayDescription: lng === 'ar' ? comp.descriptionAr : comp.description,
      displayFeatures: lng === 'ar' ? comp.featuresAr : comp.features
    }));

    // Get unique categories and other metadata
    const categories = [...new Set(modernComponents.map(comp => comp.category))];
    const difficulties = [...new Set(modernComponents.map(comp => comp.difficulty))];
    const popularities = [...new Set(modernComponents.map(comp => comp.popularity))];

    return NextResponse.json({
      success: true,
      data: transformedComponents,
      metadata: {
        total: transformedComponents.length,
        categories: categories.map(cat => ({
          value: cat,
          label: lng === 'ar' ? (cat === 'modern' ? 'حديث' :
                                cat === 'themes' ? 'المواضيع' :
                                cat === 'interactions' ? 'التفاعلات' :
                                cat === 'layout' ? 'التخطيط' :
                                cat === 'accessibility' ? 'إمكانية الوصول' :
                                cat === 'data' ? 'البيانات' :
                                cat === 'forms' ? 'النماذج' : cat) : cat
        })),
        difficulties: difficulties.map(diff => ({
          value: diff,
          label: lng === 'ar' ? (diff === 'beginner' ? 'مبتدئ' :
                                diff === 'intermediate' ? 'متوسط' :
                                diff === 'advanced' ? 'متقدم' : diff) : diff
        })),
        popularities: popularities.map(pop => ({
          value: pop,
          label: lng === 'ar' ? (pop === 'high' ? 'عالي' :
                                pop === 'medium' ? 'متوسط' :
                                pop === 'low' ? 'منخفض' : pop) : pop
        }))
      },
      filters: {
        category: category || null,
        difficulty: difficulty || null,
        popularity: popularity || null,
        language: lng
      }
    });
  } catch (error) {
    console.error('Error fetching modern components:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch modern components'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, componentId, codeSnippet, feedback, lng = 'en' } = body;

    // Handle different modern component actions
    switch (action) {
      case 'copy_code':
        // Log code copy action
        console.log(`Code copied for component: ${componentId}`);
        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم نسخ الكود بنجاح' : 'Code copied successfully'
        });
        break;

      case 'view_demo':
        // Log demo view action
        console.log(`Demo viewed for component: ${componentId}`);
        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم فتح العرض التوضيحي' : 'Demo opened successfully'
        });
        break;

      case 'rate_component':
        // Log component rating
        console.log(`Component rated: ${componentId}`, feedback);
        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم تسجيل تقييمك' : 'Rating recorded successfully'
        });
        break;

      case 'report_issue':
        // Log issue report
        console.log(`Issue reported for component: ${componentId}`, feedback);
        return NextResponse.json({
          success: true,
          message: lng === 'ar' ? 'تم الإبلاغ عن المشكلة. شكراً لك!' : 'Issue reported. Thank you!'
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: lng === 'ar' ? 'إجراء غير صالح' : 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing modern component action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 });
  }
}
