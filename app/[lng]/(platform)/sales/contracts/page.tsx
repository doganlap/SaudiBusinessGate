'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Contract } from '@/types/sales';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/sales/contracts', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status' },
    { key: 'start_date', header: 'Start Date' },
    { key: 'end_date', header: 'End Date' },
  ];

  if (loading) {
    return <LoadingState message="Loading contracts..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            actions={[{ label: 'New Contract', icon: Plus, onClick: () => console.log('New Contract') }]}
          />
          <DataGrid data={contracts} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}