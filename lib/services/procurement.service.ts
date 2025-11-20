/**
 * Procurement Service Layer
 * Enterprise-level procurement management with business logic
 */

import { query } from '@/lib/db/connection';
import { procurementAuditService } from './procurement-audit.service';
import { procurementStockHistoryService } from './procurement-stock-history.service';

export interface PurchaseOrder {
  id?: string;
  orderNumber?: string;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  totalAmount?: number;
  status?: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy?: string;
  approvedBy?: string;
  orderDate?: string;
  expectedDelivery?: string;
  deliveryDate?: string;
  category?: string;
  items?: PurchaseOrderItem[];
  tenantId: string;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  purchaseOrderId?: string;
  itemId?: string;
  itemName?: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  description?: string;
  category?: string;
}

export interface Vendor {
  id?: string;
  vendorCode?: string;
  name?: string;
  nameAr?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  vendorType?: string;
  status?: 'active' | 'inactive' | 'pending' | 'blacklisted';
  rating?: number;
  totalOrders?: number;
  totalValue?: number;
  lastOrder?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  notes?: string;
  taxId?: string;
  commercialRegistration?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id?: string;
  itemCode?: string;
  sku?: string;
  name?: string;
  nameAr?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitPrice?: number;
  totalValue?: number;
  location?: string;
  vendorId?: string;
  supplier?: string;
  lastRestocked?: string;
  status?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  movementType?: 'fast' | 'medium' | 'slow';
  unitOfMeasure?: string;
  barcode?: string;
  currency?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ProcurementService {
  // ============================================================================
  // PURCHASE ORDERS
  // ============================================================================

  async getPurchaseOrders(
    tenantId: string,
    filters?: {
      status?: string;
      vendorId?: string;
      category?: string;
      priority?: string;
      requestedBy?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ orders: PurchaseOrder[]; summary: any }> {
    try {
      let whereClause = 'WHERE po.tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        whereClause += ` AND po.status = $${paramIndex++}`;
        params.push(filters.status);
      }
      if (filters?.vendorId) {
        whereClause += ` AND po.vendor_id = $${paramIndex++}`;
        params.push(filters.vendorId);
      }
      if (filters?.category) {
        whereClause += ` AND po.category = $${paramIndex++}`;
        params.push(filters.category);
      }
      if (filters?.priority) {
        whereClause += ` AND po.priority = $${paramIndex++}`;
        params.push(filters.priority);
      }
      if (filters?.requestedBy) {
        whereClause += ` AND po.created_by = $${paramIndex++}`;
        params.push(filters.requestedBy);
      }
      if (filters?.dateFrom) {
        whereClause += ` AND po.order_date >= $${paramIndex++}`;
        params.push(filters.dateFrom);
      }
      if (filters?.dateTo) {
        whereClause += ` AND po.order_date <= $${paramIndex++}`;
        params.push(filters.dateTo);
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT 
          po.id, po.po_number as "orderNumber", po.vendor_id as "vendorId", 
          po.vendor_name as "vendorName", po.order_date as "orderDate",
          po.expected_delivery_date as "expectedDelivery", po.delivery_date as "deliveryDate",
          po.status, po.total_amount as "totalAmount", po.priority,
          po.created_by as "requestedBy", po.approved_by as "approvedBy",
          po.approved_at as "approvedAt", po.category, po.currency,
          po.payment_terms as "paymentTerms", po.notes,
          po.created_at as "createdAt", po.updated_at as "updatedAt",
          COUNT(poi.id)::int as items
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        ${whereClause}
        GROUP BY po.id
        ORDER BY po.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      // Get summary statistics
      const summaryResult = await query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
          COUNT(*) FILTER (WHERE status = 'approved')::int as approved,
          COUNT(*) FILTER (WHERE status = 'received')::int as received,
          SUM(total_amount) as totalValue,
          AVG(total_amount) as averageValue
        FROM purchase_orders
        WHERE tenant_id = $1
        ${filters?.status ? `AND status = '${filters.status}'` : ''}
      `, [tenantId]);

      const orders = result.rows.map((row: any) => ({
        id: row.id,
        orderNumber: row.orderNumber,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        description: row.notes || '',
        totalAmount: parseFloat(row.totalAmount) || 0,
        status: row.status,
        priority: row.priority,
        requestedBy: row.requestedBy,
        approvedBy: row.approvedBy,
        orderDate: row.orderDate,
        expectedDelivery: row.expectedDelivery,
        deliveryDate: row.deliveryDate,
        category: row.category,
        currency: row.currency || 'SAR',
        paymentTerms: row.paymentTerms,
        notes: row.notes,
        items: row.items || 0,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return {
        orders,
        summary: summaryResult.rows[0] || {
          total: 0,
          pending: 0,
          approved: 0,
          received: 0,
          totalValue: 0,
          averageValue: 0,
        },
      };
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      throw new Error(`Failed to fetch purchase orders: ${error.message}`);
    }
  }

  async getPurchaseOrder(tenantId: string, orderId: string): Promise<PurchaseOrder> {
    try {
      const result = await query(`
        SELECT 
          po.*, 
          json_agg(
            json_build_object(
              'id', poi.id,
              'itemId', poi.item_id,
              'itemName', poi.item_name,
              'sku', poi.sku,
              'quantity', poi.quantity,
              'unitPrice', poi.unit_price,
              'totalPrice', poi.total_price,
              'description', poi.description,
              'category', poi.category
            )
          ) FILTER (WHERE poi.id IS NOT NULL) as items
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        WHERE po.id = $1 AND po.tenant_id = $2
        GROUP BY po.id
      `, [orderId, tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Purchase order not found');
      }

      const row = result.rows[0];
      return {
        id: row.id,
        orderNumber: row.po_number,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        description: row.notes || '',
        totalAmount: parseFloat(row.total_amount) || 0,
        status: row.status,
        priority: row.priority,
        requestedBy: row.created_by,
        approvedBy: row.approved_by,
        orderDate: row.order_date,
        expectedDelivery: row.expected_delivery_date,
        deliveryDate: row.delivery_date,
        category: row.category,
        currency: row.currency || 'SAR',
        paymentTerms: row.payment_terms,
        notes: row.notes,
        items: row.items || [],
        tenantId,
      };
    } catch (error: any) {
      console.error('Error fetching purchase order:', error);
      throw new Error(`Failed to fetch purchase order: ${error.message}`);
    }
  }

  async createPurchaseOrder(tenantId: string, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    try {
      // Generate order number
      const orderNumberResult = await query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
        FROM purchase_orders
        WHERE tenant_id = $1
      `, [tenantId]);
      const nextNum = orderNumberResult.rows[0]?.next_num || 1;
      const orderNumber = `PO-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;

      // Insert purchase order
      const result = await query(`
        INSERT INTO purchase_orders (
          po_number, vendor_id, vendor_name, order_date, expected_delivery_date,
          status, priority, total_amount, category, currency, payment_terms,
          notes, created_by, tenant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        orderNumber,
        orderData.vendorId || null,
        orderData.vendorName || '',
        orderData.orderDate || new Date().toISOString().split('T')[0],
        orderData.expectedDelivery || null,
        orderData.status || 'draft',
        orderData.priority || 'medium',
        orderData.totalAmount || 0,
        orderData.category || '',
        orderData.currency || 'SAR',
        orderData.paymentTerms || '',
        orderData.notes || '',
        orderData.requestedBy || '',
        tenantId,
      ]);

      const orderId = result.rows[0].id;

      // Insert order items if provided
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          await query(`
            INSERT INTO purchase_order_items (
              purchase_order_id, item_id, item_name, sku, quantity,
              unit_price, total_price, description, category
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            orderId,
            item.itemId || null,
            item.itemName || '',
            item.sku || '',
            item.quantity || 0,
            item.unitPrice || 0,
            item.totalPrice || (item.quantity || 0) * (item.unitPrice || 0),
            item.description || '',
            item.category || '',
          ]);
        }

        // Recalculate total
        const totalResult = await query(`
          SELECT SUM(total_price) as total
          FROM purchase_order_items
          WHERE purchase_order_id = $1
        `, [orderId]);

        const totalAmount = parseFloat(totalResult.rows[0]?.total || '0');
        await query(`
          UPDATE purchase_orders
          SET total_amount = $1
          WHERE id = $2
        `, [totalAmount, orderId]);
      }

      return await this.getPurchaseOrder(tenantId, orderId);
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      throw new Error(`Failed to create purchase order: ${error.message}`);
    }
  }

  async updatePurchaseOrder(tenantId: string, orderId: string, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (orderData.vendorId !== undefined) {
        updates.push(`vendor_id = $${paramIndex++}`);
        params.push(orderData.vendorId);
      }
      if (orderData.vendorName !== undefined) {
        updates.push(`vendor_name = $${paramIndex++}`);
        params.push(orderData.vendorName);
      }
      if (orderData.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(orderData.status);
        if (orderData.status === 'approved' && orderData.approvedBy) {
          updates.push(`approved_by = $${paramIndex++}`);
          params.push(orderData.approvedBy);
          updates.push(`approved_at = NOW()`);
        }
      }
      if (orderData.expectedDelivery !== undefined) {
        updates.push(`expected_delivery_date = $${paramIndex++}`);
        params.push(orderData.expectedDelivery);
      }
      if (orderData.deliveryDate !== undefined) {
        updates.push(`delivery_date = $${paramIndex++}`);
        params.push(orderData.deliveryDate);
      }
      if (orderData.priority !== undefined) {
        updates.push(`priority = $${paramIndex++}`);
        params.push(orderData.priority);
      }
      if (orderData.notes !== undefined) {
        updates.push(`notes = $${paramIndex++}`);
        params.push(orderData.notes);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        params.push(orderId, tenantId);
        await query(`
          UPDATE purchase_orders
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        `, params);
      }

      const updatedOrder = await this.getPurchaseOrder(tenantId, orderId);

      // Log audit trail
      try {
        await procurementAuditService.log(
          tenantId,
          (orderData as any).updatedBy || 'system',
          'update',
          'purchase_order',
          orderId,
          undefined, // changes would be calculated here
          { orderNumber: updatedOrder.orderNumber }
        );
      } catch (auditError) {
        // Don't fail if audit logging fails
        console.error('Audit logging failed:', auditError);
      }

      return updatedOrder;
    } catch (error: any) {
      console.error('Error updating purchase order:', error);
      throw new Error(`Failed to update purchase order: ${error.message}`);
    }
  }

  // ============================================================================
  // VENDORS
  // ============================================================================

  async getVendors(
    tenantId: string,
    filters?: {
      status?: string;
      category?: string;
      vendorType?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ vendors: Vendor[]; summary: any }> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status && filters.status !== 'all') {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      if (filters?.category) {
        whereClause += ` AND category = $${paramIndex++}`;
        params.push(filters.category);
      }
      if (filters?.vendorType) {
        whereClause += ` AND vendor_type = $${paramIndex++}`;
        params.push(filters.vendorType);
      }
      if (filters?.search) {
        whereClause += ` AND (vendor_name ILIKE $${paramIndex++} OR contact_person ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 2;
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT 
          v.*,
          (SELECT COUNT(*)::int FROM purchase_orders WHERE vendor_id = v.id) as total_orders,
          (SELECT SUM(total_amount) FROM purchase_orders WHERE vendor_id = v.id) as total_value,
          (SELECT MAX(order_date) FROM purchase_orders WHERE vendor_id = v.id) as last_order_date
        FROM vendors v
        ${whereClause}
        ORDER BY v.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      const vendors = result.rows.map((row: any) => ({
        id: row.id,
        vendorCode: row.vendor_code,
        name: row.vendor_name,
        nameAr: row.vendor_name_ar,
        contactPerson: row.contact_person,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        category: row.category || row.vendor_type,
        vendorType: row.vendor_type,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        totalOrders: parseInt(row.total_orders) || 0,
        totalValue: parseFloat(row.total_value) || 0,
        lastOrder: row.last_order_date || '',
        paymentTerms: row.payment_terms || '',
        deliveryTime: '',
        notes: row.notes || '',
        taxId: row.tax_id,
        commercialRegistration: row.commercial_registration,
        tenantId,
      }));

      // Get summary
      const summaryResult = await query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'active')::int as active,
          COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
          AVG(rating) as averageRating
        FROM vendors
        WHERE tenant_id = $1
      `, [tenantId]);

      return {
        vendors,
        summary: summaryResult.rows[0] || { total: 0, active: 0, pending: 0, averageRating: 0 },
      };
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }
  }

  async getVendor(tenantId: string, vendorId: string): Promise<Vendor> {
    try {
      const result = await query(`
        SELECT 
          v.*,
          (SELECT COUNT(*)::int FROM purchase_orders WHERE vendor_id = v.id) as total_orders,
          (SELECT SUM(total_amount) FROM purchase_orders WHERE vendor_id = v.id) as total_value,
          (SELECT MAX(order_date) FROM purchase_orders WHERE vendor_id = v.id) as last_order_date
        FROM vendors v
        WHERE v.id = $1 AND v.tenant_id = $2
      `, [vendorId, tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const row = result.rows[0];
      return {
        id: row.id,
        vendorCode: row.vendor_code,
        name: row.vendor_name,
        nameAr: row.vendor_name_ar,
        contactPerson: row.contact_person,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        category: row.category || row.vendor_type,
        vendorType: row.vendor_type,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        totalOrders: parseInt(row.total_orders) || 0,
        totalValue: parseFloat(row.total_value) || 0,
        lastOrder: row.last_order_date || '',
        paymentTerms: row.payment_terms || '',
        notes: row.notes || '',
        taxId: row.tax_id,
        commercialRegistration: row.commercial_registration,
        tenantId,
      };
    } catch (error: any) {
      console.error('Error fetching vendor:', error);
      throw new Error(`Failed to fetch vendor: ${error.message}`);
    }
  }

  async createVendor(tenantId: string, vendorData: Partial<Vendor>): Promise<Vendor> {
    try {
      // Generate vendor code
      const codeResult = await query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_code FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
        FROM vendors
        WHERE tenant_id = $1
      `, [tenantId]);
      const nextNum = codeResult.rows[0]?.next_num || 1;
      const vendorCode = `VENDOR-${String(nextNum).padStart(4, '0')}`;

      const result = await query(`
        INSERT INTO vendors (
          vendor_code, vendor_name, vendor_name_ar, contact_person, email, phone,
          address, city, country, category, vendor_type, status, rating,
          payment_terms, notes, tax_id, commercial_registration, tenant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        vendorCode,
        vendorData.name || '',
        vendorData.nameAr || '',
        vendorData.contactPerson || '',
        vendorData.email || '',
        vendorData.phone || '',
        vendorData.address || '',
        vendorData.city || '',
        vendorData.country || '',
        vendorData.category || '',
        vendorData.vendorType || '',
        vendorData.status || 'pending',
        vendorData.rating || 0,
        vendorData.paymentTerms || '',
        vendorData.notes || '',
        vendorData.taxId || '',
        vendorData.commercialRegistration || '',
        tenantId,
      ]);

      return await this.getVendor(tenantId, result.rows[0].id);
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      throw new Error(`Failed to create vendor: ${error.message}`);
    }
  }

  async updateVendor(tenantId: string, vendorId: string, vendorData: Partial<Vendor>): Promise<Vendor> {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      const fields: { [key: string]: string } = {
        name: 'vendor_name',
        nameAr: 'vendor_name_ar',
        contactPerson: 'contact_person',
        email: 'email',
        phone: 'phone',
        address: 'address',
        city: 'city',
        country: 'country',
        category: 'category',
        vendorType: 'vendor_type',
        status: 'status',
        rating: 'rating',
        paymentTerms: 'payment_terms',
        notes: 'notes',
        taxId: 'tax_id',
        commercialRegistration: 'commercial_registration',
      };

      for (const [key, dbField] of Object.entries(fields)) {
        if (vendorData[key as keyof Vendor] !== undefined) {
          updates.push(`${dbField} = $${paramIndex++}`);
          params.push(vendorData[key as keyof Vendor]);
        }
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        params.push(vendorId, tenantId);
        await query(`
          UPDATE vendors
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        `, params);
      }

      const updatedVendor = await this.getVendor(tenantId, vendorId);

      // Log audit trail
      try {
        await procurementAuditService.log(
          tenantId,
          (vendorData as any).updatedBy || 'system',
          'update',
          'vendor',
          vendorId,
          undefined,
          { vendorName: updatedVendor.name }
        );
      } catch (auditError) {
        console.error('Audit logging failed:', auditError);
      }

      return updatedVendor;
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      throw new Error(`Failed to update vendor: ${error.message}`);
    }
  }

  // ============================================================================
  // INVENTORY
  // ============================================================================

  async getInventory(
    tenantId: string,
    filters?: {
      status?: string;
      category?: string;
      subcategory?: string;
      vendorId?: string;
      lowStock?: boolean;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ inventory: InventoryItem[]; summary: any }> {
    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      if (filters?.category) {
        whereClause += ` AND category = $${paramIndex++}`;
        params.push(filters.category);
      }
      if (filters?.subcategory) {
        whereClause += ` AND subcategory = $${paramIndex++}`;
        params.push(filters.subcategory);
      }
      if (filters?.vendorId) {
        whereClause += ` AND vendor_id = $${paramIndex++}`;
        params.push(filters.vendorId);
      }
      if (filters?.lowStock) {
        whereClause += ` AND current_stock <= min_stock_level`;
      }
      if (filters?.search) {
        whereClause += ` AND (item_name ILIKE $${paramIndex++} OR item_code ILIKE $${paramIndex++} OR sku ILIKE $${paramIndex++})`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 2;
      }

      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;

      // Determine status based on stock levels
      const result = await query(`
        SELECT 
          i.*,
          CASE 
            WHEN current_stock = 0 THEN 'out-of-stock'
            WHEN current_stock <= min_stock_level THEN 'low-stock'
            WHEN current_stock > max_stock_level THEN 'overstocked'
            ELSE 'in-stock'
          END as calculated_status,
          (current_stock * unit_cost) as calculated_total_value
        FROM inventory i
        ${whereClause}
        ORDER BY i.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      const inventory = result.rows.map((row: any) => {
        const status = row.status || row.calculated_status;
        let movementType: 'fast' | 'medium' | 'slow' = 'medium';
        // This would be calculated based on historical data in a real system
        if (row.last_restocked) {
          const daysSinceRestock = Math.floor((Date.now() - new Date(row.last_restocked).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceRestock < 7) movementType = 'fast';
          else if (daysSinceRestock > 30) movementType = 'slow';
        }

        return {
          id: row.id,
          itemCode: row.item_code,
          sku: row.sku,
          name: row.item_name,
          nameAr: row.item_name_ar,
          category: row.category,
          subcategory: row.subcategory,
          description: row.description || '',
          currentStock: parseInt(row.current_stock) || 0,
          minStock: parseInt(row.min_stock_level) || 0,
          maxStock: parseInt(row.max_stock_level) || 0,
          reorderPoint: parseInt(row.reorder_point) || 0,
          unitPrice: parseFloat(row.unit_cost) || 0,
          totalValue: parseFloat(row.calculated_total_value) || 0,
          location: row.location || '',
          vendorId: row.vendor_id,
          supplier: '',
          lastRestocked: row.last_restocked || '',
          status,
          movementType,
          unitOfMeasure: row.unit_of_measure || '',
          barcode: row.barcode || '',
          currency: row.currency || 'SAR',
          tenantId,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });

      // Get summary
      const summaryResult = await query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE current_stock = 0)::int as out_of_stock,
          COUNT(*) FILTER (WHERE current_stock <= min_stock_level AND current_stock > 0)::int as low_stock,
          COUNT(*) FILTER (WHERE current_stock > max_stock_level)::int as overstocked,
          SUM(current_stock * unit_cost) as totalValue,
          AVG(current_stock) as averageStock
        FROM inventory
        WHERE tenant_id = $1
      `, [tenantId]);

      return {
        inventory,
        summary: summaryResult.rows[0] || {
          total: 0,
          out_of_stock: 0,
          low_stock: 0,
          overstocked: 0,
          totalValue: 0,
          averageStock: 0,
        },
      };
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
  }

  async getInventoryItem(tenantId: string, itemId: string): Promise<InventoryItem> {
    try {
      const result = await query(`
        SELECT *
        FROM inventory
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Inventory item not found');
      }

      const row = result.rows[0];
      const status = row.status || 
        (row.current_stock === 0 ? 'out-of-stock' :
         row.current_stock <= row.min_stock_level ? 'low-stock' :
         row.current_stock > row.max_stock_level ? 'overstocked' : 'in-stock');

      return {
        id: row.id,
        itemCode: row.item_code,
        sku: row.sku,
        name: row.item_name,
        nameAr: row.item_name_ar,
        category: row.category,
        subcategory: row.subcategory,
        description: row.description || '',
        currentStock: parseInt(row.current_stock) || 0,
        minStock: parseInt(row.min_stock_level) || 0,
        maxStock: parseInt(row.max_stock_level) || 0,
        reorderPoint: parseInt(row.reorder_point) || 0,
        unitPrice: parseFloat(row.unit_cost) || 0,
        totalValue: parseFloat(row.current_stock) * parseFloat(row.unit_cost) || 0,
        location: row.location || '',
        vendorId: row.vendor_id,
        lastRestocked: row.last_restocked || '',
        status,
        unitOfMeasure: row.unit_of_measure || '',
        barcode: row.barcode || '',
        currency: row.currency || 'SAR',
        tenantId,
      };
    } catch (error: any) {
      console.error('Error fetching inventory item:', error);
      throw new Error(`Failed to fetch inventory item: ${error.message}`);
    }
  }

  async createInventoryItem(tenantId: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      // Generate item code
      const codeResult = await query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(item_code FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
        FROM inventory
        WHERE tenant_id = $1
      `, [tenantId]);
      const nextNum = codeResult.rows[0]?.next_num || 1;
      const itemCode = `ITEM-${String(nextNum).padStart(5, '0')}`;

      const currentStock = itemData.currentStock || 0;
      const minStock = itemData.minStock || 0;
      let status = itemData.status;
      if (!status) {
        status = currentStock === 0 ? 'out-of-stock' :
                 currentStock <= minStock ? 'low-stock' :
                 currentStock > (itemData.maxStock || 1000) ? 'overstocked' : 'in-stock';
      }

      const result = await query(`
        INSERT INTO inventory (
          item_code, item_name, item_name_ar, category, subcategory,
          description, sku, barcode, unit_of_measure,
          current_stock, min_stock_level, max_stock_level, reorder_point,
          unit_cost, currency, location, vendor_id, status, tenant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `, [
        itemCode,
        itemData.name || '',
        itemData.nameAr || '',
        itemData.category || '',
        itemData.subcategory || '',
        itemData.description || '',
        itemData.sku || '',
        itemData.barcode || '',
        itemData.unitOfMeasure || 'unit',
        currentStock,
        minStock,
        itemData.maxStock || 1000,
        itemData.reorderPoint || minStock,
        itemData.unitPrice || 0,
        itemData.currency || 'SAR',
        itemData.location || '',
        itemData.vendorId || null,
        status,
        tenantId,
      ]);

      const newItem = await this.getInventoryItem(tenantId, result.rows[0].id);

      // Log audit trail
      try {
        await procurementAuditService.log(
          tenantId,
          itemData.createdBy || 'system',
          'create',
          'inventory',
          result.rows[0].id,
          undefined,
          { itemName: newItem.name }
        );
      } catch (auditError) {
        console.error('Audit logging failed:', auditError);
      }

      return newItem;
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      throw new Error(`Failed to create inventory item: ${error.message}`);
    }
  }

  async updateInventoryItem(tenantId: string, itemId: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      const fields: { [key: string]: string } = {
        name: 'item_name',
        nameAr: 'item_name_ar',
        category: 'category',
        subcategory: 'subcategory',
        description: 'description',
        sku: 'sku',
        barcode: 'barcode',
        unitOfMeasure: 'unit_of_measure',
        currentStock: 'current_stock',
        minStock: 'min_stock_level',
        maxStock: 'max_stock_level',
        reorderPoint: 'reorder_point',
        unitPrice: 'unit_cost',
        currency: 'currency',
        location: 'location',
        vendorId: 'vendor_id',
        status: 'status',
      };

      for (const [key, dbField] of Object.entries(fields)) {
        if (itemData[key as keyof InventoryItem] !== undefined) {
          updates.push(`${dbField} = $${paramIndex++}`);
          params.push(itemData[key as keyof InventoryItem]);
        }
      }

      // Recalculate status if stock changed
      if (itemData.currentStock !== undefined || itemData.minStock !== undefined || itemData.maxStock !== undefined) {
        const current = await this.getInventoryItem(tenantId, itemId);
        const currentStock = itemData.currentStock !== undefined ? itemData.currentStock : current.currentStock;
        const minStock = itemData.minStock !== undefined ? itemData.minStock : current.minStock;
        const maxStock = itemData.maxStock !== undefined ? itemData.maxStock : current.maxStock;
        
        let newStatus = currentStock === 0 ? 'out-of-stock' :
                       currentStock <= minStock ? 'low-stock' :
                       currentStock > maxStock ? 'overstocked' : 'in-stock';
        
        updates.push(`status = $${paramIndex++}`);
        params.push(newStatus);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        params.push(itemId, tenantId);
        await query(`
          UPDATE inventory
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        `, params);
      }

      const updatedItem = await this.getInventoryItem(tenantId, itemId);

      // Log audit trail
      try {
        await procurementAuditService.log(
          tenantId,
          (itemData as any).updatedBy || 'system',
          'update',
          'inventory',
          itemId,
          undefined,
          { itemName: updatedItem.name }
        );
      } catch (auditError) {
        console.error('Audit logging failed:', auditError);
      }

      return updatedItem;
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      throw new Error(`Failed to update inventory item: ${error.message}`);
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getProcurementKPIs(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<any> {
    try {
      const dateFilter = filters?.dateFrom && filters?.dateTo
        ? `AND order_date BETWEEN '${filters.dateFrom}' AND '${filters.dateTo}'`
        : '';

      const result = await query(`
        SELECT 
          -- Purchase Orders
          (SELECT COUNT(*)::int FROM purchase_orders WHERE tenant_id = $1 ${dateFilter}) as total_orders,
          (SELECT COUNT(*)::int FROM purchase_orders WHERE tenant_id = $1 AND status = 'pending' ${dateFilter}) as pending_orders,
          (SELECT COUNT(*)::int FROM purchase_orders WHERE tenant_id = $1 AND status = 'approved' ${dateFilter}) as approved_orders,
          (SELECT COUNT(*)::int FROM purchase_orders WHERE tenant_id = $1 AND status = 'received' ${dateFilter}) as received_orders,
          (SELECT SUM(total_amount) FROM purchase_orders WHERE tenant_id = $1 ${dateFilter}) as total_spend,
          (SELECT AVG(total_amount) FROM purchase_orders WHERE tenant_id = $1 ${dateFilter}) as average_order_value,
          
          -- Vendors
          (SELECT COUNT(*)::int FROM vendors WHERE tenant_id = $1 AND status = 'active') as active_vendors,
          (SELECT COUNT(*)::int FROM vendors WHERE tenant_id = $1 AND status = 'pending') as pending_vendors,
          (SELECT AVG(rating) FROM vendors WHERE tenant_id = $1) as average_vendor_rating,
          
          -- Inventory
          (SELECT COUNT(*)::int FROM inventory WHERE tenant_id = $1) as total_items,
          (SELECT COUNT(*)::int FROM inventory WHERE tenant_id = $1 AND current_stock <= min_stock_level) as low_stock_items,
          (SELECT COUNT(*)::int FROM inventory WHERE tenant_id = $1 AND current_stock = 0) as out_of_stock_items,
          (SELECT SUM(current_stock * unit_cost) FROM inventory WHERE tenant_id = $1) as total_inventory_value,
          
          -- Performance
          (SELECT AVG(EXTRACT(EPOCH FROM (delivery_date - order_date))/86400) 
           FROM purchase_orders WHERE tenant_id = $1 AND delivery_date IS NOT NULL ${dateFilter}) as average_delivery_days
      `, [tenantId]);

      return result.rows[0] || {};
    } catch (error: any) {
      console.error('Error fetching procurement KPIs:', error);
      throw new Error(`Failed to fetch procurement KPIs: ${error.message}`);
    }
  }

  async getProcurementAnalytics(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<any> {
    try {
      const dateFilter = filters?.dateFrom && filters?.dateTo
        ? `AND order_date BETWEEN '${filters.dateFrom}' AND '${filters.dateTo}'`
        : '';

      // Spending by category
      const categorySpending = await query(`
        SELECT 
          category,
          COUNT(*)::int as order_count,
          SUM(total_amount) as total_spend,
          AVG(total_amount) as average_order
        FROM purchase_orders
        WHERE tenant_id = $1 ${dateFilter} AND category IS NOT NULL
        GROUP BY category
        ORDER BY total_spend DESC
        LIMIT 10
      `, [tenantId]);

      // Spending by vendor
      const vendorSpending = await query(`
        SELECT 
          vendor_name,
          COUNT(*)::int as order_count,
          SUM(total_amount) as total_spend,
          AVG(total_amount) as average_order
        FROM purchase_orders
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY vendor_name
        ORDER BY total_spend DESC
        LIMIT 10
      `, [tenantId]);

      // Monthly spending trend
      const monthlyTrend = await query(`
        SELECT 
          TO_CHAR(order_date, 'YYYY-MM') as month,
          COUNT(*)::int as order_count,
          SUM(total_amount) as total_spend
        FROM purchase_orders
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY TO_CHAR(order_date, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      `, [tenantId]);

      // Order status distribution
      const statusDistribution = await query(`
        SELECT 
          status,
          COUNT(*)::int as count,
          SUM(total_amount) as total_value
        FROM purchase_orders
        WHERE tenant_id = $1 ${dateFilter}
        GROUP BY status
      `, [tenantId]);

      return {
        categorySpending: categorySpending.rows,
        vendorSpending: vendorSpending.rows,
        monthlyTrend: monthlyTrend.rows,
        statusDistribution: statusDistribution.rows,
      };
    } catch (error: any) {
      console.error('Error fetching procurement analytics:', error);
      throw new Error(`Failed to fetch procurement analytics: ${error.message}`);
    }
  }
}

// Singleton instance
export const procurementService = new ProcurementService();

