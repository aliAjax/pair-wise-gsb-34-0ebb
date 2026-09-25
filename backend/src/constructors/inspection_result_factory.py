from src.utils.formatters import format_datetime


def create_inspection_result_dto(**overrides):
    """巡检结果默认对象：表单与种子数据的基线结构。"""
    row = {
        "id": 0,
        "task_id": 0,
        "device_id": 0,
        "item_code": "",
        "result_status": "NORMAL",
        "measured_value": "",
        "photo_url": "",
        "note": "",
    }
    row.update(overrides)
    return row


def inspection_result_response(row, device_code=None, item_name=None, ticket_id=None):
    return {
        "id": row.id,
        "task_id": row.task_id,
        "device_id": row.device_id,
        "device_code": device_code,
        "item_code": row.item_code,
        "item_name": item_name,
        "result_status": row.result_status,
        "measured_value": row.measured_value,
        "photo_url": row.photo_url,
        "note": row.note,
        "ticket_id": ticket_id,
        "updated_at": format_datetime(row.updated_at),
    }
