import type { ChecklistItem } from "../types/InspectionTask";

// 与后端 constants/checklist_items.py 保持一致。
export const CHECKLIST_ITEMS: Record<string, ChecklistItem[]> = {
  EXTINGUISHER: [
    { item_code: "PRESSURE", item_name: "压力表指针在绿区" },
    { item_code: "SEAL", item_name: "铅封与保险销完好" },
    { item_code: "WEIGHT", item_name: "灭火剂重量达标" },
    { item_code: "EXPIRY", item_name: "在有效期内" },
  ],
  HYDRANT: [
    { item_code: "WATER_PRESSURE", item_name: "出水压力正常" },
    { item_code: "VALVE", item_name: "阀门启闭灵活无渗漏" },
    { item_code: "HOSE", item_name: "水带水枪齐全完好" },
    { item_code: "CABINET", item_name: "箱门完好前方无遮挡" },
  ],
  SMOKE_DETECTOR: [
    { item_code: "ALARM_TEST", item_name: "模拟报警测试正常" },
    { item_code: "INDICATOR", item_name: "巡检指示灯正常" },
    { item_code: "COVER", item_name: "外观清洁无遮挡" },
  ],
  SPRINKLER: [
    { item_code: "PIPE_PRESSURE", item_name: "管网压力正常" },
    { item_code: "HEAD", item_name: "喷头无遮挡无损坏" },
    { item_code: "ALARM_VALVE", item_name: "报警阀组工作正常" },
  ],
  EXIT_LIGHT: [
    { item_code: "LIGHTING", item_name: "应急点亮正常" },
    { item_code: "DIRECTION", item_name: "疏散指示方向正确" },
    { item_code: "BATTERY", item_name: "备用电源续航正常" },
  ],
};
