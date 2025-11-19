import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getServerSession } from 'next-auth/next';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  location: string;
  employeeId: string;
  tenantId: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    try {
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      if (department) {
        whereClause += ` AND department = $${paramIndex++}`;
        params.push(department);
      }

      const result = await query(`
        SELECT 
          id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title,
          employment_type, hire_date, status, salary, currency,
          work_location, manager_id
        FROM employees
        ${whereClause}
        ORDER BY hire_date DESC
      `, params);

      // Get manager names
      const managerIds = [...new Set(result.rows.map((r: any) => r.manager_id).filter(Boolean))];
      const managers: Record<number, string> = {};
      if (managerIds.length > 0) {
        const managerResult = await query(`
          SELECT id, full_name FROM employees WHERE id = ANY($1)
        `, [managerIds]);
        for (const mgr of managerResult.rows) {
          managers[mgr.id] = mgr.full_name;
        }
      }

      const employees: Employee[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        name: row.full_name || `${row.first_name} ${row.last_name}`,
        email: row.email || '',
        phone: row.phone || '',
        position: row.position || row.job_title || '',
        department: row.department || '',
        manager: row.manager_id ? managers[row.manager_id] || '' : '',
        salary: Number(row.salary || 0),
        startDate: row.hire_date ? new Date(row.hire_date).toISOString().split('T')[0] : '',
        status: (row.status === 'on_leave' ? 'on-leave' : row.status) as 'active' | 'inactive' | 'on-leave',
        location: row.work_location || '',
        employeeId: row.employee_number || '',
        tenantId: tenantId
      }));

      const activeEmployees = employees.filter(e => e.status === 'active');
      const onLeave = employees.filter(e => e.status === 'on-leave');
      const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    
    return NextResponse.json({
      success: true,
        employees,
        total: employees.length,
        summary: {
          totalEmployees: employees.length,
          activeEmployees: activeEmployees.length,
          onLeave: onLeave.length,
          avgSalary: employees.length > 0 ? Math.round(totalSalary / employees.length) : 0
        },
        source: 'database'
      });
    } catch (error: any) {
      if (error.code === '42P01') {
        // Table doesn't exist
        return NextResponse.json({
          success: true,
          employees: [],
          total: 0,
      summary: {
            totalEmployees: 0,
            activeEmployees: 0,
            onLeave: 0,
            avgSalary: 0
          },
          source: 'empty'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || (session.user as any).tenantId || 'default-tenant';
    const body = await request.json();
    
    const {
      first_name, last_name, email, phone, position, department, job_title,
      employment_type = 'full_time', hire_date, salary, work_location
    } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'first_name, last_name, and email are required' },
        { status: 400 }
      );
    }

    // Generate employee number
    const countResult = await query('SELECT COUNT(*) as count FROM employees WHERE tenant_id = $1', [tenantId]);
    const count = parseInt(countResult.rows[0]?.count || '0');
    const employeeNumber = `EMP-${String(count + 1).padStart(3, '0')}`;

    try {
      const result = await query(`
        INSERT INTO employees (
          tenant_id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title, employment_type,
          hire_date, status, salary, currency, work_location, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        RETURNING id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title, hire_date, status, salary, work_location
      `, [
        tenantId, employeeNumber, first_name, last_name,
        `${first_name} ${last_name}`, email, phone || '', position || '',
        department || '', job_title || position || '', employment_type,
        hire_date || new Date(), 'active', salary || 0, 'SAR', work_location || ''
      ]);
    
    const newEmployee: Employee = {
        id: result.rows[0].id.toString(),
        name: result.rows[0].full_name,
        email: result.rows[0].email,
        phone: result.rows[0].phone || '',
        position: result.rows[0].position || result.rows[0].job_title || '',
        department: result.rows[0].department || '',
        manager: '',
        salary: Number(result.rows[0].salary || 0),
        startDate: result.rows[0].hire_date ? new Date(result.rows[0].hire_date).toISOString().split('T')[0] : '',
        status: 'active',
        location: result.rows[0].work_location || '',
        employeeId: result.rows[0].employee_number,
        tenantId: tenantId
      };
    
    return NextResponse.json({
      success: true,
      employee: newEmployee,
      message: 'Employee created successfully'
      }, { status: 201 });
    } catch (error: any) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Employees table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Employee with this email already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
