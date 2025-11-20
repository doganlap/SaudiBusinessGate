import { query } from '../db/connection';

/**
 * HR Service
 * Contains all business logic for Human Resources operations
 */

// ============================================
// Type Definitions
// ============================================

export interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  job_title?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated' | 'resigned';
  salary?: number;
  currency: string;
  work_location?: string;
  manager_id?: number;
  manager_name?: string;
  tenant_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmployeeFilters {
  status?: string;
  department?: string;
  employment_type?: string;
  limit?: number;
  offset?: number;
}

export interface EmployeeSummary {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  avgSalary: number;
  totalSalary: number;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  job_title?: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date?: Date | string;
  salary?: number;
  work_location?: string;
  manager_id?: number;
  currency?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: number;
  employee_name?: string;
  employee_number?: string;
  department?: string;
  attendance_date: Date | string;
  check_in_time?: Date | string;
  check_out_time?: Date | string;
  break_duration_minutes?: number;
  total_hours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'remote';
  leave_type?: string;
  notes?: string;
  tenant_id: string;
}

export interface AttendanceSummary {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  remoteCount: number;
  avgHours: number;
  attendanceRate: number;
}

export interface CreateAttendanceInput {
  employee_id: number;
  attendance_date: Date | string;
  check_in_time?: Date | string;
  check_out_time?: Date | string;
  break_duration_minutes?: number;
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'remote';
  leave_type?: string;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: number;
  employee_name?: string;
  employee_number?: string;
  department?: string;
  position?: string;
  pay_period_start: Date | string;
  pay_period_end: Date | string;
  pay_date: Date | string;
  base_salary: number;
  overtime_hours?: number;
  overtime_pay?: number;
  allowances?: number;
  bonuses?: number;
  deductions?: number;
  gross_salary: number;
  net_salary: number;
  currency: string;
  payment_method?: string;
  status: 'pending' | 'processed' | 'paid' | 'cancelled';
  tenant_id: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalOvertime: number;
  totalBonuses: number;
  paidEmployees: number;
}

export interface CreatePayrollInput {
  employee_id: number;
  pay_period_start: Date | string;
  pay_period_end: Date | string;
  pay_date: Date | string;
  base_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  allowances?: number;
  bonuses?: number;
  deductions?: number;
  currency?: string;
  payment_method?: string;
}

// ============================================
// HR Service Class
// ============================================

export class HRService {
  // ============================================
  // Employee Management
  // ============================================

