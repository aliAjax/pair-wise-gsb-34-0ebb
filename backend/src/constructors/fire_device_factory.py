from src.utils.formatters import format_date


def create_fire_device_dto(**overrides):
    """消防设备默认对象：表单与种子数据的基线结构。"""
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


def fire_device_response(row, building_name=None, maintenance_due=False):
    return {
        "id": row.id,
        "building_id": row.building_id,
        "building_name": building_name,
        "device_code": row.device_code,
        "device_type": row.device_type,
        "floor": row.floor,
        "location_desc": row.location_desc,
        "install_date": format_date(row.install_date),
        "status": row.status,
        "next_maintenance_at": format_date(row.next_maintenance_at),
        "maintenance_due": maintenance_due,
    }
