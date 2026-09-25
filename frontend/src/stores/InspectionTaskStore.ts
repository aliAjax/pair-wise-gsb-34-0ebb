import { create } from "zustand";
import {
  claimInspectionTask,
  createInspectionTask,
  listInspectionTask,
  reviewInspectionTask,
  submitInspectionTask
} from "../api/InspectionTask";
import type { InspectionTaskFilter, InspectionTaskPayload } from "../api/InspectionTask";
import type { InspectionTask } from "../types/InspectionTask";

type State = {
  rows: InspectionTask[];
  loading: boolean;
  load: (filter?: InspectionTaskFilter) => Promise<void>;
  create: (payload: InspectionTaskPayload) => Promise<void>;
  claim: (id: number) => Promise<void>;
  submit: (id: number) => Promise<void>;
  review: (id: number) => Promise<void>;
};

export const useInspectionTaskStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load(filter) {
    set({ loading: true });
    set({ rows: await listInspectionTask(filter), loading: false });
  },
  async create(payload) {
    await createInspectionTask(payload);
    await get().load();
  },
  async claim(id) {
    await claimInspectionTask(id);
    await get().load();
  },
  async submit(id) {
    await submitInspectionTask(id);
    await get().load();
  },
  async review(id) {
    await reviewInspectionTask(id);
    await get().load();
  }
}));
