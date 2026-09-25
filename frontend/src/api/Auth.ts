import { request } from "./client";
import type { AppUser } from "../types/AppUser";

const endpoint = "/api/auth";

export async function login(username: string, password: string): Promise<{ token: string; user: AppUser }> {
  return request(`${endpoint}/login`, { method: "POST", body: { username, password } });
}

export async function listUsers(): Promise<AppUser[]> {
  return request(`${endpoint}/users`);
}
