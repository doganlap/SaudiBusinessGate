'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Building2, MapPin, Star, Calendar } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  type: 'lead' | 'customer' | 'partner' | 'vendor';
  status: 'active' | 'inactive';
  lastContact: string;
  assignedTo: string;
  tags: string[];
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/crm/contacts', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([
        {
          id: '1', name: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0123',
          company: 'TechCorp', position: 'CTO', location: 'San Francisco, CA',
          type: 'customer', status: 'active', lastContact: '2024-01-15',
          assignedTo: 'Sarah Johnson', tags: ['VIP', 'Enterprise']
        },
        {
          id: '2', name: 'Emily Davis', email: 'emily@startup.io', phone: '+1-555-0456',
          company: 'Startup Inc', position: 'CEO', location: 'Austin, TX',
          type: 'lead', status: 'active', lastContact: '2024-01-14',
          assignedTo: 'Mike Chen', tags: ['Hot Lead']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'contact',
      header: 'Contact',
      render: (contact: Contact) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">{contact.name.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{contact.name}</div>
            <div className="text-sm text-gray-500">{contact.position}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (contact: Contact) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{contact.company}</span>
        </div>
      )
    },
    {
      key: 'contact_info',
      header: 'Contact Info',
      render: (contact: Contact) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{contact.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (contact: Contact) => (
        <Badge variant={contact.type === 'customer' ? 'default' : 'outline'}>
          {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
        </Badge>
      )
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (contact: Contact) => (
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )
    },
    {
      key: 'lastContact',
      header: 'Last Contact',
      render: (contact: Contact) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(contact.lastContact).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Contact',
      icon: Plus,
      onClick: () => console.log('Create new contact'),
      variant: 'primary' as const
    }
  ];

  if (loading) return <LoadingState message="Loading contacts..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
          <p className="text-gray-600">Manage all your business contacts and relationships</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.type === 'customer').length}
            </div>
            <p className="text-xs text-gray-500">Active customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {contacts.filter(c => c.type === 'lead').length}
            </div>
            <p className="text-xs text-gray-500">Potential customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {contacts.filter(c => c.type === 'partner').length}
            </div>
            <p className="text-xs text-gray-500">Business partners</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search contacts..."
            actions={toolbarActions}
          />
          <DataGrid data={filteredContacts} columns={columns} searchable={false} sortable={true} />
        </CardContent>
      </Card>
    </div>
  );
}
