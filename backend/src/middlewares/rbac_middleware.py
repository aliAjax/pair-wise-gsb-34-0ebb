from fastapi import Depends, Request

from src.utils.exceptions import ServiceError


async def current_user(request: Request) -> dict:
    user = getattr(request.state, "user", None)
    if not user:
        raise ServiceError("AUTH_REQUIRED", 401)
    return user


def allow_roles(*roles):
    """RBAC 依赖工厂：require_roles("SUPERVISOR") 形式使用。"""

    async def dependency(user: dict = Depends(current_user)) -> dict:
        if roles and user.get("role") not in roles:
            raise ServiceError("RBAC_DENIED", 403)
        return user

    return dependency
