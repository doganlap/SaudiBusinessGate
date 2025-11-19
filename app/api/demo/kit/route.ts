import { NextRequest, NextResponse } from 'next/server';

// Demo components data for the DemoKit page
const demoComponents = [
  {
    id: 'button',
    name: 'Button Components',
    nameAr: 'مكونات الأزرار',
    description: 'Various button styles and states',
    descriptionAr: 'أنماط وأحوال مختلفة للأزرار',
    category: 'ui',
    complexity: 'basic',
    usage: 'High',
    components: ['PrimaryButton', 'SecondaryButton', 'OutlineButton', 'GhostButton', 'LoadingButton']
  },
  {
    id: 'form',
    name: 'Form Components',
    nameAr: 'مكونات النماذج',
    description: 'Input fields, selects, and form validation',
    descriptionAr: 'حقول الإدخال والاختيارات وتحقق النماذج',
    category: 'forms',
    complexity: 'intermediate',
    usage: 'High',
    components: ['TextInput', 'SelectInput', 'Checkbox', 'RadioGroup', 'FormField']
  },
  {
    id: 'table',
    name: 'Data Tables',
    nameAr: 'جداول البيانات',
    description: 'Sortable, filterable data tables',
    descriptionAr: 'جداول بيانات قابلة للترتيب والتصفية',
    category: 'data',
    complexity: 'advanced',
    usage: 'Medium',
    components: ['DataTable', 'SortableTable', 'PaginatedTable']
  },
  {
    id: 'chart',
    name: 'Chart Components',
    nameAr: 'مكونات الرسوم البيانية',
    description: 'Interactive charts and visualizations',
    descriptionAr: 'رسوم بيانية تفاعلية وتصورات',
    category: 'visualization',
    complexity: 'advanced',
    usage: 'Medium',
    components: ['BarChart', 'LineChart', 'PieChart', 'AreaChart']
  },
  {
    id: 'modal',
    name: 'Modal & Dialogs',
    nameAr: 'النوافذ المنبثقة والحوارات',
    description: 'Modal windows and dialog components',
    descriptionAr: 'نوافذ منبثقة ومكونات حوار',
    category: 'ui',
    complexity: 'intermediate',
    usage: 'High',
    components: ['Modal', 'Dialog', 'Drawer', 'Tooltip', 'Popover']
  },
  {
    id: 'navigation',
    name: 'Navigation Components',
    nameAr: 'مكونات التنقل',
    description: 'Breadcrumbs, tabs, and navigation elements',
    descriptionAr: 'فتات الخبز والتبويبات وعناصر التنقل',
    category: 'navigation',
    complexity: 'basic',
    usage: 'High',
    components: ['Breadcrumb', 'Tabs', 'Pagination', 'Navbar']
  },
  {
    id: 'feedback',
    name: 'Feedback Components',
    nameAr: 'مكونات الردود',
    description: 'Alerts, notifications, and loading states',
    descriptionAr: 'التنبيهات والإشعارات وحالات التحميل',
    category: 'ui',
    complexity: 'basic',
    usage: 'High',
    components: ['Alert', 'Toast', 'Spinner', 'ProgressBar', 'Skeleton']
  },
  {
    id: 'layout',
    name: 'Layout Components',
    nameAr: 'مكونات التخطيط',
    description: 'Grid, flexbox, and layout utilities',
    descriptionAr: 'الشبكة وflexbox وأدوات التخطيط',
    category: 'layout',
    complexity: 'intermediate',
    usage: 'High',
    components: ['Grid', 'Container', 'Flex', 'Stack', 'Card']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const complexity = searchParams.get('complexity');
    const usage = searchParams.get('usage');
    const lng = searchParams.get('lng') || 'en';

    let filteredComponents = demoComponents;

    // Apply filters
    if (category) {
      filteredComponents = filteredComponents.filter(comp => comp.category === category);
    }

    if (complexity) {
      filteredComponents = filteredComponents.filter(comp => comp.complexity === complexity);
    }

    if (usage) {
      filteredComponents = filteredComponents.filter(comp => comp.usage === usage);
    }

    // Transform based on language
    const transformedComponents = filteredComponents.map(comp => ({
      ...comp,
      displayName: lng === 'ar' ? comp.nameAr : comp.name,
      displayDescription: lng === 'ar' ? comp.descriptionAr : comp.description
    }));

    // Get unique categories and other metadata
    const categories = [...new Set(demoComponents.map(comp => comp.category))];
    const complexities = [...new Set(demoComponents.map(comp => comp.complexity))];
    const usageLevels = [...new Set(demoComponents.map(comp => comp.usage))];

    return NextResponse.json({
      success: true,
      data: transformedComponents,
      metadata: {
        total: transformedComponents.length,
        categories: categories.map(cat => ({
          value: cat,
          label: lng === 'ar' ? (cat === 'ui' ? 'واجهة المستخدم' :
                                cat === 'forms' ? 'النماذج' :
                                cat === 'data' ? 'البيانات' :
                                cat === 'visualization' ? 'التصور' :
                                cat === 'navigation' ? 'التنقل' :
                                cat === 'feedback' ? 'الردود' :
                                cat === 'layout' ? 'التخطيط' : cat) : cat
        })),
        complexities: complexities.map(comp => ({
          value: comp,
          label: lng === 'ar' ? (comp === 'basic' ? 'أساسي' :
                                comp === 'intermediate' ? 'متوسط' :
                                comp === 'advanced' ? 'متقدم' : comp) : comp
        })),
        usageLevels: usageLevels.map(level => ({
          value: level,
          label: lng === 'ar' ? (level === 'High' ? 'عالي' :
                                level === 'Medium' ? 'متوسط' :
                                level === 'Low' ? 'منخفض' : level) : level
        }))
      },
      filters: {
        category: category || null,
        complexity: complexity || null,
        usage: usage || null,
        language: lng
      }
    });
  } catch (error) {
    console.error('Error fetching demo components:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch demo components'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, componentId, feedback } = body;

    // Handle different demo actions
    switch (action) {
      case 'view':
        // Log component view
        console.log(`Component viewed: ${componentId}`);
        break;

      case 'feedback':
        // Store user feedback
        console.log(`Feedback for ${componentId}:`, feedback);
        break;

      case 'copy':
        // Log code copy action
        console.log(`Code copied for component: ${componentId}`);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Action recorded successfully'
    });
  } catch (error) {
    console.error('Error processing demo action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 });
  }
}
