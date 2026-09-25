from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import inspection_result_controller
from src.middlewares.rbac_middleware import current_user

router = APIRouter(prefix="/api/inspection-result", tags=["InspectionResult"])


@router.get("")
def list_inspection_result(task_id: int | None = None, result_status: str | None = None,
                           device_id: int | None = None,
                           db: Session = Depends(get_db), user=Depends(current_user)):
    return inspection_result_controller.list_inspection_result(
        db, task_id, result_status, device_id
    )


@router.get("/abnormal/pending")
def list_abnormal_pending(db: Session = Depends(get_db), user=Depends(current_user)):
    return inspection_result_controller.list_abnormal_pending(db)
