from pydantic import BaseModel


class InspectionResultPayload(BaseModel):
    result_status: str | None = None
    measured_value: str | None = None
    photo_url: str | None = None
    note: str | None = None
