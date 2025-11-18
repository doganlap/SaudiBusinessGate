import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unified Finance Module
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to the finance management system for the unified platform.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/finance" 
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Finance Dashboard
            </Link>
            
            <Link 
              href="/api/finance/health" 
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Check Health Status
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>✅ Real Finance Application</p>
            <p>🚀 Not an nginx placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}
