export type ResultStatusValue = "NORMAL" | "ABNORMAL";

export interface InspectionResult {
  id: number;
  task_id: number;
  device_id: number;
  device_code?: string | null;
  item_code: string;
  item_name?: string | null;
  result_status: ResultStatusValue | string;
  measured_value: string;
  photo_url: string;
  note: string;
  ticket_id?: number | null;
  updated_at?: string | null;
  task_status?: string;
  building_id?: number;
}
