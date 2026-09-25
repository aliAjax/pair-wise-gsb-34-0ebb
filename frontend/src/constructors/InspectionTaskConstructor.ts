import type { InspectionTask } from "../types/InspectionTask";

export const createDefaultInspectionTask = (overrides: Partial<InspectionTask> = {}): InspectionTask => ({
  id: 0,
  building_id: 0,
  inspector_id: null,
  plan_date: null,
  task_type: "MONTHLY",
  status: "PLANNED",
  checklist_version: "v2026.09",
  finished_at: null,
  is_overdue: false,
  ...overrides
});

// 新建巡检任务表单初始值
export const createInspectionTaskForm = (): Partial<InspectionTask> => ({
  building_id: 0,
  plan_date: null,
  task_type: "MONTHLY",
  checklist_version: "v2026.09"
});

export const createInspectionTaskResponse = createDefaultInspectionTask;
