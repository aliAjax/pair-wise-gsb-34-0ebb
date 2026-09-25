from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import fire_device_controller
from src.middlewares.rbac_middleware import allow_roles, current_user
from src.types.fire_device_payload import FireDevicePayload

router = APIRouter(prefix="/api/fire-device", tags=["FireDevice"])


@router.get("")
def list_fire_device(building_id: int | None = None, device_type: str | None = None,
                     status: str | None = None, floor: str | None = None,
                     db: Session = Depends(get_db), user=Depends(current_user)):
    return fire_device_controller.list_fire_device(
        db, building_id, device_type, status, floor
    )


@router.post("")
def create_fire_device(payload: FireDevicePayload, db: Session = Depends(get_db),
                       user=Depends(allow_roles("SUPERVISOR"))):
    return fire_device_controller.create_fire_device(db, payload, user)


@router.get("/{device_id}")
def get_fire_device(device_id: int, db: Session = Depends(get_db),
                    user=Depends(current_user)):
    return fire_device_controller.get_fire_device(db, device_id)


@router.get("/{device_id}/results")
def list_device_results(device_id: int, db: Session = Depends(get_db),
                        user=Depends(current_user)):
    return fire_device_controller.list_device_results(db, device_id)
