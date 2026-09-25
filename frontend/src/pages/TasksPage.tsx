import { useCallback, useEffect, useMemo, useState } from "react";
import { getInspectionTask } from "../api/InspectionTask";
import { ChecklistPanel, draftKey } from "../components/common/ChecklistPanel";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { DeviceType, DeviceTypeText } from "../constants/DeviceType";
import { InspectionStatus, InspectionStatusText } from "../constants/InspectionStatus";
import { createInspectionTaskForm } from "../constructors/InspectionTaskConstructor";
import { useChecklistProgress } from "../hooks/useChecklistProgress";
import { useAuthStore } from "../stores/AuthStore";
import { useBuildingStore } from "../stores/BuildingStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import type { ResultDraft, TaskDetail } from "../types/InspectionTask";
import type { InspectionTask } from "../types/InspectionTask";
import { formatDate, todayIso } from "../utils/formatters";

const TABS = ["", ...InspectionStatus] as const;

function TaskExecutionModal({
  taskId,
  readonly,
  onClose,
  onChanged,
}: {
  taskId: number;
  readonly: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { claim, saveResults, submit, review } = useInspectionTaskStore();
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ResultDraft>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const d = await getInspectionTask(taskId);
    setDetail(d);
    const initial: Record<string, ResultDraft> = {};
    d.results.forEach((r) => {
      initial[draftKey(r.device_id, r.item_code)] = {
        device_id: r.device_id,
        item_code: r.item_code,
        result_status: r.result_status,
        measured_value: r.measured_value,
        photo_url: r.photo_url,
        note: r.note,
      };
    });
    setDrafts(initial);
  }, [taskId]);

  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, [reload]);

  const total = detail ? detail.devices.length * detail.items.length : 0;
  const progress = useChecklistProgress(drafts, total);
  const editable = !readonly && detail?.task.status === "IN_PROGRESS";

  const patch = (deviceId: number, itemCode: string, patch: Partial<ResultDraft>) => {
    const key = draftKey(deviceId, itemCode);
    setDrafts((prev) => {
      const existing: ResultDraft =
        prev[key] ?? {
          device_id: deviceId,
          item_code: itemCode,
          result_status: "NORMAL",
          measured_value: "",
          photo_url: "",
          note: "",
        };
      return {
        ...prev,
        [key]: { ...existing, ...patch, device_id: deviceId, item_code: itemCode },
      };
    });
  };

  const run = async (action: "save" | "submit") => {
    setBusy(true);
    setError(null);
    const values = Object.values(drafts);
    const missingNote = values.find((r) => r.result_status === "ABNORMAL" && !r.note.trim());
    if (action === "submit" && missingNote) {
      setError("存在未填写异常说明的异常项，请补充后再提交");
      setBusy(false);
      return;
    }
    try {
      await saveResults(taskId, values);
      if (action === "submit") {
        await submit(taskId);
      }
      await reload();
      onChanged();
      if (action === "submit") {
        onClose();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const doReview = async () => {
    setBusy(true);
    setError(null);
    try {
      await review(taskId);
      onChanged();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const doClaim = async () => {
    setBusy(true);
    setError(null);
    try {
      await claim(taskId);
      await reload();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!detail) {
    return (
      <Modal title="巡检任务" open onClose={onClose}>
        <EmptyState title={error ?? "正在加载…"} />
      </Modal>
    );
  }

  const t = detail.task;
  return (
    <Modal
      title={`${t.building_name} · ${DeviceTypeText[t.task_type as keyof typeof DeviceTypeText] ?? t.task_type}巡检`}
      open
      onClose={onClose}
      footer={
        <>
          <span className="muted">
            完成度 {progress.filled}/{progress.total}
            {progress.abnormal > 0 && <span className="danger-text"> · 异常 {progress.abnormal} 项</span>}
          </span>
          <span style={{ flex: 1 }} />
          {t.status === "PLANNED" || t.status === "OVERDUE" ? (
            user?.role === "INSPECTOR" || user?.role === "SUPERVISOR" ? (
              <button className="primary" disabled={busy} onClick={doClaim}>领取任务</button>
            ) : null
          ) : editable ? (
            <>
              <button disabled={busy} onClick={() => run("save")}>保存草稿</button>
              <button
                className="primary"
                disabled={busy || !progress.isComplete}
                title={progress.isComplete ? "" : "完成全部检查项后可提交"}
                onClick={() => run("submit")}
              >
                提交巡检
              </button>
            </>
          ) : t.status === "SUBMITTED" && user?.role === "SUPERVISOR" ? (
            <button className="primary" disabled={busy} onClick={doReview}>复核通过</button>
          ) : null}
        </>
      }
    >
      <div className="stack">
        <div className="task-meta">
          <StatusBadge value={t.status} />
          <span className="muted">计划日期：{formatDate(t.plan_date)}</span>
          <span className="muted">巡检员：{t.inspector_name ?? "未领取"}</span>
          <span className="muted">检查单版本：{t.checklist_version}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
        <ChecklistPanel
          devices={detail.devices}
          items={detail.items}
          drafts={drafts}
          readonly={!editable}
          onChange={patch}
        />
        {error && <p className="danger-text">{error}</p>}
      </div>
    </Modal>
  );
}

export function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR";
  const { rows, error, load } = useInspectionTaskStore();
  const buildings = useBuildingStore((s) => s.rows);
  const loadBuildings = useBuildingStore((s) => s.load);

  const [tab, setTab] = useState<string>("");
  const [openTask, setOpenTask] = useState<{ id: number; readonly: boolean } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(createInspectionTaskForm());
  const [createError, setCreateError] = useState<string | null>(null);
  const { create } = useInspectionTaskStore();

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);
  useEffect(() => {
    load(tab ? { status: tab } : {});
  }, [load, tab]);

  const buildingName = useMemo(
    () => Object.fromEntries(buildings.map((b) => [b.id, b.name])),
    [buildings]
  );

  const submitCreate = async () => {
    setCreateError(null);
    try {
      await create({ ...form, building_id: Number(form.building_id) });
      setShowCreate(false);
      load(tab ? { status: tab } : {});
    } catch (e) {
      setCreateError((e as Error).message);
    }
  };

  const canInspect = user?.role === "INSPECTOR" || user?.role === "SUPERVISOR";

  const primaryAction = (task: InspectionTask) => {
    if ((task.status === "PLANNED" || task.status === "OVERDUE") && canInspect) {
      return (
        <button className="primary small" onClick={() => setOpenTask({ id: task.id, readonly: false })}>
          领取
        </button>
      );
    }
    if (task.status === "IN_PROGRESS") {
      return (
        <button className="primary small" onClick={() => setOpenTask({ id: task.id, readonly: false })}>
          {canInspect ? "继续检查" : "查看"}
        </button>
      );
    }
    if (task.status === "SUBMITTED" && isSupervisor) {
      return (
        <button className="primary small" onClick={() => setOpenTask({ id: task.id, readonly: false })}>
          去复核
        </button>
      );
    }
    return (
      <button className="ghost small" onClick={() => setOpenTask({ id: task.id, readonly: true })}>
        查看
      </button>
    );
  };

  return (
    <div className="stack">
      <div className="toolbar tabs">
        {TABS.map((status) => (
          <button
            key={status}
            className={"tab" + (tab === status ? " active" : "")}
            onClick={() => setTab(status)}
          >
            {status === "" ? "全部" : InspectionStatusText[status as keyof typeof InspectionStatusText]}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {isSupervisor && (
          <button
            className="primary"
            onClick={() => {
              setForm(createInspectionTaskForm({
                building_id: buildings[0]?.id ?? 0,
                plan_date: todayIso(),
              }));
              setShowCreate(true);
            }}
          >
            创建巡检计划
          </button>
        )}
      </div>

      {error && <EmptyState title="任务加载失败" hint={error} />}
      {!error && (
        <section className="panel">
          <table className="grid-table">
            <thead>
              <tr>
                <th>楼栋</th>
                <th>巡检类型</th>
                <th>计划日期</th>
                <th>巡检员</th>
                <th>完成度</th>
                <th>状态</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.building_name ?? buildingName[task.building_id]}</strong></td>
                  <td>{DeviceTypeText[task.task_type as keyof typeof DeviceTypeText] ?? task.task_type}</td>
                  <td>{formatDate(task.plan_date)}</td>
                  <td>{task.inspector_name ?? "-"}</td>
                  <td>
                    {task.progress ? `${task.progress.filled}/${task.progress.total}` : "-"}
                  </td>
                  <td><StatusBadge value={task.status} /></td>
                  <td>{primaryAction(task)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7}><EmptyState title="当前筛选下没有任务" /></td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {openTask && (
        <TaskExecutionModal
          taskId={openTask.id}
          readonly={openTask.readonly}
          onClose={() => setOpenTask(null)}
          onChanged={() => load(tab ? { status: tab } : {})}
        />
      )}

      <Modal
        title="创建巡检计划"
        open={showCreate}
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <button className="ghost" onClick={() => setShowCreate(false)}>取消</button>
            <button className="primary" onClick={submitCreate}>创建</button>
          </>
        }
      >
        <div className="form-grid">
          <label>楼栋</label>
          <select
            value={form.building_id}
            onChange={(e) => setForm({ ...form, building_id: Number(e.target.value) })}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <label>巡检类型（按设备类型）</label>
          <select
            value={form.task_type}
            onChange={(e) => setForm({ ...form, task_type: e.target.value })}
          >
            {DeviceType.map((t) => (
              <option key={t} value={t}>{DeviceTypeText[t]}</option>
            ))}
          </select>
          <label>计划日期</label>
          <input
            type="date"
            value={form.plan_date}
            onChange={(e) => setForm({ ...form, plan_date: e.target.value })}
          />
        </div>
        {createError && <p className="danger-text">{createError}</p>}
      </Modal>
    </div>
  );
}
