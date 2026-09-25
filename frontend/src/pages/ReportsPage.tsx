import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { formatPercent, monthKey, monthLabel, recentMonths } from "../utils/formatters";

const MONTH_COUNT = 6;

export function ReportsPage() {
  const tasks = useInspectionTaskStore((s) => s.rows);
  const tickets = useHazardTicketStore((s) => s.rows);
  const results = useInspectionResultStore((s) => s.rows);
  const buildings = useBuildingStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);

  const months = useMemo(() => recentMonths(MONTH_COUNT), []);
  const [selected, setSelected] = useState(months[MONTH_COUNT - 1]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useInspectionTaskStore.getState().load();
    useHazardTicketStore.getState().load();
    useInspectionResultStore.getState().load();
    useBuildingStore.getState().load();
    useFireDeviceStore.getState().load();
  }, []);

  const monthly = useMemo(
    () =>
      months.map((key) => {
        const monthTasks = tasks.filter((t) => monthKey(t.plan_date) === key);
        const done = monthTasks.filter((t) => t.status === "SUBMITTED" || t.status === "REVIEWED").length;
        const monthTickets = tickets.filter((t) => monthKey(t.created_at) === key);
        const closed = monthTickets.filter((t) => t.rectify_status === "CLOSED").length;
        const monthResults = results.filter((r) => monthKey(r.created_at) === key && r.result_status !== "PENDING");
        const abnormal = monthResults.filter((r) => r.result_status === "ABNORMAL").length;
        return {
          key,
          taskTotal: monthTasks.length,
          taskDone: done,
          inspectRate: monthTasks.length === 0 ? 0 : done / monthTasks.length,
          ticketTotal: monthTickets.length,
          ticketClosed: closed,
          rectifyRate: monthTickets.length === 0 ? 0 : closed / monthTickets.length,
          resultTotal: monthResults.length,
          abnormal,
          faultRate: monthResults.length === 0 ? 0 : abnormal / monthResults.length,
        };
      }),
    [months, tasks, tickets, results]
  );

  const current = monthly.find((m) => m.key === selected) ?? monthly[MONTH_COUNT - 1];

  const buildingRows = useMemo(
    () =>
      buildings.map((b) => {
        const bTasks = tasks.filter((t) => t.building_id === b.id && monthKey(t.plan_date) === current.key);
        const done = bTasks.filter((t) => t.status === "SUBMITTED" || t.status === "REVIEWED").length;
        const deviceIds = new Set(devices.filter((d) => d.building_id === b.id).map((d) => d.id));
        const resultIds = new Set(results.filter((r) => deviceIds.has(r.device_id)).map((r) => r.id));
        const newTickets = tickets.filter((t) => monthKey(t.created_at) === current.key && resultIds.has(t.result_id)).length;
        const closedTickets = tickets.filter((t) => monthKey(t.closed_at) === current.key && resultIds.has(t.result_id)).length;
        return { building: b, taskTotal: bTasks.length, taskDone: done, newTickets, closedTickets };
      }),
    [buildings, tasks, devices, results, tickets, current.key]
  );

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["巡检完成率", "整改闭环率", "结果异常率"] },
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
      xAxis: { type: "category", data: monthly.map((m) => monthLabel(m.key)) },
      yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
      series: [
        {
          name: "巡检完成率",
          type: "bar",
          data: monthly.map((m) => Math.round(m.inspectRate * 100)),
          itemStyle: { color: "#4a7c59" },
        },
        {
          name: "整改闭环率",
          type: "line",
          smooth: true,
          data: monthly.map((m) => Math.round(m.rectifyRate * 100)),
          itemStyle: { color: "#d39b46" },
        },
        {
          name: "结果异常率",
          type: "line",
          smooth: true,
          data: monthly.map((m) => Math.round(m.faultRate * 100)),
          itemStyle: { color: "#b64a3c" },
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [monthly]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">reports</p>
          <h1>合规报表</h1>
        </div>
        <div className="month-tabs">
          {months.map((key) => (
            <button key={key} className={key === current.key ? "active" : ""} onClick={() => setSelected(key)}>
              {monthLabel(key)}
            </button>
          ))}
        </div>
      </section>

      <section className="metrics four">
        <StatCard label="计划任务" value={current.taskTotal} hint={`已完成 ${current.taskDone}`} />
        <StatCard label="巡检完成率" value={formatPercent(current.inspectRate)} />
        <StatCard label="整改闭环率" value={formatPercent(current.rectifyRate)} hint={`新增隐患 ${current.ticketTotal} 单`} />
        <StatCard label="结果异常率" value={formatPercent(current.faultRate)} tone={current.faultRate > 0.2 ? "danger" : ""} hint={`异常 ${current.abnormal} 项`} />
      </section>

      <section className="panel">
        <h2>近 {MONTH_COUNT} 个月趋势</h2>
        <div ref={chartRef} className="chart" />
      </section>

      <section className="panel">
        <h2>{monthLabel(current.key)}楼栋明细</h2>
        {buildingRows.every((row) => row.taskTotal === 0 && row.newTickets === 0) ? (
          <EmptyState title="该月没有巡检与隐患数据" hint="切换上方月份查看其他月份" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>楼栋</th>
                <th>计划任务</th>
                <th>已完成</th>
                <th>完成率</th>
                <th>新增隐患</th>
                <th>闭环隐患</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows.map(({ building, taskTotal, taskDone, newTickets, closedTickets }) => (
                <tr key={building.id}>
                  <td>{building.name}</td>
                  <td>{taskTotal}</td>
                  <td>{taskDone}</td>
                  <td>{taskTotal === 0 ? "—" : formatPercent(taskDone / taskTotal)}</td>
                  <td>{newTickets}</td>
                  <td>{closedTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
