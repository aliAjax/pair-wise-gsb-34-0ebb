export type DeviceStatusValue = "NORMAL" | "FAULT" | "MAINTENANCE" | "SCRAPPED";

export interface FireDevice {
  id: number;
  building_id: number;
  building_name?: string | null;
  device_code: string;
  device_type: string;
  floor: string;
  location_desc: string;
  install_date: string | null;
  status: DeviceStatusValue | string;
  next_maintenance_at: string | null;
  maintenance_due?: boolean;
}
