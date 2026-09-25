from sqlalchemy.exc import SQLAlchemyError

from src.constants.checklist_items import CHECKLIST_ITEMS, CHECKLIST_VERSION
from src.constants.task_type import TaskType
from src.constructors.inspection_task_factory import to_inspection_task_response
from src.models.inspection_result import InspectionResult
from src.models.inspection_task import InspectionTask
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.utils.exceptions import BizError, not_found, state_conflict, validation_failed
from src.utils.formatters import now, parse_date


class InspectionTaskService:
    def __init__(self, session):
        self.session = session
        self.repo = InspectionTaskRepository(session)
        self.result_repo = InspectionResultRepository(session)
        self.device_repo = FireDeviceRepository(session)
        self.building_repo = BuildingRepository(session)

    def list(self, building_id=None, status=None, inspector_id=None):
        rows = self.repo.find_all(building_id=building_id, status=status, inspector_id=inspector_id)
        return [to_inspection_task_response(row) for row in rows]

    def get(self, id: int):
        row = self.repo.find_by_id(id)
        if row is None:
            raise not_found(f"巡检任务 {id} 不存在")
        return row

    def create(self, payload):
        if not payload.building_id or self.building_repo.find_by_id(payload.building_id) is None:
            raise validation_failed("所属楼栋不存在")
        if payload.task_type and payload.task_type not in TaskType:
            raise validation_failed(f"任务类型必须是 {'/'.join(TaskType)} 之一")
        try:
            plan_date = parse_date(payload.plan_date, "plan_date") if payload.plan_date else None
        except ValueError as exc:
            raise validation_failed(str(exc)) from exc
        devices = self.device_repo.find_by_building(payload.building_id)
        if not devices:
            raise validation_failed("该楼栋下没有消防设备，无法生成检查项")
        task = InspectionTask(
            building_id=payload.building_id,
            inspector_id=None,
            plan_date=plan_date,
            task_type=payload.task_type or "MONTHLY",
            status="PLANNED",
            checklist_version=payload.checklist_version or CHECKLIST_VERSION,
            finished_at=None,
        )
        try:
            self.repo.insert(task)
            # 按楼栋内每台设备的类型预生成检查项，巡检员逐项填写
            for device in devices:
                for item_code, _name in CHECKLIST_ITEMS.get(device.device_type, []):
                    self.result_repo.insert(
                        InspectionResult(
                            task_id=task.id,
                            device_id=device.id,
                            item_code=item_code,
                            result_status="PENDING",
                            measured_value="",
                            photo_url="",
                            note="",
                        )
                    )
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"任务创建失败：{exc.__class__.__name__}") from exc
        return to_inspection_task_response(task)

    def claim(self, id: int, user):
        task = self.get(id)
        if task.status != "PLANNED":
            raise state_conflict("只有计划中的任务可以领取")
        task.inspector_id = user["id"]
        task.status = "IN_PROGRESS"
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"任务领取失败：{exc.__class__.__name__}") from exc
        return to_inspection_task_response(task)

    def submit(self, id: int, user):
        task = self.get(id)
        if task.status != "IN_PROGRESS":
            raise state_conflict("只有进行中的任务可以提交")
        if task.inspector_id != user["id"]:
            raise state_conflict("只能提交本人领取的任务")
        results = self.result_repo.find_by_task(id)
        pending = [r for r in results if r.result_status == "PENDING"]
        if pending:
            raise state_conflict(f"还有 {len(pending)} 个检查项未填写，不能提交")
        task.status = "SUBMITTED"
        task.finished_at = now()
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"任务提交失败：{exc.__class__.__name__}") from exc
        return to_inspection_task_response(task)

    def review(self, id: int, _user):
        task = self.get(id)
        if task.status != "SUBMITTED":
            raise state_conflict("只有已提交的任务可以复核")
        task.status = "REVIEWED"
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"任务复核失败：{exc.__class__.__name__}") from exc
        return to_inspection_task_response(task)
