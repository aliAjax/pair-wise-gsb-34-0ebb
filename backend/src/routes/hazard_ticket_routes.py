from fastapi import APIRouter

from src.controllers.hazard_ticket_controller import (
    close_hazard_ticket,
    dispatch_hazard_ticket,
    list_hazard_ticket,
    rectify_hazard_ticket,
)

router = APIRouter(prefix="/api/hazard-ticket", tags=["HazardTicket"])
router.get("")(list_hazard_ticket)
router.post("")(dispatch_hazard_ticket)
router.post("/{id}/rectify")(rectify_hazard_ticket)
router.post("/{id}/close")(close_hazard_ticket)
