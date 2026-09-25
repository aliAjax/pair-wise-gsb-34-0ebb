import { request } from "./client";
import type { InspectionResult } from "../types/InspectionResult";

const endpoint = "/api/inspection-result";

export interface InspectionResultPayload {
  result_status?: string;
  measured_value?: string;
  photo_url?: string;
  note?: string;
}

export interface InspectionResultFilter {
  task_id?: number;
  device_id?: number;
  result_status?: string;
  unticketed?: boolean;
}

export async function listInspectionResult(filter: InspectionResultFilter = {}): Promise<InspectionResult[]> {
  return request(endpoint, { params: { ...filter } });
}

export async function updateInspectionResult(id: number, payload: InspectionResultPayload): Promise<InspectionResult> {
  return request(`${endpoint}/${id}`, { method: "PUT", body: payload });
}
