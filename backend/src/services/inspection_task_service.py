from datetime import date, datetime, timezone

from src.constants.checklist_items import CHECKLIST_ITEMS
from src.constants.device_type import DeviceType
from src.constants.result_status import ResultStatus
from src.constructors.inspection_result_factory import inspection_result_response
from src.constructors.inspection_task_factory import inspection_task_response
from src.models.inspection_result import InspectionResult
from src.models.inspection_task import InspectionTask
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.repositories.user_repository import UserRepository
from src.services.audit_log_service import AuditLogService
from src.services.fire_device_service import FireDeviceService
from src.utils.exceptions import ServiceError

FINISHED_STATUSES = ("SUBMITTED", "REVIEWED")


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class InspectionTaskService:
    def __init__(self):
        self.repo = InspectionTaskRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.user_repo = UserRepository()
        self.device_service = FireDeviceService()
        self.audit = AuditLogService()

    # ---------- 查询 ----------

    def _refresh_overdue(self, db):
        """计划日期已过且未完成的任务惰性标记为逾期。"""
        expired = self.repo.find_expired_open(db, date.today())
        for row in expired:
            row.status = "OVERDUE"
        if expired:
            db.commit()

    def _names(self, db):
        buildings = {b.id: b.name for b in self.building_repo.find_all(db)}
        users = {u.id: u.display_name for u in self.user_repo.find_all(db)}
        return buildings, users

    def _progress(self, db, task):
        devices = self.device_repo.find_by_building_and_type(
            db, task.building_id, task.task_type
        )
        items = CHECKLIST_ITEMS.get(task.task_type, [])
        total = len(devices) * len(items)
        if total == 0:
            return {"filled": 0, "total": 0}
        filled = len(self.result_repo.find_by_task(db, task.id))
        return {"filled": min(filled, total), "total": total}

    def _render(self, db, task, buildings, users):
        return inspection_task_response(
            task,
            building_name=buildings.get(task.building_id),
            inspector_name=users.get(task.inspector_id) if task.inspector_id else None,
            progress=self._progress(db, task),
        )

    def list(self, db, status=None, building_id=None, inspector_id=None):
        self._refresh_overdue(db)
        buildings, users = self._names(db)
        rows = self.repo.find_all(db, status, building_id, inspector_id)
        return [self._render(db, row, buildings, users) for row in rows]

    def detail(self, db, task_id):
        self._refresh_overdue(db)
        task = self.repo.find_by_id(db, task_id)
        if not task:
            raise ServiceError("TASK_NOT_FOUND", 404)
        buildings, users = self._names(db)
        devices = self.device_repo.find_by_building_and_type(
            db, task.building_id, task.task_type
        )
        items = CHECKLIST_ITEMS.get(task.task_type, [])
        results = self.result_repo.find_by_task(db, task_id)
        result_map = {(r.device_id, r.item_code): r for r in results}
        item_names = {i["item_code"]: i["item_name"] for i in items}
        return {
            "task": self._render(db, task, buildings, users),
            "items": items,
            "devices": [
                {
                    "device_id": d.id,
                    "device_code": d.device_code,
                    "floor": d.floor,
                    "location_desc": d.location_desc,
                    "status": d.status,
                }
                for d in devices
            ],
            "results": [
                inspection_result_response(
                    r,
                    device_code=next(
                        (d.device_code for d in devices if d.id == r.device_id), None
                    ),
                    item_name=item_names.get(r.item_code),
                )
                for r in results
            ],
            "result_map": {
                f"{device_id}:{item_code}": r.id
                for (device_id, item_code), r in result_map.items()
            },
        }

    # ---------- 写操作 ----------

    def create(self, db, payload, user):
        if payload.task_type not in DeviceType:
            raise ServiceError("VALIDATION_FAILED", 422, "巡检类型不合法")
        building = self.building_repo.find_by_id(db, payload.building_id)
        if not building:
            raise ServiceError("BUILDING_NOT_FOUND", 404)
        try:
            plan_date = date.fromisoformat(str(payload.plan_date)[:10])
        except ValueError:
            raise ServiceError("VALIDATION_FAILED", 422, "plan_date 日期格式应为 YYYY-MM-DD")
        devices = self.device_repo.find_by_building_and_type(
            db, payload.building_id, payload.task_type
        )
        if not devices:
            raise ServiceError(
                "VALIDATION_FAILED", 422, "该楼栋下没有此类型的设备，无法生成检查单"
            )
        task = InspectionTask(
            building_id=payload.building_id,
            inspector_id=None,
            plan_date=plan_date,
            task_type=payload.task_type,
            status="PLANNED",
            checklist_version=payload.checklist_version or "v1.0",
            created_at=_now(),
        )
        self.repo.insert(db, task)
        self.audit.record(
            db, user, "InspectionTask", "create", task.id,
            task=f"{building.name} {payload.task_type} {plan_date.isoformat()}",
        )
        db.commit()
        buildings, users = self._names(db)
        return self._render(db, task, buildings, users)

    def claim(self, db, task_id, user):
        self._refresh_overdue(db)
        task = self.repo.find_by_id(db, task_id)
        if not task:
            raise ServiceError("TASK_NOT_FOUND", 404)
        if task.status not in ("PLANNED", "OVERDUE"):
            raise ServiceError("TASK_NOT_CLAIMABLE", 409)
        task.status = "IN_PROGRESS"
        task.inspector_id = user["id"]
        self.audit.record(
            db, user, "InspectionTask", "claim", task.id,
            task=f"任务#{task.id}",
        )
        db.commit()
        return self.detail(db, task_id)

    def save_results(self, db, task_id, payload, user):
        task = self.repo.find_by_id(db, task_id)
        if not task:
            raise ServiceError("TASK_NOT_FOUND", 404)
        if task.status != "IN_PROGRESS":
            raise ServiceError("TASK_NOT_EDITABLE", 409)
        devices = self.device_repo.find_by_building_and_type(
            db, task.building_id, task.task_type
        )
        device_ids = {d.id for d in devices}
        item_codes = {i["item_code"] for i in CHECKLIST_ITEMS.get(task.task_type, [])}
        saved = []
        for item in payload.results:
            if item.device_id not in device_ids:
                raise ServiceError("VALIDATION_FAILED", 422, f"设备 {item.device_id} 不属于本任务")
            if item.item_code not in item_codes:
                raise ServiceError("VALIDATION_FAILED", 422, f"检查项 {item.item_code} 不在检查单内")
            if item.result_status not in ResultStatus:
                raise ServiceError("VALIDATION_FAILED", 422, "检查结果状态不合法")
            row = self.result_repo.find_one(db, task_id, item.device_id, item.item_code)
            if row is None:
                row = InspectionResult(
                    task_id=task_id,
                    device_id=item.device_id,
                    item_code=item.item_code,
                    result_status=item.result_status,
                    measured_value=item.measured_value or "",
                    photo_url=item.photo_url or "",
                    note=item.note or "",
                    updated_at=_now(),
                )
                self.result_repo.insert(db, row)
            else:
                row.result_status = item.result_status
                row.measured_value = item.measured_value or ""
                row.photo_url = item.photo_url or ""
                row.note = item.note or ""
                row.updated_at = _now()
            saved.append(row)
        self.audit.record(
            db, user, "InspectionResult", "update", task_id,
            result=f"任务#{task_id} 保存 {len(saved)} 项",
        )
        db.commit()
        return self.detail(db, task_id)

    def submit(self, db, task_id, user):
        task = self.repo.find_by_id(db, task_id)
        if not task:
            raise ServiceError("TASK_NOT_FOUND", 404)
        if task.status != "IN_PROGRESS":
            raise ServiceError("TASK_NOT_SUBMITTABLE", 409)
        progress = self._progress(db, task)
        if progress["total"] == 0 or progress["filled"] < progress["total"]:
            raise ServiceError(
                "CHECKLIST_INCOMPLETE", 409,
                f"检查项未完成（{progress['filled']}/{progress['total']}），无法提交",
            )
        task.status = "SUBMITTED"
        task.finished_at = _now()
        # 异常结果联动设备状态为故障
        abnormal = [
            r for r in self.result_repo.find_by_task(db, task_id)
            if r.result_status == "ABNORMAL"
        ]
        touched = set()
        for r in abnormal:
            if r.device_id not in touched:
                self.device_service.update_status(db, r.device_id, "FAULT", user)
                touched.add(r.device_id)
        self.audit.record(
            db, user, "InspectionTask", "submit", task.id,
            task=f"任务#{task.id}（异常 {len(abnormal)} 项）",
        )
        db.commit()
        return self.detail(db, task_id)

    def review(self, db, task_id, user):
        task = self.repo.find_by_id(db, task_id)
        if not task:
            raise ServiceError("TASK_NOT_FOUND", 404)
        if task.status != "SUBMITTED":
            raise ServiceError("TASK_NOT_REVIEWABLE", 409)
        task.status = "REVIEWED"
        self.audit.record(
            db, user, "InspectionTask", "review", task.id, task=f"任务#{task.id}"
        )
        db.commit()
        return self.detail(db, task_id)
