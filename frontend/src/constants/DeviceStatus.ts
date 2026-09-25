export const DeviceStatus = ["NORMAL", "FAULT", "MAINTENANCE", "SCRAPPED"] as const;
export type DeviceStatus = (typeof DeviceStatus)[number];
export const DeviceStatusText: Record<DeviceStatus, string> = {
  NORMAL: "正常",
  FAULT: "故障",
  MAINTENANCE: "维保中",
  SCRAPPED: "已报废",
};
