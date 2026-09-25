from fastapi import APIRouter

from src.controllers.inspection_task_controller import (
    claim_inspection_task,
    create_inspection_task,
    list_inspection_task,
    review_inspection_task,
    submit_inspection_task,
)

router = APIRouter(prefix="/api/inspection-task", tags=["InspectionTask"])
router.get("")(list_inspection_task)
router.post("")(create_inspection_task)
router.post("/{id}/claim")(claim_inspection_task)
router.post("/{id}/submit")(submit_inspection_task)
router.post("/{id}/review")(review_inspection_task)
