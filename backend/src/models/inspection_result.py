from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class InspectionResult(Base):
    __tablename__ = "inspection_result"
    __table_args__ = (
        UniqueConstraint("task_id", "device_id", "item_code", name="uq_result_task_device_item"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int]
    device_id: Mapped[int]
    item_code: Mapped[str]
    result_status: Mapped[str]
    measured_value: Mapped[str] = mapped_column(default="")
    photo_url: Mapped[str] = mapped_column(default="")
    note: Mapped[str] = mapped_column(default="")
    updated_at: Mapped[datetime | None] = mapped_column(nullable=True)
