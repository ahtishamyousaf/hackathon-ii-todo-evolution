-- Migration 006: Add Task Templates and Notifications
-- Adds task_templates and notifications tables

-- Task Templates table
CREATE TABLE IF NOT EXISTS task_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    template_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_templates_user_id ON task_templates(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    related_task_id INTEGER,
    related_user_id INTEGER,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Comments
COMMENT ON TABLE task_templates IS 'Reusable task templates';
COMMENT ON COLUMN task_templates.template_data IS 'Template configuration as JSON';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Notification type (task_assigned, task_due, comment_added, etc.)';
