"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Globe,
  SunMedium,
  MoonStar,
  Search,
  Bell,
  Menu,
  X,
  // Nav icons
  LayoutDashboard,
  ShoppingBag,
  Package,
  PanelsTopLeft,
  Workflow,
  Handshake,
  CreditCard,
  BarChart3,
  Users,
  ShieldCheck,
  ScrollText,
  Database as DatabaseIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  // Agents
  Bot,
  Zap,
  FileCheck,
  Timer,
  Activity,
  ClipboardCheck,
  Building2,
  DollarSign,
  TrendingUp,
  UserPlus,
  UserCircle,
  Calendar,
  ShoppingCart,
  Plus,
  AlignLeft,
  AlignRight,
  Phone,
  Send,
  Scale,
  FileText,
} from "lucide-react";

/**
 * Saudi Store — The first Autonomous Business Gateway in the region.
 * Glassmorphic header + LEFT nav + RIGHT agent workflow dock.
 * AR/EN bilingual, RTL-aware, active-link highlighting, tooltips, Command Palette (Ctrl/⌘K),
 * agents wired to example API endpoints. Tailwind + framer-motion + lucide-react.
 */

export default function SaudiStoreShell({
  locale: initialLocale = "ar",
  children,
}: { locale?: "ar" | "en"; children?: React.ReactNode }) {
  const [locale, setLocale] = useState<"ar" | "en">(initialLocale);
  const [dark, setDark] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rightDockOpen, setRightDockOpen] = useState(true);
  
  // Direction state - independent of language, can be overridden
  const [direction, setDirection] = useState<"rtl" | "ltr">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('text-direction');
      if (saved === 'rtl' || saved === 'ltr') return saved;
    }
    return initialLocale === "ar" ? "rtl" : "ltr";
  });

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = direction;
    if (typeof window !== 'undefined') {
      localStorage.setItem('text-direction', direction);
    }
  }, [direction]);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-neutral-950 dark:to-neutral-900">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        dark={dark} 
        setDark={setDark} 
        direction={direction}
        setDirection={setDirection}
        onToggleDrawer={()=>setDrawerOpen(v=>!v)} 
      />
      <div className="flex">
        <LeftNav locale={locale} collapsedAt={1280} drawerOpen={drawerOpen} onCloseDrawer={()=>setDrawerOpen(false)} />
        <main className="flex-1 pt-28 px-4 sm:px-6" style={{ marginInlineStart: 300, marginInlineEnd: rightDockOpen ? 360 : 24 }}>
          <div className="mx-auto max-w-7xl">
            {children || <DefaultContent locale={locale} />}
          </div>
        </main>
        <RightAgentDock locale={locale} open={rightDockOpen} onToggle={()=>setRightDockOpen(v=>!v)} />
      </div>
    </div>
  );
}

