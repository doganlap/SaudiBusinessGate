'use client';

import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { Plus } from 'lucide-react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Timesheet } from '@/types/project-management';
import { useSearchParams } from 'next/navigation';

const TimesheetsPage = () => {
  const { _ } = useLingui();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      const fetchTimesheets = async () => {
        try {
          const response = await fetch(`/api/pm/timesheets?taskId=${taskId}`);
          if (response.ok) {
            const data = await response.json();
            setTimesheets(data);
          }
        } catch (error) {
          console.error('Failed to fetch timesheets', error);
        }
        setLoading(false);
      };

      fetchTimesheets();
    }
  }, [taskId]);

  const columns: GridColDef[] = [
    { field: 'user_id', headerName: _('User'), flex: 1 },
    { field: 'hours_spent', headerName: _('Hours Spent'), flex: 1 },
    { field: 'log_date', headerName: _('Log Date'), flex: 1 },
    { field: 'notes', headerName: _('Notes'), flex: 1 },
  ];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <EnterpriseToolbar
        actions={[
          {
            label: _('New Timesheet'),
            icon: Plus,
            onClick: () => console.log('New Timesheet')
          }
        ]}
      />
      <DataGrid
        rows={timesheets}
        columns={columns}
        loading={loading}
        sx={{ border: 0 }}
      />
    </div>
  );
};

export default TimesheetsPage;