import type { InspectionStatus } from "../types/InspectionStatus";

export const INSPECTION_STATUSES: InspectionStatus[] = ["PLANNED", "IN_PROGRESS", "SUBMITTED", "REVIEWED", "OVERDUE"];

export const INSPECTION_STATUS_TEXT: Record<InspectionStatus, string> = {
  PLANNED: "计划中",
  IN_PROGRESS: "进行中",
  SUBMITTED: "已提交",
  REVIEWED: "已复核",
  OVERDUE: "已逾期",
};
