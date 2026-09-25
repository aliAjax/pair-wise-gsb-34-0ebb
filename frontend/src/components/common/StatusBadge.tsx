import { STATUS_TEXT_ALL } from "../../constants/statusText";

// 状态码 -> 色调类名
const TONE_BY_STATUS: Record<string, string> = {
  NORMAL: "ok",
  REVIEWED: "ok",
  CLOSED: "ok",
  SUBMITTED: "info",
  IN_PROGRESS: "info",
  RECTIFIED: "info",
  PLANNED: "muted",
  PENDING: "muted",
  OPEN: "warn",
  MAINTENANCE: "warn",
  ABNORMAL: "danger",
  FAULT: "danger",
  OVERDUE: "danger",
};

export function StatusBadge({ value, overdue = false }: { value: string; overdue?: boolean }) {
  const tone = TONE_BY_STATUS[value] ?? "muted";
  return (
    <span className={`badge ${tone}`}>
      {STATUS_TEXT_ALL[value] ?? value}
      {overdue && value !== "OVERDUE" ? <em className="badge-sub">逾期</em> : null}
    </span>
  );
}
