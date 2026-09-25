import type { FireDevice } from "../types/FireDevice";

export const createDefaultFireDevice = (overrides: Partial<FireDevice> = {}): FireDevice => ({
  id: 0,
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

// 新建设备表单初始值
export const createFireDeviceForm = (): Partial<FireDevice> => ({
  building_id: 0,
  device_code: "",
  device_type: "EXTINGUISHER",
  floor: "1F",
  location_desc: "",
  install_date: null,
  next_maintenance_at: null
});

export const createFireDeviceResponse = createDefaultFireDevice;
