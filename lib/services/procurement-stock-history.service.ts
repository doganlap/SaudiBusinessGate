/**
 * Procurement Stock Movement History Service
 * Track all inventory stock movements
 */

import { query } from '@/lib/db/connection';

export interface StockMovement {
  id?: string;
  tenantId: string;
  itemId: string;
  itemName?: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'damage' | 'loss';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string; // Reference to purchase order, transfer, etc.
  referenceType?: 'purchase_order' | 'transfer' | 'adjustment' | 'return';
  location?: string;
  performedBy: string;
  notes?: string;
  createdAt?: string;
}

export class ProcurementStockHistoryService {
  async recordMovement(
    tenantId: string,
    itemId: string,
    movementType: StockMovement['movementType'],
    quantity: number,
    previousStock: number,
    newStock: number,
    performedBy: string,
    reason?: string,
    referenceId?: string,
    referenceType?: StockMovement['referenceType'],
    location?: string,
    notes?: string
  ): Promise<StockMovement> {
    try {
      // Get item name
      const itemResult = await query(`
        SELECT item_name FROM inventory
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      const itemName = itemResult.rows[0]?.item_name || '';

      const movementId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const result = await query(`
        INSERT INTO stock_movements (
          id, tenant_id, item_id, item_name, movement_type, quantity,
          previous_stock, new_stock, reason, reference_id, reference_type,
          location, performed_by, notes, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *
      `, [
        movementId,
        tenantId,
        itemId,
        itemName,
        movementType,
        quantity,
        previousStock,
        newStock,
        reason || null,
        referenceId || null,
        referenceType || null,
        location || null,
        performedBy,
        notes || null,
      ]);

      return this.mapMovementFromDb(result.rows[0]);
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createStockMovementsTable();
        return this.recordMovement(
          tenantId,
          itemId,
          movementType,
          quantity,
          previousStock,
          newStock,
          performedBy,
          reason,
          referenceId,
          referenceType,
          location,
          notes
        );
      }
      throw error;
    }
  }

  async getItemHistory(
    tenantId: string,
    itemId: string,
    filters?: {
      movementType?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<StockMovement[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1 AND item_id = $2';
      const params: any[] = [tenantId, itemId];
      let paramIndex = 3;

      if (filters?.movementType) {
        whereClause += ` AND movement_type = $${paramIndex++}`;
        params.push(filters.movementType);
      }

      if (filters?.dateFrom) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(filters.dateFrom);
      }

      if (filters?.dateTo) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(filters.dateTo);
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT *
        FROM stock_movements
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      return result.rows.map((row: any) => this.mapMovementFromDb(row));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createStockMovementsTable();
        return [];
      }
      throw error;
    }
  }

  async getAllMovements(
    tenantId: string,
    filters?: {
      itemId?: string;
      movementType?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<StockMovement[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.itemId) {
        whereClause += ` AND item_id = $${paramIndex++}`;
        params.push(filters.itemId);
      }

      if (filters?.movementType) {
        whereClause += ` AND movement_type = $${paramIndex++}`;
        params.push(filters.movementType);
      }

      if (filters?.dateFrom) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(filters.dateFrom);
      }

      if (filters?.dateTo) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(filters.dateTo);
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT *
        FROM stock_movements
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      return result.rows.map((row: any) => this.mapMovementFromDb(row));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createStockMovementsTable();
        return [];
      }
      throw error;
    }
  }

  private mapMovementFromDb(row: any): StockMovement {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      itemId: row.item_id,
      itemName: row.item_name,
      movementType: row.movement_type,
      quantity: parseInt(row.quantity),
      previousStock: parseInt(row.previous_stock),
      newStock: parseInt(row.new_stock),
      reason: row.reason,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      location: row.location,
      performedBy: row.performed_by,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  private async createStockMovementsTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        item_id VARCHAR(255) NOT NULL,
        item_name VARCHAR(255),
        movement_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reason VARCHAR(255),
        reference_id VARCHAR(255),
        reference_type VARCHAR(50),
        location VARCHAR(255),
        performed_by VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_item (tenant_id, item_id),
        INDEX idx_type (movement_type),
        INDEX idx_created_at (created_at),
        INDEX idx_reference (reference_id, reference_type)
      )
    `);
  }
}

export const procurementStockHistoryService = new ProcurementStockHistoryService();

