"use client";
import { useEffect, useMemo, useState } from "react";
import { dict, Locale } from "@/lib/i18n";

const randomSeries = (len = 12) => Array.from({ length: len }, () => 20 + Math.round(Math.random() * 80));

export default function DashboardPreview({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const [series, setSeries] = useState<number[]>(randomSeries());
  const [kpis, setKpis] = useState({
    rfp: 1247,
    time: "2.4 min",
    rate: "94%",
    value: "$2.4M",
  });

  useEffect(() => {
    const id = setInterval(() => {
      setSeries(randomSeries());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Animated bars heights
  const heights = useMemo(() => series.map((v) => `${v}%`), [series]);

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-glass">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold">{t.dashboard_title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI label={t.dashboard_kpi_1} value={kpis.rfp.toLocaleString()} />
        <KPI label={t.dashboard_kpi_2} value={kpis.time} />
        <KPI label={t.dashboard_kpi_3} value={kpis.rate} />
        <KPI label={t.dashboard_kpi_4} value={kpis.value} />
      </div>
      <div className="sparkline-bar">
        {heights.map((h, i) => (
          <span key={i} style={{ height: h, animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
      <div className="text-xs md:text-sm opacity-80">{label}</div>
      <div className="text-xl md:text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
