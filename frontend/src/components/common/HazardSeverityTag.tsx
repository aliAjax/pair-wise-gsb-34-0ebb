import { HAZARD_SEVERITY_TEXT } from "../../constants/HazardSeverity";
import type { HazardSeverity } from "../../types/HazardSeverity";

const TONE_BY_SEVERITY: Record<HazardSeverity, string> = {
  LOW: "sev-low",
  MEDIUM: "sev-medium",
  HIGH: "sev-high",
  CRITICAL: "sev-critical",
};

export function HazardSeverityTag({ severity }: { severity: HazardSeverity }) {
  return <span className={`severity-tag ${TONE_BY_SEVERITY[severity] ?? ""}`}>{HAZARD_SEVERITY_TEXT[severity] ?? severity}</span>;
}
