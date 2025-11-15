export interface Project {
  id: number;
  tenant_id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'backlog';
  due_date?: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Timesheet {
  id: number;
  task_id: number;
  user_id: string;
  hours_spent: number;
  log_date: string;
  notes?: string;
  created_at: string;
}