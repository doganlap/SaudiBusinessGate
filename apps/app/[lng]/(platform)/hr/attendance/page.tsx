'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Calendar, Users, CheckCircle, 
  XCircle, AlertTriangle, Coffee, MapPin
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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch('/api/hr/attendance', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      setAttendanceRecords(data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      // Mock data
      setAttendanceRecords([
        {
          id: '1', employeeId: 'EMP001', employeeName: 'Sarah Johnson', department: 'Sales',
          date: '2024-01-15', checkIn: '09:00', checkOut: '17:30', hoursWorked: 8.5,
          status: 'present', location: 'Office', notes: 'On time'
        },
        {
          id: '2', employeeId: 'EMP002', employeeName: 'Mike Chen', department: 'Engineering',
          date: '2024-01-15', checkIn: '09:15', checkOut: '18:00', hoursWorked: 8.75,
          status: 'late', location: 'Office', notes: 'Traffic delay'
        },
        {
          id: '3', employeeId: 'EMP003', employeeName: 'Alex Rodriguez', department: 'Marketing',
          date: '2024-01-15', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8,
          status: 'remote', location: 'Home', notes: 'Working from home'
        },
        {
          id: '4', employeeId: 'EMP004', employeeName: 'Lisa Anderson', department: 'HR',
          date: '2024-01-15', checkIn: '09:30', checkOut: '13:30', hoursWorked: 4,
          status: 'half-day', location: 'Office', notes: 'Medical appointment'
        },
        {
          id: '5', employeeId: 'EMP005', employeeName: 'David Wilson', department: 'Finance',
          date: '2024-01-15', checkIn: '', checkOut: '', hoursWorked: 0,
          status: 'absent', location: '', notes: 'Sick leave'
        }
      ]);
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
            actions={[]}
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
