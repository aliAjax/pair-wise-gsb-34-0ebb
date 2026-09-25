/** 隐患派单表单默认结构（不包含 result_id，由被派单的异常结果带入）。 */
export const createHazardTicketForm = (
  overrides: Partial<{ severity: string; owner_id: number; deadline: string }> = {}
) => ({
  severity: "MEDIUM",
  owner_id: 0,
  deadline: "",
  ...overrides
});

export const createDefaultHazardTicket = createHazardTicketForm;
export const createHazardTicketResponse = createHazardTicketForm;
