'use client';

import Link from 'next/link';
import { Home, Globe } from 'lucide-react';

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse"/>
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          The page you're looking for doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/ar/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/ar"
            className="flex items-center justify-center gap-2 w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            <Globe className="h-5 w-5" />
            <span>Go to Home</span>
          </Link>
        </div>

        {/* Branding */}
        <div className="mt-12">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            Saudi Business Gate Enterprise
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            The 1st Autonomous Business Gate in the Region
          </p>
        </div>
      </div>
    </div>
  );
}
