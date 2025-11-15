/**
 * White-Label Theme Management Service
 * Enterprise-grade theming and branding system
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

// =====================================================
// THEME INTERFACES
// =====================================================

export interface WhiteLabelTheme {
  id?: number;
  organizationId: number;
  themeName: string;
  
  // Brand Identity
  companyName: string;
  logoPrimary?: string;
  logoSecondary?: string;
  favicon?: string;
  tagline?: string;
  
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    hoverPrimary: string;
    activePrimary: string;
  };
  
  // Typography
  typography: {
    fontFamily: {
      primary: string;
      secondary?: string;
      monospace: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
  };
  
  // Layout
  layout: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    maxWidth: string;
  };
  
  // Component Styles
  components: {
    navbar: {
      background: string;
      textColor: string;
      height: string;
    };
    sidebar: {
      background: string;
      textColor: string;
      activeBackground: string;
    };
    buttons: {
      primaryBg: string;
      primaryText: string;
      primaryHover: string;
    };
  };
  
  // Advanced Settings
  advancedSettings?: {
    animations: boolean;
    darkMode: boolean;
    rtl: boolean;
    compactMode: boolean;
  };
  
  // Metadata
  isActive?: boolean;
  isDefault?: boolean;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// =====================================================
// DEFAULT THEME PRESETS
// =====================================================

export const THEME_PRESETS = {
  modern: {
    name: 'Modern Light',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#ffffff',
      surface: '#f9fafb',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      hoverPrimary: '#4f46e5',
      activePrimary: '#4338ca'
    },
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Inter, system-ui, sans-serif',
        monospace: 'Fira Code, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    }
  },
  
  professional: {
    name: 'Professional Dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      hoverPrimary: '#2563eb',
      activePrimary: '#1d4ed8'
    },
    typography: {
      fontFamily: {
        primary: 'Roboto, system-ui, sans-serif',
        secondary: 'Roboto, system-ui, sans-serif',
        monospace: 'Roboto Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    }
  },
  
  minimal: {
    name: 'Minimal Clean',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#737373',
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626',
      info: '#0ea5e9',
      background: '#ffffff',
      surface: '#fafafa',
      textPrimary: '#171717',
      textSecondary: '#737373',
      border: '#e5e5e5',
      hoverPrimary: '#262626',
      activePrimary: '#404040'
    },
    typography: {
      fontFamily: {
        primary: 'SF Pro Display, system-ui, sans-serif',
        secondary: 'SF Pro Display, system-ui, sans-serif',
        monospace: 'SF Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    }
  }
};

// =====================================================
// THEME MANAGEMENT SERVICE
// =====================================================

export class ThemeManagementService {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  async createTheme(theme: WhiteLabelTheme): Promise<WhiteLabelTheme> {
    const query = `
      INSERT INTO white_label_themes (
        organization_id, theme_name, company_name,
        logo_primary, logo_secondary, favicon, tagline,
        colors, typography, layout, components, advanced_settings
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      theme.organizationId,
      theme.themeName,
      theme.companyName,
      theme.logoPrimary,
      theme.logoSecondary,
      theme.favicon,
      theme.tagline,
      JSON.stringify(theme.colors),
      JSON.stringify(theme.typography),
      JSON.stringify(theme.layout),
      JSON.stringify(theme.components),
      JSON.stringify(theme.advancedSettings || {})
    ];
    
    const result = await this.db.query(query, values);
    return this.mapRowToTheme(result.rows[0]);
  }

  async getTheme(organizationId: number): Promise<WhiteLabelTheme | null> {
    const query = `
      SELECT * FROM white_label_themes
      WHERE organization_id = $1 AND is_active = true
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1
    `;
    
    const result = await this.db.query(query, [organizationId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToTheme(result.rows[0]);
  }

  async updateTheme(themeId: number, updates: Partial<WhiteLabelTheme>): Promise<WhiteLabelTheme> {
    // Save to history first
    await this.saveThemeHistory(themeId);
    
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (updates.themeName) {
      setClauses.push(`theme_name = $${paramCount++}`);
      values.push(updates.themeName);
    }
    if (updates.companyName) {
      setClauses.push(`company_name = $${paramCount++}`);
      values.push(updates.companyName);
    }
    if (updates.logoPrimary !== undefined) {
      setClauses.push(`logo_primary = $${paramCount++}`);
      values.push(updates.logoPrimary);
    }
    if (updates.colors) {
      setClauses.push(`colors = $${paramCount++}`);
      values.push(JSON.stringify(updates.colors));
    }
    if (updates.typography) {
      setClauses.push(`typography = $${paramCount++}`);
      values.push(JSON.stringify(updates.typography));
    }
    if (updates.layout) {
      setClauses.push(`layout = $${paramCount++}`);
      values.push(JSON.stringify(updates.layout));
    }
    if (updates.components) {
      setClauses.push(`components = $${paramCount++}`);
      values.push(JSON.stringify(updates.components));
    }
    
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    setClauses.push(`version = version + 1`);
    
    values.push(themeId);
    
    const query = `
      UPDATE white_label_themes
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await this.db.query(query, values);
    return this.mapRowToTheme(result.rows[0]);
  }

  async deleteTheme(themeId: number): Promise<boolean> {
    const query = 'UPDATE white_label_themes SET is_active = false WHERE id = $1';
    await this.db.query(query, [themeId]);
    return true;
  }

  // =====================================================
  // THEME UTILITIES
  // =====================================================

  async applyPreset(organizationId: number, presetName: keyof typeof THEME_PRESETS): Promise<WhiteLabelTheme> {
    const preset = THEME_PRESETS[presetName];
    
    const theme: WhiteLabelTheme = {
      organizationId,
      themeName: preset.name,
      companyName: 'My Company', // Default, will be customized
      colors: preset.colors,
      typography: preset.typography,
      layout: {
        borderRadius: {
          sm: '4px',
          md: '8px',
          lg: '12px',
          xl: '16px',
          full: '9999px'
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
          '2xl': '48px'
        },
        maxWidth: '1280px'
      },
      components: {
        navbar: {
          background: preset.colors.surface,
          textColor: preset.colors.textPrimary,
          height: '64px'
        },
        sidebar: {
          background: preset.colors.surface,
          textColor: preset.colors.textPrimary,
          activeBackground: preset.colors.primary
        },
        buttons: {
          primaryBg: preset.colors.primary,
          primaryText: '#ffffff',
          primaryHover: preset.colors.hoverPrimary
        }
      }
    };
    
    return this.createTheme(theme);
  }

  async generateCSS(theme: WhiteLabelTheme): Promise<string> {
    return `
      :root {
        /* Colors */
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        --color-info: ${theme.colors.info};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text-primary: ${theme.colors.textPrimary};
        --color-text-secondary: ${theme.colors.textSecondary};
        --color-border: ${theme.colors.border};
        
        /* Typography */
        --font-primary: ${theme.typography.fontFamily.primary};
        --font-monospace: ${theme.typography.fontFamily.monospace};
        --font-size-xs: ${theme.typography.fontSize.xs};
        --font-size-sm: ${theme.typography.fontSize.sm};
        --font-size-base: ${theme.typography.fontSize.base};
        --font-size-lg: ${theme.typography.fontSize.lg};
        --font-size-xl: ${theme.typography.fontSize.xl};
        --font-size-2xl: ${theme.typography.fontSize['2xl']};
        --font-size-3xl: ${theme.typography.fontSize['3xl']};
        --font-size-4xl: ${theme.typography.fontSize['4xl']};
        
        /* Layout */
        --border-radius-sm: ${theme.layout.borderRadius.sm};
        --border-radius-md: ${theme.layout.borderRadius.md};
        --border-radius-lg: ${theme.layout.borderRadius.lg};
        --border-radius-xl: ${theme.layout.borderRadius.xl};
        --spacing-xs: ${theme.layout.spacing.xs};
        --spacing-sm: ${theme.layout.spacing.sm};
        --spacing-md: ${theme.layout.spacing.md};
        --spacing-lg: ${theme.layout.spacing.lg};
        --spacing-xl: ${theme.layout.spacing.xl};
        --spacing-2xl: ${theme.layout.spacing['2xl']};
        --max-width: ${theme.layout.maxWidth};
        
        /* Components */
        --navbar-bg: ${theme.components.navbar.background};
        --navbar-text: ${theme.components.navbar.textColor};
        --navbar-height: ${theme.components.navbar.height};
        --sidebar-bg: ${theme.components.sidebar.background};
        --sidebar-text: ${theme.components.sidebar.textColor};
        --sidebar-active-bg: ${theme.components.sidebar.activeBackground};
        --button-primary-bg: ${theme.components.buttons.primaryBg};
        --button-primary-text: ${theme.components.buttons.primaryText};
        --button-primary-hover: ${theme.components.buttons.primaryHover};
      }
      
      /* Global Styles */
      body {
        font-family: var(--font-primary);
        font-size: var(--font-size-base);
        color: var(--color-text-primary);
        background-color: var(--color-background);
      }
      
      /* Navbar */
      .navbar {
        background-color: var(--navbar-bg);
        color: var(--navbar-text);
        height: var(--navbar-height);
      }
      
      /* Sidebar */
      .sidebar {
        background-color: var(--sidebar-bg);
        color: var(--sidebar-text);
      }
      
      .sidebar-item.active {
        background-color: var(--sidebar-active-bg);
      }
      
      /* Buttons */
      .btn-primary {
        background-color: var(--button-primary-bg);
        color: var(--button-primary-text);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
      }
      
      .btn-primary:hover {
        background-color: var(--button-primary-hover);
      }
      
      /* Cards */
      .card {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-lg);
      }
    `;
  }

  // =====================================================
  // HISTORY & VERSIONING
  // =====================================================

  private async saveThemeHistory(themeId: number): Promise<void> {
    const query = `
      INSERT INTO white_label_theme_history (theme_id, theme_data, version)
      SELECT id, 
             jsonb_build_object(
               'colors', colors,
               'typography', typography,
               'layout', layout,
               'components', components,
               'advanced_settings', advanced_settings
             ),
             version
      FROM white_label_themes
      WHERE id = $1
    `;
    
    await this.db.query(query, [themeId]);
  }

  async getThemeHistory(themeId: number): Promise<any[]> {
    const query = `
      SELECT * FROM white_label_theme_history
      WHERE theme_id = $1
      ORDER BY version DESC
      LIMIT 20
    `;
    
    const result = await this.db.query(query, [themeId]);
    return result.rows;
  }

  async rollbackTheme(themeId: number, version: number): Promise<WhiteLabelTheme> {
    const historyQuery = `
      SELECT theme_data FROM white_label_theme_history
      WHERE theme_id = $1 AND version = $2
    `;
    
    const historyResult = await this.db.query(historyQuery, [themeId, version]);
    
    if (historyResult.rows.length === 0) {
      throw new Error('Version not found in history');
    }
    
    const themeData = historyResult.rows[0].theme_data;
    
    // Save current version to history
    await this.saveThemeHistory(themeId);
    
    // Update theme with historical data
    const updateQuery = `
      UPDATE white_label_themes
      SET 
        colors = $1,
        typography = $2,
        layout = $3,
        components = $4,
        advanced_settings = $5,
        updated_at = CURRENT_TIMESTAMP,
        version = version + 1
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await this.db.query(updateQuery, [
      themeData.colors,
      themeData.typography,
      themeData.layout,
      themeData.components,
      themeData.advanced_settings,
      themeId
    ]);
    
    return this.mapRowToTheme(result.rows[0]);
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private mapRowToTheme(row: any): WhiteLabelTheme {
    return {
      id: row.id,
      organizationId: row.organization_id,
      themeName: row.theme_name,
      companyName: row.company_name,
      logoPrimary: row.logo_primary,
      logoSecondary: row.logo_secondary,
      favicon: row.favicon,
      tagline: row.tagline,
      colors: row.colors,
      typography: row.typography,
      layout: row.layout,
      components: row.components,
      advancedSettings: row.advanced_settings,
      isActive: row.is_active,
      isDefault: row.is_default,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// =====================================================
// EXPRESS ROUTES
// =====================================================

export function createThemeManagementRoutes(dbPool: Pool): Router {
  const router = Router();
  const service = new ThemeManagementService(dbPool);

  // Get current theme
  router.get('/theme/:organizationId', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const theme = await service.getTheme(organizationId);
      
      if (!theme) {
        return res.status(404).json({ success: false, error: 'Theme not found' });
      }
      
      res.json({ success: true, data: theme });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Create theme
  router.post('/theme', async (req: Request, res: Response) => {
    try {
      const theme = await service.createTheme(req.body);
      res.json({ success: true, data: theme });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Update theme
  router.put('/theme/:themeId', async (req: Request, res: Response) => {
    try {
      const themeId = parseInt(req.params.themeId);
      const theme = await service.updateTheme(themeId, req.body);
      res.json({ success: true, data: theme });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Apply preset
  router.post('/theme/preset/:organizationId/:presetName', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const presetName = req.params.presetName as keyof typeof THEME_PRESETS;
      
      const theme = await service.applyPreset(organizationId, presetName);
      res.json({ success: true, data: theme });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Generate CSS
  router.get('/theme/:organizationId/css', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const theme = await service.getTheme(organizationId);
      
      if (!theme) {
        return res.status(404).json({ success: false, error: 'Theme not found' });
      }
      
      const css = await service.generateCSS(theme);
      res.setHeader('Content-Type', 'text/css');
      res.send(css);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Get theme history
  router.get('/theme/:themeId/history', async (req: Request, res: Response) => {
    try {
      const themeId = parseInt(req.params.themeId);
      const history = await service.getThemeHistory(themeId);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Rollback theme
  router.post('/theme/:themeId/rollback/:version', async (req: Request, res: Response) => {
    try {
      const themeId = parseInt(req.params.themeId);
      const version = parseInt(req.params.version);
      const theme = await service.rollbackTheme(themeId, version);
      res.json({ success: true, data: theme });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // List available presets
  router.get('/theme/presets', (req: Request, res: Response) => {
    const presets = Object.entries(THEME_PRESETS).map(([key, value]) => ({
      key,
      name: value.name,
      preview: {
        primary: value.colors.primary,
        background: value.colors.background,
        text: value.colors.textPrimary
      }
    }));
    
    res.json({ success: true, data: presets });
  });

  return router;
}

export default ThemeManagementService;

