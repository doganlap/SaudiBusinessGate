'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Calendar, Users, CheckCircle, 
  XCircle, AlertTriangle, Coffee, MapPin, Plus
} from 'lucide-react';
import { DataGrid } from '@/components/enterprise/DataGrid';
import { EnterpriseToolbar } from '@/components/enterprise/EnterpriseToolbar';
import { LoadingState } from '@/components/enterprise/LoadingState';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'remote';
  location: string;
  notes?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.lng || 'en';
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hr/attendance', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.attendance) {
        // Map API response to component state
        const mappedRecords = data.attendance.map((record: any) => ({
          id: record.id || record.attendance_id || '',
          employeeId: record.employee_id || record.employee_code || '',
          employeeName: record.employee_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown',
          department: record.department || '',
          date: record.date || record.attendance_date || new Date().toISOString().split('T')[0],
          checkIn: record.check_in || record.checkin_time || '',
          checkOut: record.check_out || record.checkout_time || '',
          hoursWorked: record.hours_worked || record.total_hours || 0,
          status: record.status || 'present',
          location: record.location || record.work_location || '',
          notes: record.notes || record.comments || '',
        }));
        setAttendanceRecords(mappedRecords);
      } else {
        throw new Error(data.error || 'Failed to fetch attendance records');
      }
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      // Keep empty array on error instead of mock data
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'absent': return XCircle;
      case 'late': return AlertTriangle;
      case 'half-day': return Clock;
      case 'remote': return Coffee;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-yellow-600';
      case 'half-day': return 'text-blue-600';
      case 'remote': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (record: AttendanceRecord) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{record.employeeName}</div>
            <div className="text-sm text-gray-500">{record.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (record: AttendanceRecord) => (
        <span className="font-medium">{record.department}</span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (record: AttendanceRecord) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(record.date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (record: AttendanceRecord) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-green-600" />
          <span>{record.checkIn || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (record: AttendanceRecord) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-red-600" />
          <span>{record.checkOut || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'hoursWorked',
      header: 'Hours Worked',
      render: (record: AttendanceRecord) => (
        <span className="font-medium">{record.hoursWorked}h</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: AttendanceRecord) => {
        const StatusIcon = getStatusIcon(record.status);
        const colorClass = getStatusColor(record.status);
        
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-4 w-4 ${colorClass}`} />
            <Badge variant={
              record.status === 'present' ? 'default' :
              record.status === 'absent' ? 'destructive' :
              record.status === 'late' ? 'secondary' : 'outline'
            }>
              {record.status === 'half-day' ? 'Half Day' :
               record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'location',
      header: 'Location',
      render: (record: AttendanceRecord) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{record.location || 'N/A'}</span>
        </div>
      )
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'half-day', label: 'Half Day' },
    { value: 'remote', label: 'Remote' }
  ];

  const toolbarActions = [
    {
      label: 'Log Attendance',
      icon: Plus,
      onClick: () => router.push(`/${locale}/hr/attendance/log`),
      variant: 'primary' as const
    }
  ];

  // Calculate summary stats
  const totalEmployees = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'remote').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const avgHours = attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0) / totalEmployees;

  if (loading) return <LoadingState message="Loading attendance records..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-gray-600">Track employee attendance and working hours</p>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-gray-500">
              {Math.round((presentCount / totalEmployees) * 100)}% attendance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-gray-500">Employees absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            <p className="text-xs text-gray-500">Late today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgHours.toFixed(1)}h
            </div>
            <p className="text-xs text-gray-500">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <EnterpriseToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search employees..."
            actions={toolbarActions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
          />
          
          <DataGrid
            data={filteredRecords}
            columns={columns}
            searchable={false}
            sortable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
