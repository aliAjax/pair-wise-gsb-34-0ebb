import { useMemo } from "react";
import type { HazardTicket } from "../types/HazardTicket";
import type { Role } from "../types/Role";
import { isOverdueDate } from "../utils/formatters";

// 隐患整改单在当前角色下的可执行动作与逾期状态
export function useHazardFlow(ticket: HazardTicket, role: Role | undefined) {
  return useMemo(() => {
    const closed = ticket.rectify_status === "CLOSED";
    const canRectify = ticket.rectify_status === "OPEN" && (role === "SUPERVISOR" || role === "MAINTAINER");
    const canClose = ticket.rectify_status === "RECTIFIED" && role === "SUPERVISOR";
    const isOverdue = isOverdueDate(ticket.deadline, closed);
    const nextStep = closed ? "已闭环" : ticket.rectify_status === "RECTIFIED" ? "等待主管复验" : "等待整改反馈";
    return { canRectify, canClose, isOverdue, closed, nextStep };
  }, [ticket, role]);
}
