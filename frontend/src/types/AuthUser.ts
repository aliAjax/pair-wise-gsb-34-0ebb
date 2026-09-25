export type Role = "INSPECTOR" | "MAINTAINER" | "SUPERVISOR" | "AUDITOR";

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  role: Role | string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
