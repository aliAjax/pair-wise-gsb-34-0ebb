import type { ResultStatus } from "./ResultStatus";

export interface InspectionResult {
  id: number;
  task_id: number;
  device_id: number;
  item_code: string;
  result_status: ResultStatus;
  measured_value: string;
  photo_url: string;
  note: string;
  created_at: string | null;
}
