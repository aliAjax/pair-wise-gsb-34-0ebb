import { create } from "zustand";
import { loadAuth, saveAuth, clearAuth } from "../api/client";
import { listUsers, login } from "../api/Auth";
import type { AppUser } from "../types/AppUser";

type State = {
  user: AppUser | null;
  token: string | null;
  users: AppUser[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUsers: () => Promise<void>;
};

const persisted = loadAuth();

export const useAuthStore = create<State>((set) => ({
  user: persisted?.user ?? null,
  token: persisted?.token ?? null,
  users: [],
  async login(username, password) {
    const session = await login(username, password);
    saveAuth(session);
    set({ user: session.user, token: session.token });
  },
  logout() {
    clearAuth();
    set({ user: null, token: null });
  },
  async loadUsers() {
    set({ users: await listUsers() });
  }
}));
