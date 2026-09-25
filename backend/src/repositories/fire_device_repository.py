from sqlalchemy import select

from src.models.fire_device import FireDevice


class FireDeviceRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self, building_id=None, status=None, device_type=None, floor=None):
        stmt = select(FireDevice).order_by(FireDevice.id)
        if building_id:
            stmt = stmt.where(FireDevice.building_id == building_id)
        if status:
            stmt = stmt.where(FireDevice.status == status)
        if device_type:
            stmt = stmt.where(FireDevice.device_type == device_type)
        if floor:
            stmt = stmt.where(FireDevice.floor == floor)
        return list(self.session.scalars(stmt).all())

    def find_by_id(self, id: int):
        return self.session.get(FireDevice, id)

    def find_by_code(self, device_code: str):
        stmt = select(FireDevice).where(FireDevice.device_code == device_code)
        return self.session.scalars(stmt).first()

    def find_by_building(self, building_id: int):
        stmt = select(FireDevice).where(FireDevice.building_id == building_id).order_by(FireDevice.id)
        return list(self.session.scalars(stmt).all())

    def insert(self, row: FireDevice):
        self.session.add(row)
        self.session.flush()
        return row
