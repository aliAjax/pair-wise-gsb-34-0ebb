from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import inspection_task_controller
from src.middlewares.rbac_middleware import allow_roles, current_user
from src.types.inspection_result_payload import InspectionResultBatchPayload
from src.types.inspection_task_payload import InspectionTaskPayload

router = APIRouter(prefix="/api/inspection-task", tags=["InspectionTask"])

_INSPECTOR_ROLES = allow_roles("INSPECTOR", "SUPERVISOR")
_SUPERVISOR = allow_roles("SUPERVISOR")


@router.get("")
def list_inspection_task(status: str | None = None, building_id: int | None = None,
                         inspector_id: int | None = None,
                         db: Session = Depends(get_db), user=Depends(current_user)):
    return inspection_task_controller.list_inspection_task(
        db, status, building_id, inspector_id
    )


@router.post("")
def create_inspection_task(payload: InspectionTaskPayload, db: Session = Depends(get_db),
                           user=Depends(_SUPERVISOR)):
    return inspection_task_controller.create_inspection_task(db, payload, user)


@router.get("/{task_id}")
def get_inspection_task(task_id: int, db: Session = Depends(get_db),
                        user=Depends(current_user)):
    return inspection_task_controller.get_inspection_task(db, task_id)


@router.post("/{task_id}/claim")
def claim_inspection_task(task_id: int, db: Session = Depends(get_db),
                          user=Depends(_INSPECTOR_ROLES)):
    return inspection_task_controller.claim_inspection_task(db, task_id, user)


@router.put("/{task_id}/results")
def save_inspection_results(task_id: int, payload: InspectionResultBatchPayload,
                            db: Session = Depends(get_db), user=Depends(_INSPECTOR_ROLES)):
    return inspection_task_controller.save_inspection_results(db, task_id, payload, user)


@router.post("/{task_id}/submit")
def submit_inspection_task(task_id: int, db: Session = Depends(get_db),
                           user=Depends(_INSPECTOR_ROLES)):
    return inspection_task_controller.submit_inspection_task(db, task_id, user)


@router.post("/{task_id}/review")
def review_inspection_task(task_id: int, db: Session = Depends(get_db),
                           user=Depends(_SUPERVISOR)):
    return inspection_task_controller.review_inspection_task(db, task_id, user)
