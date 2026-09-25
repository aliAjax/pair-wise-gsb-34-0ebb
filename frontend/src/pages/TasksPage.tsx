import { useEffect, useMemo, useState } from "react";
import { ChecklistPanel } from "../components/common/ChecklistPanel";
import type { ChecklistGroup } from "../components/common/ChecklistPanel";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { INSPECTION_STATUSES, INSPECTION_STATUS_TEXT } from "../constants/InspectionStatus";
import { TASK_TYPES, TASK_TYPE_TEXT } from "../constants/TaskType";
import { createInspectionTaskForm } from "../constructors/InspectionTaskConstructor";
import { useChecklistProgress } from "../hooks/useChecklistProgress";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import type { InspectionTask } from "../types/InspectionTask";
import type { InspectionResult } from "../types/InspectionResult";
import type { ResultStatus } from "../types/ResultStatus";
import { formatDate, formatDateTime, todayStr } from "../utils/formatters";

function TaskChecklistModal({ task, onClose }: { task: InspectionTask; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const buildings = useBuildingStore((s) => s.rows);
  const devices = useFireDeviceStore((s) => s.rows);
  const results = useInspectionResultStore((s) => s.rows);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const taskResults = useMemo(() => results.filter((r) => r.task_id === task.id), [results, task.id]);
  const progress = useChecklistProgress(taskResults);

  const groups: ChecklistGroup[] = useMemo(() => {
    const buildingById = new Map(buildings.map((b) => [b.id, b]));
    return devices
      .filter((d) => taskResults.some((r) => r.device_id === d.id))
      .map((device) => ({
        device,
        building: buildingById.get(device.building_id),
        items: taskResults.filter((r) => r.device_id === device.id),
      }));
  }, [devices, taskResults, buildings]);

  const editable =
    task.status === "IN_PROGRESS" &&
    !!user &&
    (user.role === "SUPERVISOR" || (user.role === "INSPECTOR" && task.inspector_id === user.id));

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  const onJudge = (result: InspectionResult, status: ResultStatus) =>
    run(async () => {
      await useInspectionResultStore.getState().update(result.id, { result_status: status });
    });

  const onFieldSave = (result: InspectionResult, patch: { measured_value?: string; note?: string }) =>
    run(async () => {
      await useInspectionResultStore.getState().update(result.id, patch);
    });

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await useInspectionTaskStore.getState().submit(task.id);
      await useInspectionResultStore.getState().load();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`检查项填写 · 任务 #${task.id}`}
      open
      onClose={onClose}
      wide
      footer={
        <>
          <div className="progress">
            <div className="progress-bar">
              <i style={{ width: `${progress.percent}%` }} />
            </div>
            <span>
              已填 {progress.filled}/{progress.total} 项{progress.abnormal > 0 ? ` · 异常 ${progress.abnormal} 项` : ""}
            </span>
          </div>
          {editable ? (
            <button className="primary" disabled={!progress.allFilled || submitting} onClick={submit}>
              {submitting ? "提交中…" : "提交任务"}
            </button>
          ) : null}
        </>
      }
    >
      {error ? <div className="notice error">{error}</div> : null}
      {groups.length === 0 ? <EmptyState title="该任务没有检查项" /> : null}
      <ChecklistPanel groups={groups} editable={editable} onJudge={onJudge} onFieldSave={onFieldSave} />
    </Modal>
  );
}

