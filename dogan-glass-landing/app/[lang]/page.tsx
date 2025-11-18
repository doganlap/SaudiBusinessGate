import { t, type Locale } from '@/lib/i18n'

export default async function LandingByLang({ params }: { params: { lang: Locale } }) {
  const l = params.lang
  let kpis: { totalUsers: number; activeSubscriptions: number; totalRevenue: number; monthlyGrowth: number } | null = null
  try {
    const res = await fetch('http://localhost:15000/api/dashboard/stats', {
      headers: { 'x-tenant-code': 'DEFAULT' },
      cache: 'no-store'
    })
    if (res.ok) {
      const json = await res.json()
      kpis = json?.data || null
    }
  } catch (_) {}
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950" />
          <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        <header className="border-b border-white/5">
          <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10">
                <span className="text-xl">🦅</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-wide text-emerald-300">{t(l,'brand')}</p>
                <p className="text-[0.7rem] text-slate-300">{t(l,'powered')} <span className="font-semibold">{t(l,'dogan')}</span> · {t(l,'engine')} <span className="font-semibold">{t(l,'shahin')}</span></p>
              </div>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
              <a href="#platform" className="hover:text-emerald-300 transition">{t(l,'nav_platform')}</a>
              <a href="#industries" className="hover:text-emerald-300 transition">{t(l,'nav_industries')}</a>
              <a href="#agents" className="hover:text-emerald-300 transition">{t(l,'nav_agents')}</a>
              <a href="/demo" className="hover:text-emerald-300 transition">{t(l,'nav_demo')}</a>
              <a href="/poc" className="hover:text-emerald-300 transition">{t(l,'nav_poc')}</a>
              <a href="/partner" className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20 transition">{t(l,'nav_partner')}</a>
            </nav>
          </div>
        </header>

        <section className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{t(l,'badge_line')}</span>
            </div>

            {kpis && (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">المستخدمون</p>
                  <p className="text-2xl font-semibold text-slate-50">{Number(kpis.totalUsers).toLocaleString('ar')}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">الاشتراكات النشطة</p>
                  <p className="text-2xl font-semibold text-slate-50">{Number(kpis.activeSubscriptions).toLocaleString('ar')}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">إيرادات الشهر</p>
                  <p className="text-2xl font-semibold text-slate-50">{Number(kpis.totalRevenue).toLocaleString('ar-SA')}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">نمو شهري</p>
                  <p className="text-2xl font-semibold text-emerald-300">{Number(kpis.monthlyGrowth).toLocaleString('ar')}%</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-5xl">
                {t(l,'hero_title_1')}
                <span className="block text-emerald-300">{t(l,'hero_title_2')}</span>
              </h1>
              <p className="max-w-xl text-sm text-slate-200 md:text-base">{t(l,'hero_desc')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="/demo" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition">{t(l,'cta_demo')}</a>
              <a href="/poc" className="inline-flex items-center justify-center rounded-full border border-emerald-300/60 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10 transition">{t(l,'cta_poc')}</a>
              <a href="/login" className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10 transition">{t(l,'cta_login')}</a>
            </div>
          </div>
        </section>

        <section id="platform" className="border-t border-white/5 bg-slate-950/80 py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{t(l,'platform_label')}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">{t(l,'platform_title')}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">{t(l,'platform_desc')}</p>
              </div>
              <div className="text-xs text-slate-400">
                <p>API-first · Microservices · Multi-tenant Postgres · Redis</p>
                <p>Ready for Saudi / regional cloud & Zero-Trust SSO.</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-2 text-lg">{t(l,'platform_unified_title')}</p>
                <p className="text-sm text-slate-200">{t(l,'platform_unified_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-2 text-lg">{t(l,'platform_gov_title')}</p>
                <p className="text-sm text-slate-200">{t(l,'platform_gov_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-2 text-lg">{t(l,'platform_ai_title')}</p>
                <p className="text-sm text-slate-200">{t(l,'platform_ai_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="industries" className="border-t border-white/5 py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{t(l,'industries_label')}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">{t(l,'industries_title')}</h2>
              <p className="mt-2 text-sm text-slate-300">{t(l,'industries_desc')}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'industries_banking_title')}</p>
                <p className="text-slate-200">{t(l,'industries_banking_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'industries_health_title')}</p>
                <p className="text-slate-200">{t(l,'industries_health_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'industries_energy_title')}</p>
                <p className="text-slate-200">{t(l,'industries_energy_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'industries_gov_title')}</p>
                <p className="text-slate-200">{t(l,'industries_gov_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="agents" className="border-t border-white/5 bg-slate-950/90 py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{t(l,'agents_label')}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">{t(l,'agents_title')}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">{t(l,'agents_desc')}</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'agent_rfp_title')}</p>
                <p className="text-emerald-50">{t(l,'agent_rfp_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'agent_fin_title')}</p>
                <p className="text-slate-200">{t(l,'agent_fin_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'agent_comp_title')}</p>
                <p className="text-slate-200">{t(l,'agent_comp_desc')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
                <p className="mb-1 text-lg">{t(l,'agent_risk_title')}</p>
                <p className="text-slate-200">{t(l,'agent_risk_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo-poc" className="border-t border-white/5 py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{t(l,'demo_poc_label')}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">{t(l,'demo_poc_title')}</h2>
              <p className="mt-2 text-sm text-slate-300">{t(l,'demo_poc_desc')}</p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm">
                <p className="mb-2 text-lg">{t(l,'live_demo_title')}</p>
                <p className="mb-3 text-slate-200">{t(l,'live_demo_desc')}</p>
                <ul className="mb-4 list-disc space-y-1 pr-5 text-slate-300">
                  <li>{t(l,'live_demo_b1')}</li>
                  <li>{t(l,'live_demo_b2')}</li>
                </ul>
                <a href="/demo" className="mt-auto inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition">{t(l,'cta_demo')}</a>
              </div>
              <div className="flex flex-col rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-sm">
                <p className="mb-2 text-lg">{t(l,'enterprise_poc_title')}</p>
                <p className="mb-3 text-emerald-50">{t(l,'enterprise_poc_desc')}</p>
                <ul className="mb-4 list-disc space-y-1 pr-5 text-emerald-50/90">
                  <li>{t(l,'enterprise_poc_b1')}</li>
                  <li>{t(l,'enterprise_poc_b2')}</li>
                </ul>
                <a href="/poc" className="mt-auto inline-flex items-center justify-center rounded-full border border-emerald-300/60 bg-transparent px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/10 transition">{t(l,'cta_poc')}</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}