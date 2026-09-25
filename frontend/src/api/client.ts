import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { AppUser } from "../types/AppUser";

const AUTH_KEY = "fire-inspect-auth";

export interface AuthSession {
  token: string;
  user: AppUser;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function loadAuth(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuth(session: AuthSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;
  const query = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "" && v !== false)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const session = loadAuth();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let res: Response;
  try {
    res = await fetch(`${path}${query}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "无法连接服务器，请确认后端已启动");
  }

  if (res.status === 401 && session?.token && !path.startsWith("/api/auth/login")) {
    // 登录态失效：清理并回到登录页
    clearAuth();
    window.location.reload();
  }
  if (!res.ok) {
    let code = "INTERNAL_ERROR";
    let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
    try {
      const payload = await res.json();
      const detail = payload?.detail;
      if (payload?.code) {
        code = payload.code;
        message = payload.message;
      } else if (detail && typeof detail === "object" && detail.code) {
        code = detail.code;
        message = detail.message;
      } else if (typeof detail === "string") {
        message = detail;
      }
    } catch {
      // 保留默认错误文案
    }
    throw new ApiError(res.status, code, message);
  }
  return (await res.json()) as T;
}
