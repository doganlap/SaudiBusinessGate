import { query } from '@/lib/db/connection';
import { Project, Task, Timesheet } from '@/types/project-management';

export class ProjectManagementService {
  // Project CRUD Operations

  static async getProjects(tenantId: string, filters?: { status?: string; limit?: number; offset?: number }): Promise<Project[]> {
    let sql = 'SELECT * FROM pm_projects WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Project>(sql, params);
    return result.rows;
  }

  static async createProject(tenantId: string, projectData: Omit<Project, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const result = await query<Project>(
      `INSERT INTO pm_projects (tenant_id, name, description, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenantId, projectData.name, projectData.description, projectData.status || 'not_started', projectData.start_date, projectData.end_date]
    );
    return result.rows[0];
  }

  // Task CRUD Operations

  static async getTasks(projectId: number, filters?: { status?: string; assignee_id?: string; limit?: number; offset?: number }): Promise<Task[]> {
    let sql = 'SELECT * FROM pm_tasks WHERE project_id = $1';
    const params: any[] = [projectId];
    let paramIndex = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.assignee_id) {
      sql += ` AND assignee_id = $${paramIndex}`;
      params.push(filters.assignee_id);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Task>(sql, params);
    return result.rows;
  }

  static async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const result = await query<Task>(
      `INSERT INTO pm_tasks (project_id, title, description, status, due_date, assignee_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [taskData.project_id, taskData.title, taskData.description, taskData.status || 'todo', taskData.due_date, taskData.assignee_id]
    );
    return result.rows[0];
  }

  // Timesheet CRUD Operations

  static async getTimesheets(taskId: number, filters?: { user_id?: string; limit?: number; offset?: number }): Promise<Timesheet[]> {
    let sql = 'SELECT * FROM pm_timesheets WHERE task_id = $1';
    const params: any[] = [taskId];
    let paramIndex = 2;

    if (filters?.user_id) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    sql += ' ORDER BY log_date DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query<Timesheet>(sql, params);
    return result.rows;
  }

  static async createTimesheet(timesheetData: Omit<Timesheet, 'id' | 'created_at'>): Promise<Timesheet> {
    const result = await query<Timesheet>(
      `INSERT INTO pm_timesheets (task_id, user_id, hours_spent, log_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [timesheetData.task_id, timesheetData.user_id, timesheetData.hours_spent, timesheetData.log_date, timesheetData.notes]
    );
    return result.rows[0];
  }
}