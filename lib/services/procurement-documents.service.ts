/**
 * Procurement Documents Service
 * Handle file attachments for purchase orders and vendors
 */

import { query } from '@/lib/db/connection';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface ProcurementDocument {
  id?: string;
  tenantId: string;
  entityType: 'purchase_order' | 'vendor' | 'inventory';
  entityId: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  description?: string;
  category?: 'quote' | 'invoice' | 'contract' | 'delivery_note' | 'certificate' | 'other';
  createdAt?: string;
}

export class ProcurementDocumentsService {
  private uploadDir: string;

  constructor() {
    // Set upload directory (can be configured via env)
    this.uploadDir = process.env.PROCUREMENT_UPLOAD_DIR || join(process.cwd(), 'uploads', 'procurement');
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // ============================================================================
  // UPLOAD DOCUMENT
  // ============================================================================

  async uploadDocument(
    tenantId: string,
    entityType: 'purchase_order' | 'vendor' | 'inventory',
    entityId: string,
    file: File | Buffer,
    fileName: string,
    mimeType: string,
    uploadedBy: string,
    description?: string,
    category?: string
  ): Promise<ProcurementDocument> {
    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const extension = fileName.split('.').pop();
      const savedFileName = `${fileId}.${extension}`;
      const filePath = join(this.uploadDir, savedFileName);

      // Convert File to Buffer if needed
      let fileBuffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else {
        fileBuffer = file;
      }

      // Write file to disk
      await writeFile(filePath, fileBuffer);

      const fileSize = fileBuffer.length;

      // Generate ID
      const docId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Save metadata to database
      const result = await query(`
        INSERT INTO procurement_documents (
          id, tenant_id, entity_type, entity_id, file_name, original_file_name,
          file_path, mime_type, file_size, uploaded_by, description, category, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *
      `, [
        docId,
        tenantId,
        entityType,
        entityId,
        savedFileName,
        fileName,
        filePath,
        mimeType,
        fileSize,
        uploadedBy,
        description || null,
        category || 'other',
      ]);

      return {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        entityType: result.rows[0].entity_type,
        entityId: result.rows[0].entity_id,
        fileName: result.rows[0].file_name,
        originalFileName: result.rows[0].original_file_name,
        filePath: result.rows[0].file_path,
        mimeType: result.rows[0].mime_type,
        fileSize: result.rows[0].file_size,
        uploadedBy: result.rows[0].uploaded_by,
        description: result.rows[0].description,
        category: result.rows[0].category,
        createdAt: result.rows[0].created_at,
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createDocumentsTable();
        return this.uploadDocument(
          tenantId,
          entityType,
          entityId,
          file,
          fileName,
          mimeType,
          uploadedBy,
          description,
          category
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // GET DOCUMENTS
  // ============================================================================

  async getDocuments(
    tenantId: string,
    entityType: 'purchase_order' | 'vendor' | 'inventory',
    entityId: string
  ): Promise<ProcurementDocument[]> {
    try {
      const result = await query(`
        SELECT *
        FROM procurement_documents
        WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3
        ORDER BY created_at DESC
      `, [tenantId, entityType, entityId]);

      return result.rows.map((row: any) => ({
        id: row.id,
        tenantId: row.tenant_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        fileName: row.file_name,
        originalFileName: row.original_file_name,
        filePath: row.file_path,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        uploadedBy: row.uploaded_by,
        description: row.description,
        category: row.category,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createDocumentsTable();
        return [];
      }
      throw error;
    }
  }

  async getDocument(documentId: string, tenantId: string): Promise<ProcurementDocument | null> {
    try {
      const result = await query(`
        SELECT *
        FROM procurement_documents
        WHERE id = $1 AND tenant_id = $2
      `, [documentId, tenantId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        tenantId: row.tenant_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        fileName: row.file_name,
        originalFileName: row.original_file_name,
        filePath: row.file_path,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        uploadedBy: row.uploaded_by,
        description: row.description,
        category: row.category,
        createdAt: row.created_at,
      };
    } catch (error: any) {
      throw error;
    }
  }

  // ============================================================================
  // DOWNLOAD DOCUMENT
  // ============================================================================

  async downloadDocument(
    documentId: string,
    tenantId: string
  ): Promise<{ buffer: Buffer; document: ProcurementDocument } | null> {
    const document = await this.getDocument(documentId, tenantId);
    if (!document) {
      return null;
    }

    if (!existsSync(document.filePath)) {
      throw new Error('File not found on disk');
    }

    const buffer = await readFile(document.filePath);
    return { buffer, document };
  }

  // ============================================================================
  // DELETE DOCUMENT
  // ============================================================================

  async deleteDocument(documentId: string, tenantId: string): Promise<void> {
    const document = await this.getDocument(documentId, tenantId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk
    if (existsSync(document.filePath)) {
      await unlink(document.filePath);
    }

    // Delete from database
    await query(`
      DELETE FROM procurement_documents
      WHERE id = $1 AND tenant_id = $2
    `, [documentId, tenantId]);
  }

  // ============================================================================
  // DATABASE SETUP
  // ============================================================================

  private async createDocumentsTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_documents (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_by VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'other',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        INDEX idx_entity (tenant_id, entity_type, entity_id),
        INDEX idx_created_at (created_at)
      )
    `);
  }
}

export const procurementDocumentsService = new ProcurementDocumentsService();

