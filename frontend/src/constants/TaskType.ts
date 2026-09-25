import type { TaskType } from "../types/TaskType";

export const TASK_TYPES: TaskType[] = ["DAILY", "MONTHLY", "QUARTERLY", "SPECIAL"];

export const TASK_TYPE_TEXT: Record<TaskType, string> = {
  DAILY: "日常巡检",
  MONTHLY: "月度巡检",
  QUARTERLY: "季度维保",
  SPECIAL: "专项检查",
};
