from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import auth_controller
from src.middlewares.rbac_middleware import current_user
from src.types.auth_payload import LoginPayload

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    return auth_controller.login(db, payload)


@router.get("/users")
def list_users(db: Session = Depends(get_db), user=Depends(current_user)):
    return auth_controller.list_users(db)
