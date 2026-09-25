from datetime import datetime, timezone

from src.constants.log_templates import LOG_TEMPLATES
from src.models.audit_log import AuditLog
from src.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
    """业务操作日志：巡检提交、隐患派单、复验关闭等写操作统一落库。"""

    def __init__(self):
        self.repo = AuditLogRepository()

    def record(self, db, user, entity, action_key, target_id, **fmt):
        template = LOG_TEMPLATES.get(entity, {}).get(action_key, f"{entity}.{action_key}")
        try:
            action = template.format(**fmt) if fmt else template
        except KeyError:
            action = template
        actor = "系统"
        if user:
            actor = user.get("name") or user.get("username") or "系统"
        row = AuditLog(
            actor=actor,
            action=action,
            target_type=entity,
            target_id=str(target_id),
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        self.repo.insert(db, row)
        return row

    def recent(self, db, limit=20, target_type=None, target_id=None):
        rows = self.repo.find_recent(db, limit, target_type, target_id)
        return [
            {
                "id": row.id,
                "actor": row.actor,
                "action": row.action,
                "target_type": row.target_type,
                "target_id": row.target_id,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
