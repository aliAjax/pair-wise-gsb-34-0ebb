import { get, post, put } from "./http";
import type { Building } from "../types/Building";

const endpoint = "/api/building";

export type BuildingForm = Omit<Building, "id">;

export async function listBuilding(): Promise<Building[]> {
  return get<Building[]>(endpoint);
}

export async function saveBuilding(payload: BuildingForm): Promise<Building> {
  return post<Building>(endpoint, payload);
}

export async function updateBuilding(id: number, payload: BuildingForm): Promise<Building> {
  return put<Building>(`${endpoint}/${id}`, payload);
}
