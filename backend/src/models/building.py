from sqlalchemy.orm import Mapped, mapped_column

from src.config.database import Base


class Building(Base):
    __tablename__ = "building"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    campus: Mapped[str]
    floor_count: Mapped[int]
    fire_grade: Mapped[str]
    manager_id: Mapped[int]
    address_code: Mapped[str]
