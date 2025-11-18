import { PoolClient } from 'pg';
import { BaseDatabaseService } from '../db/base-service';

interface VectorIndex {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  dimensions: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  vectorCount: number;
  maxVectors: number;
  status: 'active' | 'creating' | 'error' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  metadata: {
    dataType: 'products' | 'documents' | 'support' | 'general';
    lastSync: string;
    syncStatus: 'synced' | 'syncing' | 'error';
  };
}

interface VectorRecord {
  id: string;
  indexId: string;
  vectorId: string;
  values: number[];
  metadata: Record<string, any>;
  score?: number;
  createdAt: string;
}

export class VectorizeService extends BaseDatabaseService {
  constructor() {
    super('vector_indexes');
  }

  // Implement required abstract methods from BaseDatabaseService
  async findAll(tenantId?: string): Promise<VectorIndex[]> {
    const results = await super.findAll(tenantId);
    return results.map((row: any) => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }

  async findById(id: string, tenantId?: string): Promise<VectorIndex | null> {
    const result = await super.findById(id, tenantId);
    if (result) {
      return {
        ...result,
        metadata: typeof (result as any).metadata === 'string' ? JSON.parse((result as any).metadata) : (result as any).metadata
      };
    }
    return null;
  }

  // Initialize vectorize tables
  async initializeTables(client?: PoolClient): Promise<void> {
    const queries = [
      // Vector indexes table
      `CREATE TABLE IF NOT EXISTS vector_indexes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        description TEXT,
        description_ar TEXT,
        dimensions INTEGER NOT NULL DEFAULT 1536,
        metric VARCHAR(20) NOT NULL DEFAULT 'cosine',
        vector_count INTEGER NOT NULL DEFAULT 0,
        max_vectors INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        tenant_id VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Vector records table
      `CREATE TABLE IF NOT EXISTS vector_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        index_id UUID NOT NULL REFERENCES vector_indexes(id) ON DELETE CASCADE,
        vector_id VARCHAR(255) NOT NULL,
        values VECTOR(1536),
        metadata JSONB DEFAULT '{}',
        score REAL,
        tenant_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_vector_indexes_tenant ON vector_indexes(tenant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vector_indexes_status ON vector_indexes(status)`,
      `CREATE INDEX IF NOT EXISTS idx_vector_records_index_id ON vector_records(index_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vector_records_tenant ON vector_records(tenant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vector_records_vector_id ON vector_records(vector_id)`,

      // Enable RLS
      `ALTER TABLE vector_indexes ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE vector_records ENABLE ROW LEVEL SECURITY`,

      // RLS Policies
      `DROP POLICY IF EXISTS vector_indexes_tenant_isolation ON vector_indexes`,
      `CREATE POLICY vector_indexes_tenant_isolation ON vector_indexes
       USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)`,

      `DROP POLICY IF EXISTS vector_records_tenant_isolation ON vector_records`,
      `CREATE POLICY vector_records_tenant_isolation ON vector_records
       USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)`
    ];

    for (const query of queries) {
      if (client) {
        await client.query(query);
      } else {
        await this.query(query);
      }
    }
  }

  // Create vector index
  async createIndex(
    indexData: Omit<VectorIndex, 'id' | 'createdAt' | 'updatedAt'>,
    client?: PoolClient
  ): Promise<VectorIndex | null> {
    const data = {
      name: indexData.name,
      name_ar: indexData.nameAr,
      description: indexData.description,
      description_ar: indexData.descriptionAr,
      dimensions: indexData.dimensions,
      metric: indexData.metric,
      vector_count: indexData.vectorCount || 0,
      max_vectors: indexData.maxVectors,
      status: indexData.status || 'creating',
      tenant_id: indexData.tenantId,
      metadata: JSON.stringify(indexData.metadata),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await this.create(data, indexData.tenantId, client);
    if (result) {
      return {
        ...result,
        nameAr: result.name_ar,
        descriptionAr: result.description_ar,
        vectorCount: result.vector_count,
        maxVectors: result.max_vectors,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        tenantId: result.tenant_id,
        metadata: JSON.parse(result.metadata)
      };
    }
    return null;
  }

  // Update vector index
  async updateIndex(
    id: string,
    updates: Partial<VectorIndex>,
    tenantId: string,
    client?: PoolClient
  ): Promise<VectorIndex | null> {
    const data: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.metadata) {
      data.metadata = JSON.stringify(updates.metadata);
    }

    const result = await this.update(id, data, tenantId, client);
    if (result && result.metadata) {
      result.metadata = JSON.parse(result.metadata);
    }
    return result;
  }

  // Delete vector index and all its records
  async deleteIndex(id: string, tenantId: string, client?: PoolClient): Promise<boolean> {
    return await this.executeTransaction(async (txClient: PoolClient) => {
      // Delete vector records first (cascade should handle this, but being explicit)
      await txClient.query(
        'DELETE FROM vector_records WHERE index_id = $1 AND tenant_id = $2',
        [id, tenantId]
      );

      // Delete the index
      return await this.delete(id, tenantId, txClient);
    });
  }

  // Add vectors to index
  async addVectors(
    indexId: string,
    vectors: Array<{
      vectorId: string;
      values: number[];
      metadata?: Record<string, any>;
    }>,
    tenantId: string,
    client?: PoolClient
  ): Promise<boolean> {
    try {
      if (!vectors.length) return true;

      const values = vectors.map(v => `(
        $1, '${v.vectorId}', '[${v.values.join(',')}]',
        '${JSON.stringify(v.metadata || {}).replace(/'/g, "''")}',
        NOW(), NOW()
      )`).join(', ');

      const queryText = `
        INSERT INTO vector_records (index_id, vector_id, values, metadata, created_at, updated_at)
        VALUES ${values}
      `;

      const queryParams = [indexId];

      if (client) {
        await client.query(queryText, queryParams);
      } else {
        await this.query(queryText, queryParams);
      }

      // Update vector count in index
      await this.updateVectorCount(indexId, tenantId, client);

      return true;
    } catch (error) {
      console.error('Error adding vectors:', error);
      return false;
    }
  }

  // Search vectors
  async searchVectors(
    indexId: string,
    queryVector: number[],
    topK: number = 10,
    tenantId: string,
    client?: PoolClient
  ): Promise<VectorRecord[]> {
    try {
      const queryText = `
        SELECT id, index_id, vector_id, values, metadata, score,
               created_at, updated_at, tenant_id
        FROM (
          SELECT *,
                 1 - (values <=> '[${queryVector.join(',')}]') as score
          FROM vector_records
          WHERE index_id = $1 AND tenant_id = $2
          ORDER BY values <=> '[${queryVector.join(',')}]'
          LIMIT $3
        ) results
        ORDER BY score DESC
      `;

      const result = client
        ? await client.query(queryText, [indexId, tenantId, topK])
        : await this.query(queryText, [indexId, tenantId, topK]);

      return result.rows.map((row: any) => ({
        ...row,
        metadata: JSON.parse(row.metadata || '{}')
      }));
    } catch (error) {
      console.error('Error searching vectors:', error);
      return [];
    }
  }

  // Update vector count in index
  private async updateVectorCount(
    indexId: string,
    tenantId: string,
    client?: PoolClient
  ): Promise<void> {
    const queryText = `
      UPDATE vector_indexes
      SET vector_count = (
        SELECT COUNT(*) FROM vector_records
        WHERE index_id = $1 AND tenant_id = $2
      ), updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `;

    if (client) {
      await client.query(queryText, [indexId, tenantId]);
    } else {
      await this.query(queryText, [indexId, tenantId]);
    }
  }

  // Get index statistics
  async getIndexStats(tenantId?: string, client?: PoolClient): Promise<any> {
    try {
      let queryText = `
        SELECT
          COUNT(DISTINCT vi.id) as total_indexes,
          SUM(vi.vector_count) as total_vectors,
          SUM(vi.max_vectors) as total_capacity,
          AVG(vi.vector_count::float / NULLIF(vi.max_vectors, 0)) as avg_usage,
          COUNT(CASE WHEN vi.status = 'active' THEN 1 END) as active_indexes,
          COUNT(CASE WHEN vi.status = 'creating' THEN 1 END) as creating_indexes,
          COUNT(CASE WHEN vi.status = 'error' THEN 1 END) as error_indexes
        FROM vector_indexes vi
      `;

      let params: any[] = [];
      if (tenantId) {
        queryText += ' WHERE vi.tenant_id = $1';
        params = [tenantId];
      }

      const result = client
        ? await client.query(queryText, params)
        : await this.query(queryText, params);

      const row = result.rows[0] as any;
      return row || {
        total_indexes: 0,
        total_vectors: 0,
        total_capacity: 0,
        avg_usage: 0,
        active_indexes: 0,
        creating_indexes: 0,
        error_indexes: 0
      };
    } catch (error) {
      console.error('Error getting vectorize stats:', error);
      return {
        total_indexes: 0,
        total_vectors: 0,
        total_capacity: 0,
        avg_usage: 0,
        active_indexes: 0,
        creating_indexes: 0,
        error_indexes: 0
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 FROM vector_indexes LIMIT 1');
      return true;
    } catch (error) {
      // Try to initialize tables if they don't exist
      try {
        await this.initializeTables();
        return true;
      } catch (initError) {
        console.error('Failed to initialize vectorize tables:', initError);
        return false;
      }
    }
  }

  private async query(text: string, params?: any[]): Promise<any> {
    const { query } = await import('../db/connection');
    return query(text, params);
  }
}