/* --------------------- Header --------------------- */
function Header({ 
  locale, 
  setLocale, 
  dark, 
  setDark, 
  direction,
  setDirection,
  onToggleDrawer 
}:{ 
  locale:"ar"|"en"; 
  setLocale:(v:"ar"|"en")=>void; 
  dark:boolean; 
  setDark:(v:boolean)=>void; 
  direction:"rtl"|"ltr";
  setDirection:(v:"rtl"|"ltr")=>void;
  onToggleDrawer:()=>void; 
}){
  const t = useMemo(()=>({
    ar:{ 
      brand:"المتجر السعودي — بوابة الأعمال الذاتية", 
      search:"ابحث… (Ctrl/⌘K)", 
      online:"النظام متصل", 
      db:"قاعدة البيانات: متصلة",
      rtl:"اتجاه النص: من اليمين لليسار",
      ltr:"اتجاه النص: من اليسار لليمين"
    },
    en:{ 
      brand:"Saudi Store — Autonomous Business Gateway", 
      search:"Search… (Ctrl/⌘K)", 
      online:"System Online", 
      db:"Database: Connected",
      rtl:"Text Direction: Right-to-Left",
      ltr:"Text Direction: Left-to-Right"
    }
  } as const)[locale], [locale]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AgentsBackdrop />
      <nav className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/10">
          <div className="flex items-center gap-2 px-3 sm:px-5 py-2">
            <button onClick={onToggleDrawer} className="inline-flex md:hidden items-center justify-center rounded-xl p-2 hover:bg-white/20 transition" aria-label="Toggle Menu">
              <Menu className="h-5 w-5"/>
            </button>
            <div className="relative flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/70 via-green-400/70 to-teal-400/70 ring-1 ring-white/40">
                <Building2 className="h-4 w-4"/>
              </span>
              <div className="font-semibold tracking-tight text-sm sm:text-base">{t.brand}</div>
            </div>
            <div className="ms-auto hidden md:block">
              <input aria-label={t.search} placeholder={t.search} className="w-72 rounded-xl border border-white/20 bg-white/5 px-9 py-2 text-sm outline-none placeholder-white/60 focus:ring-2 focus:ring-emerald-400/60"/>
              <Search className="pointer-events-none -ms-72 relative -start-64 -mt-7 h-4 w-4 opacity-70"/>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <button className="relative rounded-xl p-2 hover:bg-white/20 transition" aria-label="Notifications"><Bell className="h-5 w-5"/></button>
              <button 
                onClick={()=>setDirection(direction==='rtl'?'ltr':'rtl')} 
                className="rounded-xl p-2 hover:bg-white/20 transition" 
                aria-label={direction === 'rtl' ? t.ltr : t.rtl}
                title={direction === 'rtl' ? t.ltr : t.rtl}
              >
                {direction === 'rtl' ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <ChevronsLeft className="h-5 w-5" />
                )}
              </button>
              <button onClick={()=>setLocale(locale==='ar'?'en':'ar')} className="rounded-xl p-2 hover:bg-white/20 transition" aria-label="Language"><Globe className="h-5 w-5"/></button>
              <button onClick={()=>setDark(!dark)} className="rounded-xl p-2 hover:bg-white/20 transition" aria-label="Theme">{dark? <SunMedium className="h-5 w-5"/>:<MoonStar className="h-5 w-5"/>}</button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 sm:px-5 pb-2">
            <StatusChip color="emerald">{t.online}</StatusChip>
            <StatusChip color="cyan">{t.db}</StatusChip>
            <StatusChip color="violet">Saudi Store</StatusChip>
          </div>
        </div>
      </nav>
    </header>
  );
}

