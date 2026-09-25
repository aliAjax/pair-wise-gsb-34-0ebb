import { useEffect, useState } from "react";
import { checklistItemName } from "../../constants/checklistItems";
import { DEVICE_TYPE_TEXT } from "../../constants/DeviceType";
import type { Building } from "../../types/Building";
import type { FireDevice } from "../../types/FireDevice";
import type { InspectionResult } from "../../types/InspectionResult";
import type { ResultStatus } from "../../types/ResultStatus";
import { DeviceLocationCell } from "./DeviceLocationCell";
import { StatusBadge } from "./StatusBadge";

export interface ChecklistGroup {
  device: FireDevice;
  building?: Building;
  items: InspectionResult[];
}

interface PanelProps {
  groups: ChecklistGroup[];
  editable: boolean;
  onJudge: (result: InspectionResult, status: ResultStatus) => void;
  onFieldSave: (result: InspectionResult, patch: { measured_value?: string; note?: string }) => void;
}

function ChecklistItemRow({
  result,
  device,
  editable,
  onJudge,
  onFieldSave,
}: {
  result: InspectionResult;
  device: FireDevice;
  editable: boolean;
  onJudge: PanelProps["onJudge"];
  onFieldSave: PanelProps["onFieldSave"];
}) {
  const [measured, setMeasured] = useState(result.measured_value);
  const [note, setNote] = useState(result.note);

  useEffect(() => {
    setMeasured(result.measured_value);
    setNote(result.note);
  }, [result.measured_value, result.note]);

  const saveMeasured = () => {
    if (measured !== result.measured_value) onFieldSave(result, { measured_value: measured });
  };
  const saveNote = () => {
    if (note !== result.note) onFieldSave(result, { note });
  };

  return (
    <div className={`check-item ${result.result_status === "ABNORMAL" ? "abnormal" : ""}`}>
      <div className="check-head">
        <span className="check-name">{checklistItemName(device.device_type, result.item_code)}</span>
        {editable ? (
          <label className="judge">
            <input
              type="radio"
              name={`judge-${result.id}`}
              checked={result.result_status === "NORMAL"}
              onChange={() => onJudge(result, "NORMAL")}
            />
            正常
          </label>
        ) : null}
        {editable ? (
          <label className="judge danger">
            <input
              type="radio"
              name={`judge-${result.id}`}
              checked={result.result_status === "ABNORMAL"}
              onChange={() => onJudge(result, "ABNORMAL")}
            />
            异常
          </label>
        ) : (
          <StatusBadge value={result.result_status} />
        )}
      </div>
      <div className="check-fields">
        <input
          placeholder="实测值，如 0.8MPa"
          value={measured}
          disabled={!editable}
          onChange={(e) => setMeasured(e.target.value)}
          onBlur={saveMeasured}
        />
        <input
          placeholder="备注说明"
          value={note}
          disabled={!editable}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
        />
      </div>
    </div>
  );
}

// 巡检检查项面板：按设备分组逐项判定，TasksPage 复用
export function ChecklistPanel({ groups, editable, onJudge, onFieldSave }: PanelProps) {
  return (
    <div className="checklist">
      {groups.map(({ device, building, items }) => (
        <section className="check-device" key={device.id}>
          <header>
            <div>
              <strong>{device.device_code}</strong>
              <span className="device-type">{DEVICE_TYPE_TEXT[device.device_type]}</span>
            </div>
            <DeviceLocationCell device={device} building={building} />
          </header>
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              result={item}
              device={device}
              editable={editable}
              onJudge={onJudge}
              onFieldSave={onFieldSave}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
