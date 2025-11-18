"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type Budget = { id: string; name: string; fiscalYear: string; amount: number; spent: number; remaining: number };

export default function FinanceBudgetsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [rows, setRows] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState<Budget | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/budgets?limit=50");
        if (res.ok) {
          const data = await res.json();
          setRows(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRBAC = async () => {
      const r = await fetch('/api/finance/rbac');
      if (r.ok) {
        const j = await r.json();
        setCanWrite(Boolean(j.budgetsWrite));
      }
    };
    fetchRBAC();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: lng === "ar" ? "المعرف" : "ID", flex: 1 },
    { field: "name", headerName: lng === "ar" ? "الاسم" : "Name", flex: 2 },
    { field: "fiscalYear", headerName: lng === "ar" ? "السنة المالية" : "Fiscal Year", flex: 1 },
    { field: "amount", headerName: lng === "ar" ? "المبلغ" : "Amount", flex: 1 },
    { field: "spent", headerName: lng === "ar" ? "المنفق" : "Spent", flex: 1 },
    { field: "remaining", headerName: lng === "ar" ? "المتبقي" : "Remaining", flex: 1 },
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{lng === "ar" ? "الميزانيات" : "Budgets"}</h1>
          <p className="text-sm text-gray-600">{lng === "ar" ? "عرض الميزانيات حسب السنة المالية" : "View budgets by fiscal year"}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {canWrite && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">{lng === "ar" ? "إضافة ميزانية" : "Add Budget"}</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'اسم الميزانية': 'Budget Name'} />
            <input value={fiscalYear} onChange={(e)=>setFiscalYear(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'السنة المالية': 'Fiscal Year'} />
            <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'المبلغ': 'Amount'} />
            <button onClick={async ()=>{
              const res = await fetch('/api/finance/budgets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, fiscalYear, amount: Number(amount) })});
              if(res.ok){ setName(''); setFiscalYear(''); setAmount(''); const data = await fetch('/api/finance/budgets?limit=50'); setRows(await data.json()); }
            }} className="rounded-md bg-emerald-500 text-white px-4 py-2">{lng==='ar'? 'إضافة':'Add'}</button>
          </div>
        </div>
        )}
        <DataGrid rows={rows} columns={columns} loading={loading} sx={{ border: 0 }} />
        {editing && canWrite && (
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h2 className="text-lg font-semibold mb-3">{lng === 'ar' ? 'تعديل الميزانية' : 'Edit Budget'}</h2>
            <div className="grid gap-3 md:grid-cols-4">
              <input defaultValue={editing.name} onChange={(e)=>editing.name=e.target.value} className="rounded-md border px-3 py-2" />
              <input defaultValue={editing.fiscalYear} onChange={(e)=>editing.fiscalYear=e.target.value} className="rounded-md border px-3 py-2" />
              <input defaultValue={String(editing.amount)} onChange={(e)=>editing.amount=Number(e.target.value)} className="rounded-md border px-3 py-2" />
              <button onClick={async ()=>{
                const res = await fetch(`/api/finance/budgets/${editing.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: editing.name, fiscalYear: editing.fiscalYear, amount: editing.amount })});
                if(res.ok){ setEditing(null); const data = await fetch('/api/finance/budgets?limit=50'); setRows(await data.json()); }
              }} className="rounded-md bg-blue-600 text-white px-4 py-2">{lng==='ar'? 'حفظ':'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
