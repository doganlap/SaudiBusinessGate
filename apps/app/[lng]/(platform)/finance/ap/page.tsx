"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type AP = { billId: string; vendor: string; dueDate: string; amount: number; status: string };

export default function AccountsPayablePage() {
  const params = useParams() as any;
  const lng = (params?.lng as string) || "en";
  const [rows, setRows] = useState<AP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/finance/ap");
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
    { field: "billId", headerName: lng === "ar" ? "رقم الفاتورة" : "Bill", flex: 1 },
    { field: "vendor", headerName: lng === "ar" ? "المورد" : "Vendor", flex: 2 },
    { field: "dueDate", headerName: lng === "ar" ? "تاريخ الاستحقاق" : "Due Date", flex: 1 },
    { field: "amount", headerName: lng === "ar" ? "المبلغ" : "Amount", flex: 1 },
    { field: "status", headerName: lng === "ar" ? "الحالة" : "Status", flex: 1 },
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{lng === "ar" ? "الحسابات الدائنة" : "Accounts Payable"}</h1>
          <p className="text-sm text-gray-600">{lng === "ar" ? "متابعة فواتير الموردين المستحقة" : "Track vendor bills due for payment"}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DataGrid rows={rows} columns={columns} loading={loading} sx={{ border: 0 }} />
      </div>
    </div>
  );
}