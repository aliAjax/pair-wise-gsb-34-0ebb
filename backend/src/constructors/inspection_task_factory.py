from src.constants.inspection_status import ACTIVE_STATUS
from src.utils.formatters import is_overdue, to_iso


def create_inspection_task_dto(**overrides):
    """巡检任务默认对象（表单初始值 / 种子数据基底）。"""
    row = {
        "id": 0,
        "building_id": 0,
        "inspector_id": None,
        "plan_date": None,
        "task_type": "MONTHLY",
        "status": "PLANNED",
        "checklist_version": "v2026.09",
        "finished_at": None,
        "is_overdue": False,
    }
    row.update(overrides)
    return row


def to_inspection_task_response(obj) -> dict:
    # 计划日期已过且仍未完成的任务，以 is_overdue 标记供前端展示逾期
    overdue = obj.status in ACTIVE_STATUS and is_overdue(obj.plan_date, done=False)
    return create_inspection_task_dto(
        id=obj.id,
        building_id=obj.building_id,
        inspector_id=obj.inspector_id,
        plan_date=to_iso(obj.plan_date),
        task_type=obj.task_type,
        status=obj.status,
        checklist_version=obj.checklist_version,
        finished_at=to_iso(obj.finished_at),
        is_overdue=overdue,
    )
