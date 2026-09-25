import { useCallback, useEffect, useMemo, useState } from "react";
import { listInspectionResult } from "../api/InspectionResult";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { EmptyState } from "../components/common/EmptyState";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { checklistItemName } from "../constants/checklistItems";
import { HAZARD_SEVERITIES, HAZARD_SEVERITY_TEXT } from "../constants/HazardSeverity";
import { RECTIFY_STATUSES, RECTIFY_STATUS_TEXT } from "../constants/RectifyStatus";
import { createHazardTicketForm } from "../constructors/HazardTicketConstructor";
import { useHazardFlow } from "../hooks/useHazardFlow";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import { formatDate, formatDateTime, isOverdueDate, todayStr } from "../utils/formatters";

function useResultMap() {
  const results = useInspectionResultStore((s) => s.rows);
  return useMemo(() => new Map(results.map((r) => [r.id, r])), [results]);
}

function TicketRow({ ticket, onRectify, onClose }: { ticket: HazardTicket; onRectify: (t: HazardTicket) => void; onClose: (t: HazardTicket) => void }) {
  const user = useAuthStore((s) => s.user);
  const devices = useFireDeviceStore((s) => s.rows);
  const buildings = useBuildingStore((s) => s.rows);
  const results = useResultMap();
  const users = useAuthStore((s) => s.users);
  const flow = useHazardFlow(ticket, user?.role);

  const result = results.get(ticket.result_id);
  const device = result ? devices.find((d) => d.id === result.device_id) : undefined;
  const building = device ? buildings.find((b) => b.id === device.building_id) : undefined;

  return (
    <tr>
      <td>{ticket.id}</td>
      <td>
        <HazardSeverityTag severity={ticket.severity} />
      </td>
      <td>{device ? <DeviceLocationCell device={device} building={building} /> : "—"}</td>
      <td>{device && result ? checklistItemName(device.device_type, result.item_code) : "—"}</td>
      <td>{users.find((u) => u.id === ticket.owner_id)?.display_name ?? `#${ticket.owner_id}`}</td>
      <td>{formatDate(ticket.deadline)}</td>
      <td>
        <StatusBadge value={ticket.rectify_status} overdue={flow.isOverdue} />
      </td>
      <td className="note-cell">{ticket.rectify_note || "—"}</td>
      <td>{formatDateTime(ticket.closed_at)}</td>
      <td className="actions">
        {flow.canRectify ? <button onClick={() => onRectify(ticket)}>填写整改</button> : null}
        {flow.canClose ? (
          <button className="primary" onClick={() => onClose(ticket)}>
            复验关闭
          </button>
        ) : null}
      </td>
    </tr>
  );
}

