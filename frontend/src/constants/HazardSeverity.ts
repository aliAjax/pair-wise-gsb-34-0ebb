import type { HazardSeverity } from "../types/HazardSeverity";

export const HAZARD_SEVERITIES: HazardSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const HAZARD_SEVERITY_TEXT: Record<HazardSeverity, string> = {
  LOW: "低危",
  MEDIUM: "中危",
  HIGH: "高危",
  CRITICAL: "严重",
};
