from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class HazardTicket(Base):
    __tablename__ = "hazard_ticket"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    result_id: Mapped[int] = mapped_column(ForeignKey("inspection_result.id"), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM")
    owner_id: Mapped[int] = mapped_column(Integer, default=0)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    rectify_status: Mapped[str] = mapped_column(String(20), default="OPEN")
    rectify_note: Mapped[str] = mapped_column(String(500), default="")
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
