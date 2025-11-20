/**
 * Procurement Vendor Reviews Service
 * Manage vendor performance reviews and ratings
 */

import { query } from '@/lib/db/connection';

export interface VendorReview {
  id?: string;
  tenantId: string;
  vendorId: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerEmail?: string;
  rating: number; // 1-5
  categories: {
    quality: number;
    delivery: number;
    pricing: number;
    communication: number;
    reliability: number;
  };
  title?: string;
  comment?: string;
  orderId?: string; // Optional reference to purchase order
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorReviewSummary {
  vendorId: string;
  totalReviews: number;
  averageRating: number;
  categoryAverages: {
    quality: number;
    delivery: number;
    pricing: number;
    communication: number;
    reliability: number;
  };
  lastReviewDate?: string;
}

export class ProcurementVendorReviewsService {
  async createReview(
    tenantId: string,
    reviewData: Partial<VendorReview>
  ): Promise<VendorReview> {
    try {
      const averageRating = this.calculateAverageRating(reviewData.categories!);

      const reviewId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const result = await query(`
        INSERT INTO vendor_reviews (
          id, tenant_id, vendor_id, reviewer_id, rating, categories,
          title, comment, order_id, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `, [
        reviewId,
        tenantId,
        reviewData.vendorId,
        reviewData.reviewerId,
        averageRating,
        JSON.stringify(reviewData.categories),
        reviewData.title || null,
        reviewData.comment || null,
        reviewData.orderId || null,
        reviewData.status || 'pending',
      ]);

      // Update vendor rating
      await this.updateVendorRating(tenantId, reviewData.vendorId!);

      return this.mapReviewFromDb(result.rows[0]);
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createReviewsTable();
        return this.createReview(tenantId, reviewData);
      }
      throw error;
    }
  }

  async getReviews(
    tenantId: string,
    vendorId: string,
    filters?: {
      status?: string;
      minRating?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<VendorReview[]> {
    try {
      let whereClause = 'WHERE tenant_id = $1 AND vendor_id = $2';
      const params: any[] = [tenantId, vendorId];
      let paramIndex = 3;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }

      if (filters?.minRating) {
        whereClause += ` AND rating >= $${paramIndex++}`;
        params.push(filters.minRating);
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      const result = await query(`
        SELECT 
          vr.*,
          u.email as reviewer_email,
          u.name as reviewer_name
        FROM vendor_reviews vr
        LEFT JOIN users u ON vr.reviewer_id = u.id
        ${whereClause}
        ORDER BY vr.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset]);

      return result.rows.map((row: any) => this.mapReviewFromDb(row));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createReviewsTable();
        return [];
      }
      throw error;
    }
  }

  async getReviewSummary(
    tenantId: string,
    vendorId: string
  ): Promise<VendorReviewSummary> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*)::int as total_reviews,
          AVG(rating) as average_rating,
          AVG((categories->>'quality')::numeric) as avg_quality,
          AVG((categories->>'delivery')::numeric) as avg_delivery,
          AVG((categories->>'pricing')::numeric) as avg_pricing,
          AVG((categories->>'communication')::numeric) as avg_communication,
          AVG((categories->>'reliability')::numeric) as avg_reliability,
          MAX(created_at) as last_review_date
        FROM vendor_reviews
        WHERE tenant_id = $1 AND vendor_id = $2 AND status = 'approved'
      `, [tenantId, vendorId]);

      const row = result.rows[0];

      return {
        vendorId,
        totalReviews: parseInt(row.total_reviews) || 0,
        averageRating: parseFloat(row.average_rating) || 0,
        categoryAverages: {
          quality: parseFloat(row.avg_quality) || 0,
          delivery: parseFloat(row.avg_delivery) || 0,
          pricing: parseFloat(row.avg_pricing) || 0,
          communication: parseFloat(row.avg_communication) || 0,
          reliability: parseFloat(row.avg_reliability) || 0,
        },
        lastReviewDate: row.last_review_date,
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createReviewsTable();
        return {
          vendorId,
          totalReviews: 0,
          averageRating: 0,
          categoryAverages: {
            quality: 0,
            delivery: 0,
            pricing: 0,
            communication: 0,
            reliability: 0,
          },
        };
      }
      throw error;
    }
  }

  private async updateVendorRating(tenantId: string, vendorId: string): Promise<void> {
    try {
      const summary = await this.getReviewSummary(tenantId, vendorId);

      await query(`
        UPDATE vendors
        SET rating = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
      `, [summary.averageRating, vendorId, tenantId]);
    } catch (error: any) {
      console.error('Error updating vendor rating:', error);
    }
  }

  private calculateAverageRating(categories: VendorReview['categories']): number {
    const values = [
      categories.quality,
      categories.delivery,
      categories.pricing,
      categories.communication,
      categories.reliability,
    ];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private mapReviewFromDb(row: any): VendorReview {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vendorId: row.vendor_id,
      reviewerId: row.reviewer_id,
      reviewerName: row.reviewer_name,
      reviewerEmail: row.reviewer_email,
      rating: parseFloat(row.rating),
      categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : row.categories,
      title: row.title,
      comment: row.comment,
      orderId: row.order_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async createReviewsTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS vendor_reviews (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        vendor_id VARCHAR(255) NOT NULL,
        reviewer_id VARCHAR(255) NOT NULL,
        rating DECIMAL(3, 2) NOT NULL,
        categories JSONB NOT NULL,
        title VARCHAR(255),
        comment TEXT,
        order_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_vendor (tenant_id, vendor_id),
        INDEX idx_status (status),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at)
      )
    `);
  }
}

export const procurementVendorReviewsService = new ProcurementVendorReviewsService();

