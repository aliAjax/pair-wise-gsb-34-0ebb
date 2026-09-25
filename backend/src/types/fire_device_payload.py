from pydantic import BaseModel


class FireDevicePayload(BaseModel):
    building_id: int | None = None
    device_code: str | None = None
    device_type: str | None = None
    floor: str | None = None
    location_desc: str | None = None
    install_date: str | None = None
    status: str | None = None
    next_maintenance_at: str | None = None
