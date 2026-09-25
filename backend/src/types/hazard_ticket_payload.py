from pydantic import BaseModel


class HazardTicketPayload(BaseModel):
    result_id: int | None = None
    severity: str | None = None
    owner_id: int | None = None
    deadline: str | None = None


class HazardRectifyPayload(BaseModel):
    rectify_note: str | None = None
