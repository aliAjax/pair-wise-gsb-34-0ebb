import { request } from "./client";
import type { HazardTicket } from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

export interface HazardTicketPayload {
  result_id?: number;
  severity?: string;
  owner_id?: number;
  deadline?: string;
}

export interface HazardTicketFilter {
  rectify_status?: string;
  severity?: string;
  result_id?: number;
}

export async function listHazardTicket(filter: HazardTicketFilter = {}): Promise<HazardTicket[]> {
  return request(endpoint, { params: { ...filter } });
}

export async function dispatchHazardTicket(payload: HazardTicketPayload): Promise<HazardTicket> {
  return request(endpoint, { method: "POST", body: payload });
}

export async function rectifyHazardTicket(id: number, rectify_note: string): Promise<HazardTicket> {
  return request(`${endpoint}/${id}/rectify`, { method: "POST", body: { rectify_note } });
}

export async function closeHazardTicket(id: number): Promise<HazardTicket> {
  return request(`${endpoint}/${id}/close`, { method: "POST" });
}
