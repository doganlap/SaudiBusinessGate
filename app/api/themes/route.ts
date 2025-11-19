import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

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

// Database functions for theme management
async function getThemes(tenantId: string): Promise<Theme[]> {
  try {
    const result = await query(`
      SELECT 
        id, name, name_ar, description, description_ar, is_default, is_active,
        tenant_id, colors, typography, spacing, border_radius, shadows, created_at, updated_at
      FROM themes
      WHERE tenant_id = $1
      ORDER BY is_default DESC, created_at DESC
    `, [tenantId]);

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      description: row.description,
      descriptionAr: row.description_ar,
      isDefault: row.is_default,
      isActive: row.is_active,
      tenantId: row.tenant_id,
      colors: JSON.parse(row.colors || '{}'),
      typography: JSON.parse(row.typography || '{}'),
      spacing: JSON.parse(row.spacing || '{}'),
      borderRadius: JSON.parse(row.border_radius || '{}'),
      shadows: JSON.parse(row.shadows || '{}'),
      branding: JSON.parse(row.branding || '{"logo":"","favicon":"","companyName":"","companyNameAr":""}'),
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching themes:', error);
    return [];
  }
}

async function createTheme(themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<Theme | null> {
  try {
    const result = await query(`
      INSERT INTO themes (
        tenant_id, name, name_ar, description, description_ar, is_default, is_active,
        colors, typography, spacing, border_radius, shadows
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      themeData.tenantId,
      themeData.name,
      themeData.nameAr,
      themeData.description,
      themeData.descriptionAr,
      themeData.isDefault,
      themeData.isActive,
      JSON.stringify(themeData.colors),
      JSON.stringify(themeData.typography),
      JSON.stringify(themeData.spacing),
      JSON.stringify(themeData.borderRadius),
      JSON.stringify(themeData.shadows)
    ]);

    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      description: row.description,
      descriptionAr: row.description_ar,
      isDefault: row.is_default,
      isActive: row.is_active,
      tenantId: row.tenant_id,
      colors: JSON.parse(row.colors || '{}'),
      typography: JSON.parse(row.typography || '{}'),
      spacing: JSON.parse(row.spacing || '{}'),
      borderRadius: JSON.parse(row.border_radius || '{}'),
      shadows: JSON.parse(row.shadows || '{}'),
      branding: JSON.parse(row.branding || '{"logo":"","favicon":"","companyName":"","companyNameAr":""}'),
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating theme:', error);
    return null;
  }
}

async function updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | null> {
  try {
    const result = await query(`
      UPDATE themes 
      SET 
        name = COALESCE($2, name),
        name_ar = COALESCE($3, name_ar),
        description = COALESCE($4, description),
        description_ar = COALESCE($5, description_ar),
        is_active = COALESCE($6, is_active),
        colors = COALESCE($7, colors),
        typography = COALESCE($8, typography),
        spacing = COALESCE($9, spacing),
        border_radius = COALESCE($10, border_radius),
        shadows = COALESCE($11, shadows),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id,
      updates.name,
      updates.nameAr,
      updates.description,
      updates.descriptionAr,
      updates.isActive,
      updates.colors ? JSON.stringify(updates.colors) : null,
      updates.typography ? JSON.stringify(updates.typography) : null,
      updates.spacing ? JSON.stringify(updates.spacing) : null,
      updates.borderRadius ? JSON.stringify(updates.borderRadius) : null,
      updates.shadows ? JSON.stringify(updates.shadows) : null
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      nameAr: row.name_ar,
      description: row.description,
      descriptionAr: row.description_ar,
      isDefault: row.is_default,
      isActive: row.is_active,
      tenantId: row.tenant_id,
      colors: JSON.parse(row.colors || '{}'),
      typography: JSON.parse(row.typography || '{}'),
      spacing: JSON.parse(row.spacing || '{}'),
      borderRadius: JSON.parse(row.border_radius || '{}'),
      shadows: JSON.parse(row.shadows || '{}'),
      branding: JSON.parse(row.branding || '{"logo":"","favicon":"","companyName":"","companyNameAr":""}'),
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating theme:', error);
    return null;
  }
}

// Fallback mock themes for when database is not available
const fallbackThemes: Theme[] = [
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'demo-tenant';
    const themeId = searchParams.get('themeId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Try to get themes from database
    let filteredThemes = await getThemes(tenantId);

    // In production, do not use fallback
    if (filteredThemes.length === 0 && process.env.NODE_ENV !== 'production') {
      filteredThemes = fallbackThemes.filter((theme: Theme) => theme.tenantId === tenantId);
    }

    // Get specific theme
    if (themeId) {
      const theme = filteredThemes.find((t: Theme) => t.id === themeId);
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
      filteredThemes = filteredThemes.filter((theme: Theme) => theme.isActive);
    }

    // Calculate statistics
    const stats = {
      total: filteredThemes.length,
      active: filteredThemes.filter((t: Theme) => t.isActive).length,
      default: filteredThemes.filter((t: Theme) => t.isDefault).length,
      custom: filteredThemes.filter((t: Theme) => !t.isDefault).length
    };

    return NextResponse.json({
      success: true,
      data: filteredThemes,
      stats,
      source: filteredThemes.length > 0 ? 'database' : 'fallback'
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

    const created = await createTheme({
      tenantId,
      name: body.name,
      nameAr: body.nameAr || body.name,
      description: body.description,
      descriptionAr: body.descriptionAr || body.description,
      isDefault: false,
      isActive: body.isActive || false,
      colors: body.colors || fallbackThemes[0].colors,
      typography: body.typography || fallbackThemes[0].typography,
      spacing: body.spacing || fallbackThemes[0].spacing,
      borderRadius: body.borderRadius || fallbackThemes[0].borderRadius,
      shadows: body.shadows || fallbackThemes[0].shadows,
      branding: body.branding || fallbackThemes[0].branding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    if (!created) {
      return NextResponse.json({ success: false, error: 'Failed to create theme' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
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

    const updated = await updateTheme(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Theme not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
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

    if (!id) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM themes WHERE id = $1 AND is_default = false RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Theme not found or cannot delete default theme' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
