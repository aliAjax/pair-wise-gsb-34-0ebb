import hashlib
from datetime import datetime, timedelta, timezone

from jose import jwt

from src.config import settings
from src.repositories.user_repository import UserRepository
from src.utils.exceptions import ServiceError


def hash_password(password: str) -> str:
    return hashlib.sha256(f"fire-inspect:{password}".encode("utf-8")).hexdigest()


def render_user(row):
    return {
        "id": row.id,
        "username": row.username,
        "display_name": row.display_name,
        "role": row.role,
    }


class AuthService:
    def __init__(self):
        self.repo = UserRepository()

    def login(self, db, payload):
        row = self.repo.find_by_username(db, payload.username)
        if not row or row.password_hash != hash_password(payload.password):
            raise ServiceError("AUTH_FAILED", 401)
        token = self.issue_token(row)
        return {"token": token, "user": render_user(row)}

    def issue_token(self, row):
        now = datetime.now(timezone.utc)
        claims = {
            "sub": str(row.id),
            "username": row.username,
            "name": row.display_name,
            "role": row.role,
            "iat": now,
            "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        }
        return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def list_users(self, db):
        return [render_user(row) for row in self.repo.find_all(db)]
