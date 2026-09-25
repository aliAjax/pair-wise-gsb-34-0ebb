from sqlalchemy import select

from src.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, session):
        self.session = session

    def find_recent(self, limit: int = 20):
        stmt = select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)
        return list(self.session.scalars(stmt).all())

    def insert(self, row: AuditLog):
        self.session.add(row)
        self.session.flush()
        return row
