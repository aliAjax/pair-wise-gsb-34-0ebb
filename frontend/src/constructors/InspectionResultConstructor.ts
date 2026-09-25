import type { ResultDraft } from "../types/InspectionTask";

/** 单项检查结果表单默认结构。 */
export const createInspectionResultForm = (
  overrides: Partial<ResultDraft> & { device_id: number; item_code: string }
): ResultDraft => ({
  result_status: "NORMAL",
  measured_value: "",
  photo_url: "",
  note: "",
  ...overrides
});

export const createDefaultInspectionResult = createInspectionResultForm;
export const createInspectionResultResponse = createInspectionResultForm;
