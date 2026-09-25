from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class Building(Base):
    __tablename__ = "building"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    campus: Mapped[str] = mapped_column(String(100), default="")
    floor_count: Mapped[int] = mapped_column(Integer, default=1)
    fire_grade: Mapped[str] = mapped_column(String(50), default="二级")
    manager_id: Mapped[int] = mapped_column(Integer, default=0)
    address_code: Mapped[str] = mapped_column(String(50), default="")
