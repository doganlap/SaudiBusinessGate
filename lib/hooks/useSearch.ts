/**
 * React Hook for AI-Powered Search
 */

import { useState, useCallback } from 'react';

export interface SearchOptions {
  module?: string;
  type?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export interface SearchResult {
  id: string;
  module: string;
  type: string;
  title: string;
  description: string;
  url: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  suggestions?: string[];
  query?: string;
}

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        ...(options.module && { module: options.module }),
        ...(options.type && { type: options.type }),
        ...(options.limit && { limit: options.limit.toString() }),
        ...(options.offset && { offset: options.offset.toString() }),
        ...(options.sortBy && { sortBy: options.sortBy }),
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, loading, error };
}

