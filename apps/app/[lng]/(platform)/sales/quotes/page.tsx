'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { Quote } from '@/types/sales';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/sales/quotes', {
        headers: {
          'tenant-id': 'default-tenant'
        }
      });
      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'quote_number', header: 'Quote Number' },
    { key: 'status', header: 'Status' },
    { key: 'total_amount', header: 'Total Amount' },
    { key: 'valid_until', header: 'Valid Until' },
  ];

  if (loading) {
    return <LoadingState message="Loading quotes..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            actions={[{ label: 'New Quote', icon: Plus, onClick: () => console.log('New Quote') }]}
          />
          <DataGrid data={quotes} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}