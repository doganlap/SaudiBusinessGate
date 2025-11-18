"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Globe,
  SunMedium,
  MoonStar,
  Search,
  Bell,
  Menu,
  Languages,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useTheme } from "@/lib/theme/ThemeContext";

interface HeaderProps {
  locale?: "ar" | "en";
  setLocale?: (v: "ar" | "en") => void;
  dark?: boolean;
  setDark?: (v: boolean) => void;
  onToggleDrawer?: () => void;
}

export default function Header({ onToggleDrawer }: HeaderProps) {
  const { language: currentLang, isRTL } = useLanguage();
  const { toggleMode, isDark } = useTheme();

  const t = useMemo(() => ({
    ar: {
      brand: "المتجر السعودي — بوابة الأعمال الذاتية",
      search: "ابحث… (Ctrl/⌘K)",
      online: "النظام متصل",
      db: "قاعدة البيانات: متصلة"
    },
    en: {
      brand: "Saudi Store — Autonomous Business Gateway",
      search: "Search… (Ctrl/⌘K)",
      online: "System Online",
      db: "Database: Connected"
    }
  } as const)[currentLang], [currentLang]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AgentsBackdrop />
      <nav className="mx-auto max-w-7xl px-3 sm:px-6">
        {/* Enhanced Glassmorphism Header */}
        <div className="mt-3 rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-neutral-900/50 dark:via-neutral-900/40 dark:to-neutral-900/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/20 dark:ring-white/10">
          <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onToggleDrawer}
              className="inline-flex md:hidden items-center justify-center rounded-xl p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5"/>
            </button>

            {/* Brand */}
            <div className="relative flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/80 via-teal-400/80 to-green-400/80 dark:from-emerald-500/70 dark:via-teal-500/70 dark:to-green-500/70 ring-2 ring-white/40 dark:ring-white/20 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-4 w-4 text-white"/>
              </span>
              <div className="font-semibold tracking-tight text-sm sm:text-base">{t.brand}</div>
            </div>

            {/* Search Bar */}
            <div className="ms-auto hidden md:block relative">
              <input
                aria-label={t.search}
                placeholder={t.search}
                className="w-72 rounded-xl border border-white/25 dark:border-white/15 bg-white/10 dark:bg-white/5 px-10 py-2 text-sm outline-none placeholder-white/60 dark:placeholder-white/50 focus:ring-2 focus:ring-emerald-400/60 dark:focus:ring-emerald-500/50 focus:border-emerald-400/60 transition-all duration-200"
              />
              <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"/>
            </div>

            {/* Actions */}
            <div className="ms-auto flex items-center gap-1.5">
              {/* Notifications */}
              <button
                className="relative rounded-xl p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 group"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform"/>
                <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-rose-400 to-red-500 ring-2 ring-white dark:ring-neutral-900 animate-pulse"/>
              </button>

              {/* Language Switcher - Modern Glassmorphism */}
              <div className="relative">
                <div className="rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 px-1 py-1 backdrop-blur-md hover:bg-white/15 dark:hover:bg-white/8 transition-all duration-200">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleMode}
                className="rounded-xl p-2 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 group"
                aria-label="Theme"
              >
                {isDark ?
                  <SunMedium className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"/> :
                  <MoonStar className="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"/>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-3 px-3 sm:px-5 pb-2 mt-2">
          <StatusChip color="emerald">{t.online}</StatusChip>
          <StatusChip color="cyan">{t.db}</StatusChip>
          <StatusChip color="violet">Saudi Store</StatusChip>
        </div>
      </nav>
    </header>
  );
}

function StatusChip({ children, color }: { children: React.ReactNode; color: "emerald" | "cyan" | "violet" }) {
  const palette = {
    emerald: "from-emerald-400/80 to-teal-400/70",
    cyan: "from-cyan-400/80 to-sky-400/70",
    violet: "from-fuchsia-400/80 to-violet-400/70"
  }[color];

  const glowColor = {
    emerald: "shadow-emerald-400/40",
    cyan: "shadow-cyan-400/40",
    violet: "shadow-violet-400/40"
  }[color];

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/25 dark:border-white/15 bg-gradient-to-br from-white/15 to-white/5 dark:from-white/10 dark:to-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 dark:ring-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${palette} ${glowColor} shadow-lg animate-pulse`} />
      {children}
    </motion.span>
  );
}

function AgentsBackdrop() {
  const Orb = ({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) => (
    <motion.span 
      initial={{ opacity: 0.25, x, y, scale: 0.9 }} 
      animate={{ 
        opacity: [0.35, 0.6, 0.35], 
        x: [x, x + 8, x - 6, x], 
        y: [y, y - 6, y + 4, y], 
        scale: [0.95, 1.06, 0.98, 0.95] 
      }} 
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }} 
      className="pointer-events-none absolute rounded-full blur-2xl" 
      style={{ 
        width: size, 
        height: size, 
        background: "radial-gradient(35% 35% at 50% 50%, rgba(16,185,129,0.8), rgba(16,185,129,0) 70%)" 
      }}
    />
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
