from datetime import date, datetime

from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class InspectionTask(Base):
    __tablename__ = "inspection_task"

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int]
    inspector_id: Mapped[int | None] = mapped_column(nullable=True)
    plan_date: Mapped[date]
    task_type: Mapped[str]
    status: Mapped[str] = mapped_column(default="PLANNED")
    checklist_version: Mapped[str] = mapped_column(default="v1.0")
    finished_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(nullable=True)
