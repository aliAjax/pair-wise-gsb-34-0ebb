from sqlalchemy import select

from src.models.inspection_result import InspectionResult


class InspectionResultRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self, task_id=None, device_id=None, result_status=None):
        stmt = select(InspectionResult).order_by(InspectionResult.id)
        if task_id:
            stmt = stmt.where(InspectionResult.task_id == task_id)
        if device_id:
            stmt = stmt.where(InspectionResult.device_id == device_id)
        if result_status:
            stmt = stmt.where(InspectionResult.result_status == result_status)
        return list(self.session.scalars(stmt).all())

    def find_by_id(self, id: int):
        return self.session.get(InspectionResult, id)

    def find_by_task(self, task_id: int):
        return self.find_all(task_id=task_id)

    def insert(self, row: InspectionResult):
        self.session.add(row)
        self.session.flush()
        return row
