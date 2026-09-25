from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class FireDevice(Base):
    __tablename__ = "fire_device"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("building.id"), nullable=False, index=True)
    device_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    device_type: Mapped[str] = mapped_column(String(30), nullable=False)
    floor: Mapped[str] = mapped_column(String(20), default="1F")
    location_desc: Mapped[str] = mapped_column(String(200), default="")
    install_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="NORMAL")
    next_maintenance_at: Mapped[date | None] = mapped_column(Date, nullable=True)
