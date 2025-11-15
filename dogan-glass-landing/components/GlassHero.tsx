"use client";
import { useEffect } from "react";
import { getTodayScene } from "@/lib/scene";
import { dict, Locale } from "@/lib/i18n";
import AgentsField from "./AgentsField";
import DashboardPreview from "./DashboardPreview";
import clsx from "clsx";

export default function GlassHero({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  const t = dict[locale];

  // Set daily scene variables on mount
  useEffect(() => {
    const scene = getTodayScene();
    const root = document.documentElement;
    root.style.setProperty("--scene-gradient", scene.gradient);
    root.style.setProperty("--color-primary", scene.primary);
  }, []);

  // Apply RTL when Arabic
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", locale);
  }, [locale]);

  return (
    <section className={clsx("relative min-h-[100svh] scene-gradient overflow-hidden")}>
      <AgentsField />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-28">
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div className="text-sm opacity-80">
            <span className="mr-2 rtl:mr-0 rtl:ml-2">•</span>
            <span>{t.rotating_scene}: </span>
            <span className="font-semibold">Auto</span>
          </div>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="btn"
            aria-label="Toggle language"
            title="Toggle language"
          >
            {t.language}
          </button>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="glass rounded-3xl p-6 md:p-10 shadow-glass">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-90 rtl:text-right">
              {t.subtitle}
            </p>
            <div className="mt-6 flex gap-3 rtl:flex-row-reverse">
              <a href="#dashboard" className="btn">{t.cta_secondary}</a>
              <a href="#" className="btn">{t.cta_primary}</a>
            </div>
          </div>

          <div className="">
            <DashboardPreview locale={locale} />
          </div>
        </div>

        <div id="dashboard" className="mt-14">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-6 shadow-glass">
              <h4 className="font-semibold mb-2">KSA Playbooks</h4>
              <p className="opacity-80 text-sm">
                NCA • SAMA • PDPL • DGA — mapped controls and evidence packs ready for deployment.
              </p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-glass">
              <h4 className="font-semibold mb-2">AI Agents</h4>
              <p className="opacity-80 text-sm">
                Autonomous orchestrators to analyze RFPs, compliance gaps, and delivery progress.
              </p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-glass">
              <h4 className="font-semibold mb-2">Secure by Default</h4>
              <p className="opacity-80 text-sm">
                Multi-tenant architecture, RBAC, and audit trail — built for Saudi enterprises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
