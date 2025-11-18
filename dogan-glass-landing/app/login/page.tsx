"use client";
import { useState } from "react";

type FormData = {
  name: string;
  email: string;
  password: string;
  company: string;
  role: string;
  phone: string;
  region: string;
  sector: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    company: "",
    role: "",
    phone: "",
    region: "",
    sector: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name) e.name = "الاسم مطلوب";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "البريد الإلكتروني غير صالح";
    if (!form.password || form.password.length < 8) e.password = "كلمة المرور يجب أن لا تقل عن 8 أحرف";
    if (!form.company) e.company = "اسم الشركة مطلوب";
    if (!form.role) e.role = "المنصب مطلوب";
    if (!form.phone || form.phone.length < 8) e.phone = "رقم الجوال غير صالح";
    if (!form.region) e.region = "المنطقة مطلوبة";
    if (!form.sector) e.sector = "القطاع مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSuccess(false);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
  };

  const onReset = () => {
    setForm({ name: "", email: "", password: "", company: "", role: "", phone: "", region: "", sector: "" });
    setErrors({});
    setSuccess(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">الملف الشخصي والدخول المتقدم</h1>
          <p className="text-slate-300 mb-8">أدخل بياناتك لإعداد الوصول الذكي وتخصيص التجربة للمؤسسة والقطاع.</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">الاسم الكامل</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="مثال: أحمد بن خالد"
                  dir="rtl"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">البريد الإلكتروني</label>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="you@company.com"
                  dir="ltr"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                  dir="ltr"
                />
                {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">اسم الشركة</label>
                <input
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="مثال: مجموعة الرياض"
                  dir="rtl"
                />
                {errors.company ? <p className="mt-1 text-xs text-red-400">{errors.company}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">المنصب</label>
                <input
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="مثال: مدير الامتثال"
                  dir="rtl"
                />
                {errors.role ? <p className="mt-1 text-xs text-red-400">{errors.role}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">رقم الجوال</label>
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                />
                {errors.phone ? <p className="mt-1 text-xs text-red-400">{errors.phone}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">المنطقة</label>
                <select
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">اختر المنطقة</option>
                  <option value="riyadh">الرياض</option>
                  <option value="jeddah">جدة</option>
                  <option value="neom">نيوم</option>
                  <option value="eastern">المنطقة الشرقية</option>
                </select>
                {errors.region ? <p className="mt-1 text-xs text-red-400">{errors.region}</p> : null}
              </div>
              <div>
                <label className="block text-sm mb-1">القطاع</label>
                <select
                  value={form.sector}
                  onChange={(e) => setField("sector", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">اختر القطاع</option>
                  <option value="banking">بنوك وتأمين</option>
                  <option value="healthcare">صحة</option>
                  <option value="energy">طاقة وصناعة</option>
                  <option value="government">حكومي وتنظيمي</option>
                </select>
                {errors.sector ? <p className="mt-1 text-xs text-red-400">{errors.sector}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition disabled:opacity-60"
              >
                {submitting ? "جارٍ الحفظ..." : "حفظ وإعداد الدخول"}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10 transition"
              >
                إعادة تعيين
              </button>
              {success ? <span className="text-emerald-300 text-sm">تم الحفظ بنجاح</span> : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}