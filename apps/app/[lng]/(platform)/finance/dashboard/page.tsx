"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Stats = { revenue: number; expenses: number; cashFlow: number; profit: number };

export default function FinanceDashboardPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data?.data || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const f = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">لوحة المالية</h1>
          <p className="text-sm text-gray-600">مؤشرات أساسية للحالة المالية.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{f(stats?.revenue || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">المصروفات</p>
              <p className="text-2xl font-bold text-gray-900">{f(stats?.expenses || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">التدفق النقدي</p>
              <p className="text-2xl font-bold text-gray-900">{f(stats?.cashFlow || 0)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">صافي الربح</p>
              <p className="text-2xl font-bold text-gray-900">{f(stats?.profit || 0)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
