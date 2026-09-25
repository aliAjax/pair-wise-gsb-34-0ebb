"""本地种子数据：首次启动且楼栋表为空时写入，全部为本地数据。

日期相对运行日生成，保证演示时逾期、本月、历史任务同时存在。
"""
from datetime import date, datetime, timedelta

from sqlalchemy import select

from src.models.audit_log import AuditLog
from src.models.building import Building
from src.models.fire_device import FireDevice
from src.models.hazard_ticket import HazardTicket
from src.models.inspection_result import InspectionResult
from src.models.inspection_task import InspectionTask
from src.models.sys_user import SysUser
from src.repositories.building_repository import BuildingRepository
from src.services.auth_service import hash_password


def _dt(d: date, hour=9) -> datetime:
    return datetime(d.year, d.month, d.day, hour, 0, 0)


def seed_if_empty(db):
    if BuildingRepository().count(db) > 0:
        return

    today = date.today()

    def d(offset):
        return today + timedelta(days=offset)

    # ---------- 用户（巡检员/维保商/物业主管/审计员） ----------
    users = [
        SysUser(id=1, username="admin", password_hash=hash_password("admin123"),
                display_name="王主管", role="SUPERVISOR"),
        SysUser(id=2, username="inspector1", password_hash=hash_password("inspect123"),
                display_name="张巡检", role="INSPECTOR"),
        SysUser(id=3, username="inspector2", password_hash=hash_password("inspect123"),
                display_name="李巡检", role="INSPECTOR"),
        SysUser(id=4, username="maintainer1", password_hash=hash_password("maintain123"),
                display_name="赵维保", role="MAINTAINER"),
        SysUser(id=5, username="auditor1", password_hash=hash_password("audit123"),
                display_name="钱审计", role="AUDITOR"),
    ]
    db.add_all(users)

    # ---------- 楼栋 ----------
    db.add_all([
        Building(id=1, name="1号研发楼", campus="科创园东区", floor_count=12,
                 fire_grade="一级", manager_id=1, address_code="ADR-E-001"),
        Building(id=2, name="2号实验楼", campus="科创园东区", floor_count=8,
                 fire_grade="二级", manager_id=1, address_code="ADR-E-002"),
        Building(id=3, name="3号综合楼", campus="科创园西区", floor_count=6,
                 fire_grade="二级", manager_id=1, address_code="ADR-W-001"),
        Building(id=4, name="地下车库", campus="科创园西区", floor_count=2,
                 fire_grade="一级", manager_id=1, address_code="ADR-W-002"),
    ])

    # ---------- 设备 ----------
    db.add_all([
        FireDevice(id=1, building_id=1, device_code="EXT-1-001", device_type="EXTINGUISHER",
                   floor="1F", location_desc="前台东侧", install_date=d(-400),
                   status="NORMAL", next_maintenance_at=d(20)),
        FireDevice(id=2, building_id=1, device_code="EXT-1-002", device_type="EXTINGUISHER",
                   floor="3F", location_desc="茶水间旁", install_date=d(-380),
                   status="NORMAL", next_maintenance_at=d(30)),
        FireDevice(id=3, building_id=1, device_code="HYD-1-001", device_type="HYDRANT",
                   floor="3F", location_desc="西侧消火栓箱", install_date=d(-600),
                   status="FAULT", next_maintenance_at=d(60)),
        FireDevice(id=4, building_id=1, device_code="SDE-1-001", device_type="SMOKE_DETECTOR",
                   floor="5F", location_desc="办公区天花", install_date=d(-300),
                   status="NORMAL", next_maintenance_at=d(45)),
        FireDevice(id=5, building_id=1, device_code="EXL-1-001", device_type="EXIT_LIGHT",
                   floor="1F", location_desc="安全出口", install_date=d(-250),
                   status="NORMAL", next_maintenance_at=d(15)),
        FireDevice(id=6, building_id=2, device_code="SDE-2-001", device_type="SMOKE_DETECTOR",
                   floor="2F", location_desc="实验室门口", install_date=d(-320),
                   status="NORMAL", next_maintenance_at=d(40)),
        FireDevice(id=7, building_id=2, device_code="SDE-2-002", device_type="SMOKE_DETECTOR",
                   floor="4F", location_desc="走廊东侧天花", install_date=d(-330),
                   status="NORMAL", next_maintenance_at=d(-5)),
        FireDevice(id=8, building_id=2, device_code="EXT-2-001", device_type="EXTINGUISHER",
                   floor="1F", location_desc="门厅", install_date=d(-410),
                   status="NORMAL", next_maintenance_at=d(25)),
        FireDevice(id=9, building_id=3, device_code="EXL-3-001", device_type="EXIT_LIGHT",
                   floor="2F", location_desc="疏散通道", install_date=d(-200),
                   status="NORMAL", next_maintenance_at=d(10)),
        FireDevice(id=10, building_id=3, device_code="EXL-3-002", device_type="EXIT_LIGHT",
                   floor="4F", location_desc="楼梯口", install_date=d(-210),
                   status="MAINTENANCE", next_maintenance_at=d(-8)),
        FireDevice(id=11, building_id=3, device_code="SDE-3-001", device_type="SMOKE_DETECTOR",
                   floor="3F", location_desc="会议室天花", install_date=d(-260),
                   status="FAULT", next_maintenance_at=d(50)),
        FireDevice(id=12, building_id=4, device_code="SPR-4-001", device_type="SPRINKLER",
                   floor="B1", location_desc="泵房主管", install_date=d(-700),
                   status="NORMAL", next_maintenance_at=d(70)),
        FireDevice(id=13, building_id=4, device_code="SPR-4-002", device_type="SPRINKLER",
                   floor="B2", location_desc="停车区管网", install_date=d(-700),
                   status="NORMAL", next_maintenance_at=d(70)),
        FireDevice(id=14, building_id=4, device_code="HYD-4-001", device_type="HYDRANT",
                   floor="B1", location_desc="车库出入口", install_date=d(-600),
                   status="NORMAL", next_maintenance_at=d(35)),
        FireDevice(id=15, building_id=4, device_code="EXT-4-001", device_type="EXTINGUISHER",
                   floor="B2", location_desc="配电室门口", install_date=d(-350),
                   status="NORMAL", next_maintenance_at=d(12)),
    ])

    # ---------- 任务 ----------
    db.add_all([
        InspectionTask(id=1, building_id=1, inspector_id=2, plan_date=d(-2),
                       task_type="EXTINGUISHER", status="REVIEWED",
                       checklist_version="v1.0", finished_at=_dt(d(-2), 11),
                       created_at=_dt(d(-3), 9)),
        InspectionTask(id=2, building_id=1, inspector_id=2, plan_date=d(-1),
                       task_type="HYDRANT", status="SUBMITTED",
                       checklist_version="v1.0", finished_at=_dt(d(-1), 10),
                       created_at=_dt(d(-2), 9)),
        InspectionTask(id=3, building_id=2, inspector_id=3, plan_date=d(0),
                       task_type="SMOKE_DETECTOR", status="IN_PROGRESS",
                       checklist_version="v1.0", finished_at=None,
                       created_at=_dt(d(0), 8)),
        InspectionTask(id=4, building_id=3, inspector_id=None, plan_date=d(1),
                       task_type="EXIT_LIGHT", status="PLANNED",
                       checklist_version="v1.0", finished_at=None,
                       created_at=_dt(d(0), 10)),
        InspectionTask(id=5, building_id=4, inspector_id=None, plan_date=d(-5),
                       task_type="SPRINKLER", status="PLANNED",
                       checklist_version="v1.0", finished_at=None,
                       created_at=_dt(d(-6), 9)),
        InspectionTask(id=6, building_id=2, inspector_id=2, plan_date=d(-30),
                       task_type="EXTINGUISHER", status="REVIEWED",
                       checklist_version="v1.0", finished_at=_dt(d(-30), 11),
                       created_at=_dt(d(-31), 9)),
        InspectionTask(id=7, building_id=3, inspector_id=3, plan_date=d(-25),
                       task_type="SMOKE_DETECTOR", status="REVIEWED",
                       checklist_version="v1.0", finished_at=_dt(d(-25), 10),
                       created_at=_dt(d(-26), 9)),
    ])

    # ---------- 巡检结果 ----------
    results = []
    rid = 1

    def add(task_id, device_id, item_code, result_status, measured="", note="", updated=None):
        nonlocal rid
        results.append(InspectionResult(
            id=rid, task_id=task_id, device_id=device_id, item_code=item_code,
            result_status=result_status, measured_value=measured, photo_url="",
            note=note, updated_at=updated or _dt(today, 9),
        ))
        rid += 1

    # T1：1号研发楼灭火器，全部正常
    for device_id in (1, 2):
        for code, value in (("PRESSURE", "绿区"), ("SEAL", "完好"),
                            ("WEIGHT", "达标"), ("EXPIRY", "在有效期内")):
            add(1, device_id, code, "NORMAL", value, updated=_dt(d(-2), 11))

    # T2：3F消火栓，两项异常（一项已派单逾期，一项待派单）
    add(2, 3, "WATER_PRESSURE", "NORMAL", "0.28MPa", updated=_dt(d(-1), 10))
    add(2, 3, "VALVE", "ABNORMAL", "0.28MPa", "阀门锈蚀，启闭困难", updated=_dt(d(-1), 10))
    add(2, 3, "HOSE", "NORMAL", "齐全完好", updated=_dt(d(-1), 10))
    add(2, 3, "CABINET", "ABNORMAL", "", "箱体前方被杂物遮挡", updated=_dt(d(-1), 10))

    # T3：2号实验楼烟感，进行中（9 项完成 4 项）
    add(3, 6, "ALARM_TEST", "NORMAL", "报警正常", updated=_dt(d(0), 9))
    add(3, 6, "INDICATOR", "NORMAL", "指示灯正常", updated=_dt(d(0), 9))
    add(3, 6, "COVER", "NORMAL", "外观清洁", updated=_dt(d(0), 9))
    add(3, 7, "ALARM_TEST", "NORMAL", "报警正常", updated=_dt(d(0), 9))

    # T6：2号实验楼灭火器，有效期异常（已整改闭环）
    add(6, 8, "PRESSURE", "NORMAL", "绿区", updated=_dt(d(-30), 10))
    add(6, 8, "SEAL", "NORMAL", "完好", updated=_dt(d(-30), 10))
    add(6, 8, "WEIGHT", "NORMAL", "达标", updated=_dt(d(-30), 10))
    add(6, 8, "EXPIRY", "ABNORMAL", "", "灭火器已超过有效期", updated=_dt(d(-30), 10))

    # T7：3号综合楼烟感，报警测试异常（已整改待复验）
    add(7, 11, "ALARM_TEST", "ABNORMAL", "", "模拟报警无响应", updated=_dt(d(-25), 10))
    add(7, 11, "INDICATOR", "NORMAL", "正常", updated=_dt(d(-25), 10))
    add(7, 11, "COVER", "NORMAL", "清洁无遮挡", updated=_dt(d(-25), 10))
    db.add_all(results)

    # ---------- 隐患整改单 ----------
    db.add_all([
        HazardTicket(id=1, result_id=10, severity="HIGH", owner_id=4, deadline=d(-1),
                     rectify_status="ASSIGNED", rectify_note="", closed_at=None,
                     created_at=_dt(d(-1), 14)),
        HazardTicket(id=2, result_id=20, severity="LOW", owner_id=4, deadline=d(-26),
                     rectify_status="CLOSED",
                     rectify_note="已更换新灭火器，编号 EXT-2-001，重新称重合格｜复验：合格",
                     closed_at=_dt(d(-22), 15), created_at=_dt(d(-28), 14)),
        HazardTicket(id=3, result_id=21, severity="MEDIUM", owner_id=4, deadline=d(2),
                     rectify_status="RECTIFIED",
                     rectify_note="已更换探测器电池并重新加烟测试，报警恢复正常",
                     closed_at=None, created_at=_dt(d(-20), 14)),
    ])

    # ---------- 历史操作日志 ----------
    db.add_all([
        AuditLog(id=1, actor="王主管", action="巡检任务创建：任务#7 3号综合楼 SMOKE_DETECTOR",
                 target_type="InspectionTask", target_id="7", created_at=_dt(d(-26), 9)),
        AuditLog(id=2, actor="李巡检", action="巡检任务提交：任务#7（异常 1 项）",
                 target_type="InspectionTask", target_id="7", created_at=_dt(d(-25), 10)),
        AuditLog(id=3, actor="王主管", action="隐患整改单派单：整改单#3（SDE-3-001 -> 赵维保）",
                 target_type="HazardTicket", target_id="3", created_at=_dt(d(-20), 14)),
        AuditLog(id=4, actor="赵维保", action="隐患整改填写：整改单#3",
                 target_type="HazardTicket", target_id="3", created_at=_dt(d(-3), 16)),
        AuditLog(id=5, actor="王主管", action="巡检任务复核：任务#1",
                 target_type="InspectionTask", target_id="1", created_at=_dt(d(-2), 14)),
        AuditLog(id=6, actor="王主管", action="隐患复验关闭：整改单#2",
                 target_type="HazardTicket", target_id="2", created_at=_dt(d(-22), 15)),
        AuditLog(id=7, actor="王主管", action="隐患整改单派单：整改单#1（HYD-1-001 -> 赵维保）",
                 target_type="HazardTicket", target_id="1", created_at=_dt(d(-1), 14)),
    ])

    db.commit()
    _sync_sequences(db)


def _sync_sequences(db):
    """显式插入固定 id 后，同步自增序列（SERIAL / IDENTITY 均按 {table}_id_seq 命名）。"""
    if db.bind.dialect.name != "postgresql":
        return
    from sqlalchemy import text

    tables = (
        "sys_user", "building", "fire_device", "inspection_task",
        "inspection_result", "hazard_ticket", "audit_log",
    )
    for table in tables:
        db.execute(text(
            f"SELECT setval('{table}_id_seq', "
            f"COALESCE((SELECT MAX(id) FROM {table}), 1))"
        ))
    db.commit()
