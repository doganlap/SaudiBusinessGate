/**
 * Procurement Templates & Recurring Orders Service
 * Manage purchase order templates and recurring orders
 */

import { query } from '@/lib/db/connection';
import { procurementService, PurchaseOrder } from './procurement.service';

export interface PurchaseOrderTemplate {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  category?: string;
  currency?: string;
  paymentTerms?: string;
  items: any[]; // Array of item templates
  createdBy: string;
  createdAt?: string;
}

export interface RecurringOrder {
  id?: string;
  tenantId: string;
  templateId?: string;
  name: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time?: string; // HH:MM format
  };
  nextRunDate?: string;
  lastRunDate?: string;
  status: 'active' | 'paused' | 'completed';
  orderData: Partial<PurchaseOrder>;
  createdBy: string;
  createdAt?: string;
}

export class ProcurementTemplatesService {
  // ============================================================================
  // TEMPLATES
  // ============================================================================

  async createTemplate(
    tenantId: string,
    templateData: Partial<PurchaseOrderTemplate>
  ): Promise<PurchaseOrderTemplate> {
    try {
      const templateId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const result = await query(`
        INSERT INTO procurement_templates (
          id, tenant_id, name, description, vendor_id, vendor_name,
          category, currency, payment_terms, items, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `, [
        templateId,
        tenantId,
        templateData.name,
        templateData.description || null,
        templateData.vendorId || null,
        templateData.vendorName || null,
        templateData.category || null,
        templateData.currency || 'SAR',
        templateData.paymentTerms || null,
        JSON.stringify(templateData.items || []),
        templateData.createdBy,
      ]);

      return this.mapTemplateFromDb(result.rows[0]);
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createTemplatesTable();
        return this.createTemplate(tenantId, templateData);
      }
      throw error;
    }
  }

  async getTemplates(
    tenantId: string,
    filters?: { category?: string; vendorId?: string }
  ): Promise<PurchaseOrderTemplate[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.category) {
        whereClause += ` AND category = $${paramIndex++}`;
        params.push(filters.category);
      }

      if (filters?.vendorId) {
        whereClause += ` AND vendor_id = $${paramIndex++}`;
        params.push(filters.vendorId);
      }

      const result = await query(`
        SELECT *
        FROM procurement_templates
        ${whereClause}
        ORDER BY created_at DESC
      `, params);

      return result.rows.map((row: any) => this.mapTemplateFromDb(row));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createTemplatesTable();
        return [];
      }
      throw error;
    }
  }

  async getTemplate(templateId: string, tenantId: string): Promise<PurchaseOrderTemplate | null> {
    try {
      const result = await query(`
        SELECT *
        FROM procurement_templates
        WHERE id = $1 AND tenant_id = $2
      `, [templateId, tenantId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapTemplateFromDb(result.rows[0]);
    } catch (error: any) {
      throw error;
    }
  }

  async createOrderFromTemplate(
    tenantId: string,
    templateId: string,
    overrides?: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new Error('Template not found');
    }

    const orderData: Partial<PurchaseOrder> = {
      vendorId: template.vendorId,
      vendorName: template.vendorName,
      category: template.category,
      currency: template.currency,
      paymentTerms: template.paymentTerms,
      items: template.items,
      status: 'draft',
      ...overrides,
    };

    return await procurementService.createPurchaseOrder(tenantId, orderData);
  }

  // ============================================================================
  // RECURRING ORDERS
  // ============================================================================

  async createRecurringOrder(
    tenantId: string,
    recurringData: Partial<RecurringOrder>
  ): Promise<RecurringOrder> {
    try {
      const nextRunDate = this.calculateNextRunDate(recurringData.schedule!);

      const recurringId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const result = await query(`
        INSERT INTO procurement_recurring_orders (
          id, tenant_id, template_id, name, description, vendor_id, vendor_name,
          schedule, next_run_date, status, order_data, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *
      `, [
        recurringId,
        tenantId,
        recurringData.templateId || null,
        recurringData.name,
        recurringData.description || null,
        recurringData.vendorId || null,
        recurringData.vendorName || null,
        JSON.stringify(recurringData.schedule),
        nextRunDate,
        recurringData.status || 'active',
        JSON.stringify(recurringData.orderData || {}),
        recurringData.createdBy,
      ]);

      return this.mapRecurringFromDb(result.rows[0]);
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createRecurringOrdersTable();
        return this.createRecurringOrder(tenantId, recurringData);
      }
      throw error;
    }
  }

  async getRecurringOrders(
    tenantId: string,
    filters?: { status?: string }
  ): Promise<RecurringOrder[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }

      const result = await query(`
        SELECT *
        FROM procurement_recurring_orders
        ${whereClause}
        ORDER BY next_run_date ASC
      `, params);

      return result.rows.map((row: any) => this.mapRecurringFromDb(row));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createRecurringOrdersTable();
        return [];
      }
      throw error;
    }
  }

  async processRecurringOrders(tenantId: string): Promise<{ processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await query(`
        SELECT *
        FROM procurement_recurring_orders
        WHERE tenant_id = $1
          AND status = 'active'
          AND next_run_date <= $2
      `, [tenantId, today]);

      for (const row of result.rows) {
        try {
          const recurring = this.mapRecurringFromDb(row);

          // Create order from recurring order
          let orderData = recurring.orderData;
          if (recurring.templateId) {
            const order = await this.createOrderFromTemplate(tenantId, recurring.templateId, orderData);
            orderData = order;
          } else {
            orderData = await procurementService.createPurchaseOrder(tenantId, orderData);
          }

          // Calculate next run date
          const nextRunDate = this.calculateNextRunDate(recurring.schedule);

          // Update recurring order
          await query(`
            UPDATE procurement_recurring_orders
            SET last_run_date = NOW(),
                next_run_date = $1,
                updated_at = NOW()
            WHERE id = $2
          `, [nextRunDate, recurring.id]);

          processed++;
        } catch (error: any) {
          errors.push(`Recurring order ${row.id}: ${error.message}`);
        }
      }

      return { processed, errors };
    } catch (error: any) {
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private calculateNextRunDate(schedule: RecurringOrder['schedule']): string {
    const now = new Date();
    let nextDate = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case 'weekly':
        const daysUntilNextWeek = 7 - now.getDay() + (schedule.dayOfWeek || 0);
        nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
        break;

      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (schedule.dayOfMonth) {
          nextDate.setDate(schedule.dayOfMonth);
        }
        break;

      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        if (schedule.dayOfMonth) {
          nextDate.setDate(schedule.dayOfMonth);
        }
        break;

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        if (schedule.dayOfMonth) {
          nextDate.setDate(schedule.dayOfMonth);
        }
        break;
    }

    return nextDate.toISOString().split('T')[0];
  }

  private mapTemplateFromDb(row: any): PurchaseOrderTemplate {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      category: row.category,
      currency: row.currency,
      paymentTerms: row.payment_terms,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }

  private mapRecurringFromDb(row: any): RecurringOrder {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      templateId: row.template_id,
      name: row.name,
      description: row.description,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      schedule: typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule,
      nextRunDate: row.next_run_date,
      lastRunDate: row.last_run_date,
      status: row.status,
      orderData: typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }

  private async createTemplatesTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_templates (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        vendor_id VARCHAR(255),
        vendor_name VARCHAR(255),
        category VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'SAR',
        payment_terms VARCHAR(100),
        items JSONB DEFAULT '[]',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_tenant (tenant_id)
      )
    `);
  }

  private async createRecurringOrdersTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_recurring_orders (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        template_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        vendor_id VARCHAR(255),
        vendor_name VARCHAR(255),
        schedule JSONB NOT NULL,
        next_run_date DATE NOT NULL,
        last_run_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        order_data JSONB DEFAULT '{}',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_tenant_status (tenant_id, status),
        INDEX idx_next_run (next_run_date)
      )
    `);
  }
}

export const procurementTemplatesService = new ProcurementTemplatesService();