export function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const tasks = useInspectionTaskStore((s) => s.rows);
  const buildings = useBuildingStore((s) => s.rows);
  const results = useInspectionResultStore((s) => s.rows);
  const users = useAuthStore((s) => s.users);

  const [statusFilter, setStatusFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [activeTask, setActiveTask] = useState<InspectionTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(createInspectionTaskForm());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    useInspectionTaskStore.getState().load();
    useBuildingStore.getState().load();
    useFireDeviceStore.getState().load();
    useInspectionResultStore.getState().load();
    useAuthStore.getState().loadUsers();
  }, []);

  const buildingById = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const progressByTask = useMemo(() => {
    const map = new Map<number, { total: number; filled: number }>();
    for (const r of results) {
      const entry = map.get(r.task_id) ?? { total: 0, filled: 0 };
      entry.total += 1;
      if (r.result_status !== "PENDING") entry.filled += 1;
      map.set(r.task_id, entry);
    }
    return map;
  }, [results]);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (statusFilter && t.status !== statusFilter) return false;
        if (buildingFilter && t.building_id !== Number(buildingFilter)) return false;
        return true;
      }),
    [tasks, statusFilter, buildingFilter]
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

  const createTask = () =>
    run(async () => {
      await useInspectionTaskStore.getState().create({
        building_id: form.building_id || undefined,
        plan_date: form.plan_date || undefined,
        task_type: form.task_type,
        checklist_version: form.checklist_version,
      });
      await useInspectionResultStore.getState().load();
      setCreateOpen(false);
      setForm(createInspectionTaskForm());
    }, "任务已创建");

  const claim = (task: InspectionTask) =>
    run(async () => {
      await useInspectionTaskStore.getState().claim(task.id);
    }, `已领取任务 #${task.id}`);

  const review = (task: InspectionTask) =>
    run(async () => {
      await useInspectionTaskStore.getState().review(task.id);
    }, `任务 #${task.id} 已复核`);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">inspection</p>
          <h1>巡检任务</h1>
        </div>
        {user?.role === "SUPERVISOR" ? (
          <button className="primary" onClick={() => setCreateOpen(true)}>
            新建巡检任务
          </button>
        ) : null}
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice ok">{notice}</div> : null}

      <section className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">全部状态</option>
          {INSPECTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INSPECTION_STATUS_TEXT[s]}
            </option>
          ))}
        </select>
        <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
          <option value="">全部楼栋</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        {filtered.length === 0 ? (
          <EmptyState title="没有符合条件的巡检任务" hint="主管可点击右上角新建巡检任务" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>楼栋</th>
                <th>任务类型</th>
                <th>计划日期</th>
                <th>巡检员</th>
                <th>检查进度</th>
                <th>状态</th>
                <th>完成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const progress = progressByTask.get(task.id);
                const isMine = user?.role === "INSPECTOR" && task.inspector_id === user.id;
                return (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{buildingById.get(task.building_id)?.name ?? `#${task.building_id}`}</td>
                    <td>{TASK_TYPE_TEXT[task.task_type]}</td>
                    <td>{formatDate(task.plan_date)}</td>
                    <td>{task.inspector_id ? userById.get(task.inspector_id)?.display_name ?? `#${task.inspector_id}` : "待领取"}</td>
                    <td>{progress ? `${progress.filled}/${progress.total}` : "—"}</td>
                    <td>
                      <StatusBadge value={task.is_overdue ? "OVERDUE" : task.status} />
                    </td>
                    <td>{formatDateTime(task.finished_at)}</td>
                    <td className="actions">
                      {user?.role === "INSPECTOR" && task.status === "PLANNED" ? (
                        <button onClick={() => claim(task)}>领取</button>
                      ) : null}
                      {task.status === "IN_PROGRESS" && (isMine || user?.role === "SUPERVISOR") ? (
                        <button className="primary" onClick={() => setActiveTask(task)}>
                          填写检查
                        </button>
                      ) : null}
                      {user?.role === "SUPERVISOR" && task.status === "SUBMITTED" ? (
                        <button className="primary" onClick={() => review(task)}>
                          复核通过
                        </button>
                      ) : null}
                      {task.status === "SUBMITTED" || task.status === "REVIEWED" ? (
                        <button onClick={() => setActiveTask(task)}>查看</button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        title="新建巡检任务"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <button className="primary" onClick={createTask}>
            创建并生成检查项
          </button>
        }
      >
        <label className="field">
          <span>巡检楼栋</span>
          <select value={form.building_id ?? 0} onChange={(e) => setForm({ ...form, building_id: Number(e.target.value) })}>
            <option value={0}>请选择楼栋</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>任务类型</span>
          <select value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value as typeof form.task_type })}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TASK_TYPE_TEXT[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>计划日期</span>
          <input type="date" min={todayStr()} value={form.plan_date ?? ""} onChange={(e) => setForm({ ...form, plan_date: e.target.value })} />
        </label>
        <label className="field">
          <span>检查表版本</span>
          <input value={form.checklist_version ?? ""} onChange={(e) => setForm({ ...form, checklist_version: e.target.value })} />
        </label>
      </Modal>

      {activeTask ? <TaskChecklistModal task={activeTask} onClose={() => setActiveTask(null)} /> : null}
    </main>
  );
}
