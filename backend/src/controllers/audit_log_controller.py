from fastapi import Depends
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.audit_log_service import AuditLogService


def list_audit_log(limit: int = 20, session: Session = Depends(get_session)):
    return AuditLogService(session).recent(limit)
