from jose import JWTError, jwt

from src.config import settings

PUBLIC_PATHS = ("/health", "/docs", "/openapi.json", "/redoc", "/api/auth/login")


async def auth_middleware(request, call_next):
    """解析 Bearer JWT，写入 request.state.user；未登录请求不在这里拦截。"""
    request.state.user = None
    token = request.headers.get("authorization", "")
    if token.startswith("Bearer "):
        try:
            payload = jwt.decode(
                token[7:], settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            request.state.user = {
                "id": int(payload["sub"]),
                "username": payload.get("username", ""),
                "name": payload.get("name", ""),
                "role": payload.get("role", ""),
            }
        except (JWTError, KeyError, ValueError):
            request.state.user = None
    return await call_next(request)
