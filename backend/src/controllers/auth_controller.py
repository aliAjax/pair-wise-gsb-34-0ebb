from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from src.config.database import get_session
from src.services.auth_service import AuthService
from src.types.auth_payload import LoginPayload
from src.utils.exceptions import BizError


def _wrap(exc: BizError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


def list_users(session: Session = Depends(get_session)):
    return AuthService(session).list_users()


def login(payload: LoginPayload, session: Session = Depends(get_session)):
    try:
        return AuthService(session).login(payload)
    except BizError as exc:
        raise _wrap(exc) from exc
