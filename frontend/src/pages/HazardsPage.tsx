import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { HazardSeverity, HazardSeverityText } from "../constants/HazardSeverity";
import { RectifyStatus, RectifyStatusText } from "../constants/RectifyStatus";
import { createHazardTicketForm } from "../constructors/HazardTicketConstructor";
import { useHazardFlow } from "../hooks/useHazardFlow";
import { listAuditLog } from "../api/AuditLog";
import { useAuthStore } from "../stores/AuthStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import type { AuditLogEntry } from "../types/Stats";
import type { HazardTicket } from "../types/HazardTicket";
import type { InspectionResult } from "../types/InspectionResult";
import { formatDate, todayIso } from "../utils/formatters";

const TICKET_TABS = ["", ...RectifyStatus] as const;

export function HazardsPage() {
  const user = useAuthStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR";
  const isRectifier = user?.role === "MAINTAINER" || isSupervisor;

  const ticketsState = useHazardTicketStore();
  const pendingState = useInspectionResultStore();
  const users = useAuthStore((s) => s.users);
  const loadUsers = useAuthStore((s) => s.loadUsers);

  const [tab, setTab] = useState("");
  const [dispatchTarget, setDispatchTarget] = useState<InspectionResult | null>(null);
  const [dispatchForm, setDispatchForm] = useState(createHazardTicketForm());
  const [rectifyTarget, setRectifyTarget] = useState<HazardTicket | null>(null);
  const [rectifyNote, setRectifyNote] = useState("");
  const [closeTarget, setCloseTarget] = useState<HazardTicket | null>(null);
  const [closeNote, setCloseNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const refresh = () => {
    ticketsState.load(tab ? { rectify_status: tab } : {});
    pendingState.loadPending();
    listAuditLog(10, "HazardTicket").then(setLogs).catch(() => setLogs([]));
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const flow = useHazardFlow(ticketsState.rows);

  const owners = users.filter((u) => u.role === "MAINTAINER" || u.role === "SUPERVISOR");

  const submitDispatch = async () => {
    setActionError(null);
    try {
      await ticketsState.dispatch({
        result_id: dispatchTarget!.id,
        severity: dispatchForm.severity,
        owner_id: Number(dispatchForm.owner_id),
        deadline: dispatchForm.deadline,
      });
      setDispatchTarget(null);
      refresh();
    } catch (e) {
      setActionError((e as Error).message);
    }
  };

  const submitRectify = async () => {
    setActionError(null);
    try {
      await ticketsState.rectify(rectifyTarget!.id, rectifyNote);
      setRectifyTarget(null);
      refresh();
    } catch (e) {
      setActionError((e as Error).message);
    }
  };

  const submitClose = async (passed: boolean) => {
    setActionError(null);
    try {
      await ticketsState.close(closeTarget!.id, passed, closeNote);
      setCloseTarget(null);
      refresh();
    } catch (e) {
      setActionError((e as Error).message);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <h2>
          待派单异常结果
          <span className="count-pill">{pendingState.pending.length}</span>
        </h2>
        {pendingState.pending.length === 0 ? (
          <EmptyState title="没有待派单的异常结果" hint="巡检提交的异常项会出现在这里，等待主管派单" />
        ) : (
          <table className="grid-table">
            <thead>
              <tr>
                <th>设备</th>
                <th>检查项</th>
                <th>异常说明</th>
                <th>实测值</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingState.pending.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.device_code}</strong></td>
                  <td>{r.item_name ?? r.item_code}</td>
                  <td className="danger-text">{r.note}</td>
                  <td>{r.measured_value || "-"}</td>
                  <td>
                    {isSupervisor ? (
                      <button
                        className="primary small"
                        onClick={() => {
                          setDispatchTarget(r);
                          setDispatchForm(createHazardTicketForm({
                            owner_id: owners[0]?.id ?? 0,
                            deadline: todayIso(),
                          }));
                          setActionError(null);
                        }}
                      >
                        派单
                      </button>
                    ) : (
                      <span className="muted">等待主管派单</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="toolbar tabs">
        {TICKET_TABS.map((status) => (
          <button
            key={status}
            className={"tab" + (tab === status ? " active" : "")}
            onClick={() => setTab(status)}
          >
            {status === ""
              ? `全部 ${ticketsState.rows.length}`
              : `${RectifyStatusText[status as keyof typeof RectifyStatusText]} ${
                  status === "ASSIGNED"
                    ? flow.assigned.length
                    : status === "RECTIFIED"
                    ? flow.rectified.length
                    : flow.closed.length
                }`}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {flow.overdue.length > 0 && <span className="danger-text">逾期 {flow.overdue.length} 单</span>}
      </div>

      {ticketsState.error && <EmptyState title="整改单加载失败" hint={ticketsState.error} />}
      <div className="workbench">
        <section className="panel">
          <table className="grid-table">
            <thead>
              <tr>
                <th>整改单</th>
                <th>等级</th>
                <th>责任人</th>
                <th>截止日期</th>
                <th>整改状态</th>
                <th>整改说明</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ticketsState.rows.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>#{ticket.id} {ticket.device_code}</strong>
                    <div className="muted">{ticket.building_name} · {ticket.result_note}</div>
                  </td>
                  <td><HazardSeverityTag severity={ticket.severity} /></td>
                  <td>{ticket.owner_name}</td>
                  <td className={ticket.is_overdue ? "danger-text" : ""}>
                    {formatDate(ticket.deadline)}
                    {ticket.is_overdue && <div>已逾期</div>}
                  </td>
                  <td><StatusBadge value={ticket.rectify_status} /></td>
                  <td className="note-cell">{ticket.rectify_note || "-"}</td>
                  <td>
                    {ticket.rectify_status === "ASSIGNED" && isRectifier && (
                      <button
                        className="small"
                        onClick={() => {
                          setRectifyTarget(ticket);
                          setRectifyNote(ticket.rectify_note.split("｜复验")[0] ?? "");
                          setActionError(null);
                        }}
                      >
                        填写整改
                      </button>
                    )}
                    {ticket.rectify_status === "RECTIFIED" && isSupervisor && (
                      <button
                        className="primary small"
                        onClick={() => {
                          setCloseTarget(ticket);
                          setCloseNote("");
                          setActionError(null);
                        }}
                      >
                        复验关闭
                      </button>
                    )}
                    {ticket.rectify_status === "CLOSED" && (
                      <span className="muted">{formatDate(ticket.closed_at)}</span>
                    )}
                  </td>
                </tr>
              ))}
              {ticketsState.rows.length === 0 && (
                <tr><td colSpan={7}><EmptyState title="暂无整改单" /></td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>隐患处理动态</h2>
          <TimelineList
            items={logs.map((log) => ({
              id: log.id,
              time: log.created_at,
              title: log.action,
              desc: log.actor,
            }))}
          />
        </section>
      </div>

      <Modal
        title={`异常派单 · ${dispatchTarget?.device_code ?? ""}`}
        open={!!dispatchTarget}
        onClose={() => setDispatchTarget(null)}
        footer={
          <>
            <button className="ghost" onClick={() => setDispatchTarget(null)}>取消</button>
            <button className="primary" onClick={submitDispatch}>确认派单</button>
          </>
        }
      >
        <p className="muted">{dispatchTarget?.item_name ?? ""}：{dispatchTarget?.note}</p>
        <div className="form-grid">
          <label>隐患等级</label>
          <select
            value={dispatchForm.severity}
            onChange={(e) => setDispatchForm({ ...dispatchForm, severity: e.target.value })}
          >
            {HazardSeverity.map((s) => (
              <option key={s} value={s}>{HazardSeverityText[s]}</option>
            ))}
          </select>
          <label>整改责任人</label>
          <select
            value={dispatchForm.owner_id}
            onChange={(e) => setDispatchForm({ ...dispatchForm, owner_id: Number(e.target.value) })}
          >
            <option value={0}>请选择</option>
            {owners.map((u) => (
              <option key={u.id} value={u.id}>{u.display_name}</option>
            ))}
          </select>
          <label>整改期限</label>
          <input
            type="date"
            value={dispatchForm.deadline}
            onChange={(e) => setDispatchForm({ ...dispatchForm, deadline: e.target.value })}
          />
        </div>
        {actionError && <p className="danger-text">{actionError}</p>}
      </Modal>

      <Modal
        title={`填写整改 · 整改单#${rectifyTarget?.id ?? ""}`}
        open={!!rectifyTarget}
        onClose={() => setRectifyTarget(null)}
        footer={
          <>
            <button className="ghost" onClick={() => setRectifyTarget(null)}>取消</button>
            <button className="primary" onClick={submitRectify}>提交整改</button>
          </>
        }
      >
        <label className="block-label">整改措施与完成情况</label>
        <textarea
          rows={4}
          value={rectifyNote}
          placeholder="请填写整改措施、更换部件或处理结果"
          onChange={(e) => setRectifyNote(e.target.value)}
        />
        {actionError && <p className="danger-text">{actionError}</p>}
      </Modal>

      <Modal
        title={`复验关闭 · 整改单#${closeTarget?.id ?? ""}`}
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        footer={
          <>
            <button className="ghost" onClick={() => setCloseTarget(null)}>取消</button>
            <button onClick={() => submitClose(false)}>复验不通过，退回</button>
            <button className="primary" onClick={() => submitClose(true)}>复验通过并关闭</button>
          </>
        }
      >
        <p className="muted">整改说明：{closeTarget?.rectify_note}</p>
        <label className="block-label">复验意见</label>
        <textarea
          rows={3}
          value={closeNote}
          placeholder="通过或退回的说明（选填）"
          onChange={(e) => setCloseNote(e.target.value)}
        />
        {actionError && <p className="danger-text">{actionError}</p>}
      </Modal>
    </div>
  );
}
