export default async function LangLayout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={lang} dir={dir}>
      <body className="bg-slate-950 text-slate-50 antialiased">
        <a href="#main-content" className="fixed start-4 top-4 z-50 -translate-y-20 rounded-full bg-emerald-400 px-3 py-1 text-sm font-semibold text-slate-950 shadow focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-300">تخطي إلى المحتوى</a>
        {children}
      </body>
    </html>
  )
}