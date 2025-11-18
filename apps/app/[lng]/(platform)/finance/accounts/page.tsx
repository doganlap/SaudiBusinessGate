"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EnterpriseToolbar } from "@/components/enterprise/EnterpriseToolbar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type Account = { id: string; name: string; type: string; balance: number };

export default function FinanceAccountsPage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [rows, setRows] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/accounts");
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
    { field: "name", headerName: "Name", flex: 2 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "balance", headerName: "Balance", flex: 1 },
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">الحسابات المالية</h1>
          <p className="text-sm text-gray-600">عرض الحسابات والأرصدة والتصنيفات.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EnterpriseToolbar actions={[]} />
        <DataGrid rows={rows} columns={columns} loading={loading} sx={{ border: 0 }} />
      </div>
    </div>
  );
}
