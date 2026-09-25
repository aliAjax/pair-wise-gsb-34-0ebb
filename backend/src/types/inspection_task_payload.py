from pydantic import BaseModel


class InspectionTaskPayload(BaseModel):
    building_id: int | None = None
    plan_date: str | None = None
    task_type: str | None = None
    checklist_version: str | None = None
