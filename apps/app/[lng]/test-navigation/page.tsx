export default function TestNavigationPage({ params }: { params: { lng: string } }) {
  const title = params.lng === 'ar' ? 'اختبار التنقل' : 'Test Navigation';
  const desc = params.lng === 'ar' ? 'صفحة خفيفة لاختبار التنقل أثناء التطوير.' : 'Lightweight page for navigation testing during development.';
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold text-emerald-300">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{desc}</p>
        <div className="mt-6 flex gap-3">
          <a href="/" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">Home</a>
          <a href={`/${params.lng}`} className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100">Locale Root</a>
        </div>
      </div>
    </main>
  );
}