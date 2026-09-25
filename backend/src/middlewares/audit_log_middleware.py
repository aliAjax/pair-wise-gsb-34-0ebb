import re

from src.config.database import SessionLocal
from src.constants.log_templates import LOG_ACTION_TEMPLATES, LOG_TEMPLATES
from src.models.audit_log import AuditLog
from src.utils.formatters import audit_target

# 路径前缀 -> 实体名（对应 LOG_TEMPLATES 的键）
ENTITY_BY_PATH = {
    "/api/building": "Building",
    "/api/fire-device": "FireDevice",
    "/api/inspection-task": "InspectionTask",
    "/api/inspection-result": "InspectionResult",
    "/api/hazard-ticket": "HazardTicket",
}

# 路径动作后缀 -> 业务动作日志模板键
ACTION_BY_SUFFIX = {
    "claim": "claim",
    "submit": "submit",
    "review": "review",
    "rectify": "rectify",
    "close": "close",
}


def _resolve_action(method: str, path: str) -> tuple[str, str]:
    """返回 (动作文案, 实体名)。"""
    entity = "Unknown"
    for prefix, name in ENTITY_BY_PATH.items():
        if path.startswith(prefix):
            entity = name
            break
    tail = path.rstrip("/").rsplit("/", 1)[-1]
    if tail in ACTION_BY_SUFFIX:
        return LOG_ACTION_TEMPLATES[ACTION_BY_SUFFIX[tail]], entity
    templates = LOG_TEMPLATES.get(entity, ["写操作"])
    if method == "POST":
        return templates[0], entity
    if method in ("PUT", "PATCH"):
        return templates[1], entity
    return templates[2], entity


async def audit_log_middleware(request, call_next):
    response = await call_next(request)
    path = request.url.path
    # 登录日志由 AuthService 记录（能拿到真实用户），这里只处理业务写操作
    if (
        request.method in ("POST", "PUT", "PATCH", "DELETE")
        and path.startswith("/api")
        and not path.startswith("/api/auth")
        and response.status_code < 400
    ):
        user = getattr(request.state, "user", None) or {}
        action, entity = _resolve_action(request.method, path)
        match = re.search(r"/(\d+)(?:/|$)", path)
        target_id = match.group(1) if match else "-"
        session = SessionLocal()
        try:
            session.add(
                AuditLog(
                    actor=user.get("name") or "匿名",
                    action=action,
                    target_type=entity,
                    target_id=audit_target(entity, target_id),
                    detail=f"{request.method} {path}",
                )
            )
            session.commit()
        except Exception:
            session.rollback()
        finally:
            session.close()
    return response
