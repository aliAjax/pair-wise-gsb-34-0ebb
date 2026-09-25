from datetime import date, datetime, timezone

from src.constants.hazard_severity import HazardSeverity
from src.constructors.hazard_ticket_factory import hazard_ticket_response
from src.models.hazard_ticket import HazardTicket
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.user_repository import UserRepository
from src.services.audit_log_service import AuditLogService
from src.services.fire_device_service import FireDeviceService
from src.utils.exceptions import ServiceError


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class HazardTicketService:
    def __init__(self):
        self.repo = HazardTicketRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.user_repo = UserRepository()
        self.device_service = FireDeviceService()
        self.audit = AuditLogService()

    # ---------- 查询 ----------

    def _context(self, db):
        users = {u.id: u.display_name for u in self.user_repo.find_all(db)}
        devices = {d.id: d for d in self.device_repo.find_all(db)}
        buildings = {b.id: b.name for b in self.building_repo.find_all(db)}
        results = {r.id: r for r in self.result_repo.find_all(db)}
        return users, devices, buildings, results

    def _render(self, row, users, devices, buildings, results):
        result = results.get(row.result_id)
        device = devices.get(result.device_id) if result else None
        building_name = buildings.get(device.building_id) if device else None
        overdue = bool(
            row.rectify_status != "CLOSED"
            and row.deadline
            and row.deadline < date.today()
        )
        return hazard_ticket_response(
            row,
            owner_name=users.get(row.owner_id),
            result=result,
            device=device,
            building_name=building_name,
            overdue=overdue,
        )

    def list(self, db, rectify_status=None, severity=None, owner_id=None):
        users, devices, buildings, results = self._context(db)
        rows = self.repo.find_all(db, rectify_status, severity, owner_id)
        return [self._render(row, users, devices, buildings, results) for row in rows]

    def get(self, db, ticket_id):
        row = self.repo.find_by_id(db, ticket_id)
        if not row:
            raise ServiceError("TICKET_NOT_FOUND", 404)
        users, devices, buildings, results = self._context(db)
        return self._render(row, users, devices, buildings, results)

    # ---------- 写操作 ----------

    def dispatch(self, db, payload, user):
        """主管对异常结果派单，生成隐患整改单。"""
        result = self.result_repo.find_by_id(db, payload.result_id)
        if not result:
            raise ServiceError("RESULT_NOT_FOUND", 404)
        if result.result_status != "ABNORMAL":
            raise ServiceError("RESULT_NOT_ABNORMAL", 409)
        if self.repo.find_by_result(db, payload.result_id):
            raise ServiceError("TICKET_ALREADY_EXISTS", 409)
        if payload.severity not in HazardSeverity:
            raise ServiceError("VALIDATION_FAILED", 422, "隐患等级不合法")
        owner = self.user_repo.find_by_id(db, payload.owner_id)
        if not owner:
            raise ServiceError("USER_NOT_FOUND", 404)
        try:
            deadline = date.fromisoformat(str(payload.deadline)[:10])
        except ValueError:
            raise ServiceError("VALIDATION_FAILED", 422, "deadline 日期格式应为 YYYY-MM-DD")
        row = HazardTicket(
            result_id=payload.result_id,
            severity=payload.severity,
            owner_id=payload.owner_id,
            deadline=deadline,
            rectify_status="ASSIGNED",
            rectify_note="",
            created_at=_now(),
        )
        self.repo.insert(db, row)
        device = self.device_repo.find_by_id(db, result.device_id)
        self.audit.record(
            db, user, "HazardTicket", "dispatch", row.id,
            ticket=f"整改单#{row.id}（{device.device_code if device else result.device_id} -> {owner.display_name}）",
        )
        db.commit()
        return self.get(db, row.id)

    def rectify(self, db, ticket_id, payload, user):
        """维保责任人填写整改情况，进入待复验。"""
        row = self.repo.find_by_id(db, ticket_id)
        if not row:
            raise ServiceError("TICKET_NOT_FOUND", 404)
        if row.rectify_status != "ASSIGNED":
            raise ServiceError("TICKET_NOT_RECTIFIABLE", 409)
        if not (payload.rectify_note or "").strip():
            raise ServiceError("VALIDATION_FAILED", 422, "整改说明不能为空")
        row.rectify_status = "RECTIFIED"
        row.rectify_note = payload.rectify_note.strip()
        self.audit.record(
            db, user, "HazardTicket", "rectify", row.id,
            ticket=f"整改单#{row.id}",
        )
        db.commit()
        return self.get(db, row.id)

    def close(self, db, ticket_id, payload, user):
        """主管复验：通过则关闭并恢复设备，不通过则退回整改。"""
        row = self.repo.find_by_id(db, ticket_id)
        if not row:
            raise ServiceError("TICKET_NOT_FOUND", 404)
        if row.rectify_status != "RECTIFIED":
            raise ServiceError("TICKET_NOT_CLOSABLE", 409)
        result = self.result_repo.find_by_id(db, row.result_id)
        if payload.passed:
            row.rectify_status = "CLOSED"
            row.closed_at = _now()
            if payload.note:
                row.rectify_note = f"{row.rectify_note}｜复验：{payload.note}"
            self.audit.record(
                db, user, "HazardTicket", "close", row.id,
                ticket=f"整改单#{row.id}",
            )
            # 该设备没有其他未闭环整改单时恢复正常
            if result:
                sibling_results = self.result_repo.find_all(db, device_id=result.device_id)
                open_tickets = self.repo.find_open_by_result_ids(
                    db, [r.id for r in sibling_results]
                )
                open_tickets = [t for t in open_tickets if t.id != row.id]
                if not open_tickets:
                    self.device_service.update_status(
                        db, result.device_id, "NORMAL", user
                    )
        else:
            row.rectify_status = "ASSIGNED"
            if payload.note:
                row.rectify_note = f"{row.rectify_note}｜复验不通过：{payload.note}"
            self.audit.record(
                db, user, "HazardTicket", "reopen", row.id,
                ticket=f"整改单#{row.id}",
            )
        db.commit()
        return self.get(db, row.id)
