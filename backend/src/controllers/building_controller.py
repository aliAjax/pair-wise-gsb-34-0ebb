from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.building_service import BuildingService
from src.types.building_payload import BuildingPayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_building(session: Session = Depends(get_session)):
    return BuildingService(session).list()


def create_building(payload: BuildingPayload, session: Session = Depends(get_session)):
    try:
        return BuildingService(session).create(payload)
    except BizError as exc:
        raise _wrap(exc) from exc


def update_building(id: int, payload: BuildingPayload, session: Session = Depends(get_session)):
    try:
        return BuildingService(session).update(id, payload)
    except BizError as exc:
        raise _wrap(exc) from exc
