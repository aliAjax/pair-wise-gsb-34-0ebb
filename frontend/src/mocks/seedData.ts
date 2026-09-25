// 本地离线骨架数据：真实业务数据统一来自后端 /api，业务代码不再引用本文件。
// 仅保留最小类型形状，供断网时手工调试 UI 骨架使用。
import type { Building } from "../types/Building";
import type { FireDevice } from "../types/FireDevice";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import type { InspectionTask } from "../types/InspectionTask";

export const mockData: {
  building: Building[];
  fireDevice: FireDevice[];
  inspectionTask: InspectionTask[];
  inspectionResult: InspectionResult[];
  hazardTicket: HazardTicket[];
} = {
  building: [],
  fireDevice: [],
  inspectionTask: [],
  inspectionResult: [],
  hazardTicket: [],
};
