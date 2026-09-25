from sqlalchemy.exc import SQLAlchemyError

from src.constructors.inspection_result_factory import to_inspection_result_response
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.utils.exceptions import BizError, not_found, state_conflict, validation_failed


class InspectionResultService:
    def __init__(self, session):
        self.session = session
        self.repo = InspectionResultRepository(session)
        self.task_repo = InspectionTaskRepository(session)
        self.ticket_repo = HazardTicketRepository(session)

    def list(self, task_id=None, device_id=None, result_status=None, unticketed: bool = False):
        rows = self.repo.find_all(task_id=task_id, device_id=device_id, result_status=result_status)
        if unticketed:
            # 只保留还没有未关闭整改单的异常结果，供主管派单
            rows = [r for r in rows if not self.ticket_repo.find_open_by_result(r.id)]
        return [to_inspection_result_response(row) for row in rows]

    def update(self, id: int, payload, user):
        row = self.repo.find_by_id(id)
        if row is None:
            raise not_found(f"巡检结果 {id} 不存在")
        task = self.task_repo.find_by_id(row.task_id)
        if task is None:
            raise not_found(f"巡检任务 {row.task_id} 不存在")
        if task.status != "IN_PROGRESS":
            raise state_conflict("任务不在进行中，检查项不可修改")
        if user.get("role") == "INSPECTOR" and task.inspector_id != user.get("id"):
            raise state_conflict("只能填写本人领取的任务")
        if payload.result_status is not None and payload.result_status not in ("NORMAL", "ABNORMAL"):
            raise validation_failed("检查结果只能判定为 NORMAL 或 ABNORMAL")
        if payload.result_status is not None:
            row.result_status = payload.result_status
        if payload.measured_value is not None:
            row.measured_value = payload.measured_value
        if payload.photo_url is not None:
            row.photo_url = payload.photo_url
        if payload.note is not None:
            row.note = payload.note
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"结果保存失败：{exc.__class__.__name__}") from exc
        return to_inspection_result_response(row)
