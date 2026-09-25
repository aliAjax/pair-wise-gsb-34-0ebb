from sqlalchemy import func, select

from src.models.fire_device import FireDevice


class FireDeviceRepository:
    def find_all(self, db, building_id=None, device_type=None, status=None, floor=None):
        stmt = select(FireDevice).order_by(FireDevice.id)
        if building_id:
            stmt = stmt.where(FireDevice.building_id == building_id)
        if device_type:
            stmt = stmt.where(FireDevice.device_type == device_type)
        if status:
            stmt = stmt.where(FireDevice.status == status)
        if floor:
            stmt = stmt.where(FireDevice.floor == floor)
        return db.scalars(stmt).all()

    def find_by_id(self, db, device_id):
        return db.get(FireDevice, device_id)

    def find_by_code(self, db, device_code):
        return db.scalars(
            select(FireDevice).where(FireDevice.device_code == device_code)
        ).first()

    def find_by_building_and_type(self, db, building_id, device_type):
        stmt = (
            select(FireDevice)
            .where(
                FireDevice.building_id == building_id,
                FireDevice.device_type == device_type,
            )
            .order_by(FireDevice.id)
        )
        return db.scalars(stmt).all()

    def insert(self, db, row: FireDevice):
        db.add(row)
        db.flush()
        return row

    def count_by_status(self, db):
        rows = db.execute(
            select(FireDevice.status, func.count()).group_by(FireDevice.status)
        ).all()
        return {status: count for status, count in rows}

    def count(self, db):
        return db.scalar(select(func.count()).select_from(FireDevice)) or 0
