"""本地演示种子数据：仅在数据库为空时写入，日期相对当天生成，保证演示时逾期/完成率合理。"""
from datetime import date, datetime, timedelta

from src.constants.checklist_items import CHECKLIST_ITEMS, CHECKLIST_VERSION
from src.models.app_user import AppUser
from src.models.audit_log import AuditLog
from src.models.building import Building
from src.models.fire_device import FireDevice
from src.models.hazard_ticket import HazardTicket
from src.models.inspection_result import InspectionResult
from src.models.inspection_task import InspectionTask

DEFAULT_PASSWORD = "123456"

USERS = [
    ("wangjianguo", "王建国", "SUPERVISOR"),
    ("lilei", "李雷", "INSPECTOR"),
    ("hanmeimei", "韩梅梅", "INSPECTOR"),
    ("zhaosi", "赵四", "MAINTAINER"),
    ("qianshen", "钱审计", "AUDITOR"),
]

BUILDINGS = [
    ("1号研发楼", "东区", 6, "一级", 1, "JD-001"),
    ("2号办公楼", "东区", 12, "一级", 1, "JD-002"),
    ("3号仓库", "西区", 2, "二级", 1, "JD-003"),
]

# (building_idx, device_code, device_type, floor, location_desc, 安装于多少天前, 下次维保距今天数, status)
DEVICES = [
    (0, "EX-MH-101", "EXTINGUISHER", "1F", "大堂东侧灭火器箱", 800, 30, "NORMAL"),
    (0, "EX-MH-102", "EXTINGUISHER", "2F", "走廊尽头灭火器箱", 800, 30, "NORMAL"),
    (0, "HY-MH-101", "HYDRANT", "1F", "楼梯间消火栓箱", 900, 60, "NORMAL"),
    (0, "SD-MH-301", "SMOKE_DETECTOR", "3F", "机房吊顶", 700, 45, "NORMAL"),
    (1, "EX-BG-201", "EXTINGUISHER", "2F", "茶水间门口", 600, 20, "NORMAL"),
    (1, "HY-BG-101", "HYDRANT", "1F", "门厅消火栓箱", 600, 20, "FAULT"),
    (1, "SD-BG-501", "SMOKE_DETECTOR", "5F", "大会议室吊顶", 500, 15, "FAULT"),
    (1, "SP-BG-101", "SPRINKLER", "1F", "地下车库喷淋管网", 500, 10, "MAINTENANCE"),
    (1, "EL-BG-201", "EXIT_LIGHT", "2F", "疏散通道拐角", 500, 25, "NORMAL"),
    (2, "EX-CK-101", "EXTINGUISHER", "1F", "库房门口", 400, 35, "NORMAL"),
    (2, "HY-CK-101", "HYDRANT", "1F", "装卸区消火栓", 400, 35, "NORMAL"),
    (2, "EL-CK-101", "EXIT_LIGHT", "1F", "安全出口上方", 400, 35, "NORMAL"),
]

# (building_idx, task_type, 计划日期距今天数, status, inspector_idx, 完成于多少天前)
TASKS = [
    (0, "MONTHLY", -35, "REVIEWED", 2, -34),
    (1, "MONTHLY", -20, "SUBMITTED", 3, -21),
    (2, "QUARTERLY", -5, "IN_PROGRESS", 2, None),
    (0, "SPECIAL", -3, "PLANNED", None, None),
    (1, "DAILY", 0, "PLANNED", None, None),
    (0, "MONTHLY", 7, "PLANNED", None, None),
]

# 已完成任务里的异常项：(task_idx, device_idx, item_code, measured_value, note)
ABNORMAL_RESULTS = [
    (0, 1, "EXPIRY", "生产日期2019年", "灭火剂已过期，需整体更换"),
    (1, 5, "PRESSURE", "0.05MPa", "管网静水压力不足，疑似渗漏"),
    (1, 6, "ALARM", "无响应", "烟感报警测试无联动反馈"),
]

# 整改单：(异常项索引, severity, owner_idx, 期限距今天数, rectify_status, rectify_note, 关闭于多少天前)
TICKETS = [
    (0, "MEDIUM", 4, -28, "CLOSED", "已更换同规格灭火器并复检压力正常", -30),
    (1, "HIGH", 4, -2, "OPEN", "", None),
    (2, "CRITICAL", 4, 3, "RECTIFIED", "已更换探测器底座并恢复联动，待复验", None),
]

# 进行中任务已填写的部分：(task_idx, device_idx, 已填写前 N 个检查项)
PARTIAL_FILLED = [(2, 9, 4), (2, 10, 1)]


