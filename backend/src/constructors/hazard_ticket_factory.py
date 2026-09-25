from src.utils.formatters import to_iso


def create_hazard_ticket_dto(**overrides):
    """隐患整改单默认对象（表单初始值 / 种子数据基底）。"""
    row = {
        "id": 0,
        "result_id": 0,
        "severity": "MEDIUM",
        "owner_id": 0,
        "deadline": None,
        "rectify_status": "OPEN",
        "rectify_note": "",
        "closed_at": None,
        "created_at": None,
    }
    row.update(overrides)
    return row


def to_hazard_ticket_response(obj) -> dict:
    return create_hazard_ticket_dto(
        id=obj.id,
        result_id=obj.result_id,
        severity=obj.severity,
        owner_id=obj.owner_id,
        deadline=to_iso(obj.deadline),
        rectify_status=obj.rectify_status,
        rectify_note=obj.rectify_note,
        closed_at=to_iso(obj.closed_at),
        created_at=to_iso(obj.created_at),
    )
