from src.constructors.app_user_factory import to_audit_log_response
from src.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
    def __init__(self, session):
        self.session = session
        self.repo = AuditLogRepository(session)

    def recent(self, limit: int = 20):
        limit = max(1, min(int(limit or 20), 100))
        return [to_audit_log_response(row) for row in self.repo.find_recent(limit)]
