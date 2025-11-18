'use client';

import React from 'react';
import TabNavigation from '@/src/components/layout/navigation/tab-navigation';
import { FileText, MessageSquare, ShoppingCart, FileSignature, Lightbulb } from 'lucide-react';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const salesTabs = [
    {
      id: 'quotes',
      label: 'Quotes',
      href: '/sales/quotes',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'rfqs',
      label: 'RFQs',
      href: '/sales/rfqs',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 'orders',
      label: 'Orders',
      href: '/sales/orders',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      id: 'contracts',
      label: 'Contracts',
      href: '/sales/contracts',
      icon: <FileSignature className="h-4 w-4" />
    },
    {
      id: 'proposals',
      label: 'Proposals',
      href: '/sales/proposals',
      icon: <Lightbulb className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline, quotes, orders, and contracts
          </p>
        </div>
      </div>
      
      <TabNavigation tabs={salesTabs} variant="underline" />
      
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}