from pydantic import BaseModel


class InspectionTaskPayload(BaseModel):
    building_id: int
    plan_date: str
    task_type: str
    checklist_version: str = "v1.0"


class InspectionTaskReviewPayload(BaseModel):
    note: str | None = None
