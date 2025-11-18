export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">عرض تجريبي مباشر (Demo)</h1>
          <p className="text-slate-300 mb-6">
            بيئة جاهزة ببيانات تجريبية لعرض لوحات Shahin GRC، والوكلاء الذكيين، وتجربة المستخدم العربية.
          </p>
          <ul className="list-disc pr-5 text-slate-300 space-y-1 mb-6">
            <li>لا تحتاج لتجهيز أنظمة أو بيانات</li>
            <li>مثالية للعرض على الإدارة أو اللجنة</li>
          </ul>
          <a href="/partner" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition">تنسيق Demo مع الشركاء</a>
        </div>
      </section>
    </main>
  );
}