from datetime import date

from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class FireDevice(Base):
    __tablename__ = "fire_device"

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int]
    device_code: Mapped[str] = mapped_column(unique=True)
    device_type: Mapped[str]
    floor: Mapped[str]
    location_desc: Mapped[str]
    install_date: Mapped[date | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(default="NORMAL")
    next_maintenance_at: Mapped[date | None] = mapped_column(nullable=True)
