from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor: Mapped[str] = mapped_column(String(50), default="")
    action: Mapped[str] = mapped_column(String(100), default="")
    target_type: Mapped[str] = mapped_column(String(50), default="")
    target_id: Mapped[str] = mapped_column(String(50), default="")
    detail: Mapped[str] = mapped_column(String(300), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
