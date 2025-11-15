'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { RFQ } from '@/types/sales';

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const response = await fetch('/api/sales/rfqs', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setRfqs(data.rfqs || []);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'rfq_number', header: 'RFQ Number' },
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status' },
    { key: 'due_date', header: 'Due Date' },
  ];

  if (loading) {
    return <LoadingState message="Loading RFQs..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Requests for Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            actions={[{ label: 'New RFQ', icon: Plus, onClick: () => console.log('New RFQ') }]}
          />
          <DataGrid data={rfqs} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}