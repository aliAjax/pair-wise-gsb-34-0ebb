from src.utils.formatters import to_iso


def create_building_dto(**overrides):
    """楼栋默认对象（表单初始值 / 种子数据基底）。"""
    row = {
        "id": 0,
        "name": "",
        "campus": "",
        "floor_count": 1,
        "fire_grade": "二级",
        "manager_id": 0,
        "address_code": "",
    }
    row.update(overrides)
    return row


def to_building_response(obj) -> dict:
    return create_building_dto(
        id=obj.id,
        name=obj.name,
        campus=obj.campus,
        floor_count=obj.floor_count,
        fire_grade=obj.fire_grade,
        manager_id=obj.manager_id,
        address_code=obj.address_code,
    )


# 保留 to_iso 引用，统一响应里的日期序列化入口
serialize_date = to_iso
