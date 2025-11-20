/**
 * Procurement Barcode Service
 * Generate and manage barcodes for inventory items
 */

import { query } from '@/lib/db/connection';
import QRCode from 'qrcode';

export interface BarcodeData {
  itemId: string;
  itemCode: string;
  itemName: string;
  sku?: string;
  barcode?: string;
  qrCode?: string; // Base64 QR code image
}

export class ProcurementBarcodeService {
  async generateBarcode(
    tenantId: string,
    itemId: string
  ): Promise<{ barcode: string; qrCode: string }> {
    try {
      // Get item details
      const result = await query(`
        SELECT id, item_code, item_name, sku, barcode
        FROM inventory
        WHERE id = $1 AND tenant_id = $2
      `, [itemId, tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Item not found');
      }

      const item = result.rows[0];
      const barcodeData = `${item.item_code}|${item.sku || item.id}`;

      // Generate QR code
      const qrCodeData = JSON.stringify({
        itemId: item.id,
        itemCode: item.item_code,
        itemName: item.item_name,
        sku: item.sku,
      });

      const qrCode = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
      });

      // Update barcode in database if not exists
      if (!item.barcode) {
        await query(`
          UPDATE inventory
          SET barcode = $1
          WHERE id = $2
        `, [barcodeData, itemId]);
      }

      return {
        barcode: item.barcode || barcodeData,
        qrCode,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async scanBarcode(barcode: string, tenantId: string): Promise<BarcodeData | null> {
    try {
      // Try to find by barcode
      let result = await query(`
        SELECT id, item_code, item_name, sku, barcode
        FROM inventory
        WHERE barcode = $1 AND tenant_id = $2
      `, [barcode, tenantId]);

      if (result.rows.length === 0) {
        // Try to parse barcode format: itemCode|sku
        const parts = barcode.split('|');
        if (parts.length === 2) {
          result = await query(`
            SELECT id, item_code, item_name, sku, barcode
            FROM inventory
            WHERE item_code = $1 AND tenant_id = $2
          `, [parts[0], tenantId]);
        }
      }

      if (result.rows.length === 0) {
        return null;
      }

      const item = result.rows[0];

      // Generate QR code for response
      const qrCodeData = JSON.stringify({
        itemId: item.id,
        itemCode: item.item_code,
        itemName: item.item_name,
        sku: item.sku,
      });

      const qrCode = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
      });

      return {
        itemId: item.id,
        itemCode: item.item_code,
        itemName: item.item_name,
        sku: item.sku,
        barcode: item.barcode,
        qrCode,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async generateBulkBarcodes(
    tenantId: string,
    itemIds: string[]
  ): Promise<BarcodeData[]> {
    const results: BarcodeData[] = [];

    for (const itemId of itemIds) {
      try {
        const { barcode, qrCode } = await this.generateBarcode(tenantId, itemId);

        // Get item details
        const result = await query(`
          SELECT id, item_code, item_name, sku
          FROM inventory
          WHERE id = $1
        `, [itemId]);

        if (result.rows.length > 0) {
          const item = result.rows[0];
          results.push({
            itemId: item.id,
            itemCode: item.item_code,
            itemName: item.item_name,
            sku: item.sku,
            barcode,
            qrCode,
          });
        }
      } catch (error: any) {
        console.error(`Error generating barcode for item ${itemId}:`, error);
      }
    }

    return results;
  }
}

export const procurementBarcodeService = new ProcurementBarcodeService();

