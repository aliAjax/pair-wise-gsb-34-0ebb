import { get, withQuery } from "./http";
import type { AuditLogEntry } from "../types/Stats";

export async function listAuditLog(limit = 20, targetType?: string, targetId?: number): Promise<AuditLogEntry[]> {
  return get<AuditLogEntry[]>(
    withQuery("/api/audit-log", {
      limit,
      target_type: targetType,
      target_id: targetId,
    })
  );
}
