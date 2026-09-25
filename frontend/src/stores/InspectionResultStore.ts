import { create } from "zustand";
import { listInspectionResult, updateInspectionResult } from "../api/InspectionResult";
import type { InspectionResultFilter, InspectionResultPayload } from "../api/InspectionResult";
import type { InspectionResult } from "../types/InspectionResult";

type State = {
  rows: InspectionResult[];
  loading: boolean;
  load: (filter?: InspectionResultFilter) => Promise<void>;
  update: (id: number, payload: InspectionResultPayload) => Promise<void>;
};

export const useInspectionResultStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load(filter) {
    set({ loading: true });
    set({ rows: await listInspectionResult(filter), loading: false });
  },
  async update(id, payload) {
    const saved = await updateInspectionResult(id, payload);
    // 局部更新，避免整表重载导致填写中的输入框失焦
    set({ rows: get().rows.map((row) => (row.id === saved.id ? saved : row)) });
  }
}));
