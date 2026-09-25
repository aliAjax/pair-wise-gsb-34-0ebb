import type { RectifyStatus } from "../types/RectifyStatus";

export const RECTIFY_STATUSES: RectifyStatus[] = ["OPEN", "RECTIFIED", "CLOSED"];

export const RECTIFY_STATUS_TEXT: Record<RectifyStatus, string> = {
  OPEN: "待整改",
  RECTIFIED: "待复验",
  CLOSED: "已关闭",
};
