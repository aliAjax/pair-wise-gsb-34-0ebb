import { request } from "./client";
import type { AuditLog } from "../types/AuditLog";

const endpoint = "/api/audit-log";

export async function listAuditLog(limit = 20): Promise<AuditLog[]> {
  return request(endpoint, { params: { limit } });
}
