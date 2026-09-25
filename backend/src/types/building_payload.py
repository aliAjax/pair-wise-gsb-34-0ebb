from pydantic import BaseModel


class BuildingPayload(BaseModel):
    name: str | None = None
    campus: str | None = None
    floor_count: int | None = None
    fire_grade: str | None = None
    manager_id: int | None = None
    address_code: str | None = None
