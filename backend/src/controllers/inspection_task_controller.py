from src.services.inspection_task_service import InspectionTaskService
from src.types.inspection_result_payload import InspectionResultBatchPayload
from src.types.inspection_task_payload import InspectionTaskPayload

service = InspectionTaskService()


def list_inspection_task(db, status=None, building_id=None, inspector_id=None):
    return service.list(db, status, building_id, inspector_id)


def get_inspection_task(db, task_id):
    return service.detail(db, task_id)


def create_inspection_task(db, payload: InspectionTaskPayload, user):
    return service.create(db, payload, user)


def claim_inspection_task(db, task_id, user):
    return service.claim(db, task_id, user)


def save_inspection_results(db, task_id, payload: InspectionResultBatchPayload, user):
    return service.save_results(db, task_id, payload, user)


def submit_inspection_task(db, task_id, user):
    return service.submit(db, task_id, user)


def review_inspection_task(db, task_id, user):
    return service.review(db, task_id, user)
