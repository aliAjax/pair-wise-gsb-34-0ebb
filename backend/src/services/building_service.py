from src.constructors.building_factory import building_response
from src.models.building import Building
from src.repositories.building_repository import BuildingRepository
from src.services.audit_log_service import AuditLogService
from src.utils.exceptions import ServiceError


class BuildingService:
    def __init__(self):
        self.repo = BuildingRepository()
        self.audit = AuditLogService()

    def list(self, db):
        return [building_response(row) for row in self.repo.find_all(db)]

    def get(self, db, building_id):
        row = self.repo.find_by_id(db, building_id)
        if not row:
            raise ServiceError("BUILDING_NOT_FOUND", 404)
        return building_response(row)

    def create(self, db, payload, user):
        row = Building(
            name=payload.name,
            campus=payload.campus,
            floor_count=payload.floor_count,
            fire_grade=payload.fire_grade,
            manager_id=payload.manager_id,
            address_code=payload.address_code,
        )
        self.repo.insert(db, row)
        self.audit.record(db, user, "Building", "create", row.id, name=row.name)
        db.commit()
        return building_response(row)

    def update(self, db, building_id, payload, user):
        row = self.repo.find_by_id(db, building_id)
        if not row:
            raise ServiceError("BUILDING_NOT_FOUND", 404)
        row.name = payload.name
        row.campus = payload.campus
        row.floor_count = payload.floor_count
        row.fire_grade = payload.fire_grade
        row.manager_id = payload.manager_id
        row.address_code = payload.address_code
        self.audit.record(db, user, "Building", "update", row.id, name=row.name)
        db.commit()
        return building_response(row)
