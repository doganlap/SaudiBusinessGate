"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type CostCenter = { id: string; name: string; department: string; budget: number; spent: number };

export default function FinanceCostCentersPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [rows, setRows] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [budget, setBudget] = useState("");
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/cost-centers?limit=50");
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
        setCanWrite(Boolean(j.costCentersWrite));
      }
    };
    fetchRBAC();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: lng === "ar" ? "المعرف" : "ID", flex: 1 },
    { field: "name", headerName: lng === "ar" ? "الاسم" : "Name", flex: 2 },
    { field: "department", headerName: lng === "ar" ? "القسم" : "Department", flex: 1 },
    { field: "budget", headerName: lng === "ar" ? "الميزانية" : "Budget", flex: 1 },
    { field: "spent", headerName: lng === "ar" ? "المنفق" : "Spent", flex: 1 },
  ];

  return (
    <div className="h-full w-full">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{lng === "ar" ? "مراكز التكلفة" : "Cost Centers"}</h1>
          <p className="text-sm text-gray-600">{lng === "ar" ? "إدارة مراكز التكلفة والميزانيات" : "Manage cost centers and budgets"}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {canWrite && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">{lng === "ar" ? "إضافة مركز تكلفة" : "Add Cost Center"}</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'الاسم': 'Name'} />
            <input value={department} onChange={(e)=>setDepartment(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'القسم': 'Department'} />
            <input value={budget} onChange={(e)=>setBudget(e.target.value)} className="rounded-md border px-3 py-2" placeholder={lng==='ar'? 'الميزانية': 'Budget'} />
            <button onClick={async ()=>{
              const res = await fetch('/api/finance/cost-centers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, department, budget: Number(budget) })});
              if(res.ok){ setName(''); setDepartment(''); setBudget(''); const data = await fetch('/api/finance/cost-centers?limit=50'); setRows(await data.json()); }
            }} className="rounded-md bg-emerald-500 text-white px-4 py-2">{lng==='ar'? 'إضافة':'Add'}</button>
          </div>
        </div>
        )}
        <DataGrid rows={rows} columns={columns} loading={loading} sx={{ border: 0 }} />
        {editing && canWrite && (
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h2 className="text-lg font-semibold mb-3">{lng === 'ar' ? 'تعديل مركز التكلفة' : 'Edit Cost Center'}</h2>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                defaultValue={editing.name}
                onChange={(e)=>editing.name=e.target.value}
                className="rounded-md border px-3 py-2"
                aria-label={lng === 'ar' ? 'اسم مركز التكلفة' : 'Cost Center Name'}
                title={lng === 'ar' ? 'اسم مركز التكلفة' : 'Cost Center Name'}
                placeholder={lng === 'ar' ? 'الاسم' : 'Name'}
              />
              <input
                defaultValue={editing.department}
                onChange={(e)=>editing.department=e.target.value}
                className="rounded-md border px-3 py-2"
                aria-label={lng === 'ar' ? 'قسم مركز التكلفة' : 'Cost Center Department'}
                title={lng === 'ar' ? 'قسم مركز التكلفة' : 'Cost Center Department'}
                placeholder={lng === 'ar' ? 'القسم' : 'Department'}
              />
              <input
                defaultValue={String(editing.budget)}
                onChange={(e)=>editing.budget=Number(e.target.value)}
                className="rounded-md border px-3 py-2"
                aria-label={lng === 'ar' ? 'ميزانية مركز التكلفة' : 'Cost Center Budget'}
                title={lng === 'ar' ? 'ميزانية مركز التكلفة' : 'Cost Center Budget'}
                placeholder={lng === 'ar' ? 'الميزانية' : 'Budget'}
                inputMode="numeric"
              />
              <button onClick={async ()=>{
                const res = await fetch(`/api/finance/cost-centers/${editing.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: editing.name, department: editing.department, budget: editing.budget })});
                if(res.ok){ setEditing(null); const data = await fetch('/api/finance/cost-centers?limit=50'); setRows(await data.json()); }
              }} className="rounded-md bg-blue-600 text-white px-4 py-2">{lng==='ar'? 'حفظ':'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
