-- HR Module Database Schema
-- Human resources management with employees, payroll, and attendance

-- HR Employees Table
CREATE TABLE IF NOT EXISTS hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100) NOT NULL, -- EMP001, EMP002, etc.
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(255),
    position VARCHAR(255),
    manager_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active', -- active, inactive, terminated, on_leave
    employment_type VARCHAR(50) DEFAULT 'full_time', -- full_time, part_time, contract, intern
    salary DECIMAL(15,2),
    hourly_rate DECIMAL(10,2),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for employee_id per tenant
    UNIQUE(tenant_id, employee_id),
    
    -- Indexes
    INDEX idx_hr_employees_tenant (tenant_id),
    INDEX idx_hr_employees_status (employment_status),
    INDEX idx_hr_employees_department (department),
    INDEX idx_hr_employees_manager (manager_id),
    INDEX idx_hr_employees_hire_date (hire_date)
);

-- HR Payroll Records Table
CREATE TABLE IF NOT EXISTS hr_payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    bonuses DECIMAL(15,2) DEFAULT 0,
    commissions DECIMAL(15,2) DEFAULT 0,
    gross_pay DECIMAL(15,2) NOT NULL,
    
    -- Deductions
    federal_tax DECIMAL(15,2) DEFAULT 0,
    state_tax DECIMAL(15,2) DEFAULT 0,
    social_security DECIMAL(15,2) DEFAULT 0,
    medicare DECIMAL(15,2) DEFAULT 0,
    health_insurance DECIMAL(15,2) DEFAULT 0,
    dental_insurance DECIMAL(15,2) DEFAULT 0,
    retirement_401k DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) NOT NULL,
    
    net_pay DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, processed, paid
    processed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_hr_payroll_tenant (tenant_id),
    INDEX idx_hr_payroll_employee (employee_id),
    INDEX idx_hr_payroll_period (pay_period_start, pay_period_end),
    INDEX idx_hr_payroll_status (status),
    INDEX idx_hr_payroll_pay_date (pay_date)
);

-- HR Attendance Records Table
CREATE TABLE IF NOT EXISTS hr_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    break_duration_minutes INTEGER DEFAULT 0,
    hours_worked DECIMAL(4,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'present', -- present, absent, late, half_day, remote, sick_leave, vacation
    location VARCHAR(255) DEFAULT 'office', -- office, home, client_site, etc.
    notes TEXT,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for one record per employee per day
    UNIQUE(tenant_id, employee_id, attendance_date),
    
    -- Indexes
    INDEX idx_hr_attendance_tenant (tenant_id),
    INDEX idx_hr_attendance_employee (employee_id),
    INDEX idx_hr_attendance_date (attendance_date),
    INDEX idx_hr_attendance_status (status)
);

-- HR Leave Requests Table
CREATE TABLE IF NOT EXISTS hr_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL, -- vacation, sick, personal, maternity, paternity, bereavement
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_hr_leave_tenant (tenant_id),
    INDEX idx_hr_leave_employee (employee_id),
    INDEX idx_hr_leave_status (status),
    INDEX idx_hr_leave_dates (start_date, end_date),
    INDEX idx_hr_leave_type (leave_type)
);

-- Sample data for testing
INSERT INTO hr_employees (tenant_id, employee_id, first_name, last_name, email, department, position, hire_date, employment_status, salary) VALUES
('default-tenant', 'EMP001', 'Sarah', 'Johnson', 'sarah.johnson@company.com', 'Sales', 'Sales Manager', '2023-01-15', 'active', 85000),
('default-tenant', 'EMP002', 'Mike', 'Chen', 'mike.chen@company.com', 'Engineering', 'Software Engineer', '2023-03-20', 'active', 95000),
('default-tenant', 'EMP003', 'Alex', 'Rodriguez', 'alex.rodriguez@company.com', 'Marketing', 'Marketing Specialist', '2023-06-10', 'active', 65000),
('default-tenant', 'EMP004', 'Lisa', 'Anderson', 'lisa.anderson@company.com', 'HR', 'HR Manager', '2022-11-01', 'active', 75000),
('default-tenant', 'EMP005', 'David', 'Wilson', 'david.wilson@company.com', 'Finance', 'Financial Analyst', '2023-08-15', 'active', 70000)
ON CONFLICT (tenant_id, employee_id) DO NOTHING;

-- Sample payroll data
INSERT INTO hr_payroll (tenant_id, employee_id, pay_period_start, pay_period_end, pay_date, base_salary, overtime_pay, bonuses, gross_pay, total_deductions, net_pay, status) VALUES
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP001' AND tenant_id = 'default-tenant'), '2024-01-01', '2024-01-31', '2024-01-31', 7083, 450, 1000, 8533, 1200, 7333, 'paid'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP002' AND tenant_id = 'default-tenant'), '2024-01-01', '2024-01-31', '2024-01-31', 7917, 600, 500, 9017, 1400, 7617, 'paid'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP003' AND tenant_id = 'default-tenant'), '2024-02-01', '2024-02-29', '2024-02-29', 5417, 200, 300, 5917, 950, 4967, 'processed')
ON CONFLICT DO NOTHING;

-- Sample attendance data
INSERT INTO hr_attendance (tenant_id, employee_id, attendance_date, check_in_time, check_out_time, hours_worked, status, location) VALUES
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP001' AND tenant_id = 'default-tenant'), '2024-01-15', '09:00', '17:30', 8.5, 'present', 'office'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP002' AND tenant_id = 'default-tenant'), '2024-01-15', '09:15', '18:00', 8.75, 'late', 'office'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP003' AND tenant_id = 'default-tenant'), '2024-01-15', '09:00', '17:00', 8.0, 'remote', 'home'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP004' AND tenant_id = 'default-tenant'), '2024-01-15', '09:30', '13:30', 4.0, 'half_day', 'office'),
('default-tenant', (SELECT id FROM hr_employees WHERE employee_id = 'EMP005' AND tenant_id = 'default-tenant'), '2024-01-15', NULL, NULL, 0, 'absent', '')
ON CONFLICT (tenant_id, employee_id, attendance_date) DO NOTHING;

-- Triggers for updated_at
CREATE TRIGGER update_hr_employees_updated_at BEFORE UPDATE ON hr_employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_payroll_updated_at BEFORE UPDATE ON hr_payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_attendance_updated_at BEFORE UPDATE ON hr_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_leave_requests_updated_at BEFORE UPDATE ON hr_leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
