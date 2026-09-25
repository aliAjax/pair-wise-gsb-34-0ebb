from pydantic import BaseModel


class FireDevicePayload(BaseModel):
    building_id: int
    device_code: str
    device_type: str
    floor: str
    location_desc: str
    install_date: str | None = None
    status: str = "NORMAL"
    next_maintenance_at: str | None = None
