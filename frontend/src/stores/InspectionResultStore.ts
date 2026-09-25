import { create } from "zustand";
import {
  listAbnormalPending,
  listInspectionResult,
} from "../api/InspectionResult";
import type { InspectionResult } from "../types/InspectionResult";

type State = {
  rows: InspectionResult[];
  pending: InspectionResult[];
  loading: boolean;
  error: string | null;
  load: (filters?: Parameters<typeof listInspectionResult>[0]) => Promise<void>;
  loadPending: () => Promise<void>;
};

export const useInspectionResultStore = create<State>((set) => ({
  rows: [],
  pending: [],
  loading: false,
  error: null,
  async load(filters = {}) {
    set({ loading: true, error: null });
    try {
      set({ rows: await listInspectionResult(filters), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async loadPending() {
    set({ loading: true, error: null });
    try {
      set({ pending: await listAbnormalPending(), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  }
}));
