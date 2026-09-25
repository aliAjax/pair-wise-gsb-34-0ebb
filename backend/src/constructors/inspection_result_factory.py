from src.utils.formatters import to_iso


def create_inspection_result_dto(**overrides):
    """巡检结果默认对象（表单初始值 / 种子数据基底）。"""
    row = {
        "id": 0,
        "task_id": 0,
        "device_id": 0,
        "item_code": "",
        "result_status": "PENDING",
        "measured_value": "",
        "photo_url": "",
        "note": "",
        "created_at": None,
    }
    row.update(overrides)
    return row


def to_inspection_result_response(obj) -> dict:
    return create_inspection_result_dto(
        id=obj.id,
        task_id=obj.task_id,
        device_id=obj.device_id,
        item_code=obj.item_code,
        result_status=obj.result_status,
        measured_value=obj.measured_value,
        photo_url=obj.photo_url,
        note=obj.note,
        created_at=to_iso(obj.created_at),
    )
