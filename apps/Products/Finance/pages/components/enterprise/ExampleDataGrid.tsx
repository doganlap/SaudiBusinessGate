/**
 * Example Usage of EnterpriseDataGrid
 * Demonstrates how to use the advanced data grid with various features
 */

import React, { useMemo, useState } from 'react';
import { EnterpriseDataGrid } from './EnterpriseDataGrid';
import { createColumns, formatCurrency, StatusBadge } from './dataGridUtils';

// Sample data type
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  account: string;
}

// Sample data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15T10:30:00Z',
    description: 'Office Supplies Purchase',
    amount: 245.50,
    category: 'Expenses',
    status: 'completed',
    account: 'Business Account',
  },
  {
    id: '2',
    date: '2024-01-14T14:45:00Z',
    description: 'Client Payment - Project Alpha',
    amount: 5000.00,
    category: 'Income',
    status: 'completed',
    account: 'Business Account',
  },
  {
    id: '3',
    date: '2024-01-13T09:15:00Z',
    description: 'Software Subscription',
    amount: 99.99,
    category: 'Expenses',
    status: 'pending',
    account: 'Credit Card',
  },
  {
    id: '4',
    date: '2024-01-12T16:20:00Z',
    description: 'Consulting Fee - Client Beta',
    amount: 2500.00,
    category: 'Income',
    status: 'completed',
    account: 'Business Account',
  },
  {
    id: '5',
    date: '2024-01-11T11:05:00Z',
    description: 'Team Lunch',
    amount: 120.00,
    category: 'Expenses',
    status: 'failed',
    account: 'Credit Card',
  },
];

export function ExampleDataGrid() {
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Column definitions using the helper
  const columns = useMemo(
    () =>
      createColumns([
        {
          Header: 'ID',
          accessor: 'id',
          width: 80,
        },
        {
          Header: 'Date',
          accessor: 'date',
          width: 150,
          Cell: ({ value }: { value: string }) => 
            new Date(value).toLocaleDateString(),
        },
        {
          Header: 'Description',
          accessor: 'description',
          width: 250,
        },
        {
          Header: 'Amount',
          accessor: 'amount',
          width: 120,
          Cell: ({ value }: { value: number }) => (
            <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(value)}
            </span>
          ),
        },
        {
          Header: 'Category',
          accessor: 'category',
          width: 120,
          Cell: ({ value }: { value: string }) => (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                value === 'Income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {value}
            </span>
          ),
        },
        {
          Header: 'Status',
          accessor: 'status',
          width: 120,
          Cell: ({ value }: { value: string }) => {
            const variant = {
              completed: 'success',
              pending: 'warning',
              failed: 'danger',
            }[value] as 'success' | 'warning' | 'danger';
            
            return <StatusBadge status={value} variant={variant} />;
          },
        },
        {
          Header: 'Account',
          accessor: 'account',
          width: 150,
        },
      ]),
    []
  );

  // Simulate server-side data fetching
  const handleFetchData = async (params: any) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, you would fetch from your API
    console.log('Fetching data with params:', params);
    
    setLoading(false);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    // Implement export functionality
  };

  const handleRowClick = (row: Transaction) => {
    console.log('Row clicked:', row);
    // Navigate to detail view or show modal
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <p className="text-gray-600">
          Advanced data grid with sorting, filtering, pagination, and real-time updates
        </p>
      </div>

      <EnterpriseDataGrid<Transaction>
        data={sampleTransactions}
        columns={columns}
        loading={loading}
        totalCount={sampleTransactions.length}
        onFetchData={handleFetchData}
        onSelectionChange={setSelectedRows}
        onRowClick={handleRowClick}
        onExport={handleExport}
        selectable={true}
        paginated={true}
        filterable={true}
        realTimeUpdates={true}
        channel="transactions"
        className="bg-white rounded-lg shadow"
      />

      {selectedRows.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Selected {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}