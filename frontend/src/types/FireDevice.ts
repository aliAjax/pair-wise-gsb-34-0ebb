import type { DeviceStatus } from "./DeviceStatus";
import type { DeviceType } from "./DeviceType";

export interface FireDevice {
  id: number;
  building_id: number;
  device_code: string;
  device_type: DeviceType;
  floor: string;
  location_desc: string;
  install_date: string | null;
  status: DeviceStatus;
  next_maintenance_at: string | null;
}
