import { create } from "zustand";
import { closeHazardTicket, dispatchHazardTicket, listHazardTicket, rectifyHazardTicket } from "../api/HazardTicket";
import type { HazardTicketFilter, HazardTicketPayload } from "../api/HazardTicket";
import type { HazardTicket } from "../types/HazardTicket";

type State = {
  rows: HazardTicket[];
  loading: boolean;
  load: (filter?: HazardTicketFilter) => Promise<void>;
  dispatch: (payload: HazardTicketPayload) => Promise<void>;
  rectify: (id: number, note: string) => Promise<void>;
  close: (id: number) => Promise<void>;
};

export const useHazardTicketStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load(filter) {
    set({ loading: true });
    set({ rows: await listHazardTicket(filter), loading: false });
  },
  async dispatch(payload) {
    await dispatchHazardTicket(payload);
    await get().load();
  },
  async rectify(id, note) {
    await rectifyHazardTicket(id, note);
    await get().load();
  },
  async close(id) {
    await closeHazardTicket(id);
    await get().load();
  }
}));
