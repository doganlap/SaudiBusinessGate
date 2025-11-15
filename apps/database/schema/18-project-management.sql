-- Projects Table
CREATE TABLE pm_projects (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not_started',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE pm_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES pm_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    due_date DATE,
    assignee_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timesheets Table
CREATE TABLE pm_timesheets (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES pm_tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    hours_spent NUMERIC(5, 2) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_pm_projects_tenant_id ON pm_projects(tenant_id);
CREATE INDEX idx_pm_tasks_project_id ON pm_tasks(project_id);
CREATE INDEX idx_pm_timesheets_task_id ON pm_timesheets(task_id);

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at_on_pm_projects() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pm_projects_updated_at_trigger
BEFORE UPDATE ON pm_projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_pm_projects();

CREATE OR REPLACE FUNCTION set_updated_at_on_pm_tasks() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pm_tasks_updated_at_trigger
BEFORE UPDATE ON pm_tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_pm_tasks();