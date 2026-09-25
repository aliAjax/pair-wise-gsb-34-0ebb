import { useMemo } from "react";
import type { HazardTicket } from "../types/HazardTicket";

/** 隐患整改流：按 ASSIGNED -> RECTIFIED -> CLOSED 分组并标记逾期，驱动隐患页 Tab 与操作按钮。 */
export function useHazardFlow(rows: HazardTicket[] = []) {
  return useMemo(() => {
    const open = rows.filter((row) => row.rectify_status !== "CLOSED");
    const assigned = rows.filter((row) => row.rectify_status === "ASSIGNED");
    const rectified = rows.filter((row) => row.rectify_status === "RECTIFIED");
    const closed = rows.filter((row) => row.rectify_status === "CLOSED");
    const overdue = open.filter((row) => row.is_overdue);
    const highRiskOpen = open.filter((row) =>
      row.severity === "HIGH" || row.severity === "CRITICAL"
    );
    return { open, assigned, rectified, closed, overdue, highRiskOpen };
  }, [rows]);
}
