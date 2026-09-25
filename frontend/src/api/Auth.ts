import { get, post } from "./http";
import type { AuthUser, LoginResponse } from "../types/AuthUser";

const endpoint = "/api/auth";

export async function login(username: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>(`${endpoint}/login`, { username, password });
}

export async function listUsers(): Promise<AuthUser[]> {
  return get<AuthUser[]>(`${endpoint}/users`);
}
