from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class InspectionResult(Base):
    __tablename__ = "inspection_result"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("inspection_task.id"), nullable=False, index=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("fire_device.id"), nullable=False, index=True)
    item_code: Mapped[str] = mapped_column(String(50), nullable=False)
    result_status: Mapped[str] = mapped_column(String(20), default="PENDING")
    measured_value: Mapped[str] = mapped_column(String(100), default="")
    photo_url: Mapped[str] = mapped_column(String(300), default="")
    note: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
