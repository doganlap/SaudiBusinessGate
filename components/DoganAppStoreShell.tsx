"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from '@/src/components/layout/shell/Header';
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
  // Agents
  Bot,
  Zap,
  FileCheck,
  Timer,
  Activity,
  ClipboardCheck,
} from "lucide-react";

/**
 * Dogan AppStore — The first Autonomous Business Gateway in the region.
 * Glassmorphic header + LEFT nav + RIGHT agent workflow dock.
 * AR/EN bilingual, RTL-aware, active-link highlighting, tooltips, Command Palette (Ctrl/⌘K),
 * agents wired to example API endpoints. Tailwind + framer-motion + lucide-react.
 */

export default function DoganAppStoreShell({
  locale: initialLocale = "ar",
  children,
}: { 
  locale?: "ar" | "en";
  children?: React.ReactNode;
}) {
  const [locale, setLocale] = useState<"ar" | "en">(initialLocale);
  const [dark, setDark] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rightDockOpen, setRightDockOpen] = useState(true);

  const dir = locale === "ar" ? "rtl" : "ltr";
  useEffect(() => { document.documentElement.dir = dir; }, [dir]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-neutral-950 dark:to-neutral-900">
      <Header locale={locale} setLocale={setLocale} dark={dark} setDark={setDark} onToggleDrawer={()=>setDrawerOpen(v=>!v)} />
      <div className="flex">
        <LeftNav locale={locale} collapsedAt={1280} drawerOpen={drawerOpen} onCloseDrawer={()=>setDrawerOpen(false)} />
        <main 
          className={`flex-1 pt-28 px-4 sm:px-6 transition-all duration-300 ${
            rightDockOpen ? 'mr-[360px]' : 'mr-6'
          }`}
          style={{ marginInlineStart: 300 }}
        >
          {children || (
            <div className="mx-auto max-w-7xl">
              <HeroBanner locale={locale} />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <MetricCard title={locale==='ar'? 'عدد التطبيقات' : 'Apps'} value="128" trend="↑ 6%"/>
                <MetricCard title={locale==='ar'? 'عمليات الشراء' : 'Purchases'} value="3,420" trend="↑ 12%"/>
                <MetricCard title={locale==='ar'? 'الوكلاء النشطون' : 'Active Agents'} value="6" trend="→"/>
              </div>
            </div>
          )}
        </main>
        <RightAgentDock locale={locale} open={rightDockOpen} onToggle={()=>setRightDockOpen(v=>!v)} />
      </div>
    </div>
  );
}

// Temporary components - will be moved to separate files
function LeftNav({ locale, collapsedAt, drawerOpen, onCloseDrawer }: any) {
  return <div>LeftNav Component</div>;
}

function RightAgentDock({ locale, open, onToggle }: any) {
  return <div>RightAgentDock Component</div>;
}

function HeroBanner({ locale }: { locale: "ar" | "en" }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl ring-1 ring-white/10 shadow">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">{locale==='ar'? 'أهلاً بك في المتجر السعودي' : 'Welcome to Saudi Store'}</div>
          <div className="text-sm opacity-80">{locale==='ar'? 'أول بوابة أعمال ذاتية في المنطقة — اختر تطبيقًا، شغّل وكيلًا، وابدأ التدفق.' : 'The first autonomous business gateway in the region — pick an app, fire an agent, and get to flow.'}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/apps" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/20">{locale==='ar'? 'استعراض التطبيقات' : 'Browse Apps'}</Link>
          <Link href="/workflows" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/20">{locale==='ar'? 'سير العمل' : 'Workflows'}</Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl ring-1 ring-white/10 shadow">
      <div className="text-sm opacity-80">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="text-xs opacity-70">{trend}</div>
    </div>
  );
}
