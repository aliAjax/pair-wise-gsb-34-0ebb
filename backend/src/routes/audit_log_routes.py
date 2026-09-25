from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import auth_controller
from src.middlewares.rbac_middleware import current_user

router = APIRouter(prefix="/api/audit-log", tags=["AuditLog"])


@router.get("")
def list_audit_logs(limit: int = 20, target_type: str | None = None,
                    target_id: int | None = None,
                    db: Session = Depends(get_db), user=Depends(current_user)):
    return auth_controller.list_audit_logs(db, min(limit, 100), target_type, target_id)
