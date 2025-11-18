export default function PartnerPortal() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">بوابة الشركاء</h1>
          <p className="mt-1 text-sm text-gray-600">إدارة العروض، المشاريع المشتركة، ولوحات الأداء بين شركائنا والمؤسسة.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">لوحة الشريك</h2>
          <p className="text-sm text-gray-600">عرض الحالة، الفرص المفتوحة، المستندات، وخطط التنفيذ.</p>
          <a href={`/${'ar'}/platform/users`} className="mt-4 inline-block rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm">دخول الشريك</a>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">عروض مشتركة</h2>
          <p className="text-sm text-gray-600">إنشاء عروض مشتركة، تتبع الموافقات، وإدارة المستندات.</p>
          <a href={`/${'ar'}/crm/deals`} className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm">إدارة الفرص</a>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">مؤشرات الأداء</h2>
          <p className="text-sm text-gray-600">متابعة المؤشرات باستخدام لوحات المؤسسة.</p>
          <a href={`/${'ar'}/analytics`} className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm">لوحات Analytics</a>
        </div>
      </div>
    </main>
  );
}