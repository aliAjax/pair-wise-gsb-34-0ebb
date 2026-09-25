from jose import JWTError
from starlette.responses import JSONResponse

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.services.auth_service import AuthService

# 不需要登录即可访问的路径
PUBLIC_PATHS = {
    "/health",
    "/api/auth/login",
    "/api/auth/users",
    "/docs",
    "/openapi.json",
    "/redoc",
}


def _unauthorized():
    return JSONResponse(
        status_code=401,
        content={"code": ERROR_CODES["AUTH_REQUIRED"], "message": ERROR_MESSAGES["AUTH_REQUIRED"]},
    )


async def auth_middleware(request, call_next):
    path = request.url.path
    request.state.user = None
    if path in PUBLIC_PATHS or not path.startswith("/api"):
        return await call_next(request)
    header = request.headers.get("authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    if not token:
        return _unauthorized()
    try:
        request.state.user = AuthService.decode_token(token)
    except (JWTError, ValueError, KeyError):
        return _unauthorized()
    return await call_next(request)
