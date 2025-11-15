"use client";
import { useState } from 'react';
import { Database, Search, Plus, Trash2, RefreshCw, Activity, BarChart3, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface VectorizeManagerProps {
  indexes: VectorIndex[];
  onCreateIndex?: (data: any) => void;
  onDeleteIndex?: (id: string) => void;
  onSyncIndex?: (id: string) => void;
  onSearchVectors?: (indexId: string, query: string) => void;
  locale?: 'ar' | 'en';
}

export default function VectorizeManager({ 
  indexes, 
  onCreateIndex, 
  onDeleteIndex, 
  onSyncIndex, 
  onSearchVectors, 
  locale = 'ar' 
}: VectorizeManagerProps) {
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const t = {
    ar: {
      title: 'إدارة المتجهات',
      createIndex: 'إنشاء فهرس',
      searchVectors: 'البحث في المتجهات',
      syncIndex: 'مزامنة الفهرس',
      deleteIndex: 'حذف الفهرس',
      indexName: 'اسم الفهرس',
      dimensions: 'الأبعاد',
      vectorCount: 'عدد المتجهات',
      usage: 'الاستخدام',
      status: 'الحالة',
      lastSync: 'آخر مزامنة',
      dataType: 'نوع البيانات',
      metric: 'المقياس',
      active: 'نشط',
      creating: 'قيد الإنشاء',
      error: 'خطأ',
      maintenance: 'صيانة',
      synced: 'متزامن',
      syncing: 'قيد المزامنة',
      products: 'المنتجات',
      documents: 'الوثائق',
      support: 'الدعم',
      general: 'عام',
      cosine: 'جيب التمام',
      euclidean: 'إقليدي',
      dotproduct: 'الضرب النقطي',
      search: 'بحث',
      noResults: 'لا توجد نتائج',
      searchPlaceholder: 'ابحث في المتجهات...'
    },
    en: {
      title: 'Vectorize Management',
      createIndex: 'Create Index',
      searchVectors: 'Search Vectors',
      syncIndex: 'Sync Index',
      deleteIndex: 'Delete Index',
      indexName: 'Index Name',
      dimensions: 'Dimensions',
      vectorCount: 'Vector Count',
      usage: 'Usage',
      status: 'Status',
      lastSync: 'Last Sync',
      dataType: 'Data Type',
      metric: 'Metric',
      active: 'Active',
      creating: 'Creating',
      error: 'Error',
      maintenance: 'Maintenance',
      synced: 'Synced',
      syncing: 'Syncing',
      products: 'Products',
      documents: 'Documents',
      support: 'Support',
      general: 'General',
      cosine: 'Cosine',
      euclidean: 'Euclidean',
      dotproduct: 'Dot Product',
      search: 'Search',
      noResults: 'No Results',
      searchPlaceholder: 'Search vectors...'
    }
  }[locale];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'creating': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'products': return <BarChart3 className="h-4 w-4" />;
      case 'documents': return <Database className="h-4 w-4" />;
      case 'support': return <Activity className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t.title}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="h-4 w-4" />
          {t.createIndex}
        </button>
      </div>

      {/* Search */}
      {selectedIndex && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => onSearchVectors?.(selectedIndex, searchQuery)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {t.search}
            </button>
          </div>
        </div>
      )}

      {/* Indexes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {indexes.map((index, i) => (
          <motion.div
            key={index.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white dark:bg-neutral-900 rounded-xl border-2 transition-all cursor-pointer ${
              selectedIndex === index.id 
                ? 'border-emerald-500 shadow-lg' 
                : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-300'
            }`}
            onClick={() => setSelectedIndex(selectedIndex === index.id ? null : index.id)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                    {getDataTypeIcon(index.metadata.dataType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {locale === 'ar' ? index.nameAr : index.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {t[index.metadata.dataType as keyof typeof t]} • {index.dimensions}D
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(index.status)}`}>
                  <span>{t[index.status as keyof typeof t]}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {locale === 'ar' ? index.descriptionAr : index.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{t.vectorCount}</div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {index.vectorCount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{t.usage}</div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {getUsagePercentage(index.vectorCount, index.maxVectors).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${getUsagePercentage(index.vectorCount, index.maxVectors)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>{index.vectorCount.toLocaleString()}</span>
                  <span>{index.maxVectors.toLocaleString()}</span>
                </div>
              </div>

              {/* Sync Status */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-neutral-600 dark:text-neutral-400">{t.lastSync}:</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getSyncStatusColor(index.metadata.syncStatus)}`} />
                  <span className={getSyncStatusColor(index.metadata.syncStatus)}>
                    {t[index.metadata.syncStatus as keyof typeof t]}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSyncIndex?.(index.id);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t.syncIndex}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this index?')) {
                      onDeleteIndex?.(index.id);
                    }
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {indexes.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No Vector Indexes
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Create your first vector index to start storing and searching vectors
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
          >
            {t.createIndex}
          </button>
        </div>
      )}

      {/* Create Index Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {t.createIndex}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.indexName}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  placeholder="Enter index name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.dataType}
                </label>
                <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
                  <option value="products">{t.products}</option>
                  <option value="documents">{t.documents}</option>
                  <option value="support">{t.support}</option>
                  <option value="general">{t.general}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t.dimensions}
                </label>
                <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
                  <option value="768">768</option>
                  <option value="1024">1024</option>
                  <option value="1536">1536</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onCreateIndex?.({
                    name: 'New Index',
                    dataType: 'general',
                    dimensions: 768
                  });
                  setShowCreateModal(false);
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
