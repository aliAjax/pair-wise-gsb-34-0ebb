import type { InspectionStatus } from "./InspectionStatus";
import type { TaskType } from "./TaskType";

export interface InspectionTask {
  id: number;
  building_id: number;
  inspector_id: number | null;
  plan_date: string | null;
  task_type: TaskType;
  status: InspectionStatus;
  checklist_version: string;
  finished_at: string | null;
  is_overdue: boolean;
}
