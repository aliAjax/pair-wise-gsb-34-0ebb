from src.utils.formatters import format_date, format_datetime


def create_hazard_ticket_dto(**overrides):
    """隐患整改单默认对象：表单与种子数据的基线结构。"""
    row = {
        "id": 0,
        "result_id": 0,
        "severity": "MEDIUM",
        "owner_id": 0,
        "deadline": None,
        "rectify_status": "ASSIGNED",
        "rectify_note": "",
        "closed_at": None,
    }
    row.update(overrides)
    return row


def hazard_ticket_response(row, owner_name=None, result=None, device=None, building_name=None, overdue=False):
    return {
        "id": row.id,
        "result_id": row.result_id,
        "severity": row.severity,
        "owner_id": row.owner_id,
        "owner_name": owner_name,
        "deadline": format_date(row.deadline),
        "rectify_status": row.rectify_status,
        "rectify_note": row.rectify_note,
        "closed_at": format_datetime(row.closed_at),
        "created_at": format_datetime(row.created_at),
        "is_overdue": overdue,
        "device_id": device.id if device else None,
        "device_code": device.device_code if device else None,
        "device_type": device.device_type if device else None,
        "building_name": building_name,
        "item_code": result.item_code if result else None,
        "result_note": result.note if result else None,
        "measured_value": result.measured_value if result else None,
    }
