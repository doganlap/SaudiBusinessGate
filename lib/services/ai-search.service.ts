/**
 * AI-Powered Search Service
 * Intelligent search across all modules
 * 
 * Features:
 * - Natural language queries
 * - Semantic search
 * - Multi-module search
 * - Result ranking
 * - Search suggestions
 */

import { cacheService } from './redis-cache';

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

export interface SearchOptions {
  module?: string;
  type?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export class AISearchService {
  private searchHistory: Map<string, string[]> = new Map();

  /**
   * Search across all modules
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    total: number;
    suggestions?: string[];
    query?: string;
  }> {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = await cacheService.get<{
      results: SearchResult[];
      total: number;
    }>(cacheKey);
    
    if (cached) {
      return {
        ...cached,
        suggestions: await this.getSuggestions(query),
      };
    }

    // Process natural language query
    const processedQuery = await this.processNaturalLanguage(query);
    
    // Search across modules
    const results = await this.searchModules(processedQuery, options);
    
    // Rank results by relevance
    const rankedResults = this.rankResults(results, processedQuery);
    
    // Apply filters and sorting
    const filteredResults = this.applyFilters(rankedResults, options);
    const sortedResults = this.sortResults(filteredResults, options.sortBy || 'relevance');
    
    // Paginate
    const paginatedResults = this.paginate(sortedResults, options.limit || 20, options.offset || 0);
    
    // Cache results
    await cacheService.set(cacheKey, {
      results: paginatedResults,
      total: sortedResults.length,
    }, { ttl: 300 }); // Cache for 5 minutes

    // Store search history
    this.storeSearchHistory(query);

    return {
      results: paginatedResults,
      total: sortedResults.length,
      suggestions: await this.getSuggestions(query),
      query: processedQuery,
    };
  }

  /**
   * Process natural language query
   */
  private async processNaturalLanguage(query: string): Promise<string> {
    // Extract entities, intents, and keywords
    // In production, this would use NLP models
    
    // Simple keyword extraction for now
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);

    return keywords.join(' ');
  }

  /**
   * Search across all modules
   */
  private async searchModules(
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const modules = options.module 
      ? [options.module] 
      : ['hr', 'finance', 'crm', 'sales', 'analytics', 'grc'];

    for (const module of modules) {
      try {
        const moduleResults = await this.searchModule(module, query, options);
        results.push(...moduleResults);
      } catch (error) {
        console.error(`Search error in module ${module}:`, error);
      }
    }

    return results;
  }

  /**
   * Search within a specific module
   */
  private async searchModule(
    module: string,
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    // In production, this would query the module's database
    // For now, return mock results based on module

    const results: SearchResult[] = [];
    const keywords = query.toLowerCase().split(/\s+/);

    // Mock search results by module
    switch (module) {
      case 'hr':
        // Search employees, attendance, payroll
        results.push(
          ...this.searchHR(keywords, options),
        );
        break;
      case 'finance':
        // Search transactions, accounts, budgets
        results.push(
          ...this.searchFinance(keywords, options),
        );
        break;
      case 'crm':
        // Search customers, contacts, activities
        results.push(
          ...this.searchCRM(keywords, options),
        );
        break;
      case 'sales':
        // Search deals, leads, pipeline
        results.push(
          ...this.searchSales(keywords, options),
        );
        break;
      default:
        break;
    }

    return results;
  }

