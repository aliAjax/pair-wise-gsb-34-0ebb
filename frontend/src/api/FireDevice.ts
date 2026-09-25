import { request } from "./client";
import type { FireDevice } from "../types/FireDevice";

const endpoint = "/api/fire-device";

export type FireDevicePayload = Partial<Omit<FireDevice, "id">>;

export interface FireDeviceFilter {
  building_id?: number;
  status?: string;
  device_type?: string;
  floor?: string;
}

export async function listFireDevice(filter: FireDeviceFilter = {}): Promise<FireDevice[]> {
  return request(endpoint, { params: { ...filter } });
}

export async function createFireDevice(payload: FireDevicePayload): Promise<FireDevice> {
  return request(endpoint, { method: "POST", body: payload });
}

export async function updateFireDevice(id: number, payload: FireDevicePayload): Promise<FireDevice> {
  return request(`${endpoint}/${id}`, { method: "PUT", body: payload });
}
