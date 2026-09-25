from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str]
    action: Mapped[str]
    target_type: Mapped[str]
    target_id: Mapped[str]
    created_at: Mapped[datetime | None] = mapped_column(nullable=True)
