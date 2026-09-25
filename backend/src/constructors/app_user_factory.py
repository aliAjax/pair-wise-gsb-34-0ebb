from src.utils.formatters import to_iso


def create_app_user_dto(**overrides):
    row = {
        "id": 0,
        "username": "",
        "display_name": "",
        "role": "INSPECTOR",
    }
    row.update(overrides)
    return row


def to_app_user_response(obj) -> dict:
    return create_app_user_dto(
        id=obj.id,
        username=obj.username,
        display_name=obj.display_name,
        role=obj.role,
    )


def create_audit_log_dto(**overrides):
    row = {
        "id": 0,
        "actor": "",
        "action": "",
        "target_type": "",
        "target_id": "",
        "detail": "",
        "created_at": None,
    }
    row.update(overrides)
    return row


def to_audit_log_response(obj) -> dict:
    return create_audit_log_dto(
        id=obj.id,
        actor=obj.actor,
        action=obj.action,
        target_type=obj.target_type,
        target_id=obj.target_id,
        detail=obj.detail,
        created_at=to_iso(obj.created_at),
    )
