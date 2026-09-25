import type { Role } from "../types/Role";

export const ROLES: Role[] = ["INSPECTOR", "MAINTAINER", "SUPERVISOR", "AUDITOR"];

export const ROLE_TEXT: Record<Role, string> = {
  INSPECTOR: "巡检员",
  MAINTAINER: "维保商",
  SUPERVISOR: "物业主管",
  AUDITOR: "审计员",
};
