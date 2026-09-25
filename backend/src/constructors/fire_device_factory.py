from src.utils.formatters import to_iso


def create_fire_device_dto(**overrides):
    """消防设备默认对象（表单初始值 / 种子数据基底）。"""
    row = {
        "id": 0,
        "building_id": 0,
        "device_code": "",
        "device_type": "EXTINGUISHER",
        "floor": "1F",
        "location_desc": "",
        "install_date": None,
        "status": "NORMAL",
        "next_maintenance_at": None,
    }
    row.update(overrides)
    return row


def to_fire_device_response(obj) -> dict:
    return create_fire_device_dto(
        id=obj.id,
        building_id=obj.building_id,
        device_code=obj.device_code,
        device_type=obj.device_type,
        floor=obj.floor,
        location_desc=obj.location_desc,
        install_date=to_iso(obj.install_date),
        status=obj.status,
        next_maintenance_at=to_iso(obj.next_maintenance_at),
    )
