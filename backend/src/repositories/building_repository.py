from sqlalchemy import select

from src.models.building import Building


class BuildingRepository:
    def find_all(self, db):
        return db.scalars(select(Building).order_by(Building.id)).all()

    def find_by_id(self, db, building_id):
        return db.get(Building, building_id)

    def insert(self, db, row: Building):
        db.add(row)
        db.flush()
        return row

    def count(self, db):
        return len(db.scalars(select(Building.id)).all())
