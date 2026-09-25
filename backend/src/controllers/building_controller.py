from src.services.building_service import BuildingService
from src.types.building_payload import BuildingPayload

service = BuildingService()


def list_building(db):
    return service.list(db)


def create_building(db, payload: BuildingPayload, user):
    return service.create(db, payload, user)


def update_building(db, building_id, payload: BuildingPayload, user):
    return service.update(db, building_id, payload, user)
