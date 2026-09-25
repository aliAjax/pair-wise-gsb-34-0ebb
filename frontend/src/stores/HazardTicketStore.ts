import { create } from "zustand";
import {
  closeHazardTicket,
  dispatchHazardTicket,
  listHazardTicket,
  rectifyHazardTicket,
  type DispatchForm,
  type TicketFilters,
} from "../api/HazardTicket";
import type { HazardTicket } from "../types/HazardTicket";

type State = {
  rows: HazardTicket[];
  loading: boolean;
  error: string | null;
  load: (filters?: TicketFilters) => Promise<void>;
  dispatch: (payload: DispatchForm) => Promise<HazardTicket>;
  rectify: (id: number, note: string) => Promise<HazardTicket>;
  close: (id: number, passed: boolean, note: string) => Promise<HazardTicket>;
};

export const useHazardTicketStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  async load(filters = {}) {
    set({ loading: true, error: null });
    try {
      set({ rows: await listHazardTicket(filters), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async dispatch(payload) {
    const row = await dispatchHazardTicket(payload);
    set({ rows: [row, ...get().rows] });
    return row;
  },
  async rectify(id, note) {
    const row = await rectifyHazardTicket(id, note);
    set({ rows: get().rows.map((item) => (item.id === id ? row : item)) });
    return row;
  },
  async close(id, passed, note) {
    const row = await closeHazardTicket(id, passed, note);
    set({ rows: get().rows.map((item) => (item.id === id ? row : item)) });
    return row;
  }
}));
