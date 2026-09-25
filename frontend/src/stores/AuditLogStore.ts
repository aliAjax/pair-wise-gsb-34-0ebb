import { create } from "zustand";
import { listAuditLog } from "../api/AuditLog";
import type { AuditLog } from "../types/AuditLog";

type State = {
  rows: AuditLog[];
  loading: boolean;
  load: (limit?: number) => Promise<void>;
};

export const useAuditLogStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(limit = 20) {
    set({ loading: true });
    try {
      set({ rows: await listAuditLog(limit), loading: false });
    } catch {
      // 审计员/主管之外的角色无权限，静默置空
      set({ rows: [], loading: false });
    }
  }
}));