  /**
   * Search HR module
   */
  private searchHR(keywords: string[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    // Mock HR search results
    // In production, this would query the HR database
    keywords.forEach((keyword, index) => {
      if (keyword.includes('employ') || keyword.includes('staff')) {
        results.push({
          id: `hr-employee-${index}`,
          module: 'hr',
          type: 'employee',
          title: `Employee matching "${keyword}"`,
          description: 'Employee directory entry',
          url: '/hr/employees',
          score: 0.8,
        });
      }
      if (keyword.includes('attend') || keyword.includes('time')) {
        results.push({
          id: `hr-attendance-${index}`,
          module: 'hr',
          type: 'attendance',
          title: `Attendance records matching "${keyword}"`,
          description: 'Attendance tracking records',
          url: '/hr/attendance',
          score: 0.7,
        });
      }
      if (keyword.includes('payroll') || keyword.includes('salary')) {
        results.push({
          id: `hr-payroll-${index}`,
          module: 'hr',
          type: 'payroll',
          title: `Payroll records matching "${keyword}"`,
          description: 'Payroll processing records',
          url: '/hr/payroll',
          score: 0.9,
        });
      }
    });

    return results;
  }

  /**
   * Search Finance module
   */
  private searchFinance(keywords: string[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    // Mock Finance search results
    keywords.forEach((keyword, index) => {
      if (keyword.includes('transact') || keyword.includes('payment')) {
        results.push({
          id: `finance-transaction-${index}`,
          module: 'finance',
          type: 'transaction',
          title: `Transaction matching "${keyword}"`,
          description: 'Financial transaction record',
          url: '/finance/transactions',
          score: 0.85,
        });
      }
      if (keyword.includes('account') || keyword.includes('balance')) {
        results.push({
          id: `finance-account-${index}`,
          module: 'finance',
          type: 'account',
          title: `Account matching "${keyword}"`,
          description: 'Chart of accounts entry',
          url: '/finance/accounts',
          score: 0.8,
        });
      }
    });

    return results;
  }

  /**
   * Search CRM module
   */
  private searchCRM(keywords: string[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    // Mock CRM search results
    keywords.forEach((keyword, index) => {
      if (keyword.includes('customer') || keyword.includes('client')) {
        results.push({
          id: `crm-customer-${index}`,
          module: 'crm',
          type: 'customer',
          title: `Customer matching "${keyword}"`,
          description: 'Customer relationship record',
          url: '/crm/customers',
          score: 0.9,
        });
      }
      if (keyword.includes('contact') || keyword.includes('person')) {
        results.push({
          id: `crm-contact-${index}`,
          module: 'crm',
          type: 'contact',
          title: `Contact matching "${keyword}"`,
          description: 'Contact directory entry',
          url: '/crm/contacts',
          score: 0.8,
        });
      }
    });

    return results;
  }

  /**
   * Search Sales module
   */
  private searchSales(keywords: string[], options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    // Mock Sales search results
    keywords.forEach((keyword, index) => {
      if (keyword.includes('deal') || keyword.includes('sale')) {
        results.push({
          id: `sales-deal-${index}`,
          module: 'sales',
          type: 'deal',
          title: `Deal matching "${keyword}"`,
          description: 'Sales deal record',
          url: '/sales/deals',
          score: 0.9,
        });
      }
      if (keyword.includes('lead') || keyword.includes('prospect')) {
        results.push({
          id: `sales-lead-${index}`,
          module: 'sales',
          type: 'lead',
          title: `Lead matching "${keyword}"`,
          description: 'Sales lead record',
          url: '/sales/leads',
          score: 0.85,
        });
      }
    });

    return results;
  }

  /**
   * Rank results by relevance
   */
  private rankResults(results: SearchResult[], query: string): SearchResult[] {
    const keywords = query.toLowerCase().split(/\s+/);
    
    return results.map(result => {
      let score = result.score;
      
      // Boost score for title matches
      const titleLower = result.title.toLowerCase();
      keywords.forEach(keyword => {
        if (titleLower.includes(keyword)) {
          score += 0.1;
        }
      });
      
      // Boost score for description matches
      const descLower = result.description.toLowerCase();
      keywords.forEach(keyword => {
        if (descLower.includes(keyword)) {
          score += 0.05;
        }
      });
      
      return {
        ...result,
        score: Math.min(1.0, score), // Cap at 1.0
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Apply filters
   */
  private applyFilters(results: SearchResult[], options: SearchOptions): SearchResult[] {
    let filtered = results;

    if (options.module) {
      filtered = filtered.filter(r => r.module === options.module);
    }

    if (options.type) {
      filtered = filtered.filter(r => r.type === options.type);
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        filtered = filtered.filter(r => {
          return r.metadata?.[key] === value;
        });
      });
    }

    return filtered;
  }

  /**
   * Sort results
   */
  private sortResults(
    results: SearchResult[],
    sortBy: 'relevance' | 'date' | 'popularity'
  ): SearchResult[] {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => b.score - a.score);
      case 'date':
        // Sort by date if available in metadata
        return results.sort((a, b) => {
          const dateA = a.metadata?.date || 0;
          const dateB = b.metadata?.date || 0;
          return dateB - dateA;
        });
      case 'popularity':
        // Sort by popularity if available in metadata
        return results.sort((a, b) => {
          const popA = a.metadata?.popularity || 0;
          const popB = b.metadata?.popularity || 0;
          return popB - popA;
        });
      default:
        return results;
    }
  }

  /**
   * Paginate results
   */
  private paginate(results: SearchResult[], limit: number, offset: number): SearchResult[] {
    return results.slice(offset, offset + limit);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    // In production, this would use search history and autocomplete
    const history = this.searchHistory.get(query.toLowerCase()) || [];
    const suggestions = [
      ...history,
      `Search for ${query} in HR`,
      `Search for ${query} in Finance`,
      `Search for ${query} in CRM`,
    ];

    return suggestions.slice(0, 5);
  }

  /**
   * Store search history
   */
  private storeSearchHistory(query: string) {
    const normalizedQuery = query.toLowerCase();
    const history = this.searchHistory.get(normalizedQuery) || [];
    
    if (!history.includes(query)) {
      history.unshift(query);
      this.searchHistory.set(normalizedQuery, history.slice(0, 10));
    }
  }

  /**
   * Get popular searches
   */
  getPopularSearches(): string[] {
    const popular = Array.from(this.searchHistory.values())
      .flat()
      .slice(0, 10);
    
    return popular;
  }
}

// Export singleton instance
export const aiSearch = new AISearchService();

