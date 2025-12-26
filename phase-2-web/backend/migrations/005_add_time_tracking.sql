-- Migration 005: Add Time Tracking
-- Adds time_entries table for tracking time spent on tasks

CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,  -- Duration in seconds
    description VARCHAR(500),
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_user_running ON time_entries(user_id, end_time) WHERE end_time IS NULL;

-- Comments
COMMENT ON TABLE time_entries IS 'Time tracking entries for tasks';
COMMENT ON COLUMN time_entries.duration IS 'Duration in seconds';
COMMENT ON COLUMN time_entries.is_manual IS 'True if manually entered, False if from timer';
