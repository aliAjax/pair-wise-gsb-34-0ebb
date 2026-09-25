from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.hazard_ticket_service import HazardTicketService
from src.types.hazard_ticket_payload import HazardRectifyPayload, HazardTicketPayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_hazard_ticket(
    rectify_status: str | None = None,
    severity: str | None = None,
    result_id: int | None = None,
    session: Session = Depends(get_session),
):
    return HazardTicketService(session).list(rectify_status=rectify_status, severity=severity, result_id=result_id)


def dispatch_hazard_ticket(payload: HazardTicketPayload, request: Request, session: Session = Depends(get_session)):
    try:
        return HazardTicketService(session).dispatch(payload, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc


def rectify_hazard_ticket(
    id: int, payload: HazardRectifyPayload, request: Request, session: Session = Depends(get_session)
):
    try:
        return HazardTicketService(session).rectify(id, payload, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc


def close_hazard_ticket(id: int, request: Request, session: Session = Depends(get_session)):
    try:
        return HazardTicketService(session).close(id, request.state.user)
    except BizError as exc:
        raise _wrap(exc) from exc
