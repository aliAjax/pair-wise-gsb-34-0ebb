import { useEffect, useState } from "react";
import { getMonthlyReport } from "../api/Stats";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import type { MonthlyReport } from "../types/Stats";
import { currentMonth, formatPercent } from "../utils/formatters";

export function ReportsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<MonthlyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMonthlyReport(month)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [month]);

  const maxPlanned = Math.max(1, ...(data?.trend.map((t) => t.task_planned) ?? [1]));

  return (
    <div className="stack">
      <div className="toolbar">
        <label className="inline-label">统计月份</label>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
      </div>

      {error && <EmptyState title="报表加载失败" hint={error} />}
      {!error && !data && <EmptyState title="正在加载…" />}
      {data && (
        <>
          <section className="metrics">
            <StatCard
              label="本月巡检完成率"
              value={formatPercent(data.completion_rate)}
              hint={`${data.task_finished}/${data.task_planned} 项计划`}
              tone={data.completion_rate >= 80 ? "ok" : "warn"}
            />
            <StatCard
              label="本月整改关闭率"
              value={formatPercent(data.rectify_rate)}
              hint={`关闭 ${data.ticket_closed} / 派单 ${data.ticket_created}`}
              tone={data.rectify_rate >= 80 ? "ok" : "warn"}
            />
            <StatCard
              label="设备故障率"
              value={formatPercent(data.device_fault_rate)}
              hint={`故障 ${data.device_fault_count} / 共 ${data.device_total}`}
              tone={data.device_fault_count > 0 ? "danger" : "ok"}
            />
            <StatCard
              label="逾期整改（按楼栋汇总见下）"
              value={data.by_building.reduce((sum, b) => sum + b.overdue_ticket_count, 0)}
              hint="未闭环且超过期限"
              tone="danger"
            />
          </section>

          <section className="panel">
            <h2>近 6 个月巡检完成趋势</h2>
            <div className="chart-bars">
              {data.trend.map((point) => (
                <div key={point.month} className="chart-col">
                  <div className="chart-bar-track">
                    <div
                      className={"chart-bar" + (point.completion_rate >= 80 ? " ok" : point.completion_rate >= 50 ? " warn" : " danger")}
                      style={{ height: `${Math.max(point.completion_rate, point.task_planned ? 4 : 0)}%` }}
                      title={`${point.task_finished}/${point.task_planned}`}
                    />
                  </div>
                  <strong>{formatPercent(point.completion_rate)}</strong>
                  <span className="muted">{point.month.slice(5)}月</span>
                </div>
              ))}
            </div>
            <p className="muted">柱高为当月完成率，括号数据为 完成/计划，最高参考 {maxPlanned} 项。</p>
          </section>

          <section className="panel">
            <h2>楼栋合规明细（{data.month}）</h2>
            <table className="grid-table">
              <thead>
                <tr>
                  <th>楼栋</th>
                  <th>设备数</th>
                  <th>计划任务</th>
                  <th>完成任务</th>
                  <th>完成率</th>
                  <th>未闭环隐患</th>
                  <th>逾期整改</th>
                </tr>
              </thead>
              <tbody>
                {data.by_building.map((row) => (
                  <tr key={row.building_id}>
                    <td><strong>{row.building_name}</strong></td>
                    <td>{row.device_count}</td>
                    <td>{row.task_total}</td>
                    <td>{row.task_finished}</td>
                    <td className={row.completion_rate >= 80 ? "" : "danger-text"}>
                      {formatPercent(row.completion_rate)}
                    </td>
                    <td>{row.open_ticket_count}</td>
                    <td className={row.overdue_ticket_count > 0 ? "danger-text" : ""}>
                      {row.overdue_ticket_count}
                    </td>
                  </tr>
                ))}
                {data.by_building.length === 0 && (
                  <tr><td colSpan={7}><EmptyState title="该月份没有数据" /></td></tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
