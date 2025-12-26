export interface TaskTemplate {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  template_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  description?: string;
  template_data: Record<string, any>;
}

export interface TemplateUpdate {
  name?: string;
  description?: string;
  template_data?: Record<string, any>;
}
