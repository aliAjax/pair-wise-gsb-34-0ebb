from sqlalchemy import select

from src.models.building import Building


class BuildingRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self):
        return list(self.session.scalars(select(Building).order_by(Building.id)).all())

    def find_by_id(self, id: int):
        return self.session.get(Building, id)

    def insert(self, row: Building):
        self.session.add(row)
        self.session.flush()
        return row

    def count(self) -> int:
        return len(self.find_all())
