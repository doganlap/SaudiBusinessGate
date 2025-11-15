'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Proposal } from '@/types/sales';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/sales/proposals', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created At' },
  ];

  if (loading) {
    return <LoadingState message="Loading proposals..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            actions={[{ label: 'New Proposal', icon: Plus, onClick: () => console.log('New Proposal') }]}
          />
          <DataGrid data={proposals} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}