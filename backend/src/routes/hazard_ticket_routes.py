from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import hazard_ticket_controller
from src.middlewares.rbac_middleware import allow_roles, current_user
from src.types.hazard_ticket_payload import (
    HazardTicketClosePayload,
    HazardTicketRectifyPayload,
    HazardTicketPayload,
)

router = APIRouter(prefix="/api/hazard-ticket", tags=["HazardTicket"])

_SUPERVISOR = allow_roles("SUPERVISOR")
_RECTIFIER_ROLES = allow_roles("MAINTAINER", "SUPERVISOR")


@router.get("")
def list_hazard_ticket(rectify_status: str | None = None, severity: str | None = None,
                       owner_id: int | None = None,
                       db: Session = Depends(get_db), user=Depends(current_user)):
    return hazard_ticket_controller.list_hazard_ticket(
        db, rectify_status, severity, owner_id
    )


@router.get("/{ticket_id}")
def get_hazard_ticket(ticket_id: int, db: Session = Depends(get_db),
                      user=Depends(current_user)):
    return hazard_ticket_controller.get_hazard_ticket(db, ticket_id)


@router.post("")
def dispatch_hazard_ticket(payload: HazardTicketPayload, db: Session = Depends(get_db),
                           user=Depends(_SUPERVISOR)):
    return hazard_ticket_controller.dispatch_hazard_ticket(db, payload, user)


@router.post("/{ticket_id}/rectify")
def rectify_hazard_ticket(ticket_id: int, payload: HazardTicketRectifyPayload,
                          db: Session = Depends(get_db), user=Depends(_RECTIFIER_ROLES)):
    return hazard_ticket_controller.rectify_hazard_ticket(db, ticket_id, payload, user)


@router.post("/{ticket_id}/close")
def close_hazard_ticket(ticket_id: int, payload: HazardTicketClosePayload,
                        db: Session = Depends(get_db), user=Depends(_SUPERVISOR)):
    return hazard_ticket_controller.close_hazard_ticket(db, ticket_id, payload, user)
