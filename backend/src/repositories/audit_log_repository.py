from sqlalchemy import select

from src.models.audit_log import AuditLog


class AuditLogRepository:
    def find_recent(self, db, limit=20, target_type=None, target_id=None):
        stmt = select(AuditLog).order_by(AuditLog.id.desc())
        if target_type:
            stmt = stmt.where(AuditLog.target_type == target_type)
        if target_id:
            stmt = stmt.where(AuditLog.target_id == str(target_id))
        stmt = stmt.limit(limit)
        return db.scalars(stmt).all()

    def insert(self, db, row: AuditLog):
        db.add(row)
        db.flush()
        return row
