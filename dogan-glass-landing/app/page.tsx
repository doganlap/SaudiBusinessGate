type GlassTileProps = {
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
};

function GlassTile({ title, subtitle, badge, icon }: GlassTileProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-base" aria-hidden="true">{icon}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] text-slate-100">{badge}</span>
      </div>
      <p className="text-[0.8rem] font-semibold text-slate-50">{title}</p>
      <p className="mt-1 text-[0.7rem] leading-snug text-slate-200/90">{subtitle}</p>
    </div>
  );
}

import HeroImage from "../components/HeroImage";

export default function HomePage() {
  const plat = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:15000';
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" role="presentation">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950" />
          <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <HeroImage />
        </div>

        <div className="relative">
          <header className="border-b border-white/5">
            <div className="container mx-auto flex items-center justify-between gap-6 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10">
                  <span className="text-xl" aria-hidden="true">🦅</span>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-wide text-emerald-300">Saudi Business Gate</p>
                  <p className="text-[0.7rem] text-slate-300">Powered by <span className="font-semibold">DoganConsult</span> · Engine: <span className="font-semibold">Shahin AI</span></p>
                </div>
              </div>

              <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex" aria-label="Primary">
                <a href="#platform" className="hover:text-emerald-300 transition">المنصّة</a>
                <a href="#industries" className="hover:text-emerald-300 transition">القطاعات</a>
                <a href="#agents" className="hover:text-emerald-300 transition">الوكلاء الذكيون</a>
                <a href="/demo" className="hover:text-emerald-300 transition">Demo</a>
                <a href="/poc" className="hover:text-emerald-300 transition">POC</a>
                <a href={`${plat}/ar/partner`} className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20 transition">دخول الشركاء</a>
              </nav>
            </div>
          </header>

          <section className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-24">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>من السعودية إلى العالم · بوابة الأعمال الذكية</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-5xl">
                  البوابة السعودية المتقدمة لربط أنظمة الأعمال
                  <span className="block text-emerald-300">وإدارة الحوكمة بالذكاء الاصطناعي</span>
                </h1>
                <p className="max-w-xl text-sm text-slate-200 md:text-base">Saudi Business Gate توحّد <span className="font-semibold">ERP، المالية، المخاطر، الامتثال، ووكلاء الذكاء الاصطناعي</span> في بوابة واحدة، مصمّمة للأنظمة السعودية (NCA, SAMA, PDPL, DGA) لخدمة فروعك من الرياض ونيوم إلى أي فرع في العالم.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a href="/demo" className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-brand-400 transition">طلب Demo مباشر</a>
                <a href="/poc" className="inline-flex items-center justify-center rounded-full border border-brand-400/60 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-brand-400/10 transition">جدولة POC مخصص</a>
                <a href={`${plat}/ar/auth`} className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10 transition">دخول العملاء</a>
                <a href={`${plat}/ar/dashboard`} className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 transition">دخول المنصّة</a>
              </div>

              <div className="grid gap-4 text-xs text-slate-200 md:grid-cols-3 md:text-[0.8rem]">
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-200">صُمّم للمؤسسات السعودية</p>
                  <p>بنوك · تأمين · صحة · طاقة · حكومة · مجموعات استثمارية.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-200">تكامل من KSA إلى العالم</p>
                  <p>ربط فروعك وأنظمتك في الرياض، جدة، نيوم، دبي، ولندن في نفس البوابة.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-200">طاقم افتراضي ذاتي</p>
                  <p>RFP Analyzer · Risk Bot · Compliance Copilot · Finance Guardian.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-x-10 -top-10 h-40 bg-gradient-to-b from-emerald-400/30 via-transparent to-transparent blur-3xl" />
              <div className="relative rounded-3xl border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200">KSA LANDMARK GRID</p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">Saudi Business Gate · Global View</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-slate-950/40 px-3 py-1 text-[0.65rem] text-slate-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span>Autonomous Staff Online</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <GlassTile title="الرياض · المقر الرئيسي" subtitle="لوحة قيادة المجلس: KPIs، المخاطر، الامتثال في لحظتها." badge="Capital" icon="🌆" />
                  <GlassTile title="نيوم · منطقة المستقبل" subtitle="بيانات المدن الذكية، أمن الـ IoT، ولوحات ESG." badge="Vision 2030" icon="🛰️" />
                  <GlassTile title="ميناء جدة" subtitle="تمويل تجاري، فحص عقوبات، وتنبيهات الشحن." badge="Trade" icon="⚓" />
                  <GlassTile title="فروع عالمية" subtitle="وكلاء شاهين الافتراضيون يخدمون فرقك في أوروبا وآسيا." badge="Global" icon="🌍" />
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/5 p-3 text-[0.72rem] text-emerald-50">
                  <p className="mb-1 font-semibold">طاقم أعمال ذاتي، يعمل 24/7 من السعودية إلى العالم</p>
                  <p>ضباط مخاطر، ومسؤولو امتثال، ومساعدو مالية، ومحللو RFP يعملون كـ <span className="font-semibold">“Autonomous Staff”</span> داخل المنصّة، مع تتبع كامل (Audit) ومواءمة مع الأنظمة السعودية.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section id="platform" className="border-t border-white/5 bg-slate-950/80 py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">PLATFORM</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">منصة موحّدة تربط الأعمال، المخاطر، والامتثال</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Shahin AI يعمل كـ <span className="font-semibold">Business Gate &amp; GRC Brain</span> يجمع بياناتك من ERP والأنظمة المالية وأنظمة المخاطر ليقدّم رؤية واحدة مؤسسية.</p>
            </div>
            <div className="text-xs text-slate-400">
              <p>API-first · Microservices · Multi-tenant Postgres · Redis</p>
              <p>Ready for Saudi / regional cloud &amp; Zero-Trust SSO.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="mb-2 text-lg">🧩 Unified Business Gate</p>
              <p className="text-sm text-slate-200">توحيد أنظمة ERP، المالية، الموارد البشرية، والعمليات في بوابة واحدة مع صلاحيات متعددة المستأجرين (Multi-tenant) للمجموعات والشركات القابضة.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="mb-2 text-lg">🛡️ Governance &amp; Compliance</p>
              <p className="text-sm text-slate-200">مبنية حول Shahin Vision GRC Master مع نماذج متوافقة مع NCA ECC, SAMA CSF, PDPL, DGA، ولوحات تحكم جاهزة للمراجعين والرقابة.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="mb-2 text-lg">🤖 AI &amp; Autonomous Agents</p>
              <p className="text-sm text-slate-200">وكلاء Shahin يعملون كطاقم افتراضي: يراجعون RFPs، يحتسبون المخاطر، يتابعون ضوابط الامتثال، ويصدرون تنبيهات لحظية للإدارة التنفيذية.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="border-t border-white/5 py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">INDUSTRIES</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">مصمّمة لقطاعات حيوية في المملكة</h2>
            <p className="mt-2 text-sm text-slate-300">من البنوك والتأمين إلى الصحة والطاقة والقطاع الحكومي – نفس البوابة، مع تكوينات مخصصة لكل قطاع.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">🏦 Banking &amp; Insurance</p>
              <p className="text-slate-200">SAMA CSF، مراقبة المخاطر، AML &amp; Sanctions، ولوحات تحكم للمدير الإقليمي والفروع.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">🏥 Healthcare</p>
              <p className="text-slate-200">أمن الـ IoT والمعدات الطبية، حماية بيانات المرضى (PDPL)، ولوحات جودة وسلامة.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">⚡ Energy &amp; Industrial</p>
              <p className="text-slate-200">مخاطر الـ OT، سلسلة الإمداد، ولوحات تشغيل للمواقع والمصانع والحقول.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">🏛️ Government &amp; Regulators</p>
              <p className="text-slate-200">بوابات GRC إشرافية، قياس مؤشرات Vision 2030، ودعم متقدم لفرق الرقابة.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="agents" className="border-t border-white/5 bg-slate-950/90 py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">AUTONOMOUS STAFF</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">وكلاء Shahin كطاقم أعمال ذاتي للمؤسسة</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">ليس مجرد لوحة تحكم – بل <span className="font-semibold">فريق افتراضي من الوكلاء الذكيين</span> يعملون من السعودية لخدمة فروعك في كل مكان.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">
              <p className="mb-1 text-lg">📄 RFP Analyzer</p>
              <p className="text-emerald-50">يحلل المناقصات (RFPs)، يطابق المتطلبات مع قدرات المنصّة، ويبني Matrix جاهزة للعطاء.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">🧮 Finance Copilot</p>
              <p className="text-slate-200">يتابع المعاملات الشاذة، الانحرافات عن السياسة المالية، والتنبيهات الحرجة للمحاسبة.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">⚖️ Compliance Officer Bot</p>
              <p className="text-slate-200">يراقب ضوابط NCA/SAMA/PDPL، ويصدر تقارير جاهزة للمراجعة والتفتيش.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm">
              <p className="mb-1 text-lg">📊 Risk Guardian</p>
              <p className="text-slate-200">يحتسب المخاطر على مستوى الكيان والفرع، ويعطي رؤية موحدة للمجلس التنفيذي.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo-poc" className="border-t border-white/5 py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">DEMO &amp; POC</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">ابدأ بسرعة: Demo على بيئتنا أو POC على بيئتك</h2>
            <p className="mt-2 text-sm text-slate-300">اختر المسار المناسب: عرض تجريبي سريع أو POC مرتبط بأنظمتك وبياناتك الحقيقية في المملكة.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm">
              <p className="mb-2 text-lg">⚡ Live Demo</p>
              <p className="mb-3 text-slate-200">بيئة جاهزة ببيانات تجريبية تعطيك صورة كاملة عن لوحات Shahin GRC، والوكلاء الذكيين، وتجربة المستخدم.</p>
              <ul className="mb-4 list-disc space-y-1 pr-5 text-slate-300">
                <li>لا تحتاج لتجهيز أنظمة أو بيانات.</li>
                <li>مثالية للعرض على الإدارة أو اللجنة.</li>
              </ul>
              <a href="/demo" className="mt-auto inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition">طلب Demo الآن</a>
            </div>

            <div className="flex flex-col rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-sm">
              <p className="mb-2 text-lg">🏗️ Enterprise POC</p>
              <p className="mb-3 text-emerald-50">نربط نظام أو نظامين فعليين (ERP، Core، EMR…) ونركّب نماذج المخاطر والامتثال المناسبة لقطاعك.</p>
              <ul className="mb-4 list-disc space-y-1 pr-5 text-emerald-50/90">
                <li>مناسب لتقييم جدي قبل الشراء.</li>
                <li>يركّز على Use Cases حقيقية لفريقك.</li>
              </ul>
              <a href="/poc" className="mt-auto inline-flex items-center justify-center rounded-full border border-emerald-300/60 bg-transparent px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/10 transition">طلب POC للمؤسسة</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
