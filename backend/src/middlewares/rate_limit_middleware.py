import time
from collections import defaultdict, deque

from starlette.responses import JSONResponse

from src.config import settings
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES

# 单进程内存滑动窗口限流，只保护 /api 写接口之外的突发流量
_hits: dict[str, deque] = defaultdict(deque)


async def rate_limit_middleware(request, call_next):
    path = request.url.path
    if path.startswith("/api"):
        key = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window = _hits[key]
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=429,
                content={"code": ERROR_CODES["RATE_LIMITED"], "message": ERROR_MESSAGES["RATE_LIMITED"]},
            )
        window.append(now)
    return await call_next(request)
