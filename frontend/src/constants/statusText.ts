import { DEVICE_STATUS_TEXT } from "./DeviceStatus";
import { DEVICE_TYPE_TEXT } from "./DeviceType";
import { HAZARD_SEVERITY_TEXT } from "./HazardSeverity";
import { INSPECTION_STATUS_TEXT } from "./InspectionStatus";
import { RECTIFY_STATUS_TEXT } from "./RectifyStatus";
import { RESULT_STATUS_TEXT } from "./ResultStatus";
import { TASK_TYPE_TEXT } from "./TaskType";

export const STATUS_TEXT = {
  DeviceType: DEVICE_TYPE_TEXT,
  InspectionStatus: INSPECTION_STATUS_TEXT,
  HazardSeverity: HAZARD_SEVERITY_TEXT,
  DeviceStatus: DEVICE_STATUS_TEXT,
  ResultStatus: RESULT_STATUS_TEXT,
  RectifyStatus: RECTIFY_STATUS_TEXT,
  TaskType: TASK_TYPE_TEXT
};

// 所有状态码 -> 中文文案的扁平映射，供 StatusBadge / formatters 使用
export const STATUS_TEXT_ALL: Record<string, string> = {
  ...INSPECTION_STATUS_TEXT,
  ...DEVICE_STATUS_TEXT,
  ...RESULT_STATUS_TEXT,
  ...RECTIFY_STATUS_TEXT,
  ...TASK_TYPE_TEXT,
  ...DEVICE_TYPE_TEXT,
  ...HAZARD_SEVERITY_TEXT
};