def _dt(days: int) -> datetime:
    return datetime.combine(date.today() + timedelta(days=days), datetime.min.time()).replace(hour=9)


def seed_if_empty(session):
    if session.query(AppUser).count() > 0:
        return

    users = [
        AppUser(id=i + 1, username=u, display_name=n, role=r, password=DEFAULT_PASSWORD)
        for i, (u, n, r) in enumerate(USERS)
    ]
    session.add_all(users)

    buildings = [
        Building(id=i + 1, name=n, campus=c, floor_count=f, fire_grade=g, manager_id=m, address_code=a)
        for i, (n, c, f, g, m, a) in enumerate(BUILDINGS)
    ]
    session.add_all(buildings)

    devices = [
        FireDevice(
            id=i + 1,
            building_id=b + 1,
            device_code=code,
            device_type=dt,
            floor=floor,
            location_desc=loc,
            install_date=date.today() + timedelta(days=-installed),
            status=status,
            next_maintenance_at=date.today() + timedelta(days=maintain_in),
        )
        for i, (b, code, dt, floor, loc, installed, maintain_in, status) in enumerate(DEVICES)
    ]
    session.add_all(devices)

    tasks = [
        InspectionTask(
            id=i + 1,
            building_id=b + 1,
            inspector_id=inspector,
            plan_date=date.today() + timedelta(days=plan_in),
            task_type=tt,
            status=status,
            checklist_version=CHECKLIST_VERSION,
            finished_at=_dt(finished) if finished is not None else None,
        )
        for i, (b, tt, plan_in, status, inspector, finished) in enumerate(TASKS)
    ]
    session.add_all(tasks)
    session.flush()

    # 每台设备的检查项结果
    abnormal_map = {(t, d): (item, mv, note) for t, d, item, mv, note in ABNORMAL_RESULTS}
    partial_map = {(t, d): n for t, d, n in PARTIAL_FILLED}
    results: dict[tuple[int, int], list[InspectionResult]] = {}
    next_id = 1
    for t_idx, task in enumerate(tasks):
        for d_idx, device in enumerate(devices):
            if device.building_id != task.building_id:
                continue
            items = CHECKLIST_ITEMS.get(device.device_type, [])
            filled_upto = partial_map.get((t_idx, d_idx), 0)
            for item_idx, (item_code, _name) in enumerate(items):
                status = "PENDING"
                measured, note = "", ""
                if task.status in ("SUBMITTED", "REVIEWED"):
                    status = "NORMAL"
                    measured = "正常"
                elif task.status == "IN_PROGRESS" and item_idx < filled_upto:
                    status = "NORMAL"
                    measured = "正常"
                abnormal = abnormal_map.get((t_idx, d_idx))
                if abnormal and abnormal[0] == item_code and task.status in ("SUBMITTED", "REVIEWED"):
                    status = "ABNORMAL"
                    measured, note = abnormal[1], abnormal[2]
                row = InspectionResult(
                    id=next_id,
                    task_id=task.id,
                    device_id=device.id,
                    item_code=item_code,
                    result_status=status,
                    measured_value=measured,
                    photo_url="",
                    note=note,
                    created_at=task.finished_at or _dt(0),
                )
                results.setdefault((t_idx, d_idx), []).append(row)
                next_id += 1
    session.add_all([r for rows in results.values() for r in rows])
    session.flush()

    flat = [r for rows in results.values() for r in rows]
    abnormal_rows = [r for r in flat if r.result_status == "ABNORMAL"]
    tickets = []
    for abnormal_idx, severity, owner, deadline_in, rstatus, note, closed in TICKETS:
        tickets.append(
            HazardTicket(
                result_id=abnormal_rows[abnormal_idx].id,
                severity=severity,
                owner_id=owner,
                deadline=date.today() + timedelta(days=deadline_in),
                rectify_status=rstatus,
                rectify_note=note,
                closed_at=_dt(closed) if closed is not None else None,
                created_at=_dt(deadline_in - 2),
            )
        )
    session.add_all(tickets)

    session.add_all(
        [
            AuditLog(actor="王建国", action="创建巡检任务", target_type="InspectionTask", target_id="InspectionTask#6", detail="系统初始化种子数据"),
            AuditLog(actor="李雷", action="领取巡检任务", target_type="InspectionTask", target_id="InspectionTask#3", detail="系统初始化种子数据"),
            AuditLog(actor="王建国", action="隐患派单", target_type="HazardTicket", target_id="HazardTicket#2", detail="系统初始化种子数据"),
        ]
    )
    session.commit()
