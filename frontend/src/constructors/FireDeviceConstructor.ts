import type { FireDevice } from "../types/FireDevice";

/** 设备登记表单默认结构。 */
export const createFireDeviceForm = (
  overrides: Partial<Omit<FireDevice, "id" | "building_name" | "maintenance_due">> = {}
): Omit<FireDevice, "id" | "building_name" | "maintenance_due"> => ({
  building_id: 0,
  device_code: "",
  device_type: "EXTINGUISHER",
  floor: "1F",
  location_desc: "",
  install_date: null,
  status: "NORMAL",
  next_maintenance_at: null,
  ...overrides
});

export const createDefaultFireDevice = createFireDeviceForm;
export const createFireDeviceResponse = createFireDeviceForm;
