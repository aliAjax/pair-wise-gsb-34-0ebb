import { request } from "./client";
import type { InspectionTask } from "../types/InspectionTask";

const endpoint = "/api/inspection-task";

export interface InspectionTaskPayload {
  building_id?: number;
  plan_date?: string;
  task_type?: string;
  checklist_version?: string;
}

export interface InspectionTaskFilter {
  building_id?: number;
  status?: string;
  inspector_id?: number;
}

export async function listInspectionTask(filter: InspectionTaskFilter = {}): Promise<InspectionTask[]> {
  return request(endpoint, { params: { ...filter } });
}

export async function createInspectionTask(payload: InspectionTaskPayload): Promise<InspectionTask> {
  return request(endpoint, { method: "POST", body: payload });
}

export async function claimInspectionTask(id: number): Promise<InspectionTask> {
  return request(`${endpoint}/${id}/claim`, { method: "POST" });
}

export async function submitInspectionTask(id: number): Promise<InspectionTask> {
  return request(`${endpoint}/${id}/submit`, { method: "POST" });
}

export async function reviewInspectionTask(id: number): Promise<InspectionTask> {
  return request(`${endpoint}/${id}/review`, { method: "POST" });
}
