from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import building_controller
from src.middlewares.rbac_middleware import allow_roles, current_user
from src.types.building_payload import BuildingPayload

router = APIRouter(prefix="/api/building", tags=["Building"])


@router.get("")
def list_building(db: Session = Depends(get_db), user=Depends(current_user)):
    return building_controller.list_building(db)


@router.post("")
def create_building(payload: BuildingPayload, db: Session = Depends(get_db),
                    user=Depends(allow_roles("SUPERVISOR"))):
    return building_controller.create_building(db, payload, user)


@router.put("/{building_id}")
def update_building(building_id: int, payload: BuildingPayload,
                    db: Session = Depends(get_db),
                    user=Depends(allow_roles("SUPERVISOR"))):
    return building_controller.update_building(db, building_id, payload, user)
