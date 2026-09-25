from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.fire_device_service import FireDeviceService
from src.types.fire_device_payload import FireDevicePayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_fire_device(
    building_id: int | None = None,
    status: str | None = None,
    device_type: str | None = None,
    floor: str | None = None,
    session: Session = Depends(get_session),
):
    return FireDeviceService(session).list(building_id=building_id, status=status, device_type=device_type, floor=floor)


def create_fire_device(payload: FireDevicePayload, session: Session = Depends(get_session)):
    try:
        return FireDeviceService(session).create(payload)
    except BizError as exc:
        raise _wrap(exc) from exc


def update_fire_device(id: int, payload: FireDevicePayload, session: Session = Depends(get_session)):
    try:
        return FireDeviceService(session).update(id, payload)
    except BizError as exc:
        raise _wrap(exc) from exc
