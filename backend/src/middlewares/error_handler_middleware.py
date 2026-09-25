from src.constants.error_messages import ERROR_MESSAGES
from src.utils.exceptions import ServiceError


def to_error_payload(exc):
    code = getattr(exc, "code", "INTERNAL_ERROR")
    message = str(exc) or ERROR_MESSAGES.get(code, "服务器内部错误")
    return {"code": code, "message": message}


async def service_error_handler(request, exc: ServiceError):
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=exc.status_code,
        content=to_error_payload(exc),
    )


async def validation_error_handler(request, exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=422,
        content={"code": "VALIDATION_FAILED", "message": "表单字段缺失或格式错误"},
    )


async def unhandled_error_handler(request, exc: Exception):
    from fastapi.responses import JSONResponse

    print("unhandled error:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "服务器内部错误"},
    )
