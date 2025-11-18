export default function FinanceAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Finance Analytics</h1>
          <p className="text-sm text-gray-600">Use the platform analytics module for deeper insights.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-700">Navigate to Analytics: <a href="../../analytics" className="text-blue-600 underline">Open Analytics</a></p>
        </div>
      </div>
    </div>
  );
}