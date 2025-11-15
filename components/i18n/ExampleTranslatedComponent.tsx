'use client';

import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from './LanguageProvider';

/**
 * Example component demonstrating i18n usage
 * This shows different ways to use translations in your components
 */
export function ExampleTranslatedComponent() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  return (
    <div className={`p-6 space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">
          {/* Method 1: Using Trans component for static text */}
          <Trans>Example Translated Component</Trans>
        </h2>
        <p className="text-gray-600 mt-2">
          <Trans>This component demonstrates different translation methods</Trans>
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          <Trans>Method 1: Trans Component</Trans>
        </h3>
        <p>
          <Trans>This is the recommended way for static text and JSX content.</Trans>
        </p>
        <div className="bg-gray-100 p-3 rounded">
          <code className="text-sm">
            {'<Trans>Your text here</Trans>'}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          <Trans>Method 2: t() function with msg macro</Trans>
        </h3>
        <p>
          {t(msg`Current language: ${language}`)}
        </p>
        <div className="bg-gray-100 p-3 rounded">
          <code className="text-sm">
            {`const { t } = useTranslation(); t(msg\`Text\`)`}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          <Trans>Method 3: Using message IDs</Trans>
        </h3>
        <div className="space-y-1">
          <p>{t('app.title')}</p>
          <p>{t('app.description')}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <code className="text-sm">
            {`t('app.title')`}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          <Trans>Common Translations</Trans>
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {t('common.save')}
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            {t('common.cancel')}
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            {t('common.delete')}
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            {t('common.add')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          <Trans>Navigation Examples</Trans>
        </h3>
        <nav className="space-y-1">
          <div className="p-2 hover:bg-gray-100 rounded">{t('nav.home')}</div>
          <div className="p-2 hover:bg-gray-100 rounded">{t('nav.dashboard')}</div>
          <div className="p-2 hover:bg-gray-100 rounded">{t('nav.billing')}</div>
          <div className="p-2 hover:bg-gray-100 rounded">{t('nav.settings')}</div>
        </nav>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600">
          <Trans>
            See{' '}
            <a href="/I18N_IMPLEMENTATION_GUIDE.md" className="text-blue-500 underline">
              I18N_IMPLEMENTATION_GUIDE.md
            </a>
            {' '}for more details
          </Trans>
        </p>
      </div>
    </div>
  );
}
