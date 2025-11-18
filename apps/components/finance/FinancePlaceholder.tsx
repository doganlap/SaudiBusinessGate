export default function FinancePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-700">سيتم ربط هذه الصفحة بمكوّنات المالية قريبًا.</p>
        </div>
      </div>
    </div>
  );
}