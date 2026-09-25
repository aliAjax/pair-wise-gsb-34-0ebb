import type { HazardSeverity } from "./HazardSeverity";
import type { RectifyStatus } from "./RectifyStatus";

export interface HazardTicket {
  id: number;
  result_id: number;
  severity: HazardSeverity;
  owner_id: number;
  deadline: string | null;
  rectify_status: RectifyStatus;
  rectify_note: string;
  closed_at: string | null;
  created_at: string | null;
}
