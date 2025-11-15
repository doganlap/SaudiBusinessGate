/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Vectorize {
    query(
      vector: number[],
      options?: {
        topK?: number;
        filter?: string;
        returnMetadata?: 'all' | 'none';
        returnValues?: boolean;
      }
    ): Promise<{
      matches: Array<{
        id: string;
        score: number;
        values?: number[];
        metadata?: Record<string, any>;
      }>;
      count: number;
    }>;
    
    insert(vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, any>;
    }>): Promise<{ mutationId: string }>;
    
    upsert(vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, any>;
    }>): Promise<{ mutationId: string }>;
    
    deleteByIds(ids: string[]): Promise<{ mutationId: string }>;
  }
}

export {};
