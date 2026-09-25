import { create } from "zustand";
import { listBuilding, saveBuilding, type BuildingForm } from "../api/Building";
import type { Building } from "../types/Building";

type State = {
  rows: Building[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (payload: BuildingForm) => Promise<Building>;
};

export const useBuildingStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listBuilding(), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async create(payload) {
    const row = await saveBuilding(payload);
    set({ rows: [...get().rows, row] });
    return row;
  }
}));
