import re

from starlette.responses import JSONResponse

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES

# (方法, 路径正则, 允许的角色)；命中第一条规则即生效
RULES = [
    ("GET", r"^/api/audit-log", {"SUPERVISOR", "AUDITOR"}),
    ("POST", r"^/api/building", {"SUPERVISOR"}),
    ("PUT", r"^/api/building", {"SUPERVISOR"}),
    ("POST", r"^/api/fire-device", {"SUPERVISOR"}),
    ("PUT", r"^/api/fire-device", {"SUPERVISOR"}),
    ("POST", r"^/api/inspection-task/\d+/claim", {"INSPECTOR"}),
    ("POST", r"^/api/inspection-task/\d+/submit", {"INSPECTOR"}),
    ("POST", r"^/api/inspection-task/\d+/review", {"SUPERVISOR"}),
    ("POST", r"^/api/inspection-task", {"SUPERVISOR"}),
    ("PUT", r"^/api/inspection-result", {"INSPECTOR", "SUPERVISOR"}),
    ("POST", r"^/api/hazard-ticket/\d+/rectify", {"SUPERVISOR", "MAINTAINER"}),
    ("POST", r"^/api/hazard-ticket/\d+/close", {"SUPERVISOR"}),
    ("POST", r"^/api/hazard-ticket", {"SUPERVISOR"}),
]


def allow_roles(role: str, *roles: str) -> bool:
    return role in roles


async def rbac_middleware(request, call_next):
    path = request.url.path
    user = getattr(request.state, "user", None)
    if user is not None and path.startswith("/api"):
        for method, pattern, roles in RULES:
            if request.method == method and re.search(pattern, path):
                if not allow_roles(user.get("role"), *roles):
                    return JSONResponse(
                        status_code=403,
                        content={"code": ERROR_CODES["RBAC_DENIED"], "message": ERROR_MESSAGES["RBAC_DENIED"]},
                    )
                break
    return await call_next(request)
