import { get, post, put, withQuery } from "./http";
import type { ResultDraft, InspectionTask, TaskDetail } from "../types/InspectionTask";

const endpoint = "/api/inspection-task";

export interface TaskFilters {
  status?: string;
  building_id?: number;
  inspector_id?: number;
}

export interface TaskForm {
  building_id: number;
  plan_date: string;
  task_type: string;
  checklist_version?: string;
}

export async function listInspectionTask(filters: TaskFilters = {}): Promise<InspectionTask[]> {
  return get<InspectionTask[]>(withQuery(endpoint, filters));
}

export async function getInspectionTask(id: number): Promise<TaskDetail> {
  return get<TaskDetail>(`${endpoint}/${id}`);
}

export async function saveInspectionTask(payload: TaskForm): Promise<InspectionTask> {
  return post<InspectionTask>(endpoint, payload);
}

export async function claimTask(id: number): Promise<TaskDetail> {
  return post<TaskDetail>(`${endpoint}/${id}/claim`);
}

export async function saveTaskResults(id: number, results: ResultDraft[]): Promise<TaskDetail> {
  return put<TaskDetail>(`${endpoint}/${id}/results`, { results });
}

export async function submitTask(id: number): Promise<TaskDetail> {
  return post<TaskDetail>(`${endpoint}/${id}/submit`);
}

export async function reviewTask(id: number): Promise<TaskDetail> {
  return post<TaskDetail>(`${endpoint}/${id}/review`);
}
