import type { DeviceType } from "../types/DeviceType";

// 与后端 constants/checklist_items.py 保持一致：各设备类型的巡检检查项
export const CHECKLIST_ITEMS: Record<DeviceType, Array<{ code: string; name: string }>> = {
  EXTINGUISHER: [
    { code: "PRESSURE", name: "压力表指针在绿区" },
    { code: "SEAL", name: "铅封与保险销完好" },
    { code: "BODY", name: "瓶体无锈蚀变形" },
    { code: "EXPIRY", name: "灭火剂在有效期内" },
  ],
  HYDRANT: [
    { code: "VALVE", name: "阀门启闭灵活无渗漏" },
    { code: "HOSE", name: "水带完好无破损" },
    { code: "GUN", name: "水枪及接口齐全" },
    { code: "PRESSURE", name: "管网静水压力正常" },
  ],
  SMOKE_DETECTOR: [
    { code: "ALARM", name: "报警功能测试正常" },
    { code: "LED", name: "巡检指示灯闪烁正常" },
    { code: "COVER", name: "探测器无遮挡无污染" },
  ],
  SPRINKLER: [
    { code: "HEAD", name: "喷头无堵塞无腐蚀" },
    { code: "PIPE", name: "管网压力正常无渗漏" },
    { code: "VALVE", name: "报警阀组动作正常" },
  ],
  EXIT_LIGHT: [
    { code: "LIGHT", name: "应急点亮功能正常" },
    { code: "BATTERY", name: "蓄电池放电时间达标" },
    { code: "DIRECTION", name: "疏散指示方向正确" },
  ],
};

export function checklistItemName(deviceType: DeviceType, itemCode: string): string {
  const hit = (CHECKLIST_ITEMS[deviceType] ?? []).find((item) => item.code === itemCode);
  return hit ? hit.name : itemCode;
}
