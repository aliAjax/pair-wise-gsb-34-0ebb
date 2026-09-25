import { statusLabel } from "../../constants/statusText";

export function StatusBadge({ value }: { value: string }) {
  const cls = "badge " + String(value).toLowerCase().replace(/_/g, "-");
  return <span className={cls}>{statusLabel(value)}</span>;
}
