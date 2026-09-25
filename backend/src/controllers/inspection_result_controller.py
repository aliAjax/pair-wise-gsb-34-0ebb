from src.services.inspection_result_service import InspectionResultService

service = InspectionResultService()


def list_inspection_result(db, task_id=None, result_status=None, device_id=None):
    return service.list(db, task_id, result_status, device_id)


def list_abnormal_pending(db):
    return service.abnormal_pending(db)
