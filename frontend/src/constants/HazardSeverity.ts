export const HazardSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type HazardSeverity = (typeof HazardSeverity)[number];
export const HazardSeverityText: Record<HazardSeverity, string> = {
  LOW: "低风险",
  MEDIUM: "中风险",
  HIGH: "高风险",
  CRITICAL: "重大风险",
};
