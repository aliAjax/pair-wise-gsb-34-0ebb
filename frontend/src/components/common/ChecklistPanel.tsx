import type { ChecklistItem, ResultDraft, TaskDevice } from "../../types/InspectionTask";
import { StatusBadge } from "./StatusBadge";

export function draftKey(deviceId: number, itemCode: string) {
  return `${deviceId}:${itemCode}`;
}

/**
 * 巡检检查单面板：按设备 × 检查项渲染 正常/异常 选择、实测值与备注。
 * 只读模式用于复核与历史查看。
 */
export function ChecklistPanel({
  devices,
  items,
  drafts,
  readonly = false,
  onChange,
}: {
  devices: TaskDevice[];
  items: ChecklistItem[];
  drafts: Record<string, ResultDraft>;
  readonly?: boolean;
  onChange?: (deviceId: number, itemCode: string, patch: Partial<ResultDraft>) => void;
}) {
  return (
    <div className="checklist">
      {devices.map((device) => (
        <section key={device.device_id} className="checklist-device">
          <header>
            <strong>{device.device_code}</strong>
            <span className="muted">{device.floor} · {device.location_desc}</span>
            <StatusBadge value={device.status} />
          </header>
          <div className="checklist-items">
            {items.map((item) => {
              const key = draftKey(device.device_id, item.item_code);
              const draft = drafts[key];
              const status = draft?.result_status ?? "";
              return (
                <div key={key} className={"checklist-item" + (status === "ABNORMAL" ? " abnormal" : "")}>
                  <div className="checklist-item-head">
                    <span className="item-name">{item.item_name}</span>
                    {readonly ? (
                      draft ? (
                        <StatusBadge value={status || "NORMAL"} />
                      ) : (
                        <span className="muted">未填写</span>
                      )
                    ) : (
                      <div className="segmented">
                        <button
                          type="button"
                          className={status === "NORMAL" ? "active ok" : ""}
                          onClick={() => onChange?.(device.device_id, item.item_code, { result_status: "NORMAL" })}
                        >
                          正常
                        </button>
                        <button
                          type="button"
                          className={status === "ABNORMAL" ? "active bad" : ""}
                          onClick={() => onChange?.(device.device_id, item.item_code, { result_status: "ABNORMAL" })}
                        >
                          异常
                        </button>
                      </div>
                    )}
                  </div>
                  {readonly ? (
                    <div className="checklist-item-body">
                      {draft?.measured_value && <span>实测：{draft.measured_value}</span>}
                      {draft?.note && <span>备注：{draft.note}</span>}
                    </div>
                  ) : (
                    <div className="checklist-item-body">
                      <input
                        placeholder="实测值（选填）"
                        value={draft?.measured_value ?? ""}
                        onChange={(e) => onChange?.(device.device_id, item.item_code, { measured_value: e.target.value })}
                      />
                      <input
                        placeholder={status === "ABNORMAL" ? "异常说明（必填）" : "备注（选填）"}
                        value={draft?.note ?? ""}
                        onChange={(e) => onChange?.(device.device_id, item.item_code, { note: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
