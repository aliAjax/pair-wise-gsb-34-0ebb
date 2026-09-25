import { create } from "zustand";
import { createFireDevice, listFireDevice, updateFireDevice } from "../api/FireDevice";
import type { FireDeviceFilter, FireDevicePayload } from "../api/FireDevice";
import type { FireDevice } from "../types/FireDevice";

type State = {
  rows: FireDevice[];
  loading: boolean;
  load: (filter?: FireDeviceFilter) => Promise<void>;
  create: (payload: FireDevicePayload) => Promise<void>;
  update: (id: number, payload: FireDevicePayload) => Promise<void>;
};

export const useFireDeviceStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load(filter) {
    set({ loading: true });
    set({ rows: await listFireDevice(filter), loading: false });
  },
  async create(payload) {
    await createFireDevice(payload);
    await get().load();
  },
  async update(id, payload) {
    await updateFireDevice(id, payload);
    await get().load();
  }
}));
