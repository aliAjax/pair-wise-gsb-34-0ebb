from datetime import date

from sqlalchemy import select

from src.models.inspection_task import InspectionTask


class InspectionTaskRepository:
    def find_all(self, db, status=None, building_id=None, inspector_id=None):
        stmt = select(InspectionTask).order_by(InspectionTask.plan_date.desc(), InspectionTask.id.desc())
        if status:
            stmt = stmt.where(InspectionTask.status == status)
        if building_id:
            stmt = stmt.where(InspectionTask.building_id == building_id)
        if inspector_id:
            stmt = stmt.where(InspectionTask.inspector_id == inspector_id)
        return db.scalars(stmt).all()

    def find_by_id(self, db, task_id):
        return db.get(InspectionTask, task_id)

    def insert(self, db, row: InspectionTask):
        db.add(row)
        db.flush()
        return row

    def find_expired_open(self, db, today: date):
        # 仅“未开始且已过期”的任务标记逾期；进行中的任务保持可编辑状态。
        stmt = select(InspectionTask).where(
            InspectionTask.status == "PLANNED",
            InspectionTask.plan_date < today,
        )
        return db.scalars(stmt).all()
