import { useMemo } from "react";
import type { ResultDraft } from "../types/InspectionTask";

/**
 * 检查单完成进度：按 设备数 × 检查项数 统计已填写草稿，
 * 同时统计异常项数量，驱动 ChecklistPanel 进度条与提交按钮可用态。
 */
export function useChecklistProgress(drafts: Record<string, ResultDraft>, total: number) {
  return useMemo(() => {
    const entries = Object.values(drafts);
    const filled = entries.filter((item) => item.result_status).length;
    const abnormal = entries.filter((item) => item.result_status === "ABNORMAL").length;
    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
    return {
      filled: Math.min(filled, total),
      total,
      percent,
      abnormal,
      isComplete: total > 0 && filled >= total,
    };
  }, [drafts, total]);
}
