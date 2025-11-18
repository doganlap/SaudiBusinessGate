export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">بوابة الشركاء</h1>
          <p className="text-slate-300 mb-6">
            دخول الشركاء المعتمدين لإدارة العروض، المشاريع المشتركة، ولوحات الأداء.
          </p>
          <div className="space-y-3">
            <a href="/login" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition">تسجيل الدخول</a>
            <a href="/demo" className="inline-flex items-center justify-center rounded-full border border-emerald-300/60 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 transition">طلب Demo للشريك</a>
          </div>
        </div>
      </section>
    </main>
  );
}