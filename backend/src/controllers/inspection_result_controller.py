from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.inspection_result_service import InspectionResultService
from src.types.inspection_result_payload import InspectionResultPayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_inspection_result(
    task_id: int | None = None,
    device_id: int | None = None,
    result_status: str | None = None,
    unticketed: bool = False,
    session: Session = Depends(get_session),
):
    return InspectionResultService(session).list(
        task_id=task_id, device_id=device_id, result_status=result_status, unticketed=unticketed
    )


def update_inspection_result(
    id: int, payload: InspectionResultPayload, request: Request, session: Session = Depends(get_session)
):
    try:
        return InspectionResultService(session).update(id, payload, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc
