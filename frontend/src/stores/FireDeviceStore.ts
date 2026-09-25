import { create } from "zustand";
import {
  listFireDevice,
  saveFireDevice,
  type DeviceFilters,
  type FireDeviceForm,
} from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";

type State = {
  rows: FireDevice[];
  loading: boolean;
  error: string | null;
  load: (filters?: DeviceFilters) => Promise<void>;
  create: (payload: FireDeviceForm) => Promise<FireDevice>;
};

export const useFireDeviceStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  async load(filters = {}) {
    set({ loading: true, error: null });
    try {
      set({ rows: await listFireDevice(filters), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async create(payload) {
    const row = await saveFireDevice(payload);
    set({ rows: [...get().rows, row] });
    return row;
  }
}));
