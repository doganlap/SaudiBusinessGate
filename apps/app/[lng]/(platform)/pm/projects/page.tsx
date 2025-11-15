'use client';

import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Project } from '@/types/project-management';

const ProjectsPage = () => {
  const { _ } = useLingui();
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
    { field: 'name', headerName: _('Name'), flex: 1 },
    { field: 'status', headerName: _('Status'), flex: 1 },
    { field: 'start_date', headerName: _('Start Date'), flex: 1 },
    { field: 'end_date', headerName: _('End Date'), flex: 1 },
  ];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <EnterpriseToolbar
        title={_('Projects')}
        buttons={[{ label: _('New Project'), onClick: () => console.log('New Project') }]}
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