export interface Ticket {
  id: string;
  summary: string;
  type: string;
  priority: string;
  sprints: string[];
  url: string;
}

export interface Config {
  base_url: string;
  projects: string[];
  window_pos: string;
  last_sync_time: number;
}

export interface WindowPosition {
  label: string;
  value: string;
  description?: string;
}
