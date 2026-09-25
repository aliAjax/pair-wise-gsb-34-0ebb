import type { ResultStatus } from "../types/ResultStatus";

export const RESULT_STATUSES: ResultStatus[] = ["PENDING", "NORMAL", "ABNORMAL"];

export const RESULT_STATUS_TEXT: Record<ResultStatus, string> = {
  PENDING: "待检查",
  NORMAL: "正常",
  ABNORMAL: "异常",
};
