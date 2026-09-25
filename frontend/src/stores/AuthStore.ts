import { create } from "zustand";
import { listUsers, login as apiLogin } from "../api/Auth";
import { getToken, setToken } from "../api/http";
import type { AuthUser } from "../types/AuthUser";

const USER_KEY = "fire-inspect-user";

function readUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

type State = {
  user: AuthUser | null;
  token: string | null;
  users: AuthUser[];
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  loadUsers: () => Promise<AuthUser[]>;
};

export const useAuthStore = create<State>((set) => ({
  user: readUser(),
  token: getToken(),
  users: [],
  async login(username, password) {
    const { token, user } = await apiLogin(username, password);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
    return user;
  },
  logout() {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
  async loadUsers() {
    const users = await listUsers();
    set({ users });
    return users;
  }
}));
