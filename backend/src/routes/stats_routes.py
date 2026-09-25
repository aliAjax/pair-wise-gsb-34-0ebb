from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.controllers import stats_controller
from src.middlewares.rbac_middleware import current_user

router = APIRouter(prefix="/api", tags=["Stats"])


@router.get("/dashboard/summary")
def dashboard(db: Session = Depends(get_db), user=Depends(current_user)):
    return stats_controller.dashboard(db)


@router.get("/reports/monthly")
def monthly_report(month: str, db: Session = Depends(get_db),
                   user=Depends(current_user)):
    return stats_controller.monthly_report(db, month)
