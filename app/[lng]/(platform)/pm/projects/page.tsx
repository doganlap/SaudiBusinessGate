'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { Plus } from 'lucide-react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Project } from '@/types/project-management';

const ProjectsPage = () => {
  const params = useParams();
  const lng = (params?.lng as string) || 'en';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/pm/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: lng === 'ar' ? 'الاسم' : 'Name', flex: 1 },
    { field: 'status', headerName: lng === 'ar' ? 'الحالة' : 'Status', flex: 1 },
    { field: 'start_date', headerName: lng === 'ar' ? 'تاريخ البدء' : 'Start Date', flex: 1 },
    { field: 'end_date', headerName: lng === 'ar' ? 'تاريخ الانتهاء' : 'End Date', flex: 1 },
  ];

  return (
    <div className="h-full w-full">
      <EnterpriseToolbar
        actions={[
          {
            label: lng === 'ar' ? 'مشروع جديد' : 'New Project',
            icon: Plus,
            onClick: () => console.log('New Project')
          }
        ]}
      />
      <DataGrid
        rows={projects}
        columns={columns}
        loading={loading}
        sx={{ border: 0 }}
      />
    </div>
  );
};

export default ProjectsPage;