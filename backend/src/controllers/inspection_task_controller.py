from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.inspection_task_service import InspectionTaskService
from src.types.inspection_task_payload import InspectionTaskPayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_inspection_task(
    building_id: int | None = None,
    status: str | None = None,
    inspector_id: int | None = None,
    session: Session = Depends(get_session),
):
    return InspectionTaskService(session).list(building_id=building_id, status=status, inspector_id=inspector_id)


def create_inspection_task(payload: InspectionTaskPayload, session: Session = Depends(get_session)):
    try:
        return InspectionTaskService(session).create(payload)
    except BizError as exc:
        raise _wrap(exc) from exc


def claim_inspection_task(id: int, request: Request, session: Session = Depends(get_session)):
    try:
        return InspectionTaskService(session).claim(id, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc


def submit_inspection_task(id: int, request: Request, session: Session = Depends(get_session)):
    try:
        return InspectionTaskService(session).submit(id, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc


def review_inspection_task(id: int, request: Request, session: Session = Depends(get_session)):
    try:
        return InspectionTaskService(session).review(id, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc
