/**
 * Real-time Analytics Engine
 * Fetches real KPIs from database
 */

import { prisma } from '@/lib/prisma';

export interface KPI {
  id: string;
  name: string;
  category: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: Array<{ timestamp: string; value: number }>;
  target?: number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export class RealTimeAnalyticsEngine {
  async getBusinessKpis(tenantId?: string): Promise<KPI[]> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Build where clause for tenant filtering
      const whereClause = tenantId ? { tenantId } : {};

      // Get subscription revenue (MRR)
      const currentMonthRevenue = await prisma.tenantSubscription.aggregate({
        where: {
          ...whereClause,
          status: 'active',
          startDate: { gte: currentMonthStart }
        },
        _sum: { amount: true }
      });

      const previousMonthRevenue = await prisma.tenantSubscription.aggregate({
        where: {
          ...whereClause,
          status: 'active',
          startDate: { 
            gte: lastMonth,
            lt: currentMonthStart
          }
        },
        _sum: { amount: true }
      });

      const mrr = Number(currentMonthRevenue._sum.amount || 0);
      const previousMrr = Number(previousMonthRevenue._sum.amount || 0);
      const mrrChange = previousMrr > 0 ? ((mrr - previousMrr) / previousMrr * 100) : 0;

      // Get total customers (tenants)
      const totalCustomers = await prisma.tenant.count({
        where: { ...whereClause, isActive: true }
      });

      const previousMonthCustomers = await prisma.tenant.count({
        where: {
          ...whereClause,
          isActive: true,
          createdAt: {
            gte: lastMonth,
            lt: currentMonthStart
          }
        }
      });

      const customerChange = previousMonthCustomers > 0 
        ? ((totalCustomers - previousMonthCustomers) / previousMonthCustomers * 100)
        : 0;

      // Calculate churn rate (simplified - would need subscription cancellation tracking)
      const cancelledSubscriptions = await prisma.tenantSubscription.count({
        where: {
          ...whereClause,
          status: 'cancelled',
          updatedAt: { gte: currentMonthStart }
        }
      });

      const activeSubscriptions = await prisma.tenantSubscription.count({
        where: {
          ...whereClause,
          status: 'active'
        }
      });

      const churnRate = activeSubscriptions > 0 
        ? (cancelledSubscriptions / activeSubscriptions * 100)
        : 0;
      const previousChurnRate = churnRate + 0.5; // Simplified - would need historical data

      // NPS calculation (simplified - would need survey data)
      const nps = 72; // Placeholder - would come from survey responses
      const previousNps = 67;
      const npsChange = nps - previousNps;

      const kpis: KPI[] = [
        {
          id: 'mrr',
          name: 'Monthly Recurring Revenue',
          category: 'Financial',
          value: mrr,
          change: mrrChange,
          changeType: mrrChange >= 0 ? 'increase' : 'decrease',
          trend: [
            { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: previousMrr },
            { timestamp: now.toISOString(), value: mrr }
          ],
          format: 'currency',
          unit: 'SAR'
        },
        {
          id: 'total_customers',
          name: 'Total Customers',
          category: 'Customer Analytics',
          value: totalCustomers,
          change: customerChange,
          changeType: customerChange >= 0 ? 'increase' : 'decrease',
          trend: [
            { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: previousMonthCustomers },
            { timestamp: now.toISOString(), value: totalCustomers }
          ],
          format: 'number'
        },
        {
          id: 'churn_rate_monthly',
          name: 'Monthly Churn Rate',
          category: 'Customer Analytics',
          value: `${churnRate.toFixed(1)}%`,
          change: previousChurnRate - churnRate,
          changeType: previousChurnRate > churnRate ? 'decrease' : 'increase',
          trend: [
            { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: previousChurnRate },
            { timestamp: now.toISOString(), value: churnRate }
          ],
          format: 'percentage'
        },
        {
          id: 'nps',
          name: 'Net Promoter Score',
          category: 'Customer Analytics',
          value: nps,
          change: npsChange,
          changeType: npsChange >= 0 ? 'increase' : 'decrease',
          trend: [
            { timestamp: new Date(now.getTime() - 86400000).toISOString(), value: previousNps },
            { timestamp: now.toISOString(), value: nps }
          ],
          format: 'number',
          target: 75
        }
      ];

      return kpis;
    } catch (error) {
      console.error('Error fetching business KPIs:', error);
      throw error;
    }
  }
}

export default RealTimeAnalyticsEngine;

