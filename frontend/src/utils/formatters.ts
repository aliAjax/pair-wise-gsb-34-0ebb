import { HAZARD_SEVERITY_TEXT } from "../constants/HazardSeverity";
import { STATUS_TEXT_ALL } from "../constants/statusText";
import type { HazardSeverity } from "../types/HazardSeverity";

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("zh-CN", { hour12: false });
};

export const formatStatus = (value: string) => STATUS_TEXT_ALL[value] ?? value.replace(/_/g, " ");

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;

export const formatRisk = (value: string) => HAZARD_SEVERITY_TEXT[value as HazardSeverity] ?? value;

export const todayStr = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
};

// 期限已过且未关闭 -> 逾期
export const isOverdueDate = (deadline?: string | null, closed?: boolean) =>
  Boolean(deadline) && !closed && String(deadline).slice(0, 10) < todayStr();

export const monthKey = (value?: string | null) => (value ? String(value).slice(0, 7) : "");

export const monthLabel = (key: string) => {
  const [, m] = key.split("-");
  return `${Number(m)}月`;
};

export const recentMonths = (count: number): string[] => {
  const keys: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 0; i < count; i += 1) {
    const mm = String(cursor.getMonth() + 1).padStart(2, "0");
    keys.unshift(`${cursor.getFullYear()}-${mm}`);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return keys;
};
