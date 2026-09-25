from src.services.audit_log_service import AuditLogService
from src.services.auth_service import AuthService
from src.types.auth_payload import LoginPayload

auth_service = AuthService()
audit_service = AuditLogService()


def login(db, payload: LoginPayload):
    return auth_service.login(db, payload)


def list_users(db):
    return auth_service.list_users(db)


def list_audit_logs(db, limit=20, target_type=None, target_id=None):
    return audit_service.recent(db, limit, target_type, target_id)
