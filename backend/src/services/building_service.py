from sqlalchemy.exc import SQLAlchemyError

from src.constructors.building_factory import to_building_response
from src.models.building import Building
from src.repositories.building_repository import BuildingRepository
from src.utils.exceptions import BizError, not_found, validation_failed


class BuildingService:
    def __init__(self, session):
        self.session = session
        self.repo = BuildingRepository(session)

    def list(self):
        return [to_building_response(row) for row in self.repo.find_all()]

    def create(self, payload):
        if not payload.name:
            raise validation_failed("楼栋名称不能为空")
        row = Building(
            name=payload.name,
            campus=payload.campus or "",
            floor_count=payload.floor_count or 1,
            fire_grade=payload.fire_grade or "二级",
            manager_id=payload.manager_id or 0,
            address_code=payload.address_code or "",
        )
        try:
            self.repo.insert(row)
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"楼栋保存失败：{exc.__class__.__name__}") from exc
        return to_building_response(row)

    def update(self, id: int, payload):
        row = self.repo.find_by_id(id)
        if row is None:
            raise not_found(f"楼栋 {id} 不存在")
        if payload.name is not None:
            row.name = payload.name
        if payload.campus is not None:
            row.campus = payload.campus
        if payload.floor_count is not None:
            row.floor_count = payload.floor_count
        if payload.fire_grade is not None:
            row.fire_grade = payload.fire_grade
        if payload.manager_id is not None:
            row.manager_id = payload.manager_id
        if payload.address_code is not None:
            row.address_code = payload.address_code
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"楼栋更新失败：{exc.__class__.__name__}") from exc
        return to_building_response(row)
