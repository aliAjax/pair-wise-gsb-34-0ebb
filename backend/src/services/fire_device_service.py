from sqlalchemy.exc import SQLAlchemyError

from src.constants.device_status import DeviceStatus
from src.constants.device_type import DeviceType
from src.constructors.fire_device_factory import to_fire_device_response
from src.models.fire_device import FireDevice
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.utils.exceptions import BizError, not_found, validation_failed
from src.utils.formatters import parse_date


class FireDeviceService:
    def __init__(self, session):
        self.session = session
        self.repo = FireDeviceRepository(session)
        self.building_repo = BuildingRepository(session)

    def list(self, building_id=None, status=None, device_type=None, floor=None):
        rows = self.repo.find_all(building_id=building_id, status=status, device_type=device_type, floor=floor)
        return [to_fire_device_response(row) for row in rows]

    def create(self, payload):
        if not payload.device_code:
            raise validation_failed("设备编号不能为空")
        if payload.device_type not in DeviceType:
            raise validation_failed(f"设备类型必须是 {'/'.join(DeviceType)} 之一")
        if not payload.building_id or self.building_repo.find_by_id(payload.building_id) is None:
            raise validation_failed("所属楼栋不存在")
        if self.repo.find_by_code(payload.device_code):
            raise validation_failed(f"设备编号 {payload.device_code} 已存在")
        try:
            install_date = parse_date(payload.install_date, "install_date") if payload.install_date else None
            next_maintenance = (
                parse_date(payload.next_maintenance_at, "next_maintenance_at") if payload.next_maintenance_at else None
            )
        except ValueError as exc:
            raise validation_failed(str(exc)) from exc
        row = FireDevice(
            building_id=payload.building_id,
            device_code=payload.device_code,
            device_type=payload.device_type,
            floor=payload.floor or "1F",
            location_desc=payload.location_desc or "",
            install_date=install_date,
            status="NORMAL",
            next_maintenance_at=next_maintenance,
        )
        try:
            self.repo.insert(row)
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"设备保存失败：{exc.__class__.__name__}") from exc
        return to_fire_device_response(row)

    def update(self, id: int, payload):
        row = self.repo.find_by_id(id)
        if row is None:
            raise not_found(f"设备 {id} 不存在")
        if payload.status is not None and payload.status not in DeviceStatus:
            raise validation_failed(f"设备状态必须是 {'/'.join(DeviceStatus)} 之一")
        try:
            if payload.floor is not None:
                row.floor = payload.floor
            if payload.location_desc is not None:
                row.location_desc = payload.location_desc
            if payload.status is not None:
                row.status = payload.status
            if payload.next_maintenance_at is not None:
                row.next_maintenance_at = parse_date(payload.next_maintenance_at, "next_maintenance_at")
            if payload.install_date is not None:
                row.install_date = parse_date(payload.install_date, "install_date")
        except ValueError as exc:
            raise validation_failed(str(exc)) from exc
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise BizError("INTERNAL_ERROR", f"设备更新失败：{exc.__class__.__name__}") from exc
        return to_fire_device_response(row)
