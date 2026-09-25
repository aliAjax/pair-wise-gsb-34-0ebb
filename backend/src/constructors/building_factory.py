def create_building_dto(**overrides):
    """楼栋默认对象：表单与种子数据的基线结构。"""
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


def building_response(row):
    return {
        "id": row.id,
        "name": row.name,
        "campus": row.campus,
        "floor_count": row.floor_count,
        "fire_grade": row.fire_grade,
        "manager_id": row.manager_id,
        "address_code": row.address_code,
    }
