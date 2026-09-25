import { create } from "zustand";
import { createBuilding, listBuilding, updateBuilding } from "../api/Building";
import type { BuildingPayload } from "../api/Building";
import type { Building } from "../types/Building";

type State = {
  rows: Building[];
  loading: boolean;
  load: () => Promise<void>;
  create: (payload: BuildingPayload) => Promise<void>;
  update: (id: number, payload: BuildingPayload) => Promise<void>;
};

export const useBuildingStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listBuilding(), loading: false });
  },
  async create(payload) {
    await createBuilding(payload);
    await get().load();
  },
  async update(id, payload) {
    await updateBuilding(id, payload);
    await get().load();
  }
}));
