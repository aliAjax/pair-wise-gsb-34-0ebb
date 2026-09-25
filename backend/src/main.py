from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from src.config.database import SessionLocal, init_db
from src.middlewares.audit_log_middleware import audit_log_middleware
from src.middlewares.auth_middleware import auth_middleware
from src.middlewares.error_handler_middleware import (
    service_error_handler,
    unhandled_error_handler,
    validation_error_handler,
)
from src.routes.audit_log_routes import router as audit_log_router
from src.routes.auth_routes import router as auth_router
from src.routes.building_routes import router as building_router
from src.routes.fire_device_routes import router as fire_device_router
from src.routes.hazard_ticket_routes import router as hazard_ticket_router
from src.routes.inspection_result_routes import router as inspection_result_router
from src.routes.inspection_task_routes import router as inspection_task_router
from src.routes.stats_routes import router as stats_router
from src.seed import seed_if_empty
from src.utils.exceptions import ServiceError


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="消防设施巡检维保平台", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(auth_middleware)
app.middleware("http")(audit_log_middleware)

app.add_exception_handler(ServiceError, service_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)


@app.get("/health")
def health():
    return {"status": "ok", "service": "fire-inspect"}


app.include_router(auth_router)
app.include_router(stats_router)
app.include_router(audit_log_router)
app.include_router(building_router)
app.include_router(fire_device_router)
app.include_router(inspection_task_router)
app.include_router(inspection_result_router)
app.include_router(hazard_ticket_router)
