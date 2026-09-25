import type { Building } from "../../types/Building";
import type { FireDevice } from "../../types/FireDevice";

// 设备位置单元格：楼栋 · 楼层 · 位置描述
export function DeviceLocationCell({
  device,
  building,
}: {
  device: Pick<FireDevice, "floor" | "location_desc">;
  building?: Building;
}) {
  return (
    <div className="location-cell">
      <strong>{building ? building.name : "—"}</strong>
      <span>
        {device.floor} · {device.location_desc || "未填写位置"}
      </span>
    </div>
  );
}
