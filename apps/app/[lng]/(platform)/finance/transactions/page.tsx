"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EnterpriseToolbar } from "@/components/enterprise/EnterpriseToolbar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type Txn = { id: string; date: string; amount: number; description: string; status: string };

export default function FinanceTransactionsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [rows, setRows] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/transactions");
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

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">معاملات مالية</h1>
          <p className="text-sm text-gray-600">استعراض معاملات الشهر الحالية ومراقبة الحالة.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EnterpriseToolbar actions={[]} />
        <DataGrid rows={rows} columns={columns} loading={loading} sx={{ border: 0 }} />
      </div>
    </div>
  );
}
