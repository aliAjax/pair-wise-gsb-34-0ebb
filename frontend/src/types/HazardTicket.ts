export interface HazardTicket {
  id: number;
  result_id: number;
  severity: string;
  owner_id: number;
  owner_name?: string | null;
  deadline: string;
  rectify_status: string;
  rectify_note: string;
  closed_at: string | null;
  created_at?: string | null;
  is_overdue?: boolean;
  device_id?: number | null;
  device_code?: string | null;
  device_type?: string | null;
  building_name?: string | null;
  item_code?: string | null;
  result_note?: string | null;
  measured_value?: string | null;
}
