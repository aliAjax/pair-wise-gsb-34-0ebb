from src.services.fire_device_service import FireDeviceService
from src.types.fire_device_payload import FireDevicePayload

service = FireDeviceService()


def list_fire_device(db, building_id=None, device_type=None, status=None, floor=None):
    return service.list(db, building_id, device_type, status, floor)


def create_fire_device(db, payload: FireDevicePayload, user):
    return service.create(db, payload, user)


def get_fire_device(db, device_id):
    return service.get(db, device_id)


def list_device_results(db, device_id):
    from src.services.inspection_result_service import InspectionResultService

    return InspectionResultService().list(db, device_id=device_id)
