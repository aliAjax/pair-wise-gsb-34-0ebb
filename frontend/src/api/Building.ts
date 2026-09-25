import { request } from "./client";
import type { Building } from "../types/Building";

const endpoint = "/api/building";

export type BuildingPayload = Partial<Omit<Building, "id">>;

export async function listBuilding(): Promise<Building[]> {
  return request(endpoint);
}

export async function createBuilding(payload: BuildingPayload): Promise<Building> {
  return request(endpoint, { method: "POST", body: payload });
}

export async function updateBuilding(id: number, payload: BuildingPayload): Promise<Building> {
  return request(`${endpoint}/${id}`, { method: "PUT", body: payload });
}
