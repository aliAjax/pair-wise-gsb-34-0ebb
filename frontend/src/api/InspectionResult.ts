import { get, withQuery } from "./http";
import type { InspectionResult } from "../types/InspectionResult";

const endpoint = "/api/inspection-result";

export async function listInspectionResult(filters: {
  task_id?: number;
  result_status?: string;
  device_id?: number;
} = {}): Promise<InspectionResult[]> {
  return get<InspectionResult[]>(withQuery(endpoint, filters));
}

export async function listAbnormalPending(): Promise<InspectionResult[]> {
  return get<InspectionResult[]>(`${endpoint}/abnormal/pending`);
}
