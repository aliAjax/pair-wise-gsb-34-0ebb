import { useEffect, useMemo, useState } from "react";
import { listDeviceResults, type DeviceFilters } from "../api/FireDevice";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { DeviceStatus, DeviceStatusText } from "../constants/DeviceStatus";
import { DeviceType, DeviceTypeText } from "../constants/DeviceType";
import { createFireDeviceForm } from "../constructors/FireDeviceConstructor";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import type { FireDevice } from "../types/FireDevice";
import type { InspectionResult } from "../types/InspectionResult";
import { formatDate } from "../utils/formatters";

export function DevicesPage() {
  const user = useAuthStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR";
  const { rows, loading, error, load, create } = useFireDeviceStore();
  const buildings = useBuildingStore((s) => s.rows);
  const loadBuildings = useBuildingStore((s) => s.load);

  const [filters, setFilters] = useState<DeviceFilters>({});
  const [selected, setSelected] = useState<FireDevice | null>(null);
  const [history, setHistory] = useState<InspectionResult[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(createFireDeviceForm());
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  useEffect(() => {
    load(filters);
  }, [load, filters]);

  useEffect(() => {
    if (selected) {
      listDeviceResults(selected.id).then(setHistory).catch(() => setHistory([]));
    }
  }, [selected]);

  const floors = useMemo(
    () => Array.from(new Set(rows.map((row) => row.floor))).sort(),
    [rows]
  );

  const submitCreate = async () => {
    setSubmitError(null);
    try {
      await create({ ...form, building_id: Number(form.building_id) });
      setShowCreate(false);
      setForm(createFireDeviceForm());
      load(filters);
    } catch (e) {
      setSubmitError((e as Error).message);
    }
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <select
          value={filters.building_id ?? ""}
          onChange={(e) => setFilters({ ...filters, building_id: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">全部楼栋</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={filters.device_type ?? ""}
          onChange={(e) => setFilters({ ...filters, device_type: e.target.value || undefined })}
        >
          <option value="">全部类型</option>
          {DeviceType.map((t) => (
            <option key={t} value={t}>{DeviceTypeText[t]}</option>
          ))}
        </select>
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
        >
          <option value="">全部状态</option>
          {DeviceStatus.map((s) => (
            <option key={s} value={s}>{DeviceStatusText[s]}</option>
          ))}
        </select>
        <select
          value={filters.floor ?? ""}
          onChange={(e) => setFilters({ ...filters, floor: e.target.value || undefined })}
        >
          <option value="">全部楼层</option>
          {floors.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {isSupervisor && (
          <button
            className="primary"
            onClick={() => {
              setForm(createFireDeviceForm({ building_id: buildings[0]?.id ?? 0 }));
              setShowCreate(true);
            }}
          >
            登记设备
          </button>
        )}
      </div>

      {error && <EmptyState title="设备加载失败" hint={error} />}
      {!error && (
        <section className="panel">
          <table className="grid-table">
            <thead>
              <tr>
                <th>设备编号</th>
                <th>类型</th>
                <th>位置</th>
                <th>安装日期</th>
                <th>下次维保</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row)} className="clickable">
                  <td><strong>{row.device_code}</strong></td>
                  <td>{DeviceTypeText[row.device_type as keyof typeof DeviceTypeText] ?? row.device_type}</td>
                  <td>
                    <DeviceLocationCell
                      buildingName={row.building_name}
                      floor={row.floor}
                      locationDesc={row.location_desc}
                    />
                  </td>
                  <td>{formatDate(row.install_date)}</td>
                  <td className={row.maintenance_due ? "danger-text" : ""}>{formatDate(row.next_maintenance_at)}</td>
                  <td><StatusBadge value={row.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr><td colSpan={6}><EmptyState title="没有符合条件的设备" /></td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <Modal title={`设备详情 ${selected?.device_code ?? ""}`} open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="detail-grid">
              <span>楼栋</span><strong>{selected.building_name}</strong>
              <span>位置</span><strong>{selected.floor} · {selected.location_desc}</strong>
              <span>类型</span><strong>{DeviceTypeText[selected.device_type as keyof typeof DeviceTypeText] ?? selected.device_type}</strong>
              <span>状态</span><strong><StatusBadge value={selected.status} /></strong>
              <span>下次维保</span><strong>{formatDate(selected.next_maintenance_at)}</strong>
            </div>
            <h3>巡检历史</h3>
            {history.length === 0 ? (
              <EmptyState title="暂无巡检记录" />
            ) : (
              <div className="table">
                {history.map((r) => (
                  <article key={r.id} className="row">
                    <div>
                      <strong>{r.item_name ?? r.item_code}</strong>
                      {r.note && <span className="muted"> {r.note}</span>}
                    </div>
                    <span className="muted">{formatDate(r.updated_at)}</span>
                    <StatusBadge value={r.result_status} />
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="登记消防设备"
        open={showCreate}
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <button className="ghost" onClick={() => setShowCreate(false)}>取消</button>
            <button className="primary" onClick={submitCreate}>保存</button>
          </>
        }
      >
        <div className="form-grid">
          <label>所属楼栋</label>
          <select
            value={form.building_id}
            onChange={(e) => setForm({ ...form, building_id: Number(e.target.value) })}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <label>设备编号</label>
          <input
            value={form.device_code}
            placeholder="如 EXT-1-003"
            onChange={(e) => setForm({ ...form, device_code: e.target.value })}
          />
          <label>设备类型</label>
          <select
            value={form.device_type}
            onChange={(e) => setForm({ ...form, device_type: e.target.value })}
          >
            {DeviceType.map((t) => (
              <option key={t} value={t}>{DeviceTypeText[t]}</option>
            ))}
          </select>
          <label>楼层</label>
          <input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <label>位置描述</label>
          <input
            value={form.location_desc}
            placeholder="如 走廊东侧"
            onChange={(e) => setForm({ ...form, location_desc: e.target.value })}
          />
          <label>安装日期</label>
          <input
            type="date"
            value={form.install_date ?? ""}
            onChange={(e) => setForm({ ...form, install_date: e.target.value || null })}
          />
          <label>下次维保</label>
          <input
            type="date"
            value={form.next_maintenance_at ?? ""}
            onChange={(e) => setForm({ ...form, next_maintenance_at: e.target.value || null })}
          />
        </div>
        {submitError && <p className="danger-text">{submitError}</p>}
      </Modal>
    </div>
  );
}
