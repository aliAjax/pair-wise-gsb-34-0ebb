from sqlalchemy import select

from src.models.hazard_ticket import HazardTicket
from src.models.inspection_result import InspectionResult


class InspectionResultRepository:
    def find_all(self, db, task_id=None, result_status=None, device_id=None):
        stmt = select(InspectionResult).order_by(InspectionResult.id)
        if task_id:
            stmt = stmt.where(InspectionResult.task_id == task_id)
        if result_status:
            stmt = stmt.where(InspectionResult.result_status == result_status)
        if device_id:
            stmt = stmt.where(InspectionResult.device_id == device_id)
        return db.scalars(stmt).all()

    def find_by_id(self, db, result_id):
        return db.get(InspectionResult, result_id)

    def find_by_task(self, db, task_id):
        stmt = (
            select(InspectionResult)
            .where(InspectionResult.task_id == task_id)
            .order_by(InspectionResult.id)
        )
        return db.scalars(stmt).all()

    def find_one(self, db, task_id, device_id, item_code):
        stmt = select(InspectionResult).where(
            InspectionResult.task_id == task_id,
            InspectionResult.device_id == device_id,
            InspectionResult.item_code == item_code,
        )
        return db.scalars(stmt).first()

    def find_abnormal_without_ticket(self, db):
        stmt = (
            select(InspectionResult)
            .outerjoin(HazardTicket, HazardTicket.result_id == InspectionResult.id)
            .where(
                InspectionResult.result_status == "ABNORMAL",
                HazardTicket.id.is_(None),
            )
            .order_by(InspectionResult.id.desc())
        )
        return db.scalars(stmt).all()

    def insert(self, db, row: InspectionResult):
        db.add(row)
        db.flush()
        return row
