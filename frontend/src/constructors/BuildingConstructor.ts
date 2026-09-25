import type { Building } from "../types/Building";

export const createDefaultBuilding = (overrides: Partial<Building> = {}): Building => ({
  id: 0,
  name: "",
  campus: "东区",
  floor_count: 1,
  fire_grade: "二级",
  manager_id: 1,
  address_code: "",
  ...overrides
});

// 新建楼栋表单初始值
export const createBuildingForm = (): Partial<Building> => ({
  name: "",
  campus: "东区",
  floor_count: 1,
  fire_grade: "二级",
  manager_id: 1,
  address_code: ""
});

export const createBuildingResponse = createDefaultBuilding;
