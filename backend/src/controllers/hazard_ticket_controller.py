from src.services.hazard_ticket_service import HazardTicketService
from src.types.hazard_ticket_payload import (
    HazardTicketClosePayload,
    HazardTicketRectifyPayload,
    HazardTicketPayload,
)

service = HazardTicketService()


def list_hazard_ticket(db, rectify_status=None, severity=None, owner_id=None):
    return service.list(db, rectify_status, severity, owner_id)


def get_hazard_ticket(db, ticket_id):
    return service.get(db, ticket_id)


def dispatch_hazard_ticket(db, payload: HazardTicketPayload, user):
    return service.dispatch(db, payload, user)


def rectify_hazard_ticket(db, ticket_id, payload: HazardTicketRectifyPayload, user):
    return service.rectify(db, ticket_id, payload, user)


def close_hazard_ticket(db, ticket_id, payload: HazardTicketClosePayload, user):
    return service.close(db, ticket_id, payload, user)