function StatusChip({ children, color }:{children:React.ReactNode; color:"emerald"|"cyan"|"violet"}){
  const palette = { emerald:"from-emerald-400/70 to-teal-400/60", cyan:"from-cyan-400/70 to-sky-400/60", violet:"from-fuchsia-400/70 to-violet-400/60" }[color];
  return (
    <span className={`inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-2 py-1 text-xs ring-1 ring-white/10`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${palette} shadow`} />
      {children}
    </span>
  );
}

function AgentsBackdrop(){
  const Orb = ({ delay, size, x, y }:{delay:number; size:number; x:number; y:number}) => (
    <motion.span initial={{opacity:0.25, x, y, scale:0.9}} animate={{opacity:[0.35,0.6,0.35], x:[x,x+8,x-6,x], y:[y,y-6,y+4,y], scale:[0.95,1.06,0.98,0.95]}} transition={{duration:8, repeat:Infinity, ease:"easeInOut", delay}} className="pointer-events-none absolute rounded-full blur-2xl" style={{width:size,height:size, background:"radial-gradient(35% 35% at 50% 50%, rgba(16,185,129,0.3), rgba(255,255,255,0) 70%)"}}/>
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-36">
      <div className="relative mx-auto max-w-7xl">
        <Orb delay={0} size={180} x={-40} y={10}/>
        <Orb delay={1.2} size={140} x={220} y={-6}/>
        <Orb delay={0.8} size={120} x={520} y={8}/>
        <Orb delay={1.6} size={160} x={820} y={-2}/>
      </div>
    </div>
  );
}

/* --------------------- Left Navigation --------------------- */
function LeftNav({ locale, collapsedAt, drawerOpen, onCloseDrawer }:{ locale:"ar"|"en"; collapsedAt:number; drawerOpen:boolean; onCloseDrawer:()=>void; }){
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(()=>{
    const onResize = () => setCollapsed(window.innerWidth < collapsedAt);
    onResize();
    window.addEventListener("resize", onResize);
    return ()=>window.removeEventListener("resize", onResize);
  },[collapsedAt]);

  const groups = useMemo(()=>[
    { key:"dashboard", titleAr:"لوحة القيادة", titleEn:"Dashboard", items:[
      { k:"dashboard", ar:"الرئيسية", en:"Home", icon: LayoutDashboard, href:"/en/dashboard" },
      { k:"register", ar:"تسجيل عميل", en:"Register Customer", icon: UserPlus, href:"/en/register/complete" },
      { k:"login", ar:"تسجيل الدخول", en:"Login", icon: ShieldCheck, href:"/en/login" },
    ]},
    { key:"finance", titleAr:"المالية", titleEn:"Finance", items:[
      { k:"finance-dashboard", ar:"لوحة المالية", en:"Finance Dashboard", icon: LayoutDashboard, href:`/${locale}/finance` },
      { k:"finance-analytics", ar:"تحليلات مالية", en:"Analytics", icon: BarChart3, href:`/${locale}/finance/analytics` },
      { k:"transactions", ar:"المعاملات", en:"Transactions", icon: DollarSign, href:`/${locale}/finance/transactions` },
      { k:"accounts", ar:"الحسابات", en:"Accounts", icon: Package, href:`/${locale}/finance/accounts` },
      { k:"reports", ar:"التقارير", en:"Reports", icon: BarChart3, href:`/${locale}/finance/reports` },
    ]},
    { key:"sales", titleAr:"المبيعات", titleEn:"Sales", items:[
      { k:"sales-dashboard", ar:"لوحة المبيعات", en:"Sales Dashboard", icon: LayoutDashboard, href:`/${locale}/sales` },
      { k:"sales-analytics", ar:"تحليلات المبيعات", en:"Analytics", icon: BarChart3, href:`/${locale}/sales/analytics` },
      { k:"leads", ar:"العملاء المحتملون", en:"Leads", icon: TrendingUp, href:`/${locale}/sales/leads` },
      { k:"deals", ar:"الصفقات", en:"Deals", icon: Handshake, href:`/${locale}/sales/deals` },
      { k:"quotes", ar:"عروض الأسعار", en:"Quotes", icon: FileText, href:`/${locale}/sales/quotes` },
      { k:"rfqs", ar:"طلبات العروض", en:"RFQs", icon: Send, href:`/${locale}/sales/rfqs` },
      { k:"orders", ar:"الطلبات", en:"Orders", icon: Package, href:`/${locale}/sales/orders` },
      { k:"contracts", ar:"العقود", en:"Contracts", icon: Scale, href:`/${locale}/sales/contracts` },
      { k:"proposals", ar:"المقترحات", en:"Proposals", icon: FileText, href:`/${locale}/sales/proposals` },
    ]},
    { key:"crm", titleAr:"إدارة العلاقات", titleEn:"CRM", items:[
      { k:"crm-dashboard", ar:"لوحة CRM", en:"CRM Dashboard", icon: LayoutDashboard, href:`/${locale}/crm` },
      { k:"crm-analytics", ar:"تحليلات CRM", en:"Analytics", icon: BarChart3, href:`/${locale}/crm/analytics` },
      { k:"customers", ar:"العملاء", en:"Customers", icon: Users, href:`/${locale}/crm/customers` },
      { k:"contacts", ar:"جهات الاتصال", en:"Contacts", icon: Phone, href:`/${locale}/crm/contacts` },
      { k:"activities", ar:"الأنشطة", en:"Activities", icon: Activity, href:`/${locale}/crm/activities` },
    ]},
    { key:"hr", titleAr:"الموارد البشرية", titleEn:"HR", items:[
      { k:"hr-dashboard", ar:"لوحة الموارد البشرية", en:"HR Dashboard", icon: LayoutDashboard, href:`/${locale}/hr` },
      { k:"hr-analytics", ar:"تحليلات الموارد البشرية", en:"Analytics", icon: BarChart3, href:`/${locale}/hr/analytics` },
      { k:"employees", ar:"الموظفون", en:"Employees", icon: UserCircle, href:`/${locale}/hr/employees` },
      { k:"employees-create", ar:"إضافة موظف", en:"Create Employee", icon: UserPlus, href:`/${locale}/hr/employees/create` },
      { k:"attendance", ar:"الحضور", en:"Attendance", icon: Calendar, href:`/${locale}/hr/attendance` },
      { k:"attendance-log", ar:"تسجيل الحضور", en:"Log Attendance", icon: Calendar, href:`/${locale}/hr/attendance/log` },
      { k:"payroll", ar:"الرواتب", en:"Payroll", icon: DollarSign, href:`/${locale}/hr/payroll` },
      { k:"payroll-process", ar:"معالجة الرواتب", en:"Process Payroll", icon: DollarSign, href:`/${locale}/hr/payroll/process` },
    ]},
    { key:"procurement", titleAr:"المشتريات", titleEn:"Procurement", items:[
      { k:"procurement-dashboard", ar:"لوحة المشتريات", en:"Procurement Dashboard", icon: LayoutDashboard, href:`/${locale}/procurement` },
      { k:"procurement-analytics", ar:"تحليلات المشتريات", en:"Analytics", icon: BarChart3, href:`/${locale}/procurement/analytics` },
      { k:"orders", ar:"أوامر الشراء", en:"Purchase Orders", icon: ShoppingCart, href:`/${locale}/procurement/orders` },
      { k:"orders-create", ar:"إنشاء أمر شراء", en:"Create Order", icon: Plus, href:`/${locale}/procurement/orders/create` },
      { k:"vendors", ar:"الموردون", en:"Vendors", icon: Building2, href:`/${locale}/procurement/vendors` },
      { k:"vendors-create", ar:"إضافة مورد", en:"Create Vendor", icon: Plus, href:`/${locale}/procurement/vendors/create` },
      { k:"inventory", ar:"المخزون", en:"Inventory", icon: Package, href:`/${locale}/procurement/inventory` },
      { k:"inventory-create", ar:"إضافة عنصر", en:"Add Item", icon: Plus, href:`/${locale}/procurement/inventory/create` },
    ]},
    { key:"pm", titleAr:"إدارة المشاريع", titleEn:"Project Management", items:[
      { k:"pm-dashboard", ar:"لوحة المشاريع", en:"PM Dashboard", icon: LayoutDashboard, href:`/${locale}/pm` },
      { k:"pm-analytics", ar:"تحليلات المشاريع", en:"Analytics", icon: BarChart3, href:`/${locale}/pm/analytics` },
      { k:"projects", ar:"المشاريع", en:"Projects", icon: ClipboardCheck, href:`/${locale}/pm/projects` },
      { k:"tasks", ar:"المهام", en:"Tasks", icon: FileCheck, href:`/${locale}/pm/tasks` },
      { k:"timesheets", ar:"سجلات الوقت", en:"Timesheets", icon: Timer, href:`/${locale}/pm/timesheets` },
    ]},
    { key:"solution", titleAr:"الحلول و RFPs", titleEn:"Solution & RFPs", items:[
      { k:"solution-dashboard", ar:"لوحة الحلول", en:"Solution Dashboard", icon: LayoutDashboard, href:`/${locale}/solution` },
      { k:"solution-analytics", ar:"تحليلات الحلول", en:"Analytics", icon: BarChart3, href:`/${locale}/solution/analytics` },
      { k:"rfps", ar:"طلبات العروض", en:"RFPs", icon: FileText, href:`/${locale}/solution/rfps` },
      { k:"proposals", ar:"الاقتراحات", en:"Proposals", icon: FileText, href:`/${locale}/solution/proposals` },
      { k:"templates", ar:"القوالب", en:"Templates", icon: FileText, href:`/${locale}/solution/templates` },
    ]},
    { key:"ai", titleAr:"الذكاء الاصطناعي", titleEn:"AI & Automation", items:[
      { k:"ai-agents", ar:"وكلاء الذكاء الاصطناعي", en:"AI Agents", icon: Bot, href:`/${locale}/ai-agents` },
      { k:"motivation", ar:"التحفيز والذكاء", en:"Motivation & AI", icon: Zap, href:`/${locale}/motivation` },
    ]},
    { key:"admin", titleAr:"الإدارة", titleEn:"Admin", items:[
      { k:"platform-dashboard", ar:"لوحة الإدارة", en:"Platform Dashboard", icon: LayoutDashboard, href:`/${locale}/platform` },
      { k:"users", ar:"المستخدمون", en:"Users", icon: Users, href:`/${locale}/platform/users` },
      { k:"tenants", ar:"العملاء", en:"Tenants", icon: Building2, href:`/${locale}/platform/tenants` },
      { k:"settings", ar:"الإعدادات", en:"Settings", icon: SettingsIcon, href:`/${locale}/platform/settings` },
      { k:"api-status", ar:"حالة API", en:"API Status", icon: DatabaseIcon, href:`/${locale}/platform/api-status` },
      { k:"audit", ar:"التدقيق", en:"Audit", icon: ScrollText, href:`/${locale}/platform/audit` },
    ]},
  ],[]);

  const isActive = useCallback((href:string)=> pathname ? (pathname===href || pathname.startsWith(href+"/")) : false, [pathname]);

  return (
    <>
      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside initial={{opacity:0, x: (dir==='rtl'? 20 : -20)}} animate={{opacity:1, x:0}} exit={{opacity:0, x:(dir==='rtl'? 20 : -20)}} transition={{duration:0.18}} className={`fixed inset-y-0 ${dir==='rtl'? 'right-0':'left-0'} z-50 w-80 p-3`}> 
            <div className="h-full rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl ring-1 ring-white/10 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">Saudi Store</div>
                <button onClick={onCloseDrawer} className="rounded-lg p-2 hover:bg-white/20" title="Close drawer"><X className="h-4 w-4"/></button>
              </div>
              {groups.map(g=> (
                <div key={g.key} className="mb-3">
                  <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">{locale==='ar'? g.titleAr : g.titleEn}</div>
                  <div className="mt-1 space-y-1">
                    {g.items.map(it=>{
                      const Icon = it.icon; const active = isActive(it.href);
                      return (
                        <Link key={it.k} href={it.href} onClick={onCloseDrawer} className={`flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 ring-1 ring-white/10 transition ${active? 'bg-white/20 ring-2 ring-emerald-300/40':'bg-white/5 hover:bg-white/15'}`}>
                          <Icon className="h-4 w-4"/> <span className="text-sm font-medium">{locale==='ar'? it.ar : it.en}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={`fixed top-0 ${dir==='rtl'?'right-0':'left-0'} z-40 h-screen transition-[width] duration-300`} style={{ width: collapsed? 84 : 300 }}>
        <div className="relative h-full border border-white/15 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between gap-2 p-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/70 via-green-400/70 to-teal-400/70 ring-1 ring-white/40"><Building2 className="h-4 w-4"/></span>
              {!collapsed && <div className="text-sm font-semibold tracking-tight">Saudi Store</div>}
            </div>
            <button onClick={()=>setCollapsed(v=>!v)} className="rounded-xl border border-white/20 bg-white/10 p-2 ring-1 ring-white/10 hover:bg-white/20" title="Collapse">
              {dir==='rtl' ? (collapsed? <ChevronLeft className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>) : (collapsed? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>)}
            </button>
          </div>
          <div className="scrollbar-thin space-y-3 overflow-y-auto px-2 pb-28">
            {groups.map(g=> (
              <div key={g.key} className="relative">
                {!collapsed ? (
                  <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-white/70">{locale==='ar'? g.titleAr : g.titleEn}</div>
                ) : <div className="px-3 py-1 text-[10px] text-white/50"/>}
                <div className="mt-1 space-y-1">
                  {g.items.map(it=>{
                    const Icon = it.icon; const active = isActive(it.href);
                    return (
                      <Link key={it.k} href={it.href} className={`group flex items-center ${collapsed? 'justify-center':'gap-3'} rounded-xl border border-white/10 px-3 py-2 ring-1 ring-white/10 transition ${active? 'bg-white/20 ring-2 ring-emerald-300/40':'bg-white/5 hover:bg-white/15'}`} title={collapsed? (locale==='ar'? it.ar : it.en): undefined}>
                        <Icon className="h-4 w-4"/>
                        {!collapsed && <span className="text-sm font-medium">{locale==='ar'? it.ar : it.en}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

/* --------------------- Right Agent Dock --------------------- */
function RightAgentDock({ locale, open, onToggle }:{ locale:"ar"|"en"; open:boolean; onToggle:()=>void; }){
  const [agentBusy, setAgentBusy] = useState<string|null>(null);
  const [toast, setToast] = useState<{title:string,body?:string,type?:"ok"|"err"}|null>(null);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const agents = useMemo(()=>[
    { k:"gap", labelAr:"فحص فجوات الامتثال", labelEn:"Compliance Gap Scan", icon: ShieldCheck, color:"from-emerald-400/70 to-teal-400/70", endpoint:"/api/agents/compliance/gap-scan" },
    { k:"risk", labelAr:"تحليل المخاطر", labelEn:"Risk Analyze", icon: Activity, color:"from-amber-400/70 to-orange-400/70", endpoint:"/api/agents/risk/analyze" },
    { k:"evidence", labelAr:"جمع الأدلة", labelEn:"Collect Evidence", icon: FileCheck, color:"from-sky-400/70 to-cyan-400/70", endpoint:"/api/agents/evidence/collect" },
    { k:"rag", labelAr:"سؤال RAG", labelEn:"Ask RAG", icon: Bot, color:"from-fuchsia-400/70 to-violet-400/70", endpoint:"/api/agents/rag/ask" },
    { k:"schedule", labelAr:"تحسين الجدولة", labelEn:"Optimize Schedule", icon: Timer, color:"from-indigo-400/70 to-blue-400/70", endpoint:"/api/agents/scheduler/optimize" },
    { k:"coder", labelAr:"وكيل الكود", labelEn:"Coding Agent", icon: ClipboardCheck, color:"from-pink-400/70 to-rose-400/70", endpoint:"/api/agents/dev/coding" },
  ],[]);

  const runAgent = useCallback(async (key:string)=>{
    const agent = agents.find(a => a.k === key); if(!agent) return;
    try{
      setAgentBusy(key);
      const res = await fetch(agent.endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tenant_id: 'current' }) });
      if(!res.ok) throw new Error(await res.text());
      setToast({title: locale==='ar'? 'تم إرسال الأمر' : 'Command queued', body: locale==='ar'? 'سيبدأ الوكيل العمل الآن.' : 'Agent job is starting.', type:'ok'});
    }catch(e:any){ setToast({title: locale==='ar'? 'فشل التنفيذ' : 'Failed', body: e?.message||String(e), type:'err'}); }
    finally{ setAgentBusy(null); setTimeout(()=>setToast(null), 2500); }
  },[agents, locale]);

  return (
    <aside className={`fixed top-0 ${dir==='rtl'? 'left-0':'right-0'} z-40 h-screen transition-[width] duration-300`} style={{ width: open? 360 : 24 }}>
      <div className="relative h-full">
        <button onClick={onToggle} className={`absolute top-28 ${dir==='rtl'? 'right-0 -mr-3':'left-0 -ml-3'} z-10 rounded-full border border-white/15 bg-white/10 p-2 backdrop-blur-xl ring-1 ring-white/10 hover:bg-white/20`}>
          {open? (dir==='rtl'? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>) : (dir==='rtl'? <ChevronLeft className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>) }
        </button>
        <div className={`h-full ${open? 'border border-white/15 bg-white/10 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-s-2xl' : ''}`}>
          {open && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-3">
                <div className="text-sm font-semibold">{locale==='ar'? 'الوكلاء النشطون' : 'Active Agents'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3">
                {agents.map(a=>{
                  const Icon = a.icon; const busy = agentBusy === a.k;
                  return (
                    <button key={a.k} onClick={()=>runAgent(a.k)} className="group relative rounded-2xl border border-white/10 bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/15 transition focus:outline-none">
                      <span className={`absolute -z-10 inset-0 rounded-2xl blur-xl opacity-50 bg-gradient-to-r ${a.color}`}></span>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${busy? 'animate-pulse':''}`}/>
                        <div className="text-[11px] leading-tight line-clamp-2">{locale==='ar'? a.labelAr : a.labelEn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} transition={{duration:0.18}} className="pointer-events-none absolute bottom-24 inset-x-0 px-3">
              <div className={`mx-3 rounded-xl ${toast.type==='err'?'bg-rose-600/20 ring-rose-400/40':'bg-emerald-600/20 ring-emerald-400/40'} backdrop-blur-xl ring-1 px-3 py-2 text-sm`}> 
                <div className="font-semibold">{toast.title}</div>
                {toast.body && <div className="opacity-90 text-xs">{toast.body}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

/* --------------------- Default Content --------------------- */
function DefaultContent({ locale }:{ locale:"ar"|"en" }){
  return (
    <>
      <HeroBanner locale={locale} />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard title={locale==='ar'? 'عدد العملاء' : 'Total Customers'} value="128" trend="↑ 6%"/>
        <MetricCard title={locale==='ar'? 'المعاملات' : 'Transactions'} value="3,420" trend="↑ 12%"/>
        <MetricCard title={locale==='ar'? 'الوكلاء النشطون' : 'Active Agents'} value="6" trend="→"/>
      </div>
    </>
  );
}

function HeroBanner({ locale }:{ locale:"ar"|"en" }){
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl ring-1 ring-white/10 shadow">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">{locale==='ar'? 'أهلاً بك في المتجر السعودي' : 'Welcome to Saudi Store'}</div>
          <div className="text-sm opacity-80">{locale==='ar'? 'أول بوابة أعمال ذاتية في المنطقة — منصة متكاملة لإدارة الأعمال' : 'The first autonomous business gateway in the region — complete business management platform'}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/en/register/complete" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/20">{locale==='ar'? 'تسجيل عميل' : 'Register Customer'}</Link>
          <Link href="/en/dashboard" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/20">{locale==='ar'? 'لوحة القيادة' : 'Dashboard'}</Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend }:{ title:string; value:string; trend:string }){
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl ring-1 ring-white/10 shadow">
      <div className="text-sm opacity-80">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="text-xs opacity-70">{trend}</div>
    </div>
  );
}
