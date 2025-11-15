"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Building2,
  CreditCard,
  BarChart3,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Globe,
} from "lucide-react";

interface CommandPaletteProps {
  locale: "ar" | "en";
  userRole?: string;
  onThemeToggle?: () => void;
  onLocaleToggle?: () => void;
}

export default function CommandPalette({
  locale,
  userRole = "user",
  onThemeToggle,
  onLocaleToggle,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const t = {
    ar: {
      placeholder: "ابحث عن أي شيء...",
      navigation: "التنقل",
      actions: "الإجراءات",
      settings: "الإعدادات",
      dashboard: "لوحة القيادة",
      finance: "المالية",
      sales: "المبيعات",
      users: "المستخدمون",
      tenants: "العملاء",
      reports: "التقارير",
      billing: "الفوترة",
      analytics: "التحليلات",
      security: "الأمان",
      logout: "تسجيل الخروج",
      theme: "تبديل الثيم",
      language: "تغيير اللغة",
      noResults: "لا توجد نتائج",
    },
    en: {
      placeholder: "Search anything...",
      navigation: "Navigation",
      actions: "Actions",
      settings: "Settings",
      dashboard: "Dashboard",
      finance: "Finance",
      sales: "Sales",
      users: "Users",
      tenants: "Tenants",
      reports: "Reports",
      billing: "Billing",
      analytics: "Analytics",
      security: "Security",
      logout: "Logout",
      theme: "Toggle Theme",
      language: "Change Language",
      noResults: "No results found",
    },
  }[locale];

  // Navigation items with RBAC
  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: t.dashboard,
      href: "/en/dashboard",
      roles: ["user", "manager", "admin", "super_admin"],
    },
    {
      icon: DollarSign,
      label: t.finance,
      href: "/en/finance/transactions",
      roles: ["manager", "admin", "super_admin"],
    },
    {
      icon: TrendingUp,
      label: t.sales,
      href: "/en/sales/leads",
      roles: ["user", "manager", "admin", "super_admin"],
    },
    {
      icon: Users,
      label: t.users,
      href: "/en/platform/users",
      roles: ["admin", "super_admin"],
    },
    {
      icon: Building2,
      label: t.tenants,
      href: "/en/platform/tenants",
      roles: ["super_admin"],
    },
    {
      icon: FileText,
      label: t.reports,
      href: "/en/finance/reports",
      roles: ["manager", "admin", "super_admin"],
    },
    {
      icon: CreditCard,
      label: t.billing,
      href: "/en/billing",
      roles: ["admin", "super_admin"],
    },
    {
      icon: BarChart3,
      label: t.analytics,
      href: "/en/analytics",
      roles: ["manager", "admin", "super_admin"],
    },
    {
      icon: ShieldCheck,
      label: t.security,
      href: "/en/platform/security",
      roles: ["admin", "super_admin"],
    },
  ].filter((item) => item.roles.includes(userRole));

  // Action items
  const actionItems = [
    {
      icon: onThemeToggle ? (Moon) : Sun,
      label: t.theme,
      action: onThemeToggle,
      roles: ["user", "manager", "admin", "super_admin"],
    },
    {
      icon: Globe,
      label: t.language,
      action: onLocaleToggle,
      roles: ["user", "manager", "admin", "super_admin"],
    },
    {
      icon: LogOut,
      label: t.logout,
      action: () => router.push("/en/login"),
      roles: ["user", "manager", "admin", "super_admin"],
    },
  ].filter((item) => item.roles.includes(userRole));

  const handleSelect = useCallback(
    (callback: () => void) => {
      setOpen(false);
      callback();
    },
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl">
        <Command
          className="rounded-2xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/10"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="h-5 w-5 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-neutral-500"
            />
            <kbd className="rounded bg-neutral-200 dark:bg-neutral-800 px-2 py-1 text-xs">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-neutral-500">
              {t.noResults}
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group
              heading={t.navigation}
              className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => handleSelect(() => router.push(item.href))}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-emerald-500/10 data-[selected=true]:bg-emerald-500/20 transition"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            {/* Actions Group */}
            <Command.Group
              heading={t.actions}
              className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase"
            >
              {actionItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={idx}
                    value={item.label}
                    onSelect={() => item.action && handleSelect(item.action)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-emerald-500/10 data-[selected=true]:bg-emerald-500/20 transition"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          <div className="border-t border-white/10 px-4 py-2 text-xs text-neutral-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5">
                  ↑↓
                </kbd>
                {locale === "ar" ? "للتنقل" : "Navigate"}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5">
                  ↵
                </kbd>
                {locale === "ar" ? "للاختيار" : "Select"}
              </span>
            </div>
            <span>
              {locale === "ar" ? "اضغط" : "Press"}{" "}
              <kbd className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5">
                ESC
              </kbd>{" "}
              {locale === "ar" ? "للإغلاق" : "to close"}
            </span>
          </div>
        </Command>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
