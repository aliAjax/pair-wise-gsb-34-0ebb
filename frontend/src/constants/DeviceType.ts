import type { DeviceType } from "../types/DeviceType";

export const DEVICE_TYPES: DeviceType[] = ["EXTINGUISHER", "HYDRANT", "SMOKE_DETECTOR", "SPRINKLER", "EXIT_LIGHT"];

export const DEVICE_TYPE_TEXT: Record<DeviceType, string> = {
  EXTINGUISHER: "灭火器",
  HYDRANT: "室内消火栓",
  SMOKE_DETECTOR: "烟感探测器",
  SPRINKLER: "自动喷淋",
  EXIT_LIGHT: "应急疏散指示灯",
};
