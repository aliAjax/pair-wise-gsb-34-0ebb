import type { InspectionResult } from "./InspectionResult";

export interface Progress {
  filled: number;
  total: number;
}

export interface InspectionTask {
  id: number;
  building_id: number;
  building_name?: string | null;
  inspector_id: number | null;
  inspector_name?: string | null;
  plan_date: string;
  task_type: string;
  status: string;
  checklist_version: string;
  finished_at: string | null;
  progress?: Progress;
}

export interface ChecklistItem {
  item_code: string;
  item_name: string;
}

export interface TaskDevice {
  device_id: number;
  device_code: string;
  floor: string;
  location_desc: string;
  status: string;
}

export interface TaskDetail {
  task: InspectionTask;
  items: ChecklistItem[];
  devices: TaskDevice[];
  results: InspectionResult[];
  result_map: Record<string, number>;
}

export interface ResultDraft {
  device_id: number;
  item_code: string;
  result_status: string;
  measured_value: string;
  photo_url: string;
  note: string;
}
