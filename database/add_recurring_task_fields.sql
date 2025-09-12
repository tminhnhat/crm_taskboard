-- ===================================================================
-- ADD RECURRING TASK FUNCTIONALITY TO TASKS TABLE
-- Description: Adds fields to support recurring tasks with daily, weekly, monthly patterns
-- ===================================================================

-- Set search path to use the schema
SET search_path TO dulieu_congviec, public;

-- Add new columns for recurring task functionality
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1, -- Every X days/weeks/months
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE, -- End date for recurrence
ADD COLUMN IF NOT EXISTS recurrence_duration_months INTEGER, -- Duration in months (alternative to end_date)
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE, -- Flag to identify parent recurring tasks
ADD COLUMN IF NOT EXISTS parent_task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE; -- Link child tasks to parent

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_type ON tasks(recurrence_type);
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_end_date ON tasks(recurrence_end_date);

-- Add comments for documentation
COMMENT ON COLUMN tasks.recurrence_type IS 'Type of recurrence: none, daily, weekly, monthly';
COMMENT ON COLUMN tasks.recurrence_interval IS 'Interval for recurrence (every X days/weeks/months)';
COMMENT ON COLUMN tasks.recurrence_end_date IS 'End date for recurring task generation';
COMMENT ON COLUMN tasks.recurrence_duration_months IS 'Duration of recurrence in months';
COMMENT ON COLUMN tasks.is_recurring IS 'Flag to identify if this is a master recurring task';
COMMENT ON COLUMN tasks.parent_task_id IS 'Reference to parent task for child recurring tasks';