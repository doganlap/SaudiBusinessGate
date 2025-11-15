"use client";
import { useState } from 'react';
import { Search, Loader2, X, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price?: number;
  category?: string;
  score: number;
  metadata: Record<string, any>;
}

interface SmartSearchProps {
  locale?: 'ar' | 'en';
  searchType?: 'products' | 'documents' | 'support';
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
}

export default function SmartSearch({
  locale = 'ar',
  searchType = 'products',
  placeholder,
  onResultClick
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const t = {
    ar: {
      placeholder: placeholder || 'ابحث عن أي شيء...',
      searching: 'جاري البحث...',
      noResults: 'لا توجد نتائج',
      recentSearches: 'عمليات البحث الأخيرة',
      match: 'تطابق',
      clear: 'مسح',
      products: 'المنتجات',
      documents: 'المستندات',
      support: 'الدعم'
    },
    en: {
      placeholder: placeholder || 'Search anything...',
      searching: 'Searching...',
      noResults: 'No results found',
      recentSearches: 'Recent Searches',
      match: 'Match',
      clear: 'Clear',
      products: 'Products',
      documents: 'Documents',
      support: 'Support'
    }
  }[locale];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/search/${searchType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          locale,
          tenantId: 'current-tenant' // من session
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.matches || []);
        
        // Add to recent searches
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <Search className="h-5 w-5" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => setShowResults(true)}
          placeholder={t.placeholder}
          className={`w-full ${locale === 'ar' ? 'pr-4 pl-24' : 'pl-12 pr-24'} py-4 rounded-2xl border border-white/20 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition`}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        />
        
        <div className={`absolute ${locale === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              title={t.clear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-2xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 max-h-[600px] overflow-y-auto z-50"
          >
            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
                <p className="mt-2 text-sm text-neutral-500">{t.searching}</p>
              </div>
            )}

            {/* Recent Searches */}
            {!loading && !query && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-500 uppercase">
                  <Clock className="h-4 w-4" />
                  {t.recentSearches}
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-500/10 transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && query && results.length > 0 && (
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onResultClick?.(result);
                      setShowResults(false);
                    }}
                    className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {locale === 'ar' ? result.titleAr : result.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {locale === 'ar' ? result.descriptionAr : result.description}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          {result.price && (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {result.price} ريال
                            </span>
                          )}
                          {result.category && (
                            <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                              {result.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <TrendingUp className="h-3 w-3" />
                          {t.match}
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {(result.score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center text-neutral-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t.noResults}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {showResults && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
