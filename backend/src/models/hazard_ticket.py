from datetime import date, datetime

from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class HazardTicket(Base):
    __tablename__ = "hazard_ticket"

    id: Mapped[int] = mapped_column(primary_key=True)
    result_id: Mapped[int] = mapped_column(unique=True)
    severity: Mapped[str]
    owner_id: Mapped[int]
    deadline: Mapped[date]
    rectify_status: Mapped[str] = mapped_column(default="ASSIGNED")
    rectify_note: Mapped[str] = mapped_column(default="")
    closed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(nullable=True)
