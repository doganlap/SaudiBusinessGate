'use client';

export default function TestStylingPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="bg-white dark:bg-neutral-950/70 backdrop-blur-lg border-neutral-200 dark:border-neutral-800/50 border-r w-72 flex-col flex transition-all duration-300">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              SBG Platform
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Multi-Tenant System
            </p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <div className="p-3 bg-brand-50 text-brand-900 rounded-lg border border-brand-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                Dashboard
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                Tenants
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                Users
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                Settings
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                🎉 Styling Test Page
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Testing Tailwind CSS, fonts, and layout components
              </p>
            </div>

            {/* Test Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Tenants</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Multi-tenant system</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  24
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Active organizations
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Users</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Platform users</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  1,247
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Registered users
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">APIs</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Active endpoints</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  152+
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Available endpoints
                </p>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Button Components
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg transition-colors">
                  Secondary Button
                </button>
                <button className="px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors">
                  Outline Button
                </button>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                  Success Button
                </button>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                  Danger Button
                </button>
              </div>
            </div>

            {/* Test Typography */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Typography Test
              </h3>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  Heading 1 - Saudi Business Gate
                </h1>
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                  Heading 2 - Multi-Tenant Platform
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Regular paragraph text with proper contrast and readability.
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Small text for captions and secondary information.
                </p>
                <div className="font-arabic text-lg text-neutral-800 dark:text-neutral-200">
                  النص العربي - منصة الأعمال السعودية
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
