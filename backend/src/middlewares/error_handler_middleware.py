from starlette.responses import JSONResponse

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.utils.exceptions import BizError


def to_error_payload(exc):
    return {"code": getattr(exc, "code", ERROR_CODES["INTERNAL_ERROR"]), "message": str(exc)}


async def error_handler_middleware(request, call_next):
    try:
        return await call_next(request)
    except BizError as exc:
        return JSONResponse(status_code=exc.status_code, content={"code": exc.code, "message": exc.message})
    except Exception as exc:  # noqa: BLE001 - 兜底，防止堆栈直接暴露给前端
        return JSONResponse(
            status_code=500,
            content={"code": ERROR_CODES["INTERNAL_ERROR"], "message": f"{ERROR_MESSAGES['INTERNAL_ERROR']}（{exc.__class__.__name__}）"},
        )
