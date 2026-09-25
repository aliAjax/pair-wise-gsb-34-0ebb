from datetime import datetime, timedelta

from jose import jwt

from src.config import settings
from src.constants.log_templates import LOG_ACTION_TEMPLATES
from src.constructors.app_user_factory import to_app_user_response
from src.models.audit_log import AuditLog
from src.repositories.app_user_repository import AppUserRepository
from src.utils.exceptions import BizError
from src.utils.formatters import audit_target


class AuthService:
    def __init__(self, session):
        self.session = session
        self.repo = AppUserRepository(session)

    def list_users(self):
        return [to_app_user_response(row) for row in self.repo.find_all()]

    def login(self, payload):
        user = self.repo.find_by_username(payload.username or "")
        if user is None or user.password != payload.password:
            raise BizError("LOGIN_FAILED", status_code=401)
        token = self.issue_token(user)
        # 登录日志在 service 记录，能拿到真实用户
        self.session.add(
            AuditLog(
                actor=user.display_name,
                action=LOG_ACTION_TEMPLATES["login"],
                target_type="AppUser",
                target_id=audit_target("AppUser", user.id),
                detail="POST /api/auth/login",
            )
        )
        self.session.commit()
        return {"token": token, "user": to_app_user_response(user)}

    @staticmethod
    def issue_token(user) -> str:
        claims = {
            "sub": str(user.id),
            "name": user.display_name,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        }
        return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return {
            "id": int(payload.get("sub", "0")),
            "name": payload.get("name", ""),
            "role": payload.get("role", ""),
        }
