import type { Building } from "../types/Building";

/** 楼栋表单默认结构：建档弹窗与楼栋导出共用，禁止页面散写默认值。 */
export const createBuildingForm = (overrides: Partial<Omit<Building, "id">> = {}): Omit<Building, "id"> => ({
  name: "",
  campus: "",
  floor_count: 1,
  fire_grade: "二级",
  manager_id: 1,
  address_code: "",
  ...overrides
});

export const createDefaultBuilding = createBuildingForm;
export const createBuildingResponse = createBuildingForm;
