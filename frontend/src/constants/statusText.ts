import { DeviceStatusText } from "./DeviceStatus";
import { DeviceTypeText } from "./DeviceType";
import { HazardSeverityText } from "./HazardSeverity";
import { InspectionStatusText } from "./InspectionStatus";
import { RectifyStatusText } from "./RectifyStatus";
import { ResultStatusText } from "./ResultStatus";
import { UserRoleText } from "./UserRole";

export const STATUS_TEXT = {
  DeviceType: DeviceTypeText,
  InspectionStatus: InspectionStatusText,
  HazardSeverity: HazardSeverityText,
  DeviceStatus: DeviceStatusText,
  RectifyStatus: RectifyStatusText,
  ResultStatus: ResultStatusText,
  UserRole: UserRoleText,
};

/** 跨枚举统一查找中文文案，供 StatusBadge / 筛选器 / 详情展示共用。 */
export function statusLabel(value: string): string {
  for (const map of Object.values(STATUS_TEXT)) {
    if (value in map) {
      return (map as Record<string, string>)[value];
    }
  }
  return String(value ?? "");
}
