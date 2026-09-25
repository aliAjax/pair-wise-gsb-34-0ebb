import { get, post, withQuery } from "./http";
import type { FireDevice } from "../types/FireDevice";
import type { InspectionResult } from "../types/InspectionResult";

const endpoint = "/api/fire-device";

export interface DeviceFilters {
  building_id?: number;
  device_type?: string;
  status?: string;
  floor?: string;
}

export type FireDeviceForm = Omit<FireDevice, "id" | "building_name" | "maintenance_due">;

export async function listFireDevice(filters: DeviceFilters = {}): Promise<FireDevice[]> {
  return get<FireDevice[]>(withQuery(endpoint, filters));
}

export async function getFireDevice(id: number): Promise<FireDevice> {
  return get<FireDevice>(`${endpoint}/${id}`);
}

export async function saveFireDevice(payload: FireDeviceForm): Promise<FireDevice> {
  return post<FireDevice>(endpoint, payload);
}

export async function listDeviceResults(deviceId: number): Promise<InspectionResult[]> {
  return get<InspectionResult[]>(`${endpoint}/${deviceId}/results`);
}
