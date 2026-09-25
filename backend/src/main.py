from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

from src.config.database import Base, SessionLocal, engine
from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.error_handler_middleware import error_handler_middleware
from src.middlewares.rate_limit_middleware import rate_limit_middleware
from src.middlewares.rbac_middleware import rbac_middleware
from src.routes.audit_log_routes import router as audit_log_router
from src.routes.auth_routes import router as auth_router
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.seed import seed_if_empty

app = FastAPI(title="消防设施巡检维保平台")

# 中间件执行顺序（后注册的最外层）：error -> rate_limit -> auth -> rbac -> audit
app.middleware("http")(audit_log_middleware)
app.middleware("http")(rbac_middleware)
app.middleware("http")(auth_middleware)
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(error_handler_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": ERROR_CODES["INTERNAL_ERROR"] if exc.status_code >= 500 else "REQUEST_ERROR", "message": str(detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"code": ERROR_CODES["VALIDATION_FAILED"], "message": ERROR_MESSAGES["VALIDATION_FAILED"]},
    )


@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    session = SessionLocal()
    try:
        seed_if_empty(session)
    finally:
        session.close()


@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}


app.include_router(auth_router)
app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
app.include_router(audit_log_router)
