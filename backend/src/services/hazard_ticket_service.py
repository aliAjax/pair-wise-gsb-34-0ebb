from sqlalchemy.exc import SQLAlchemyError

from src.constants.hazard_severity import HazardSeverity
from src.constructors.hazard_ticket_factory import to_hazard_ticket_response
from src.models.hazard_ticket import HazardTicket
from src.repositories.app_user_repository import AppUserRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.utils.exceptions import BizError, not_found, state_conflict, validation_failed
from src.utils.formatters import now, parse_date


class HazardTicketService:
    def __init__(self, session):
        self.session = session
        self.repo = HazardTicketRepository(session)
        self.result_repo = InspectionResultRepository(session)
        self.device_repo = FireDeviceRepository(session)
        self.user_repo = AppUserRepository(session)

    def list(self, rectify_status=None, severity=None, result_id=None):
        rows = self.repo.find_all(rectify_status=rectify_status, severity=severity, result_id=result_id)
        return [to_hazard_ticket_response(row) for row in rows]

    def get(self, id: int):
        row = self.repo.find_by_id(id)
        if row is None:
            raise not_found(f"隐患整改单 {id} 不存在")
        return row

    def dispatch(self, payload, _user):
        """主管对异常巡检结果派单，生成整改单并把设备置为故障。"""
        if not payload.result_id:
            raise validation_failed("缺少关联的巡检结果")
        result = self.result_repo.find_by_id(payload.result_id)
        if result is None:
            raise not_found(f"巡检结果 {payload.result_id} 不存在")
        if result.result_status != "ABNORMAL":
            raise state_conflict("只有异常结果才能派单")
        if self.repo.find_open_by_result(result.id):
            raise state_conflict("该异常结果已有未关闭的整改单")
        if payload.severity not in HazardSeverity:
            raise validation_failed(f"隐患等级必须是 {'/'.join(HazardSeverity)} 之一")
        if not payload.owner_id or self.user_repo.find_by_id(payload.owner_id) is None:
            raise validation_failed("整改责任人不存在")
        try:
            deadline = parse_date(payload.deadline, "deadline") if payload.deadline else None
        except ValueError as exc:
            raise validation_failed(str(exc)) from exc
        if deadline is None:
            raise validation_failed("整改期限不能为空")
        ticket = HazardTicket(
            result_id=result.id,
            severity=payload.severity,
            owner_id=payload.owner_id,
            deadline=deadline,
            rectify_status="OPEN",
            rectify_note="",
            closed_at=None,
        )
        try:
            self.repo.insert(ticket)
            device = self.device_repo.find_by_id(result.device_id)
            if device is not None:
                device.status = "FAULT"
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"派单失败：{exc.__class__.__name__}") from exc
        return to_hazard_ticket_response(ticket)

    def rectify(self, id: int, payload, _user):
        ticket = self.get(id)
        if ticket.rectify_status != "OPEN":
            raise state_conflict("只有待整改的单据可以填写整改")
        note = (payload.rectify_note or "").strip()
        if not note:
            raise validation_failed("整改说明不能为空")
        ticket.rectify_note = note
        ticket.rectify_status = "RECTIFIED"
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"整改提交失败：{exc.__class__.__name__}") from exc
        return to_hazard_ticket_response(ticket)

    def close(self, id: int, _user):
        """复验通过并关闭；设备无其他未关闭隐患时恢复为正常。"""
        ticket = self.get(id)
        if ticket.rectify_status != "RECTIFIED":
            raise state_conflict("只有已整改待复验的单据可以关闭")
        ticket.rectify_status = "CLOSED"
        ticket.closed_at = now()
        try:
            self.session.flush()  # 先落库再统计该设备剩余未关闭隐患
            result = self.result_repo.find_by_id(ticket.result_id)
            if result is not None:
                device = self.device_repo.find_by_id(result.device_id)
                if device is not None and not self.repo.find_open_by_device(device.id):
                    device.status = "NORMAL"
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"复验关闭失败：{exc.__class__.__name__}") from exc
        return to_hazard_ticket_response(ticket)
