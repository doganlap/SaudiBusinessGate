import { NextRequest, NextResponse } from 'next/server';

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

const mockAttendance: AttendanceRecord[] = [
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
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    const totalEmployees = mockAttendance.length;
    const presentCount = mockAttendance.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'remote').length;
    const absentCount = mockAttendance.filter(r => r.status === 'absent').length;
    const lateCount = mockAttendance.filter(r => r.status === 'late').length;
    const avgHours = mockAttendance.reduce((sum, r) => sum + r.hoursWorked, 0) / totalEmployees;
    
    return NextResponse.json({
      success: true,
      attendance: mockAttendance,
      summary: {
        totalEmployees,
        presentCount,
        absentCount,
        lateCount,
        avgHours: Math.round(avgHours * 10) / 10,
        attendanceRate: Math.round((presentCount / totalEmployees) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    const newAttendance: AttendanceRecord = {
      id: Date.now().toString(),
      ...body,
      date: new Date().toISOString().split('T')[0]
    };
    
    mockAttendance.push(newAttendance);
    
    return NextResponse.json({
      success: true,
      attendance: newAttendance,
      message: 'Attendance record created successfully'
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create attendance' },
      { status: 500 }
    );
  }
}
