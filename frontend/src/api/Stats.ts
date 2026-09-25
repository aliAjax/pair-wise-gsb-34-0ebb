import { get, withQuery } from "./http";
import type { DashboardSummary, MonthlyReport } from "../types/Stats";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return get<DashboardSummary>("/api/dashboard/summary");
}

export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  return get<MonthlyReport>(withQuery("/api/reports/monthly", { month }));
}
