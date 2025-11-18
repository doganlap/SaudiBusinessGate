export default function POCPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">إثبات المفهوم للمؤسسة (POC)</h1>
          <p className="text-slate-300 mb-6">
            ربط نظام أو نظامين فعليين (ERP، Core، EMR…) مع نماذج المخاطر والامتثال المناسبة لقطاعك.
          </p>
          <ul className="list-disc pr-5 text-slate-300 space-y-1 mb-6">
            <li>مناسب لتقييم جدي قبل الشراء</li>
            <li>يركّز على حالات استخدام حقيقية لفريقك</li>
          </ul>
          <a href="/demo" className="inline-flex items-center justify-center rounded-full border border-emerالد-300/60 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 transition">اطلب Demo أولاً</a>
        </div>
      </section>
    </main>
  );
}