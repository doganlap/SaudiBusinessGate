/**
 * Advanced Analytics Service
 * Custom dashboards, data visualization, drill-down analysis
 * 
 * Features:
 * - Custom dashboard builder
 * - Multiple chart types
 * - Drill-down analysis
 * - Real-time updates
 * - Data aggregation
 */

import { cacheService } from './redis-cache';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  module: string;
  widgets: Widget[];
  layout: LayoutConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'list' | 'map';
  title: string;
  config: WidgetConfig;
  data?: any;
  position: { x: number; y: number; w: number; h: number };
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  metric?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year';
  filters?: Record<string, any>;
  dimensions?: string[];
  measures?: string[];
}

export interface LayoutConfig {
  columns: number;
  rowHeight: number;
  margin: [number, number];
}

export interface AnalyticsQuery {
  module: string;
  metrics: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export class AdvancedAnalyticsService {
  private dashboards: Map<string, Dashboard> = new Map();

  /**
   * Create a new dashboard
   */
  async createDashboard(
    module: string,
    name: string,
    description?: string
  ): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      module,
      widgets: [],
      layout: {
        columns: 12,
        rowHeight: 30,
        margin: [10, 10],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(id: string): Promise<Dashboard | null> {
    const cacheKey = `analytics:dashboard:${id}`;
    
    // Try cache first
    const cached = await cacheService.get<Dashboard>(cacheKey);
    if (cached) {
      return cached;
    }

    const dashboard = this.dashboards.get(id) || null;
    
    if (dashboard) {
      await cacheService.set(cacheKey, dashboard, { ttl: 300 });
    }

    return dashboard;
  }

  /**
   * Get all dashboards for a module
   */
  async getDashboards(module: string): Promise<Dashboard[]> {
    const dashboards = Array.from(this.dashboards.values())
      .filter(d => d.module === module)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return dashboards;
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(
    dashboardId: string,
    widget: Omit<Widget, 'id' | 'data'>
  ): Promise<Widget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: await this.fetchWidgetData(widget.config),
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    // Update cache
    const cacheKey = `analytics:dashboard:${dashboardId}`;
    await cacheService.set(cacheKey, dashboard, { ttl: 300 });

    return newWidget;
  }

  /**
   * Update widget
   */
  async updateWidget(
    dashboardId: string,
    widgetId: string,
    updates: Partial<Widget>
  ): Promise<Widget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    Object.assign(widget, updates);
    
    if (updates.config) {
      widget.data = await this.fetchWidgetData(widget.config);
    }

    dashboard.updatedAt = new Date();

    // Update cache
    const cacheKey = `analytics:dashboard:${dashboardId}`;
    await cacheService.set(cacheKey, dashboard, { ttl: 300 });

    return widget;
  }

  /**
   * Delete widget
   */
  async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
    dashboard.updatedAt = new Date();

    // Update cache
    const cacheKey = `analytics:dashboard:${dashboardId}`;
    await cacheService.set(cacheKey, dashboard, { ttl: 300 });
  }

  /**
   * Execute analytics query
   */
  async executeQuery(query: AnalyticsQuery): Promise<any> {
    const cacheKey = `analytics:query:${JSON.stringify(query)}`;
    
    // Try cache first
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query based on module
    const result = await this.queryModule(query);

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: 60 }); // Cache for 1 minute

    return result;
  }

  /**
   * Query module data
   */
  private async queryModule(query: AnalyticsQuery): Promise<any> {
    // In production, this would query the module's database
    // For now, return mock aggregated data

    switch (query.module) {
      case 'hr':
        return this.queryHR(query);
      case 'finance':
        return this.queryFinance(query);
      case 'crm':
        return this.queryCRM(query);
      case 'sales':
        return this.querySales(query);
      default:
        return { data: [], total: 0 };
    }
  }

  /**
   * Query HR module
   */
  private async queryHR(query: AnalyticsQuery): Promise<any> {
    // Mock HR analytics data
    const metrics = query.metrics.reduce((acc, metric) => {
      switch (metric) {
        case 'total_employees':
          acc[metric] = 150;
          break;
        case 'active_employees':
          acc[metric] = 140;
          break;
        case 'attendance_rate':
          acc[metric] = 95.5;
          break;
        case 'average_salary':
          acc[metric] = 8500;
          break;
        default:
          acc[metric] = 0;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics,
      dimensions: query.dimensions || [],
      data: [],
    };
  }

  /**
   * Query Finance module
   */
  private async queryFinance(query: AnalyticsQuery): Promise<any> {
    // Mock Finance analytics data
    const metrics = query.metrics.reduce((acc, metric) => {
      switch (metric) {
        case 'total_revenue':
          acc[metric] = 500000;
          break;
        case 'total_expenses':
          acc[metric] = 300000;
          break;
        case 'profit':
          acc[metric] = 200000;
          break;
        case 'cash_flow':
          acc[metric] = 150000;
          break;
        default:
          acc[metric] = 0;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics,
      dimensions: query.dimensions || [],
      data: [],
    };
  }

  /**
   * Query CRM module
   */
  private async queryCRM(query: AnalyticsQuery): Promise<any> {
    // Mock CRM analytics data
    const metrics = query.metrics.reduce((acc, metric) => {
      switch (metric) {
        case 'total_customers':
          acc[metric] = 250;
          break;
        case 'active_customers':
          acc[metric] = 200;
          break;
        case 'customer_satisfaction':
          acc[metric] = 4.5;
          break;
        case 'churn_rate':
          acc[metric] = 5.2;
          break;
        default:
          acc[metric] = 0;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics,
      dimensions: query.dimensions || [],
      data: [],
    };
  }

  /**
   * Query Sales module
   */
  private async querySales(query: AnalyticsQuery): Promise<any> {
    // Mock Sales analytics data
    const metrics = query.metrics.reduce((acc, metric) => {
      switch (metric) {
        case 'total_deals':
          acc[metric] = 50;
          break;
        case 'won_deals':
          acc[metric] = 30;
          break;
        case 'win_rate':
          acc[metric] = 60;
          break;
        case 'pipeline_value':
          acc[metric] = 1000000;
          break;
        default:
          acc[metric] = 0;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics,
      dimensions: query.dimensions || [],
      data: [],
    };
  }

  /**
   * Fetch widget data
   */
  private async fetchWidgetData(config: WidgetConfig): Promise<any> {
    // In production, this would fetch real data based on config
    // For now, return mock data based on widget type

    if (config.chartType) {
      // Generate mock chart data
      const data = Array.from({ length: 12 }, (_, i) => ({
        x: i + 1,
        y: Math.floor(Math.random() * 100),
      }));

      return {
        type: config.chartType,
        data,
      };
    }

    if (config.metric) {
      // Return metric value
      return {
        value: Math.floor(Math.random() * 1000),
        change: (Math.random() * 20 - 10).toFixed(2), // -10% to +10%
      };
    }

    return null;
  }

  /**
   * Drill down into data
   */
  async drillDown(
    query: AnalyticsQuery,
    dimension: string,
    value: any
  ): Promise<any> {
    const drillDownQuery = {
      ...query,
      filters: {
        ...query.filters,
        [dimension]: value,
      },
    };

    return this.executeQuery(drillDownQuery);
  }
}

// Export singleton instance
export const advancedAnalytics = new AdvancedAnalyticsService();

