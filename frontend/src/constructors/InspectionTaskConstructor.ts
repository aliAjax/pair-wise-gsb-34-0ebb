import type { InspectionTask } from "../types/InspectionTask";

/** 巡检计划表单默认结构。 */
export const createInspectionTaskForm = (
  overrides: Partial<Omit<InspectionTask, "id" | "inspector_id" | "status" | "finished_at" | "building_name" | "inspector_name" | "progress">> = {}
) => ({
  building_id: 0,
  plan_date: "",
  task_type: "EXTINGUISHER",
  checklist_version: "v1.0",
  ...overrides
});

export const createDefaultInspectionTask = createInspectionTaskForm;
export const createInspectionTaskResponse = createInspectionTaskForm;
