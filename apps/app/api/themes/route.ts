import { NextRequest, NextResponse } from 'next/server';

interface Theme {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isDefault: boolean;
  isActive: boolean;
  tenantId: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  branding: {
    logo?: string;
    favicon?: string;
    companyName: string;
    companyNameAr: string;
    tagline?: string;
    taglineAr?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock Themes
const mockThemes: Theme[] = [
  {
    id: 'theme-default',
    name: 'Saudi Store Default',
    nameAr: 'المتجر السعودي الافتراضي',
    description: 'Default theme with Saudi green colors and modern design',
    descriptionAr: 'المظهر الافتراضي بالألوان السعودية الخضراء والتصميم العصري',
    isDefault: true,
    isActive: true,
    tenantId: 'demo-tenant',
    colors: {
      primary: '#059669', // emerald-600
      secondary: '#0d9488', // teal-600
      accent: '#0ea5e9', // sky-500
      background: '#ffffff',
      surface: '#f8fafc', // slate-50
      text: '#0f172a', // slate-900
      textSecondary: '#64748b', // slate-500
      border: '#e2e8f0', // slate-200
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#3b82f6' // blue-500
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    },
    branding: {
      companyName: 'Saudi Store',
      companyNameAr: 'المتجر السعودي',
      tagline: 'Smart Business Management Platform',
      taglineAr: 'منصة إدارة الأعمال الذكية'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'theme-corporate',
    name: 'Corporate Blue',
    nameAr: 'الأزرق المؤسسي',
    description: 'Professional corporate theme with blue accents',
    descriptionAr: 'مظهر مؤسسي احترافي بلمسات زرقاء',
    isDefault: false,
    isActive: false,
    tenantId: 'demo-tenant',
    colors: {
      primary: '#1e40af', // blue-800
      secondary: '#1e3a8a', // blue-900
      accent: '#3b82f6', // blue-500
      background: '#ffffff',
      surface: '#f1f5f9', // slate-100
      text: '#1e293b', // slate-800
      textSecondary: '#475569', // slate-600
      border: '#cbd5e1', // slate-300
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626', // red-600
      info: '#0284c7' // sky-600
    },
    typography: {
      fontFamily: 'Roboto, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    },
    branding: {
      companyName: 'Corporate Solutions',
      companyNameAr: 'الحلول المؤسسية',
      tagline: 'Professional Business Solutions',
      taglineAr: 'حلول الأعمال الاحترافية'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'theme-dark',
    name: 'Dark Mode',
    nameAr: 'الوضع المظلم',
    description: 'Modern dark theme for reduced eye strain',
    descriptionAr: 'مظهر مظلم عصري لتقليل إجهاد العين',
    isDefault: false,
    isActive: false,
    tenantId: 'demo-tenant',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#14b8a6', // teal-500
      accent: '#06b6d4', // cyan-500
      background: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      text: '#f8fafc', // slate-50
      textSecondary: '#94a3b8', // slate-400
      border: '#334155', // slate-700
      success: '#22c55e', // green-500
      warning: '#eab308', // yellow-500
      error: '#f87171', // red-400
      info: '#60a5fa' // blue-400
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.3)'
    },
    branding: {
      companyName: 'Saudi Store',
      companyNameAr: 'المتجر السعودي',
      tagline: 'Smart Business Management Platform',
      taglineAr: 'منصة إدارة الأعمال الذكية'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const themeId = searchParams.get('themeId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let filteredThemes = mockThemes.filter(theme => theme.tenantId === tenantId);

    // Get specific theme
    if (themeId) {
      const theme = filteredThemes.find(t => t.id === themeId);
      if (!theme) {
        return NextResponse.json(
          { error: 'Theme not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: theme
      });
    }

    // Filter active themes only
    if (activeOnly) {
      filteredThemes = filteredThemes.filter(theme => theme.isActive);
    }

    // Calculate statistics
    const stats = {
      total: filteredThemes.length,
      active: filteredThemes.filter(t => t.isActive).length,
      default: filteredThemes.filter(t => t.isDefault).length,
      custom: filteredThemes.filter(t => !t.isDefault).length
    };

    return NextResponse.json({
      success: true,
      data: filteredThemes,
      stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'demo-tenant';
    const body = await request.json();

    const newTheme: Theme = {
      id: `theme-${Date.now()}`,
      name: body.name,
      nameAr: body.nameAr || body.name,
      description: body.description,
      descriptionAr: body.descriptionAr || body.description,
      isDefault: false,
      isActive: body.isActive || false,
      tenantId,
      colors: body.colors || mockThemes[0].colors,
      typography: body.typography || mockThemes[0].typography,
      spacing: body.spacing || mockThemes[0].spacing,
      borderRadius: body.borderRadius || mockThemes[0].borderRadius,
      shadows: body.shadows || mockThemes[0].shadows,
      branding: body.branding || mockThemes[0].branding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockThemes.push(newTheme);

    return NextResponse.json({
      success: true,
      data: newTheme
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    const themeIndex = mockThemes.findIndex(theme => theme.id === id);
    if (themeIndex === -1) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // If activating this theme, deactivate others
    if (body.isActive) {
      mockThemes.forEach(theme => {
        if (theme.tenantId === mockThemes[themeIndex].tenantId) {
          theme.isActive = false;
        }
      });
    }

    // Update the theme
    mockThemes[themeIndex] = {
      ...mockThemes[themeIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockThemes[themeIndex]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    const themeIndex = mockThemes.findIndex(theme => theme.id === id);
    if (themeIndex === -1) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting default themes
    if (mockThemes[themeIndex].isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default theme' },
        { status: 403 }
      );
    }

    mockThemes.splice(themeIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
