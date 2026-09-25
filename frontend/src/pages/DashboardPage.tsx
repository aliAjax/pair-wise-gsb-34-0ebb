import { useEffect, useMemo } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { DEVICE_STATUSES, DEVICE_STATUS_TEXT } from "../constants/DeviceStatus";
import { useAuditLogStore } from "../stores/AuditLogStore";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { formatDate, formatDateTime, formatPercent, isOverdueDate } from "../utils/formatters";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const buildings = useBuildingStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);
  const tasks = useInspectionTaskStore((s) => s.rows);
  const tickets = useHazardTicketStore((s) => s.rows);
  const results = useInspectionResultStore((s) => s.rows);
  const audits = useAuditLogStore((s) => s.rows);

  useEffect(() => {
    useBuildingStore.getState().load();
    useFireDeviceStore.getState().load();
    useInspectionTaskStore.getState().load();
    useHazardTicketStore.getState().load();
    useInspectionResultStore.getState().load();
    if (user && (user.role === "SUPERVISOR" || user.role === "AUDITOR")) {
      useAuditLogStore.getState().load(8);
    }
  }, [user]);

  const stats = useMemo(() => {
    const finished = tasks.filter((t) => t.status === "SUBMITTED" || t.status === "REVIEWED").length;
    const openTickets = tickets.filter((t) => t.rectify_status !== "CLOSED");
    const overdue = openTickets.filter((t) => isOverdueDate(t.deadline)).length;
    const highRisk = openTickets.filter((t) => t.severity === "HIGH" || t.severity === "CRITICAL").length;
    const byStatus = DEVICE_STATUSES.map((status) => ({
      status,
      count: devices.filter((d) => d.status === status).length,
    }));
    return {
      deviceTotal: devices.length,
      faultCount: devices.filter((d) => d.status === "FAULT").length,
      taskTotal: tasks.length,
      finishRate: tasks.length === 0 ? 0 : finished / tasks.length,
      overdueRectify: overdue,
      highRisk,
      byStatus,
    };
  }, [tasks, tickets, devices]);

  const buildingRows = useMemo(() => {
    const resultById = new Map(results.map((r) => [r.id, r]));
    return buildings.map((b) => {
      const bDevices = devices.filter((d) => d.building_id === b.id);
      const deviceIds = new Set(bDevices.map((d) => d.id));
      const bTasks = tasks.filter((t) => t.building_id === b.id);
      const done = bTasks.filter((t) => t.status === "SUBMITTED" || t.status === "REVIEWED").length;
      const openHazards = tickets.filter((t) => {
        if (t.rectify_status === "CLOSED") return false;
        const result = resultById.get(t.result_id);
        return result ? deviceIds.has(result.device_id) : false;
      }).length;
      return {
        building: b,
        deviceCount: bDevices.length,
        faultCount: bDevices.filter((d) => d.status === "FAULT").length,
        taskCount: bTasks.length,
        finishRate: bTasks.length === 0 ? 0 : done / bTasks.length,
        openHazards,
      };
    });
  }, [buildings, devices, tasks, tickets, results]);

  const overdueTickets = useMemo(
    () =>
      tickets
        .filter((t) => t.rectify_status !== "CLOSED" && isOverdueDate(t.deadline))
        .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))
        .slice(0, 5),
    [tickets]
  );

  const highRiskTickets = useMemo(
    () => tickets.filter((t) => t.rectify_status !== "CLOSED" && (t.severity === "HIGH" || t.severity === "CRITICAL")).slice(0, 5),
    [tickets]
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">fire-inspect</p>
          <h1>消防合规总览</h1>
        </div>
        <span className="page-date">{formatDate(new Date().toISOString())}</span>
      </section>

      <section className="metrics six">
        <StatCard label="设备总数" value={stats.deviceTotal} />
        <StatCard label="故障设备" value={stats.faultCount} tone={stats.faultCount > 0 ? "danger" : ""} />
        <StatCard label="巡检完成率" value={formatPercent(stats.finishRate)} hint={`共 ${stats.taskTotal} 个任务`} />
        <StatCard label="逾期整改" value={stats.overdueRectify} tone={stats.overdueRectify > 0 ? "danger" : ""} hint="超过整改期限未闭环" />
        <StatCard label="高危未闭环" value={stats.highRisk} tone={stats.highRisk > 0 ? "warn" : ""} />
        <StatCard label="楼栋数量" value={buildings.length} />
      </section>

      <section className="workbench">
        <div className="panel">
          <h2>设备状态分布</h2>
          {stats.deviceTotal === 0 ? (
            <EmptyState title="暂无设备" />
          ) : (
            <div className="dist">
              {stats.byStatus.map(({ status, count }) => (
                <div className="dist-row" key={status}>
                  <span>{DEVICE_STATUS_TEXT[status]}</span>
                  <div className="dist-bar">
                    <i className={`fill ${status.toLowerCase()}`} style={{ width: `${stats.deviceTotal ? (count / stats.deviceTotal) * 100 : 0}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          )}
          <h2>楼栋合规概览</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>楼栋</th>
                <th>院区</th>
                <th>设备数</th>
                <th>故障</th>
                <th>未闭环隐患</th>
                <th>任务完成率</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows.map(({ building, deviceCount, faultCount, taskCount, finishRate, openHazards }) => (
                <tr key={building.id}>
                  <td>{building.name}</td>
                  <td>{building.campus}</td>
                  <td>{deviceCount}</td>
                  <td>{faultCount > 0 ? <strong className="text-danger">{faultCount}</strong> : 0}</td>
                  <td>{openHazards > 0 ? <strong className="text-warn">{openHazards}</strong> : 0}</td>
                  <td>{taskCount === 0 ? "—" : formatPercent(finishRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>逾期整改</h2>
          {overdueTickets.length === 0 ? (
            <EmptyState title="没有逾期未闭环的整改单" />
          ) : (
            <ul className="ticket-list">
              {overdueTickets.map((t) => (
                <li key={t.id}>
                  <HazardSeverityTag severity={t.severity} />
                  <span>整改单 #{t.id}</span>
                  <em>期限 {formatDate(t.deadline)}</em>
                </li>
              ))}
            </ul>
          )}
          <h2>高危隐患</h2>
          {highRiskTickets.length === 0 ? (
            <EmptyState title="当前没有高危未闭环隐患" />
          ) : (
            <ul className="ticket-list">
              {highRiskTickets.map((t) => (
                <li key={t.id}>
                  <HazardSeverityTag severity={t.severity} />
                  <span>整改单 #{t.id}</span>
                  <StatusBadge value={t.rectify_status} overdue={isOverdueDate(t.deadline)} />
                </li>
              ))}
            </ul>
          )}
          {audits.length > 0 ? (
            <>
              <h2>最近操作</h2>
              <TimelineList
                items={audits.map((a) => ({
                  id: a.id,
                  title: `${a.actor} · ${a.action}`,
                  sub: a.target_id,
                  time: formatDateTime(a.created_at),
                }))}
              />
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
