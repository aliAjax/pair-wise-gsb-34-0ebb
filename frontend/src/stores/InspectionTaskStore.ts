import { create } from "zustand";
import {
  claimTask,
  listInspectionTask,
  reviewTask,
  saveInspectionTask,
  saveTaskResults,
  submitTask,
  type TaskFilters,
  type TaskForm,
} from "../api/InspectionTask";
import type { InspectionTask } from "../types/InspectionTask";

type State = {
  rows: InspectionTask[];
  loading: boolean;
  error: string | null;
  load: (filters?: TaskFilters) => Promise<void>;
  create: (payload: TaskForm) => Promise<InspectionTask>;
  claim: (id: number) => Promise<unknown>;
  saveResults: (id: number, results: Parameters<typeof saveTaskResults>[1]) => Promise<unknown>;
  submit: (id: number) => Promise<unknown>;
  review: (id: number) => Promise<unknown>;
};

export const useInspectionTaskStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  async load(filters = {}) {
    set({ loading: true, error: null });
    try {
      set({ rows: await listInspectionTask(filters), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async create(payload) {
    const row = await saveInspectionTask(payload);
    set({ rows: [row, ...get().rows] });
    return row;
  },
  async claim(id) {
    const detail = await claimTask(id);
    await get().load();
    return detail;
  },
  async saveResults(id, results) {
    const detail = await saveTaskResults(id, results);
    await get().load();
    return detail;
  },
  async submit(id) {
    const detail = await submitTask(id);
    await get().load();
    return detail;
  },
  async review(id) {
    const detail = await reviewTask(id);
    await get().load();
    return detail;
  }
}));
