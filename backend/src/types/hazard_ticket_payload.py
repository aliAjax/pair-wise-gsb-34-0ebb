from pydantic import BaseModel


class HazardTicketPayload(BaseModel):
    result_id: int
    severity: str
    owner_id: int
    deadline: str


class HazardTicketRectifyPayload(BaseModel):
    rectify_note: str


class HazardTicketClosePayload(BaseModel):
    passed: bool
    note: str = ""
