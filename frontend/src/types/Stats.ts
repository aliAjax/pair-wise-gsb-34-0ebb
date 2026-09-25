import type { HazardTicket } from "./HazardTicket";
import type { InspectionTask } from "./InspectionTask";

export interface AuditLogEntry {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string | null;
}

export interface DashboardSummary {
  building_count: number;
  device_count: number;
  device_status: Record<string, number>;
  task_total: number;
  task_finished: number;
  task_completion_rate: number;
  month_task_total: number;
  month_task_finished: number;
  month_completion_rate: number;
  open_ticket_count: number;
  overdue_ticket_count: number;
  high_risk_open_count: number;
  recent_tasks: InspectionTask[];
  overdue_tickets: HazardTicket[];
  high_risk_tickets: HazardTicket[];
  recent_logs: AuditLogEntry[];
}

export interface BuildingReportRow {
  building_id: number;
  building_name: string;
  task_total: number;
  task_finished: number;
  completion_rate: number;
  device_count: number;
  open_ticket_count: number;
  overdue_ticket_count: number;
}

export interface TrendPoint {
  month: string;
  task_planned: number;
  task_finished: number;
  completion_rate: number;
  ticket_closed: number;
}

export interface MonthlyReport {
  month: string;
  task_planned: number;
  task_finished: number;
  completion_rate: number;
  ticket_created: number;
  ticket_closed: number;
  rectify_rate: number;
  device_total: number;
  device_fault_count: number;
  device_fault_rate: number;
  by_building: BuildingReportRow[];
  trend: TrendPoint[];
}
