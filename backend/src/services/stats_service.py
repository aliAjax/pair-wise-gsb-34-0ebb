from datetime import date, datetime, timedelta

from sqlalchemy import select

from src.models.building import Building
from src.models.fire_device import FireDevice
from src.models.hazard_ticket import HazardTicket
from src.models.inspection_task import InspectionTask
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.services.audit_log_service import AuditLogService
from src.services.hazard_ticket_service import HazardTicketService
from src.services.inspection_task_service import FINISHED_STATUSES, InspectionTaskService
from src.utils.formatters import format_percent


def _month_range(month: str):
    """month: YYYY-MM -> (起, 止) 日期区间，止为下月一日。"""
    first = date.fromisoformat(f"{month}-01")
    if first.month == 12:
        nxt = date(first.year + 1, 1, 1)
    else:
        nxt = date(first.year, first.month + 1, 1)
    return first, nxt


def _month_label(d: date) -> str:
    return f"{d.year:04d}-{d.month:02d}"


class StatsService:
    def __init__(self):
        self.task_service = InspectionTaskService()
        self.ticket_service = HazardTicketService()
        self.device_repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.audit = AuditLogService()

    # ---------- 首页总览 ----------

    def dashboard(self, db):
        self.task_service._refresh_overdue(db)
        today = date.today()
        month = _month_label(today)
        m_start, m_end = _month_range(month)

        buildings = self.building_repo.find_all(db)
        device_status = self.device_repo.count_by_status(db)
        device_total = sum(device_status.values())

        tasks = db.scalars(select(InspectionTask)).all()
        finished = [t for t in tasks if t.status in FINISHED_STATUSES]
        month_tasks = [t for t in tasks if t.plan_date and m_start <= t.plan_date < m_end]
        month_finished = [t for t in month_tasks if t.status in FINISHED_STATUSES]

        tickets = self.ticket_service.list(db)
        open_tickets = [t for t in tickets if t["rectify_status"] != "CLOSED"]
        overdue_tickets = [t for t in open_tickets if t["is_overdue"]]
        high_risk = [
            t for t in open_tickets if t["severity"] in ("HIGH", "CRITICAL")
        ]

        task_views = self.task_service.list(db)
        recent_tasks = sorted(
            task_views, key=lambda t: (t["plan_date"] or "", t["id"]), reverse=True
        )[:5]

        return {
            "building_count": len(buildings),
            "device_count": device_total,
            "device_status": {k: device_status.get(k, 0) for k in ("NORMAL", "FAULT", "MAINTENANCE", "SCRAPPED")},
            "task_total": len(tasks),
            "task_finished": len(finished),
            "task_completion_rate": format_percent(len(finished), len(tasks)),
            "month_task_total": len(month_tasks),
            "month_task_finished": len(month_finished),
            "month_completion_rate": format_percent(len(month_finished), len(month_tasks)),
            "open_ticket_count": len(open_tickets),
            "overdue_ticket_count": len(overdue_tickets),
            "high_risk_open_count": len(high_risk),
            "recent_tasks": recent_tasks,
            "overdue_tickets": overdue_tickets[:5],
            "high_risk_tickets": high_risk[:5],
            "recent_logs": self.audit.recent(db, limit=8),
        }

    # ---------- 合规报表 ----------

    def monthly_report(self, db, month: str):
        self.task_service._refresh_overdue(db)
        try:
            m_start, m_end = _month_range(month)
        except ValueError:
            from src.utils.exceptions import ServiceError

            raise ServiceError("VALIDATION_FAILED", 422, "month 格式应为 YYYY-MM")

        buildings = self.building_repo.find_all(db)
        tasks = db.scalars(select(InspectionTask)).all()
        tickets = db.scalars(select(HazardTicket)).all()

        month_tasks = [t for t in tasks if t.plan_date and m_start <= t.plan_date < m_end]
        month_finished = [t for t in month_tasks if t.status in FINISHED_STATUSES]
        month_created = [
            t for t in tickets
            if t.created_at and m_start <= t.created_at.date() < m_end
        ]
        month_closed = [
            t for t in tickets
            if t.closed_at and m_start <= t.closed_at.date() < m_end
        ]

        device_status = self.device_repo.count_by_status(db)
        device_total = sum(device_status.values())
        fault_count = device_status.get("FAULT", 0)

        today = date.today()
        by_building = []
        for b in buildings:
            b_tasks = [t for t in month_tasks if t.building_id == b.id]
            b_finished = [t for t in b_tasks if t.status in FINISHED_STATUSES]
            b_devices = self.device_repo.find_all(db, building_id=b.id)
            device_ids = {d.id for d in b_devices}
            b_open = 0
            b_overdue = 0
            for t in tickets:
                if t.rectify_status == "CLOSED":
                    continue
                result_device_building = self._ticket_building_id(db, t)
                if result_device_building != b.id:
                    continue
                b_open += 1
                if t.deadline and t.deadline < today:
                    b_overdue += 1
            by_building.append({
                "building_id": b.id,
                "building_name": b.name,
                "task_total": len(b_tasks),
                "task_finished": len(b_finished),
                "completion_rate": format_percent(len(b_finished), len(b_tasks)),
                "device_count": len(b_devices),
                "open_ticket_count": b_open,
                "overdue_ticket_count": b_overdue,
            })

        trend = []
        cursor = date(m_start.year, m_start.month, 1)
        for _ in range(6):
            label = _month_label(cursor)
            trend.insert(0, self._month_point(tasks, tickets, label))
            cursor = (cursor - timedelta(days=1)).replace(day=1)

        return {
            "month": month,
            "task_planned": len(month_tasks),
            "task_finished": len(month_finished),
            "completion_rate": format_percent(len(month_finished), len(month_tasks)),
            "ticket_created": len(month_created),
            "ticket_closed": len(month_closed),
            "rectify_rate": format_percent(len(month_closed), len(month_created)),
            "device_total": device_total,
            "device_fault_count": fault_count,
            "device_fault_rate": format_percent(fault_count, device_total),
            "by_building": by_building,
            "trend": trend,
        }

    def _ticket_building_id(self, db, ticket):
        from src.models.inspection_result import InspectionResult

        result = db.get(InspectionResult, ticket.result_id)
        if not result:
            return None
        device = db.get(FireDevice, result.device_id)
        return device.building_id if device else None

    def _month_point(self, tasks, tickets, label):
        m_start, m_end = _month_range(label)
        planned = [t for t in tasks if t.plan_date and m_start <= t.plan_date < m_end]
        finished = [t for t in planned if t.status in FINISHED_STATUSES]
        closed = [
            t for t in tickets
            if t.closed_at and m_start <= t.closed_at.date() < m_end
        ]
        return {
            "month": label,
            "task_planned": len(planned),
            "task_finished": len(finished),
            "completion_rate": format_percent(len(finished), len(planned)),
            "ticket_closed": len(closed),
        }
