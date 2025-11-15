'use client';

import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Task } from '@/types/project-management';
import { useSearchParams } from 'next/navigation';

const TasksPage = () => {
  const { _ } = useLingui();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`/api/pm/tasks?projectId=${projectId}`);
          if (response.ok) {
            const data = await response.json();
            setTasks(data);
          }
        } catch (error) {
          console.error('Failed to fetch tasks', error);
        }
        setLoading(false);
      };

      fetchTasks();
    }
  }, [projectId]);

  const columns: GridColDef[] = [
    { field: 'title', headerName: _('Title'), flex: 1 },
    { field: 'status', headerName: _('Status'), flex: 1 },
    { field: 'due_date', headerName: _('Due Date'), flex: 1 },
    { field: 'assignee_id', headerName: _('Assignee'), flex: 1 },
  ];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <EnterpriseToolbar
        title={_('Tasks')}
        buttons={[{ label: _('New Task'), onClick: () => console.log('New Task') }]}
      />
      <DataGrid
        rows={tasks}
        columns={columns}
        loading={loading}
        sx={{ border: 0 }}
      />
    </div>
  );
};

export default TasksPage;