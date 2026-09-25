from src.constants.checklist_items import CHECKLIST_ITEMS
from src.constructors.inspection_result_factory import inspection_result_response
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.hazard_ticket_repository import HazardTicketRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.utils.exceptions import ServiceError

_ITEM_NAMES = {
    item["item_code"]: item["item_name"]
    for items in CHECKLIST_ITEMS.values()
    for item in items
}


class InspectionResultService:
    def __init__(self):
        self.repo = InspectionResultRepository()
        self.task_repo = InspectionTaskRepository()
        self.device_repo = FireDeviceRepository()
        self.ticket_repo = HazardTicketRepository()

    def _render(self, db, row, devices, tickets):
        device = devices.get(row.device_id)
        ticket = tickets.get(row.id)
        return inspection_result_response(
            row,
            device_code=device.device_code if device else None,
            item_name=_ITEM_NAMES.get(row.item_code),
            ticket_id=ticket.id if ticket else None,
        )

    def list(self, db, task_id=None, result_status=None, device_id=None):
        rows = self.repo.find_all(db, task_id, result_status, device_id)
        devices = {d.id: d for d in self.device_repo.find_all(db)}
        tickets = {t.result_id: t for t in self.ticket_repo.find_all(db)}
        return [self._render(db, row, devices, tickets) for row in rows]

    def abnormal_pending(self, db):
        """待派单的异常结果：已判定异常但尚未生成整改单。"""
        rows = self.repo.find_abnormal_without_ticket(db)
        devices = {d.id: d for d in self.device_repo.find_all(db)}
        tasks = {t.id: t for t in self.task_repo.find_all(db)}
        out = []
        for row in rows:
            payload = self._render(db, row, devices, {})
            task = tasks.get(row.task_id)
            payload["task_status"] = task.status if task else None
            payload["building_id"] = task.building_id if task else None
            out.append(payload)
        return out

    def get(self, db, result_id):
        row = self.repo.find_by_id(db, result_id)
        if not row:
            raise ServiceError("RESULT_NOT_FOUND", 404)
        devices = {d.id: d for d in self.device_repo.find_all(db)}
        ticket = self.ticket_repo.find_by_result(db, result_id)
        return self._render(db, row, devices, {result_id: ticket} if ticket else {})
