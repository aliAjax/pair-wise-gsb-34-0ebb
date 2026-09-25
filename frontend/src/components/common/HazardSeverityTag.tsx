import { HazardSeverityText } from "../../constants/HazardSeverity";

export function HazardSeverityTag({ severity }: { severity: string }) {
  const text = (HazardSeverityText as Record<string, string>)[severity] ?? severity;
  return (
    <span className={"badge severity " + String(severity).toLowerCase()}>{text}</span>
  );
}
