import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/Stats";
import { EmptyState } from "../components/common/EmptyState";
import { HazardSeverityTag } from "../components/common/HazardSeverityTag";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { DeviceStatus, DeviceStatusText } from "../constants/DeviceStatus";
import type { DashboardSummary } from "../types/Stats";
import { formatDate, formatPercent } from "../utils/formatters";

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <EmptyState title="总览加载失败" hint={error} />;
  }
  if (!data) {
    return <EmptyState title="正在加载…" />;
  }

  return (
    <div className="stack">
      <section className="metrics">
        <StatCard label="楼栋 / 设备" value={`${data.building_count} / ${data.device_count}`} hint="在管资产" />
        <StatCard
          label="本月巡检完成率"
          value={formatPercent(data.month_completion_rate)}
          hint={`${data.month_task_finished}/${data.month_task_total} 项任务`}
          tone={data.month_completion_rate >= 80 ? "ok" : "warn"}
        />
        <StatCard
          label="逾期整改单"
          value={data.overdue_ticket_count}
          hint={`未闭环共 ${data.open_ticket_count} 单`}
          tone={data.overdue_ticket_count > 0 ? "danger" : "ok"}
        />
        <StatCard
          label="高危未闭环隐患"
          value={data.high_risk_open_count}
          hint="高/重大风险"
          tone={data.high_risk_open_count > 0 ? "danger" : "ok"}
        />
      </section>

      <section className="panel">
        <h2>设备状态分布</h2>
        <div className="status-dist">
          {DeviceStatus.map((status) => {
            const count = data.device_status[status] ?? 0;
            const width = data.device_count ? Math.max(4, (count / data.device_count) * 100) : 0;
            return (
              <div key={status} className="status-dist-row">
                <StatusBadge value={status} />
                <div className="bar">
                  <div className={`bar-fill ${status.toLowerCase()}`} style={{ width: `${width}%` }} />
                </div>
                <strong>{count}</strong>
                <span className="muted">{DeviceStatusText[status]}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="workbench">
        <section className="panel">
          <h2>逾期整改</h2>
          {data.overdue_tickets.length === 0 ? (
            <EmptyState title="没有逾期整改单" />
          ) : (
            <div className="table">
              {data.overdue_tickets.map((ticket) => (
                <article key={ticket.id} className="row">
                  <div>
                    <strong>{ticket.device_code}</strong>
                    <span className="muted"> {ticket.building_name} · {ticket.result_note}</span>
                  </div>
                  <HazardSeverityTag severity={ticket.severity} />
                  <span className="danger-text">截止 {formatDate(ticket.deadline)}</span>
                </article>
              ))}
            </div>
          )}
          <h2>高危隐患</h2>
          {data.high_risk_tickets.length === 0 ? (
            <EmptyState title="暂无高危隐患" />
          ) : (
            <div className="table">
              {data.high_risk_tickets.map((ticket) => (
                <article key={ticket.id} className="row">
                  <div>
                    <strong>{ticket.device_code}</strong>
                    <span className="muted"> {ticket.result_note}</span>
                  </div>
                  <HazardSeverityTag severity={ticket.severity} />
                  <StatusBadge value={ticket.rectify_status} />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>最近任务</h2>
          <div className="table">
            {data.recent_tasks.map((task) => (
              <article key={task.id} className="row">
                <div>
                  <strong>{task.building_name}</strong>
                  <span className="muted"> {formatDate(task.plan_date)}</span>
                </div>
                <span className="muted">{task.progress ? `${task.progress.filled}/${task.progress.total}` : "-"}</span>
                <StatusBadge value={task.status} />
              </article>
            ))}
          </div>
          <h2>最近操作</h2>
          <TimelineList
            items={data.recent_logs.map((log) => ({
              id: log.id,
              time: log.created_at,
              title: log.action,
              desc: log.actor,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
