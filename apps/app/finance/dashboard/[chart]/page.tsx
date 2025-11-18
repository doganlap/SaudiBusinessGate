"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { exportNodeToPng } from "../export";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Treemap
} from "recharts";

export default function ChartDetailPage({ params, searchParams }: { params: { chart: string }, searchParams?: { tenant?: string } }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(searchParams?.tenant || "default");
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const key = params.chart;

  const load = async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/stats", { headers: { "x-tenant-id": t } });
      const json = await res.json();
      setStats(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tenant); }, [tenant]);

  const months = useMemo(() => stats?.monthlyRevenue || [], [stats]);
  const net = useMemo(() => months.map((m: any) => ({ month: m.month, net: Math.max(m.revenue - m.expenses, 0) })), [months]);
  const id = `#detail-${key}`;

  const renderChart = () => {
    switch (key) {
      case "revenue-expenses":
        return (
          <ResponsiveContainer>
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "revenue-area":
        return (
          <ResponsiveContainer>
            <AreaChart data={months}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#bbf7d0" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "expenses-bar":
        return (
          <ResponsiveContainer>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "net-composed":
        return (
          <ResponsiveContainer>
            <ComposedChart data={net}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="net" fill="#3b82f6" />
              <Line type="monotone" dataKey="net" stroke="#0ea5e9" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case "ar-ap-cash":
        return (
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="value" nameKey="name" data={[{ name: "AR", value: stats?.accountsReceivable || 0 }, { name: "AP", value: stats?.accountsPayable || 0 }, { name: "Cash", value: stats?.cashFlow || 0 }]} innerRadius={60} outerRadius={100}>
                {["#22c55e", "#ef4444", "#0ea5e9"].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "margins-radar":
        return (
          <ResponsiveContainer>
            <RadarChart data={[{ metric: "Gross", value: stats?.grossMargin || 0 }, { metric: "Operating", value: stats?.operatingMargin || 0 }] }>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case "revenue-share":
        const total = months.reduce((s: number, m: any) => s + m.revenue, 0);
        const share = months.map((m: any) => ({ name: m.month, value: Math.round((m.revenue / Math.max(total, 1)) * 100) }));
        return (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={share} dataKey="value" nameKey="name" label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer>
            <LineChart data={months}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-slate-900">
          <h2 className="text-xl font-semibold">Finance • {key}</h2>
          <p className="text-sm text-slate-500">Tenant: {tenant}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="default">default</option>
            <option value="demo-tenant">demo-tenant</option>
            <option value="ksa-bank">ksa-bank</option>
            <option value="enterprise">enterprise</option>
          </select>
          <button onClick={() => exportNodeToPng(id, `${key}-${tenant}.png`)} className="rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white">Export PNG</button>
          <button onClick={() => window.print()} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Print</button>
          <button onClick={() => router.back()} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Back</button>
        </div>
      </div>
      <div id={id.slice(1)} className="h-[60vh] rounded-xl border border-white/10 bg-white p-4 shadow">
        {renderChart()}
      </div>
    </div>
  );
}