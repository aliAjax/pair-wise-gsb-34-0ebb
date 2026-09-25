from src.utils.formatters import format_date, format_datetime


def create_inspection_task_dto(**overrides):
    """巡检任务默认对象：表单与种子数据的基线结构。"""
    row = {
        "id": 0,
        "building_id": 0,
        "inspector_id": None,
        "plan_date": None,
        "task_type": "EXTINGUISHER",
        "status": "PLANNED",
        "checklist_version": "v1.0",
        "finished_at": None,
    }
    row.update(overrides)
    return row


def inspection_task_response(row, building_name=None, inspector_name=None, progress=None):
    return {
        "id": row.id,
        "building_id": row.building_id,
        "building_name": building_name,
        "inspector_id": row.inspector_id,
        "inspector_name": inspector_name,
        "plan_date": format_date(row.plan_date),
        "task_type": row.task_type,
        "status": row.status,
        "checklist_version": row.checklist_version,
        "finished_at": format_datetime(row.finished_at),
        "progress": progress,
    }
