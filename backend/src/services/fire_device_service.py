from datetime import date, datetime

from src.constants.device_status import DeviceStatus
from src.constants.device_type import DeviceType
from src.constructors.fire_device_factory import fire_device_response
from src.models.fire_device import FireDevice
from src.repositories.building_repository import BuildingRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.services.audit_log_service import AuditLogService
from src.utils.exceptions import ServiceError


def _parse_date(value, field):
    if value in (None, ""):
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        raise ServiceError("VALIDATION_FAILED", 422, f"{field} 日期格式应为 YYYY-MM-DD")


class FireDeviceService:
    def __init__(self):
        self.repo = FireDeviceRepository()
        self.building_repo = BuildingRepository()
        self.audit = AuditLogService()

    def _building_names(self, db):
        return {b.id: b.name for b in self.building_repo.find_all(db)}

    def _render(self, row, names):
        due = bool(row.next_maintenance_at and row.next_maintenance_at < date.today())
        return fire_device_response(
            row, building_name=names.get(row.building_id), maintenance_due=due
        )

    def list(self, db, building_id=None, device_type=None, status=None, floor=None):
        names = self._building_names(db)
        rows = self.repo.find_all(db, building_id, device_type, status, floor)
        return [self._render(row, names) for row in rows]

    def get(self, db, device_id):
        row = self.repo.find_by_id(db, device_id)
        if not row:
            raise ServiceError("DEVICE_NOT_FOUND", 404)
        return self._render(row, self._building_names(db))

    def create(self, db, payload, user):
        if payload.device_type not in DeviceType:
            raise ServiceError("VALIDATION_FAILED", 422, "设备类型不合法")
        if payload.status not in DeviceStatus:
            raise ServiceError("VALIDATION_FAILED", 422, "设备状态不合法")
        if not self.building_repo.find_by_id(db, payload.building_id):
            raise ServiceError("BUILDING_NOT_FOUND", 404)
        if self.repo.find_by_code(db, payload.device_code):
            raise ServiceError("DEVICE_CODE_DUPLICATED", 409)
        row = FireDevice(
            building_id=payload.building_id,
            device_code=payload.device_code,
            device_type=payload.device_type,
            floor=payload.floor,
            location_desc=payload.location_desc,
            install_date=_parse_date(payload.install_date, "install_date"),
            status=payload.status,
            next_maintenance_at=_parse_date(payload.next_maintenance_at, "next_maintenance_at"),
        )
        self.repo.insert(db, row)
        self.audit.record(db, user, "FireDevice", "create", row.id, device_code=row.device_code)
        db.commit()
        return self._render(row, self._building_names(db))

    def update_status(self, db, device_id, status, user=None):
        """内部状态流转：异常结果置故障，整改闭环恢复。"""
        row = self.repo.find_by_id(db, device_id)
        if not row:
            raise ServiceError("DEVICE_NOT_FOUND", 404)
        if status not in DeviceStatus:
            raise ServiceError("VALIDATION_FAILED", 422, "设备状态不合法")
        if row.status != status:
            row.status = status
            self.audit.record(
                db, user, "FireDevice", "status", row.id,
                device_code=row.device_code, status=status,
            )
        return row
