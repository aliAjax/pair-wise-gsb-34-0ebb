import type { HazardTicket } from "../types/HazardTicket";

export const createDefaultHazardTicket = (overrides: Partial<HazardTicket> = {}): HazardTicket => ({
  id: 0,
  result_id: 0,
  severity: "MEDIUM",
  owner_id: 0,
  deadline: null,
  rectify_status: "OPEN",
  rectify_note: "",
  closed_at: null,
  created_at: null,
  ...overrides
});

// 隐患派单表单初始值
export const createHazardTicketForm = (): Partial<HazardTicket> => ({
  result_id: 0,
  severity: "MEDIUM",
  owner_id: 0,
  deadline: null
});

export const createHazardTicketResponse = createDefaultHazardTicket;
