from sqlalchemy import select

from src.models.inspection_task import InspectionTask


class InspectionTaskRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self, building_id=None, status=None, inspector_id=None):
        stmt = select(InspectionTask).order_by(InspectionTask.id.desc())
        if building_id:
            stmt = stmt.where(InspectionTask.building_id == building_id)
        if status:
            stmt = stmt.where(InspectionTask.status == status)
        if inspector_id:
            stmt = stmt.where(InspectionTask.inspector_id == inspector_id)
        return list(self.session.scalars(stmt).all())

    def find_by_id(self, id: int):
        return self.session.get(InspectionTask, id)

    def insert(self, row: InspectionTask):
        self.session.add(row)
        self.session.flush()
        return row
