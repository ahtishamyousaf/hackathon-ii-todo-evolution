export interface TimeEntry {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  description: string | null;
  is_manual: boolean;
  is_running: boolean;
  created_at: string;
}

export interface TimeEntryCreate {
  task_id: number;
  description?: string;
}

export interface ManualTimeEntryData {
  task_id: number;
  start_time: string;
  end_time: string;
  description?: string;
}

export interface TimeEntryUpdate {
  description?: string;
}
