from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class InspectionTask(Base):
    __tablename__ = "inspection_task"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("building.id"), nullable=False, index=True)
    inspector_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    plan_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    task_type: Mapped[str] = mapped_column(String(30), default="MONTHLY")
    status: Mapped[str] = mapped_column(String(20), default="PLANNED")
    checklist_version: Mapped[str] = mapped_column(String(30), default="v2026.09")
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
