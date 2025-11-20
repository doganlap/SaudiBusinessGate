"use client";
import { useState, useEffect } from 'react';
import { Database, Search, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import VectorizeManager from '@/components/VectorizeManager';

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

export default function VectorizePage({ params }: { params: Promise<{ lng: string }> }) {
  const [indexes, setIndexes] = useState<VectorIndex[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  // Fallback data for demo
  const fallbackIndexes: VectorIndex[] = [
    {
      id: 'demo-1',
      name: 'Product Catalog',
      nameAr: 'كتالوج المنتجات',
      description: 'Vector index for product search and recommendations',
      descriptionAr: 'فهرس متجهات للبحث في المنتجات والتوصيات',
      dimensions: 1536,
      metric: 'cosine',
      vectorCount: 1250,
      maxVectors: 10000,
      status: 'active',
      createdAt: '2024-11-01T10:00:00Z',
      updatedAt: '2024-11-14T15:30:00Z',
      tenantId: 'demo-tenant',
      metadata: {
        dataType: 'products',
        lastSync: '2024-11-14T15:30:00Z',
        syncStatus: 'synced'
      }
    },
    {
      id: 'demo-2',
      name: 'Support Documents',
      nameAr: 'وثائق الدعم',
      description: 'Vector index for support ticket classification',
      descriptionAr: 'فهرس متجهات لتصنيف تذاكر الدعم',
      dimensions: 1536,
      metric: 'cosine',
      vectorCount: 890,
      maxVectors: 5000,
      status: 'active',
      createdAt: '2024-11-05T08:15:00Z',
      updatedAt: '2024-11-14T12:45:00Z',
      tenantId: 'demo-tenant',
      metadata: {
        dataType: 'support',
        lastSync: '2024-11-14T12:45:00Z',
        syncStatus: 'synced'
      }
    }
  ];

  const fallbackStats = {
    total: 2,
    active: 2,
    totalVectors: 2140,
    storageUsed: '2.14 GB'
  };

  useEffect(() => {
    params.then(p => setLocale(p.lng as 'ar' | 'en'));
  }, [params]);

  const t = {
    ar: {
      title: 'إدارة المتجهات',
      subtitle: 'إدارة فهارس المتجهات والبحث الذكي',
      totalIndexes: 'إجمالي الفهارس',
      activeIndexes: 'الفهارس النشطة',
      totalVectors: 'إجمالي المتجهات',
      storageUsed: 'التخزين المستخدم',
      refresh: 'تحديث'
    },
    en: {
      title: 'Vectorize Management',
      subtitle: 'Manage vector indexes and intelligent search',
      totalIndexes: 'Total Indexes',
      activeIndexes: 'Active Indexes',
      totalVectors: 'Total Vectors',
      storageUsed: 'Storage Used',
      refresh: 'Refresh'
    }
  }[locale];

  useEffect(() => {
    fetchIndexes();
  }, []);

  const fetchIndexes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vectorize', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIndexes(data.data);
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch vector indexes');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch indexes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vector indexes';
      setError(errorMessage);
      // Use fallback data
      setIndexes(fallbackIndexes);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndex = async (indexData: any) => {
    try {
      const response = await fetch('/api/vectorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({
          action: 'create',
          ...indexData
        })
      });

      if (response.ok) {
        fetchIndexes();
        // Could add toast notification here
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to create index:', error);
      // Could show error toast here
      alert(locale === 'ar' ? 'فشل في إنشاء الفهرس' : 'Failed to create index');
    }
  };

  const handleDeleteIndex = async (indexId: string) => {
    try {
      const response = await fetch(`/api/vectorize?indexId=${indexId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': 'demo-tenant' }
      });

      if (response.ok) {
        fetchIndexes();
        // Could add success toast here
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete index:', error);
      alert(locale === 'ar' ? 'فشل في حذف الفهرس' : 'Failed to delete index');
    }
  };

  const handleSyncIndex = async (indexId: string) => {
    try {
      const response = await fetch('/api/vectorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({
          action: 'sync',
          indexId
        })
      });

      if (response.ok) {
        fetchIndexes();
        // Could add success toast here
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync index:', error);
      alert(locale === 'ar' ? 'فشل في مزامنة الفهرس' : 'Failed to sync index');
    }
  };

  const handleSearchVectors = async (indexId: string, query: string) => {
    try {
      const response = await fetch('/api/vectorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'demo-tenant'
        },
        body: JSON.stringify({
          action: 'search',
          indexId,
          query,
          topK: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Search results:', data.data.results);
          // Handle search results display
          alert(locale === 'ar' ? 'تم العثور على نتائج البحث' : 'Search results found');
        } else {
          throw new Error(data.message || 'Search failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to search vectors:', error);
      alert(locale === 'ar' ? 'فشل في البحث في المتجهات' : 'Failed to search vectors');
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="p-3 rounded-xl bg-red-100 text-red-600 mx-auto mb-4 w-fit">
                <Database className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {locale === 'ar' ? 'خطأ في تحميل البيانات' : 'Data Loading Error'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                {error}
              </p>
              <div className="text-sm text-neutral-500 mb-6">
                {locale === 'ar' ? 'يتم عرض البيانات التجريبية. يرجى المحاولة مرة أخرى لتحميل البيانات الحقيقية.' : 'Showing demo data. Please try again to load real data.'}
              </div>
              <button
                onClick={fetchIndexes}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Database className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.subtitle}
              </p>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{locale === 'ar' ? 'عرض البيانات التجريبية' : 'Showing demo data'}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={fetchIndexes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t.totalIndexes}
            value={stats.total || 0}
            icon={<Database className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200 text-blue-700"
          />
          <StatCard
            title={t.activeIndexes}
            value={stats.active || 0}
            icon={<Search className="h-6 w-6" />}
            color="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200 text-green-700"
          />
          <StatCard
            title={t.totalVectors}
            value={(stats.totalVectors || 0).toLocaleString()}
            icon={<Plus className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200 text-purple-700"
          />
          <StatCard
            title={t.storageUsed}
            value={`${((stats.totalVectors || 0) * 0.001).toFixed(1)} GB`}
            icon={<Database className="h-6 w-6" />}
            color="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-200 text-emerald-700"
          />
        </div>

        {/* Vectorize Manager Component */}
        <VectorizeManager
          indexes={indexes}
          onCreateIndex={handleCreateIndex}
          onDeleteIndex={handleDeleteIndex}
          onSyncIndex={handleSyncIndex}
          onSearchVectors={handleSearchVectors}
          locale={locale}
        />
      </div>
    </div>
  );
}