  /**
   * Generate employee number based on tenant count
   * Business Rule: Format EMP-XXX where XXX is zero-padded sequential number
   */
  private async generateEmployeeNumber(tenantId: string): Promise<string> {
    try {
      const countResult = await query(
        'SELECT COUNT(*) as count FROM employees WHERE tenant_id = $1',
        [tenantId]
      );
      const count = parseInt(countResult.rows[0]?.count || '0');
      return `EMP-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      // If table doesn't exist, start from EMP-001
      return 'EMP-001';
    }
  }

  /**
   * Get all employees with optional filtering
   * Business Logic: Includes manager names, calculates summary statistics
   */
  async getEmployees(
    tenantId: string,
    filters?: EmployeeFilters
  ): Promise<{ employees: Employee[]; summary: EmployeeSummary }> {
    try {
      // Build WHERE clause dynamically
      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(filters.status === 'on-leave' ? 'on_leave' : filters.status);
      }

      if (filters?.department) {
        whereClause += ` AND department = $${paramIndex++}`;
        params.push(filters.department);
      }

      if (filters?.employment_type) {
        whereClause += ` AND employment_type = $${paramIndex++}`;
        params.push(filters.employment_type);
      }

      // Fetch employees
      let sql = `
        SELECT 
          id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title,
          employment_type, hire_date, status, salary, currency,
          work_location, manager_id, created_at, updated_at
        FROM employees
        ${whereClause}
        ORDER BY hire_date DESC
      `;

      if (filters?.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await query(sql, params);

      // Get manager names for employees with managers
      const managerIds = [
        ...new Set(result.rows.map((r: any) => r.manager_id).filter(Boolean)),
      ];
      const managers: Record<number, string> = {};
      if (managerIds.length > 0) {
        const managerResult = await query(
          'SELECT id, full_name FROM employees WHERE id = ANY($1)',
          [managerIds]
        );
        for (const mgr of managerResult.rows) {
          managers[mgr.id] = mgr.full_name;
        }
      }

      // Map database rows to Employee interface
      const employees: Employee[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        employee_number: row.employee_number || '',
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        full_name: row.full_name || `${row.first_name} ${row.last_name}`,
        email: row.email || '',
        phone: row.phone || '',
        position: row.position || row.job_title || '',
        department: row.department || '',
        job_title: row.job_title || row.position || '',
        employment_type: row.employment_type || 'full_time',
        hire_date: row.hire_date ? new Date(row.hire_date) : new Date(),
        status: row.status || 'active',
        salary: row.salary ? Number(row.salary) : undefined,
        currency: row.currency || 'SAR',
        work_location: row.work_location || '',
        manager_id: row.manager_id,
        manager_name: row.manager_id ? managers[row.manager_id] : undefined,
        tenant_id: tenantId,
        created_at: row.created_at ? new Date(row.created_at) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
      }));

      // Calculate summary statistics
      const summary = this.calculateEmployeeSummary(employees);

      return { employees, summary };
    } catch (error: any) {
      if (error.code === '42P01') {
        // Table doesn't exist - return empty result
        return {
          employees: [],
          summary: {
            totalEmployees: 0,
            activeEmployees: 0,
            onLeave: 0,
            avgSalary: 0,
            totalSalary: 0,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Calculate employee summary statistics
   * Business Logic: Aggregate employee data for reporting
   */
  private calculateEmployeeSummary(employees: Employee[]): EmployeeSummary {
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const onLeave = employees.filter(
      (e) => e.status === 'on_leave'
    );
    const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const avgSalary =
      employees.length > 0 ? Math.round(totalSalary / employees.length) : 0;

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      onLeave: onLeave.length,
      avgSalary,
      totalSalary,
    };
  }

  /**
   * Get single employee by ID
   */
  async getEmployeeById(
    tenantId: string,
    employeeId: number | string
  ): Promise<Employee | null> {
    try {
      const result = await query(
        `
        SELECT 
          id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title,
          employment_type, hire_date, status, salary, currency,
          work_location, manager_id, created_at, updated_at
        FROM employees
        WHERE tenant_id = $1 AND id = $2
      `,
        [tenantId, employeeId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      let managerName: string | undefined;

      if (row.manager_id) {
        const managerResult = await query(
          'SELECT full_name FROM employees WHERE id = $1',
          [row.manager_id]
        );
        managerName =
          managerResult.rows.length > 0
            ? managerResult.rows[0].full_name
            : undefined;
      }

      return {
        id: row.id.toString(),
        employee_number: row.employee_number || '',
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        full_name: row.full_name || `${row.first_name} ${row.last_name}`,
        email: row.email || '',
        phone: row.phone || '',
        position: row.position || row.job_title || '',
        department: row.department || '',
        job_title: row.job_title || row.position || '',
        employment_type: row.employment_type || 'full_time',
        hire_date: row.hire_date ? new Date(row.hire_date) : new Date(),
        status: row.status || 'active',
        salary: row.salary ? Number(row.salary) : undefined,
        currency: row.currency || 'SAR',
        work_location: row.work_location || '',
        manager_id: row.manager_id,
        manager_name: managerName,
        tenant_id: tenantId,
        created_at: row.created_at ? new Date(row.created_at) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new employee
   * Business Logic: Generates employee number, validates required fields, sets defaults
   */
  async createEmployee(
    tenantId: string,
    input: CreateEmployeeInput
  ): Promise<Employee> {
    // Validate required fields
    if (!input.first_name || !input.last_name || !input.email) {
      throw new Error('first_name, last_name, and email are required');
    }

    // Generate employee number
    const employeeNumber = await this.generateEmployeeNumber(tenantId);

    // Set defaults
    const employmentType = input.employment_type || 'full_time';
    const hireDate = input.hire_date
      ? new Date(input.hire_date)
      : new Date();
    const fullName = `${input.first_name} ${input.last_name}`;
    const currency = input.currency || 'SAR';

    try {
      const result = await query(
        `
        INSERT INTO employees (
          tenant_id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title, employment_type,
          hire_date, status, salary, currency, work_location, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        RETURNING id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title, hire_date, status, salary, work_location
      `,
        [
          tenantId,
          employeeNumber,
          input.first_name,
          input.last_name,
          fullName,
          input.email,
          input.phone || '',
          input.position || '',
          input.department || '',
          input.job_title || input.position || '',
          employmentType,
          hireDate,
          'active',
          input.salary || 0,
          currency,
          input.work_location || '',
        ]
      );

      const row = result.rows[0];

      return {
        id: row.id.toString(),
        employee_number: row.employee_number,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone || '',
        position: row.position || row.job_title || '',
        department: row.department || '',
        job_title: row.job_title || row.position || '',
        employment_type: employmentType as any,
        hire_date: row.hire_date ? new Date(row.hire_date) : new Date(),
        status: 'active',
        salary: row.salary ? Number(row.salary) : undefined,
        currency,
        work_location: row.work_location || '',
        tenant_id: tenantId,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation (email or employee_number)
        if (error.constraint?.includes('email')) {
          throw new Error('Employee with this email already exists');
        }
        throw new Error('Employee number already exists');
      }
      if (error.code === '42P01') {
        throw new Error('Employees table not found. Please run database migrations.');
      }
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(
    tenantId: string,
    employeeId: number | string,
    input: Partial<CreateEmployeeInput> & { status?: string }
  ): Promise<Employee> {
    try {
      // Build update query dynamically
      const updates: string[] = [];
      const params: any[] = [tenantId, employeeId];
      let paramIndex = 3;

      if (input.first_name !== undefined) {
        updates.push(`first_name = $${paramIndex++}`);
        params.push(input.first_name);
      }
      if (input.last_name !== undefined) {
        updates.push(`last_name = $${paramIndex++}`);
        params.push(input.last_name);
        // Update full_name when last_name changes
        if (input.first_name !== undefined) {
          updates.push(`full_name = $${paramIndex++}`);
          params.push(`${input.first_name} ${input.last_name}`);
        }
      }
      if (input.email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        params.push(input.email);
      }
      if (input.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        params.push(input.phone);
      }
      if (input.position !== undefined) {
        updates.push(`position = $${paramIndex++}`);
        params.push(input.position);
      }
      if (input.department !== undefined) {
        updates.push(`department = $${paramIndex++}`);
        params.push(input.department);
      }
      if (input.job_title !== undefined) {
        updates.push(`job_title = $${paramIndex++}`);
        params.push(input.job_title);
      }
      if (input.salary !== undefined) {
        updates.push(`salary = $${paramIndex++}`);
        params.push(input.salary);
      }
      if (input.work_location !== undefined) {
        updates.push(`work_location = $${paramIndex++}`);
        params.push(input.work_location);
      }
      if (input.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(input.status);
      }

      updates.push('updated_at = NOW()');

      const result = await query(
        `
        UPDATE employees
        SET ${updates.join(', ')}
        WHERE tenant_id = $1 AND id = $2
        RETURNING id, employee_number, first_name, last_name, full_name,
          email, phone, position, department, job_title, employment_type,
          hire_date, status, salary, currency, work_location, manager_id
      `,
        params
      );

      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      const row = result.rows[0];

      return {
        id: row.id.toString(),
        employee_number: row.employee_number,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone || '',
        position: row.position || row.job_title || '',
        department: row.department || '',
        job_title: row.job_title || row.position || '',
        employment_type: row.employment_type || 'full_time',
        hire_date: row.hire_date ? new Date(row.hire_date) : new Date(),
        status: row.status || 'active',
        salary: row.salary ? Number(row.salary) : undefined,
        currency: row.currency || 'SAR',
        work_location: row.work_location || '',
        manager_id: row.manager_id,
        tenant_id: tenantId,
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        throw new Error('Employees table not found. Please run database migrations.');
      }
      throw error;
    }
  }

  /**
   * Delete employee (soft delete by setting status)
   */
  async deleteEmployee(
    tenantId: string,
    employeeId: number | string
  ): Promise<void> {
    try {
      const result = await query(
        `
        UPDATE employees
        SET status = 'terminated', updated_at = NOW()
        WHERE tenant_id = $1 AND id = $2
      `,
        [tenantId, employeeId]
      );

      if (result.rowCount === 0) {
        throw new Error('Employee not found');
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        throw new Error('Employees table not found. Please run database migrations.');
      }
      throw error;
    }
  }

  // ============================================
  // Attendance Management
  // ============================================

  /**
   * Get attendance records with optional filtering
   * Business Logic: Joins with employees table, calculates summary statistics
   */
  async getAttendance(
    tenantId: string,
    filters?: {
      employee_id?: number;
      start_date?: Date | string;
      end_date?: Date | string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ attendance: AttendanceRecord[]; summary: AttendanceSummary }> {
    try {
      let sql = `
        SELECT 
          a.id, a.employee_id, a.attendance_date, a.check_in_time, a.check_out_time,
          a.break_duration_minutes, a.total_hours, a.status, a.leave_type, a.notes,
          e.full_name as employee_name, e.employee_number, e.department
        FROM attendance a
        INNER JOIN employees e ON a.employee_id = e.id
        WHERE a.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.employee_id) {
        sql += ` AND a.employee_id = $${paramIndex++}`;
        params.push(filters.employee_id);
      }

      if (filters?.start_date) {
        sql += ` AND a.attendance_date >= $${paramIndex++}`;
        params.push(filters.start_date);
      }

      if (filters?.end_date) {
        sql += ` AND a.attendance_date <= $${paramIndex++}`;
        params.push(filters.end_date);
      }

      if (filters?.status) {
        sql += ` AND a.status = $${paramIndex++}`;
        params.push(filters.status);
      }

      sql += ` ORDER BY a.attendance_date DESC, e.full_name ASC`;

      if (filters?.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await query(sql, params);

      const attendance: AttendanceRecord[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        employee_number: row.employee_number,
        department: row.department,
        attendance_date: row.attendance_date,
        check_in_time: row.check_in_time,
        check_out_time: row.check_out_time,
        break_duration_minutes: row.break_duration_minutes || 0,
        total_hours: row.total_hours ? Number(row.total_hours) : undefined,
        status: row.status || 'present',
        leave_type: row.leave_type,
        notes: row.notes,
        tenant_id: tenantId,
      }));

      // Calculate summary
      const summary = this.calculateAttendanceSummary(attendance);

      return { attendance, summary };
    } catch (error: any) {
      if (error.code === '42P01') {
        // Table doesn't exist - return empty result
        return {
          attendance: [],
          summary: {
            totalEmployees: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            remoteCount: 0,
            avgHours: 0,
            attendanceRate: 0,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Calculate attendance summary statistics
   * Business Logic: Aggregate attendance data for reporting
   */
  private calculateAttendanceSummary(
    attendance: AttendanceRecord[]
  ): AttendanceSummary {
    const presentCount = attendance.filter(
      (r) => r.status === 'present' || r.status === 'late' || r.status === 'remote'
    ).length;
    const absentCount = attendance.filter((r) => r.status === 'absent').length;
    const lateCount = attendance.filter((r) => r.status === 'late').length;
    const remoteCount = attendance.filter((r) => r.status === 'remote').length;
    const totalEmployees = attendance.length;
    const totalHours = attendance.reduce(
      (sum, r) => sum + (r.total_hours || 0),
      0
    );
    const avgHours =
      totalEmployees > 0 ? Math.round((totalHours / totalEmployees) * 10) / 10 : 0;
    const attendanceRate =
      totalEmployees > 0
        ? Math.round((presentCount / totalEmployees) * 100)
        : 0;

    return {
      totalEmployees,
      presentCount,
      absentCount,
      lateCount,
      remoteCount,
      avgHours,
      attendanceRate,
    };
  }

  /**
   * Create attendance record
   * Business Logic: Calculates total hours if check-in/check-out provided, validates employee
   */
  async createAttendance(
    tenantId: string,
    input: CreateAttendanceInput
  ): Promise<AttendanceRecord> {
    // Validate employee exists
    const employee = await this.getEmployeeById(tenantId, input.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Calculate total hours if check-in and check-out are provided
    let totalHours: number | undefined;
    if (input.check_in_time && input.check_out_time) {
      const checkIn = new Date(input.check_in_time);
      const checkOut = new Date(input.check_out_time);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const breakHours = (input.break_duration_minutes || 0) / 60;
      totalHours = Math.round((diffHours - breakHours) * 100) / 100;
    }

    const status = input.status || 'present';
    const attendanceDate = input.attendance_date
      ? new Date(input.attendance_date)
      : new Date();

    try {
      const result = await query(
        `
        INSERT INTO attendance (
          tenant_id, employee_id, attendance_date, check_in_time, check_out_time,
          break_duration_minutes, total_hours, status, leave_type, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id, employee_id, attendance_date, check_in_time, check_out_time,
          break_duration_minutes, total_hours, status, leave_type, notes
      `,
        [
          tenantId,
          input.employee_id,
          attendanceDate,
          input.check_in_time || null,
          input.check_out_time || null,
          input.break_duration_minutes || 0,
          totalHours || null,
          status,
          input.leave_type || null,
          input.notes || null,
        ]
      );

      const row = result.rows[0];

      return {
        id: row.id.toString(),
        employee_id: row.employee_id,
        employee_name: employee.full_name,
        employee_number: employee.employee_number,
        department: employee.department,
        attendance_date: row.attendance_date,
        check_in_time: row.check_in_time,
        check_out_time: row.check_out_time,
        break_duration_minutes: row.break_duration_minutes || 0,
        total_hours: row.total_hours ? Number(row.total_hours) : undefined,
        status: row.status,
        leave_type: row.leave_type,
        notes: row.notes,
        tenant_id: tenantId,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation (employee_id, attendance_date)
        throw new Error(
          'Attendance record already exists for this employee and date'
        );
      }
      if (error.code === '42P01') {
        throw new Error(
          'Attendance table not found. Please run database migrations.'
        );
      }
      throw error;
    }
  }

  // ============================================
  // Payroll Management
  // ============================================

  /**
   * Get payroll records with optional filtering
   * Business Logic: Joins with employees table, calculates summary statistics
   */
  async getPayroll(
    tenantId: string,
    filters?: {
      employee_id?: number;
      start_date?: Date | string;
      end_date?: Date | string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ payroll: PayrollRecord[]; summary: PayrollSummary }> {
    try {
      let sql = `
        SELECT 
          p.id, p.employee_id, p.pay_period_start, p.pay_period_end, p.pay_date,
          p.base_salary, p.overtime_hours, p.overtime_pay, p.allowances,
          p.bonuses, p.deductions, p.gross_salary, p.net_salary, p.currency,
          p.payment_method, p.status,
          e.full_name as employee_name, e.employee_number, e.department, e.position
        FROM payroll p
        INNER JOIN employees e ON p.employee_id = e.id
        WHERE p.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.employee_id) {
        sql += ` AND p.employee_id = $${paramIndex++}`;
        params.push(filters.employee_id);
      }

      if (filters?.start_date) {
        sql += ` AND p.pay_date >= $${paramIndex++}`;
        params.push(filters.start_date);
      }

      if (filters?.end_date) {
        sql += ` AND p.pay_date <= $${paramIndex++}`;
        params.push(filters.end_date);
      }

      if (filters?.status) {
        sql += ` AND p.status = $${paramIndex++}`;
        params.push(filters.status);
      }

      sql += ` ORDER BY p.pay_date DESC, e.full_name ASC`;

      if (filters?.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await query(sql, params);

      const payroll: PayrollRecord[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        employee_number: row.employee_number,
        department: row.department,
        position: row.position,
        pay_period_start: row.pay_period_start,
        pay_period_end: row.pay_period_end,
        pay_date: row.pay_date,
        base_salary: Number(row.base_salary),
        overtime_hours: row.overtime_hours ? Number(row.overtime_hours) : undefined,
        overtime_pay: row.overtime_pay ? Number(row.overtime_pay) : undefined,
        allowances: row.allowances ? Number(row.allowances) : undefined,
        bonuses: row.bonuses ? Number(row.bonuses) : undefined,
        deductions: row.deductions ? Number(row.deductions) : undefined,
        gross_salary: Number(row.gross_salary),
        net_salary: Number(row.net_salary),
        currency: row.currency || 'SAR',
        payment_method: row.payment_method,
        status: row.status || 'pending',
        tenant_id: tenantId,
      }));

      // Calculate summary
      const summary = this.calculatePayrollSummary(payroll);

      return { payroll, summary };
    } catch (error: any) {
      if (error.code === '42P01') {
        // Table doesn't exist - return empty result
        return {
          payroll: [],
          summary: {
            totalEmployees: 0,
            totalGrossPay: 0,
            totalNetPay: 0,
            totalDeductions: 0,
            totalOvertime: 0,
            totalBonuses: 0,
            paidEmployees: 0,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Calculate payroll summary statistics
   * Business Logic: Aggregate payroll data for reporting
   */
  private calculatePayrollSummary(payroll: PayrollRecord[]): PayrollSummary {
    const totalGrossPay = payroll.reduce((sum, p) => sum + p.gross_salary, 0);
    const totalNetPay = payroll.reduce((sum, p) => sum + p.net_salary, 0);
    const totalDeductions = payroll.reduce(
      (sum, p) => sum + (p.deductions || 0),
      0
    );
    const totalOvertime = payroll.reduce(
      (sum, p) => sum + (p.overtime_pay || 0),
      0
    );
    const totalBonuses = payroll.reduce(
      (sum, p) => sum + (p.bonuses || 0),
      0
    );
    const paidEmployees = payroll.filter((p) => p.status === 'paid').length;

    return {
      totalEmployees: payroll.length,
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalOvertime,
      totalBonuses,
      paidEmployees,
    };
  }

  /**
   * Create payroll record
   * Business Logic: Calculates overtime pay, gross salary, and net salary
   */
  async createPayroll(
    tenantId: string,
    input: CreatePayrollInput
  ): Promise<PayrollRecord> {
    // Validate employee exists
    const employee = await this.getEmployeeById(tenantId, input.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Calculate overtime pay if overtime hours and rate provided
    const overtimePay =
      input.overtime_hours && input.overtime_rate
        ? input.overtime_hours * input.overtime_rate
        : input.overtime_hours
        ? (employee.salary || 0) / 160 * input.overtime_hours * 1.5 // Default 1.5x rate
        : 0;

    // Calculate gross salary
    const grossSalary =
      input.base_salary +
      overtimePay +
      (input.allowances || 0) +
      (input.bonuses || 0);

    // Calculate net salary
    const netSalary = grossSalary - (input.deductions || 0);

    const currency = input.currency || 'SAR';
    const paymentMethod = input.payment_method || 'bank_transfer';

    try {
      const result = await query(
        `
        INSERT INTO payroll (
          tenant_id, employee_id, pay_period_start, pay_period_end, pay_date,
          base_salary, overtime_hours, overtime_pay, allowances, bonuses,
          deductions, gross_salary, net_salary, currency, payment_method,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
        RETURNING id, employee_id, pay_period_start, pay_period_end, pay_date,
          base_salary, overtime_hours, overtime_pay, allowances, bonuses,
          deductions, gross_salary, net_salary, currency, payment_method, status
      `,
        [
          tenantId,
          input.employee_id,
          input.pay_period_start,
          input.pay_period_end,
          input.pay_date,
          input.base_salary,
          input.overtime_hours || 0,
          overtimePay,
          input.allowances || 0,
          input.bonuses || 0,
          input.deductions || 0,
          grossSalary,
          netSalary,
          currency,
          paymentMethod,
          'pending',
        ]
      );

      const row = result.rows[0];

      return {
        id: row.id.toString(),
        employee_id: row.employee_id,
        employee_name: employee.full_name,
        employee_number: employee.employee_number,
        department: employee.department,
        position: employee.position,
        pay_period_start: row.pay_period_start,
        pay_period_end: row.pay_period_end,
        pay_date: row.pay_date,
        base_salary: Number(row.base_salary),
        overtime_hours: row.overtime_hours ? Number(row.overtime_hours) : undefined,
        overtime_pay: row.overtime_pay ? Number(row.overtime_pay) : undefined,
        allowances: row.allowances ? Number(row.allowances) : undefined,
        bonuses: row.bonuses ? Number(row.bonuses) : undefined,
        deductions: row.deductions ? Number(row.deductions) : undefined,
        gross_salary: Number(row.gross_salary),
        net_salary: Number(row.net_salary),
        currency: row.currency,
        payment_method: row.payment_method,
        status: row.status || 'pending',
        tenant_id: tenantId,
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        throw new Error(
          'Payroll table not found. Please run database migrations.'
        );
      }
      throw error;
    }
  }

  // ADVANCED ANALYTICS METHODS

  async getHRAnalytics(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<any> {
    try {
      let whereClause = 'WHERE e.tenant_id = $1';
      let attendanceWhereClause = 'WHERE a.tenant_id = $1';
      let payrollWhereClause = 'WHERE p.tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.dateFrom) {
        attendanceWhereClause += ` AND a.attendance_date >= $${paramIndex}`;
        payrollWhereClause += ` AND p.pay_period_start >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        attendanceWhereClause += ` AND a.attendance_date <= $${paramIndex}`;
        payrollWhereClause += ` AND p.pay_period_end <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      // Employee distribution by department
      const departmentDistribution = await query(
        `SELECT 
          COALESCE(e.department, 'Unassigned') as department,
          COUNT(*) as employee_count,
          AVG(e.salary) as avg_salary,
          SUM(e.salary) as total_salary
        FROM employees e
        ${whereClause}
          AND e.status = 'active'
        GROUP BY e.department
        ORDER BY employee_count DESC`,
        [tenantId]
      );

      // Monthly attendance trend
      const monthlyAttendanceTrend = await query(
        `SELECT 
          TO_CHAR(a.attendance_date, 'YYYY-MM') as month,
          COUNT(DISTINCT a.employee_id) as employees_count,
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
          COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
          COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
          AVG(a.total_hours) as avg_hours
        FROM attendance a
        ${attendanceWhereClause}
        GROUP BY TO_CHAR(a.attendance_date, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12`,
        params
      );

      // Attendance status distribution
      const attendanceStatusDistribution = await query(
        `SELECT 
          a.status,
          COUNT(*) as count,
          AVG(a.total_hours) as avg_hours,
          COUNT(DISTINCT a.employee_id) as employees_count
        FROM attendance a
        ${attendanceWhereClause}
        GROUP BY a.status
        ORDER BY count DESC`,
        params
      );

      // Department attendance rates
      const departmentAttendance = await query(
        `SELECT 
          COALESCE(e.department, 'Unassigned') as department,
          COUNT(DISTINCT a.employee_id) as employees_count,
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
          COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
          AVG(a.total_hours) as avg_hours,
          CASE 
            WHEN COUNT(*) > 0 THEN 
              (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::float / COUNT(*)::float * 100)
            ELSE 0
          END as attendance_rate
        FROM attendance a
        LEFT JOIN employees e ON a.employee_id = e.id
        ${attendanceWhereClause}
        GROUP BY e.department
        ORDER BY attendance_rate DESC`,
        params
      );

      // Monthly payroll trend
      const monthlyPayrollTrend = await query(
        `SELECT 
          TO_CHAR(p.pay_period_start, 'YYYY-MM') as month,
          COUNT(DISTINCT p.employee_id) as employees_count,
          SUM(p.gross_salary) as total_gross,
          SUM(p.net_salary) as total_net,
          AVG(p.net_salary) as avg_net_salary,
          SUM(p.overtime_pay) as total_overtime,
          SUM(p.bonuses) as total_bonuses,
          SUM(p.deductions) as total_deductions
        FROM payroll p
        ${payrollWhereClause}
        GROUP BY TO_CHAR(p.pay_period_start, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12`,
        params
      );

      // Employee status distribution
      const employeeStatusDistribution = await query(
        `SELECT 
          e.status,
          COUNT(*) as count,
          AVG(e.salary) as avg_salary,
          SUM(e.salary) as total_salary
        FROM employees e
        ${whereClause}
        GROUP BY e.status
        ORDER BY count DESC`,
        [tenantId]
      );

      // Top departments by payroll cost
      const topDepartmentsByPayroll = await query(
        `SELECT 
          COALESCE(e.department, 'Unassigned') as department,
          COUNT(DISTINCT p.employee_id) as employees_count,
          SUM(p.gross_salary) as total_gross,
          SUM(p.net_salary) as total_net,
          AVG(p.net_salary) as avg_net_salary
        FROM payroll p
        LEFT JOIN employees e ON p.employee_id = e.id
        ${payrollWhereClause}
        GROUP BY e.department
        ORDER BY total_net DESC
        LIMIT 10`,
        params
      );

      return {
        departmentDistribution: departmentDistribution.rows,
        monthlyAttendanceTrend: monthlyAttendanceTrend.rows,
        attendanceStatusDistribution: attendanceStatusDistribution.rows,
        departmentAttendance: departmentAttendance.rows,
        monthlyPayrollTrend: monthlyPayrollTrend.rows,
        employeeStatusDistribution: employeeStatusDistribution.rows,
        topDepartmentsByPayroll: topDepartmentsByPayroll.rows,
      };
    } catch (error) {
      console.warn('Database not available for HR analytics, using mock data:', error);
      // Return mock analytics data
      return {
        departmentDistribution: [],
        monthlyAttendanceTrend: [],
        attendanceStatusDistribution: [],
        departmentAttendance: [],
        monthlyPayrollTrend: [],
        employeeStatusDistribution: [],
        topDepartmentsByPayroll: [],
      };
    }
  }
}

// Export singleton instance
export const hrService = new HRService();