// 结果映射：整改单 -> 巡检结果 -> 设备
export function HazardsPage() {
  const user = useAuthStore((s) => s.user);
  const tickets = useHazardTicketStore((s) => s.rows);
  const buildings = useBuildingStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);
  const users = useAuthStore((s) => s.users);

  const [unticketed, setUnticketed] = useState<InspectionResult[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [dispatchTarget, setDispatchTarget] = useState<InspectionResult | null>(null);
  const [dispatchForm, setDispatchForm] = useState(createHazardTicketForm());
  const [rectifyTarget, setRectifyTarget] = useState<HazardTicket | null>(null);
  const [rectifyNote, setRectifyNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUnticketed = useCallback(async () => {
    setUnticketed(await listInspectionResult({ result_status: "ABNORMAL", unticketed: true }));
  }, []);

  useEffect(() => {
    useHazardTicketStore.getState().load();
    useBuildingStore.getState().load();
    useFireDeviceStore.getState().load();
    useInspectionResultStore.getState().load();
    useAuthStore.getState().loadUsers();
    loadUnticketed().catch(() => setUnticketed([]));
  }, [loadUnticketed]);

  const buildingById = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const deviceById = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);
  const ownerOptions = useMemo(() => users.filter((u) => u.role === "MAINTAINER" || u.role === "SUPERVISOR"), [users]);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (statusFilter && t.rectify_status !== statusFilter) return false;
        if (severityFilter && t.severity !== severityFilter) return false;
        return true;
      }),
    [tickets, statusFilter, severityFilter]
  );

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

  const openDispatch = (result: InspectionResult) => {
    setDispatchTarget(result);
    setDispatchForm({ ...createHazardTicketForm(), result_id: result.id, owner_id: ownerOptions[0]?.id ?? 0 });
  };

  const submitDispatch = () =>
    run(async () => {
      await useHazardTicketStore.getState().dispatch({
        result_id: dispatchForm.result_id,
        severity: dispatchForm.severity,
        owner_id: dispatchForm.owner_id || undefined,
        deadline: dispatchForm.deadline || undefined,
      });
      await useFireDeviceStore.getState().load();
      await loadUnticketed();
      setDispatchTarget(null);
    }, "派单成功，设备已标记为故障");

  const submitRectify = () =>
    run(async () => {
      if (!rectifyTarget) return;
      await useHazardTicketStore.getState().rectify(rectifyTarget.id, rectifyNote);
      setRectifyTarget(null);
      setRectifyNote("");
    }, "整改结果已提交，等待复验");

  const closeTicket = (ticket: HazardTicket) =>
    run(async () => {
      await useHazardTicketStore.getState().close(ticket.id);
      await useFireDeviceStore.getState().load();
    }, `整改单 #${ticket.id} 已复验关闭`);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">hazard</p>
          <h1>隐患整改</h1>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice ok">{notice}</div> : null}

      <section className="panel">
        <h2>待派单异常结果</h2>
        {unticketed.length === 0 ? (
          <EmptyState title="没有待派单的异常结果" hint="巡检提交异常结果后会出现在这里" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>结果 #</th>
                <th>设备位置</th>
                <th>检查项</th>
                <th>实测值</th>
                <th>异常说明</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {unticketed.map((result) => {
                const device = deviceById.get(result.device_id);
                return (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>{device ? <DeviceLocationCell device={device} building={buildingById.get(device.building_id)} /> : "—"}</td>
                    <td>{device ? checklistItemName(device.device_type, result.item_code) : result.item_code}</td>
                    <td>{result.measured_value || "—"}</td>
                    <td className="note-cell">{result.note || "—"}</td>
                    <td className="actions">
                      {user?.role === "SUPERVISOR" ? (
                        <button className="primary" onClick={() => openDispatch(result)}>
                          派单
                        </button>
                      ) : (
                        <span className="muted">待主管派单</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>整改单列表</h2>
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">全部状态</option>
            {RECTIFY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {RECTIFY_STATUS_TEXT[s]}
              </option>
            ))}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="">全部等级</option>
            {HAZARD_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {HAZARD_SEVERITY_TEXT[s]}
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="没有符合条件的整改单" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>等级</th>
                <th>设备位置</th>
                <th>检查项</th>
                <th>责任人</th>
                <th>整改期限</th>
                <th>状态</th>
                <th>整改说明</th>
                <th>关闭时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} onRectify={(t) => { setRectifyTarget(t); setRectifyNote(t.rectify_note); }} onClose={closeTicket} />
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        title={`隐患派单 · 结果 #${dispatchTarget?.id ?? ""}`}
        open={dispatchTarget !== null}
        onClose={() => setDispatchTarget(null)}
        footer={
          <button className="primary" onClick={submitDispatch}>
            确认派单
          </button>
        }
      >
        <label className="field">
          <span>隐患等级</span>
          <select
            value={dispatchForm.severity}
            onChange={(e) => setDispatchForm({ ...dispatchForm, severity: e.target.value as typeof dispatchForm.severity })}
          >
            {HAZARD_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {HAZARD_SEVERITY_TEXT[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>整改责任人</span>
          <select value={dispatchForm.owner_id ?? 0} onChange={(e) => setDispatchForm({ ...dispatchForm, owner_id: Number(e.target.value) })}>
            <option value={0}>请选择责任人</option>
            {ownerOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>整改期限</span>
          <input
            type="date"
            min={todayStr()}
            value={dispatchForm.deadline ?? ""}
            onChange={(e) => setDispatchForm({ ...dispatchForm, deadline: e.target.value })}
          />
        </label>
      </Modal>

      <Modal
        title={`填写整改 · 整改单 #${rectifyTarget?.id ?? ""}`}
        open={rectifyTarget !== null}
        onClose={() => setRectifyTarget(null)}
        footer={
          <button className="primary" onClick={submitRectify}>
            提交整改结果
          </button>
        }
      >
        <label className="field">
          <span>整改说明</span>
          <textarea rows={4} placeholder="描述整改措施、更换部件和现场情况" value={rectifyNote} onChange={(e) => setRectifyNote(e.target.value)} />
        </label>
      </Modal>
    </main>
  );
}
