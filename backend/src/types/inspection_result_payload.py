from pydantic import BaseModel


class InspectionResultItemPayload(BaseModel):
    device_id: int
    item_code: str
    result_status: str
    measured_value: str = ""
    photo_url: str = ""
    note: str = ""


class InspectionResultBatchPayload(BaseModel):
    results: list[InspectionResultItemPayload]
