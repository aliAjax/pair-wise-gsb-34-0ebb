import { get, post, withQuery } from "./http";
import type { HazardTicket } from "../types/HazardTicket";

const endpoint = "/api/hazard-ticket";

export interface DispatchForm {
  result_id: number;
  severity: string;
  owner_id: number;
  deadline: string;
}

export interface TicketFilters {
  rectify_status?: string;
  severity?: string;
  owner_id?: number;
}

export async function listHazardTicket(filters: TicketFilters = {}): Promise<HazardTicket[]> {
  return get<HazardTicket[]>(withQuery(endpoint, filters));
}

export async function dispatchHazardTicket(payload: DispatchForm): Promise<HazardTicket> {
  return post<HazardTicket>(endpoint, payload);
}

export async function rectifyHazardTicket(id: number, rectify_note: string): Promise<HazardTicket> {
  return post<HazardTicket>(`${endpoint}/${id}/rectify`, { rectify_note });
}

export async function closeHazardTicket(
  id: number,
  passed: boolean,
  note: string
): Promise<HazardTicket> {
  return post<HazardTicket>(`${endpoint}/${id}/close`, { passed, note });
}
