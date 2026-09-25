import { statusLabel } from "../constants/statusText";

/** 日期/时间/状态/风险等格式化统一入口，页面与服务共同依赖。 */
export const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleDateString("zh-CN");
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return d.toLocaleString("zh-CN", { hour12: false });
};

export const formatStatus = (value: string) => statusLabel(value);

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatPercent = (value: number) => `${Number(value ?? 0).toFixed(1)}%`;

export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重" }[value] ?? value);

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const currentMonth = () => new Date().toISOString().slice(0, 7);
