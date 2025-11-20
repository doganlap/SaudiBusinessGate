/**
 * React Hook for Real-Time KPIs
 */

import { useState, useEffect, useCallback } from 'react';

export interface KPI {
  id: string;
  name: string;
  description: string;
  module: string;
  category: 'performance' | 'financial' | 'customer' | 'operational' | 'compliance';
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  status: 'good' | 'warning' | 'critical';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  lastUpdated: Date;
}

export function useKPIs(module?: string, autoRefresh: boolean = true) {
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = module ? `?module=${module}` : '';
      const response = await fetch(`/api/kpis${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch KPIs');
      }

      setKPIs(data.kpis || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    fetchKPIs();

    if (autoRefresh) {
      const interval = setInterval(fetchKPIs, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchKPIs, autoRefresh]);

  return { kpis, loading, error, refetch: fetchKPIs };
}

export function useKPI(kpiId: string, autoRefresh: boolean = true) {
  const [kpi, setKPI] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPI = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kpis?id=${kpiId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch KPI');
      }

      setKPI(data.kpi);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPI');
    } finally {
      setLoading(false);
    }
  }, [kpiId]);

  useEffect(() => {
    fetchKPI();

    if (autoRefresh) {
      const interval = setInterval(fetchKPI, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchKPI, autoRefresh]);

  return { kpi, loading, error, refetch: fetchKPI };
}

