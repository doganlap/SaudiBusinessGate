"use client";
import { useState, useEffect } from 'react';
import { Brain, Zap, DollarSign, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Provider {
  id: string;
  name: string;
  company: string;
  contextWindow: number;
}

interface LLMSelectorProps {
  onSelect: (provider: string) => void;
  locale?: 'ar' | 'en';
  defaultProvider?: string;
}

export default function LLMSelector({ 
  onSelect, 
  locale = 'ar',
  defaultProvider = 'openai-gpt4'
}: LLMSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState(defaultProvider);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'اختر نموذج الذكاء الاصطناعي',
      contextWindow: 'نافذة السياق',
      tokens: 'رمز',
      company: 'الشركة',
      loading: 'جاري التحميل...',
      noProviders: 'لا توجد نماذج متاحة',
      configure: 'يرجى تكوين API Keys'
    },
    en: {
      title: 'Select AI Model',
      contextWindow: 'Context Window',
      tokens: 'tokens',
      company: 'Company',
      loading: 'Loading...',
      noProviders: 'No models available',
      configure: 'Please configure API Keys'
    }
  }[locale];

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/llm/generate');
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    onSelect(providerId);
  };

  const selectedProvider = providers.find(p => p.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        <span className="ml-3 text-neutral-600">{t.loading}</span>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <p className="text-yellow-800 dark:text-yellow-200">{t.noProviders}</p>
        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">{t.configure}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        {t.title}
      </label>
      
      {/* Grid of Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => handleSelect(provider.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-xl border-2 transition text-left ${
              selected === provider.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-300'
            }`}
          >
            {/* Selected Indicator */}
            {selected === provider.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            
            {/* Provider Info */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Brain className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                    {provider.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {provider.company}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                <Zap className="h-3 w-3" />
                <span>{provider.contextWindow.toLocaleString()} {t.tokens}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Provider Details */}
      {selectedProvider && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                {selectedProvider.name}
              </h4>
              <div className="mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.company}:</span>
                  <span>{selectedProvider.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.contextWindow}:</span>
                  <span>{selectedProvider.contextWindow.toLocaleString()} {t.tokens}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
