import { useEffect, useMemo, useState } from "react";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { checklistItemName } from "../constants/checklistItems";
import { DEVICE_STATUSES, DEVICE_STATUS_TEXT } from "../constants/DeviceStatus";
import { DEVICE_TYPES, DEVICE_TYPE_TEXT } from "../constants/DeviceType";
import { createBuildingForm } from "../constructors/BuildingConstructor";
import { createFireDeviceForm } from "../constructors/FireDeviceConstructor";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import type { FireDevice } from "../types/FireDevice";
import { formatDate, formatDateTime } from "../utils/formatters";

export function DevicesPage() {
  const user = useAuthStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR";
  const buildings = useBuildingStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);
  const results = useInspectionResultStore((s) => s.rows);

  const [buildingFilter, setBuildingFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deviceModal, setDeviceModal] = useState(false);
  const [deviceForm, setDeviceForm] = useState(createFireDeviceForm());
  const [editTarget, setEditTarget] = useState<FireDevice | null>(null);
  const [editForm, setEditForm] = useState({ floor: "", location_desc: "", status: "NORMAL", next_maintenance_at: "" });
  const [buildingModal, setBuildingModal] = useState(false);
  const [buildingForm, setBuildingForm] = useState(createBuildingForm());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    useBuildingStore.getState().load();
    useFireDeviceStore.getState().load();
    useInspectionResultStore.getState().load();
  }, []);

  const buildingById = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const floors = useMemo(() => Array.from(new Set(devices.map((d) => d.floor))).sort(), [devices]);

  const filtered = useMemo(
    () =>
      devices.filter((d) => {
        if (buildingFilter && d.building_id !== Number(buildingFilter)) return false;
        if (typeFilter && d.device_type !== typeFilter) return false;
        if (statusFilter && d.status !== statusFilter) return false;
        if (floorFilter && d.floor !== floorFilter) return false;
        return true;
      }),
    [devices, buildingFilter, typeFilter, statusFilter, floorFilter]
  );

  const latestByDevice = useMemo(() => {
    const map = new Map<number, (typeof results)[number]>();
    for (const r of results) {
      const prev = map.get(r.device_id);
      if (!prev || String(r.created_at) > String(prev.created_at)) map.set(r.device_id, r);
    }
    return map;
  }, [results]);

  const historyByDevice = useMemo(() => {
    const map = new Map<number, typeof results>();
    for (const r of results) {
      const list = map.get(r.device_id) ?? [];
      list.push(r);
      map.set(r.device_id, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    }
    return map;
  }, [results]);

  const run = async (fn: () => Promise<void>, okText: string) => {
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(okText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  const submitDevice = () =>
    run(async () => {
      await useFireDeviceStore.getState().create({
        ...deviceForm,
        building_id: deviceForm.building_id || undefined,
        install_date: deviceForm.install_date || null,
        next_maintenance_at: deviceForm.next_maintenance_at || null,
      });
      setDeviceModal(false);
      setDeviceForm(createFireDeviceForm());
    }, "设备已登记");

  const openEdit = (device: FireDevice) => {
    setEditTarget(device);
    setEditForm({
      floor: device.floor,
      location_desc: device.location_desc,
      status: device.status,
      next_maintenance_at: device.next_maintenance_at ?? "",
    });
  };

  const submitEdit = () =>
    run(async () => {
      if (!editTarget) return;
      await useFireDeviceStore.getState().update(editTarget.id, {
        floor: editForm.floor,
        location_desc: editForm.location_desc,
        status: editForm.status as FireDevice["status"],
        next_maintenance_at: editForm.next_maintenance_at || null,
      });
      setEditTarget(null);
    }, "设备信息已更新");

  const submitBuilding = () =>
    run(async () => {
      await useBuildingStore.getState().create(buildingForm);
      setBuildingForm(createBuildingForm());
    }, "楼栋已建档");

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">devices</p>
          <h1>消防设备台账</h1>
        </div>
        {isSupervisor ? (
          <div className="head-actions">
            <button onClick={() => setBuildingModal(true)}>楼栋建档</button>
            <button className="primary" onClick={() => setDeviceModal(true)}>
              登记设备
            </button>
          </div>
        ) : null}
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice ok">{notice}</div> : null}

      <section className="filters">
        <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
          <option value="">全部楼栋</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">全部类型</option>
          {DEVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {DEVICE_TYPE_TEXT[t]}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">全部状态</option>
          {DEVICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {DEVICE_STATUS_TEXT[s]}
            </option>
          ))}
        </select>
        <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
          <option value="">全部楼层</option>
          {floors.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        {filtered.length === 0 ? (
          <EmptyState title="没有符合条件的设备" hint="主管可点击右上角登记设备" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>设备编号</th>
                <th>类型</th>
                <th>位置</th>
                <th>状态</th>
                <th>安装日期</th>
                <th>下次维保</th>
                <th>最近巡检</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => {
                const latest = latestByDevice.get(device.id);
                const history = historyByDevice.get(device.id) ?? [];
                return [
                  <tr key={device.id}>
                    <td>
                      <strong>{device.device_code}</strong>
                    </td>
                    <td>{DEVICE_TYPE_TEXT[device.device_type]}</td>
                    <td>
                      <DeviceLocationCell device={device} building={buildingById.get(device.building_id)} />
                    </td>
                    <td>
                      <StatusBadge value={device.status} />
                    </td>
                    <td>{formatDate(device.install_date)}</td>
                    <td>{formatDate(device.next_maintenance_at)}</td>
                    <td>{latest ? <StatusBadge value={latest.result_status} /> : "—"}</td>
                    <td className="actions">
                      <button onClick={() => setExpanded(expanded === device.id ? null : device.id)}>
                        {expanded === device.id ? "收起" : "历史"}
                      </button>
                      {isSupervisor ? <button onClick={() => openEdit(device)}>编辑</button> : null}
                    </td>
                  </tr>,
                  expanded === device.id ? (
                    <tr key={`${device.id}-history`} className="expand-row">
                      <td colSpan={8}>
                        {history.length === 0 ? (
                          <EmptyState title="暂无巡检记录" />
                        ) : (
                          <ul className="history-list">
                            {history.slice(0, 6).map((r) => (
                              <li key={r.id}>
                                <StatusBadge value={r.result_status} />
                                <span>{checklistItemName(device.device_type, r.item_code)}</span>
                                <em>{r.measured_value || "—"}</em>
                                <span className="muted">{r.note || ""}</span>
                                <time>{formatDateTime(r.created_at)}</time>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ) : null,
                ];
              })}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        title="登记消防设备"
        open={deviceModal}
        onClose={() => setDeviceModal(false)}
        footer={
          <button className="primary" onClick={submitDevice}>
            保存设备
          </button>
        }
      >
        <label className="field">
          <span>所属楼栋</span>
          <select value={deviceForm.building_id ?? 0} onChange={(e) => setDeviceForm({ ...deviceForm, building_id: Number(e.target.value) })}>
            <option value={0}>请选择楼栋</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>设备编号（二维码编号）</span>
          <input placeholder="如 EX-MH-103" value={deviceForm.device_code ?? ""} onChange={(e) => setDeviceForm({ ...deviceForm, device_code: e.target.value })} />
        </label>
        <label className="field">
          <span>设备类型</span>
          <select value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value as FireDevice["device_type"] })}>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {DEVICE_TYPE_TEXT[t]}
              </option>
            ))}
          </select>
        </label>
        <div className="field-grid">
          <label className="field">
            <span>楼层</span>
            <input placeholder="如 1F" value={deviceForm.floor ?? ""} onChange={(e) => setDeviceForm({ ...deviceForm, floor: e.target.value })} />
          </label>
          <label className="field">
            <span>位置描述</span>
            <input placeholder="如 大堂东侧" value={deviceForm.location_desc ?? ""} onChange={(e) => setDeviceForm({ ...deviceForm, location_desc: e.target.value })} />
          </label>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>安装日期</span>
            <input type="date" value={deviceForm.install_date ?? ""} onChange={(e) => setDeviceForm({ ...deviceForm, install_date: e.target.value })} />
          </label>
          <label className="field">
            <span>下次维保日期</span>
            <input type="date" value={deviceForm.next_maintenance_at ?? ""} onChange={(e) => setDeviceForm({ ...deviceForm, next_maintenance_at: e.target.value })} />
          </label>
        </div>
      </Modal>

      <Modal
        title={`编辑设备 · ${editTarget?.device_code ?? ""}`}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        footer={
          <button className="primary" onClick={submitEdit}>
            保存修改
          </button>
        }
      >
        <div className="field-grid">
          <label className="field">
            <span>楼层</span>
            <input value={editForm.floor} onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })} />
          </label>
          <label className="field">
            <span>设备状态</span>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {DEVICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DEVICE_STATUS_TEXT[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>位置描述</span>
          <input value={editForm.location_desc} onChange={(e) => setEditForm({ ...editForm, location_desc: e.target.value })} />
        </label>
        <label className="field">
          <span>下次维保日期</span>
          <input type="date" value={editForm.next_maintenance_at} onChange={(e) => setEditForm({ ...editForm, next_maintenance_at: e.target.value })} />
        </label>
      </Modal>

      <Modal title="楼栋建档" open={buildingModal} onClose={() => setBuildingModal(false)} wide>
        <table className="data-table">
          <thead>
            <tr>
              <th>楼栋</th>
              <th>院区</th>
              <th>层数</th>
              <th>消防等级</th>
              <th>地址编码</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.campus}</td>
                <td>{b.floor_count}</td>
                <td>{b.fire_grade}</td>
                <td>{b.address_code}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="sub-title">新增楼栋</h3>
        <div className="field-grid">
          <label className="field">
            <span>楼栋名称</span>
            <input value={buildingForm.name ?? ""} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} />
          </label>
          <label className="field">
            <span>院区</span>
            <input value={buildingForm.campus ?? ""} onChange={(e) => setBuildingForm({ ...buildingForm, campus: e.target.value })} />
          </label>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>层数</span>
            <input type="number" min={1} value={buildingForm.floor_count ?? 1} onChange={(e) => setBuildingForm({ ...buildingForm, floor_count: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>消防等级</span>
            <select value={buildingForm.fire_grade ?? "二级"} onChange={(e) => setBuildingForm({ ...buildingForm, fire_grade: e.target.value })}>
              <option value="一级">一级</option>
              <option value="二级">二级</option>
              <option value="三级">三级</option>
            </select>
          </label>
          <label className="field">
            <span>地址编码</span>
            <input placeholder="如 JD-004" value={buildingForm.address_code ?? ""} onChange={(e) => setBuildingForm({ ...buildingForm, address_code: e.target.value })} />
          </label>
        </div>
        <div className="modal-foot inline">
          <button className="primary" onClick={submitBuilding}>
            保存楼栋
          </button>
        </div>
      </Modal>
    </main>
  );
}
