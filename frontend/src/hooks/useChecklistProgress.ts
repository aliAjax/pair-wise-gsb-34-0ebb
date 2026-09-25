import { useMemo } from "react";
import type { InspectionResult } from "../types/InspectionResult";

// 巡检检查项填写进度：已填 / 总数 / 异常数 / 是否可提交
export function useChecklistProgress(rows: InspectionResult[] = []) {
  return useMemo(() => {
    const total = rows.length;
    const filled = rows.filter((row) => row.result_status !== "PENDING").length;
    const abnormal = rows.filter((row) => row.result_status === "ABNORMAL").length;
    const percent = total === 0 ? 0 : Math.round((filled / total) * 100);
    return { total, filled, abnormal, percent, allFilled: total > 0 && filled === total };
  }, [rows]);
}
