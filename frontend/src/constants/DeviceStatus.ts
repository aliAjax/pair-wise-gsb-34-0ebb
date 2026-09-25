import type { DeviceStatus } from "../types/DeviceStatus";

export const DEVICE_STATUSES: DeviceStatus[] = ["NORMAL", "FAULT", "MAINTENANCE"];

export const DEVICE_STATUS_TEXT: Record<DeviceStatus, string> = {
  NORMAL: "正常",
  FAULT: "故障",
  MAINTENANCE: "维保中",
};
