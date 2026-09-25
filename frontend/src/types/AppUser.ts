import type { Role } from "./Role";

export interface AppUser {
  id: number;
  username: string;
  display_name: string;
  role: Role;
}
