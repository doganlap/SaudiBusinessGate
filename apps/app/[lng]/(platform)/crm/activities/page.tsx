'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Activity, Phone, Mail, Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface ActivityRecord {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  contact: string;
  company: string;
  assignedTo: string;
  status: 'completed' | 'pending' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  duration?: number;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/crm/activities', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([
        {
          id: '1', type: 'call', title: 'Follow-up Call', description: 'Discuss contract terms',
          contact: 'John Smith', company: 'TechCorp', assignedTo: 'Sarah Johnson',
          status: 'completed', priority: 'high', dueDate: '2024-01-15', createdAt: '2024-01-14', duration: 30
        },
        {
          id: '2', type: 'email', title: 'Proposal Sent', description: 'Sent pricing proposal',
          contact: 'Emily Davis', company: 'Startup Inc', assignedTo: 'Mike Chen',
          status: 'completed', priority: 'medium', dueDate: '2024-01-14', createdAt: '2024-01-14'
        },
        {
          id: '3', type: 'meeting', title: 'Demo Presentation', description: 'Product demonstration',
          contact: 'Robert Wilson', company: 'Global Corp', assignedTo: 'Alex Rodriguez',
          status: 'scheduled', priority: 'high', dueDate: '2024-01-20', createdAt: '2024-01-15', duration: 60
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Users;
      case 'note': return MessageSquare;
      case 'task': return Activity;
      default: return Activity;
    }
  };

  const columns = [
    {
      key: 'activity',
      header: 'Activity',
      render: (activity: ActivityRecord) => {
        const IconComponent = getActivityIcon(activity.type);
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{activity.title}</div>
              <div className="text-sm text-gray-500">{activity.description}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (activity: ActivityRecord) => (
        <div>
          <div className="font-medium">{activity.contact}</div>
          <div className="text-sm text-gray-500">{activity.company}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (activity: ActivityRecord) => (
        <Badge variant="outline">
          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (activity: ActivityRecord) => (
        <Badge variant={
          activity.status === 'completed' ? 'default' :
          activity.status === 'scheduled' ? 'secondary' : 'outline'
        }>
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (activity: ActivityRecord) => (
        <Badge variant={
          activity.priority === 'high' ? 'destructive' :
          activity.priority === 'medium' ? 'secondary' : 'outline'
        }>
          {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
        </Badge>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (activity: ActivityRecord) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(activity.dueDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (activity: ActivityRecord) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{activity.assignedTo.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <span className="text-sm">{activity.assignedTo}</span>
        </div>
      )
    }
  ];

  const toolbarActions = [
    {
      label: 'New Activity',
      icon: Plus,
      onClick: () => console.log('Create new activity'),
      variant: 'primary' as const
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'call', label: 'Calls' },
    { value: 'email', label: 'Emails' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'note', label: 'Notes' },
    { value: 'task', label: 'Tasks' }
  ];

  if (loading) return <LoadingState message="Loading activities..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Management</h1>
          <p className="text-gray-600">Track all customer interactions and activities</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-xs text-gray-500">Finished activities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activities.filter(a => a.status === 'scheduled').length}
            </div>
            <p className="text-xs text-gray-500">Upcoming activities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activities.filter(a => a.priority === 'high').length}
            </div>
            <p className="text-xs text-gray-500">Urgent activities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search activities..."
            actions={toolbarActions}
            filterValue={filterType}
            onFilterChange={setFilterType}
            filterOptions={filterOptions}
          />
          <DataGrid data={filteredActivities} columns={columns} searchable={false} sortable={true} />
        </CardContent>
      </Card>
    </div>
  );
}
