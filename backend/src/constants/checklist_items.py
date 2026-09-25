# 各设备类型的巡检检查项（item_code -> 检查项名称）
CHECKLIST_ITEMS = {
    "EXTINGUISHER": [
        ("PRESSURE", "压力表指针在绿区"),
        ("SEAL", "铅封与保险销完好"),
        ("BODY", "瓶体无锈蚀变形"),
        ("EXPIRY", "灭火剂在有效期内"),
    ],
    "HYDRANT": [
        ("VALVE", "阀门启闭灵活无渗漏"),
        ("HOSE", "水带完好无破损"),
        ("GUN", "水枪及接口齐全"),
        ("PRESSURE", "管网静水压力正常"),
    ],
    "SMOKE_DETECTOR": [
        ("ALARM", "报警功能测试正常"),
        ("LED", "巡检指示灯闪烁正常"),
        ("COVER", "探测器无遮挡无污染"),
    ],
    "SPRINKLER": [
        ("HEAD", "喷头无堵塞无腐蚀"),
        ("PIPE", "管网压力正常无渗漏"),
        ("VALVE", "报警阀组动作正常"),
    ],
    "EXIT_LIGHT": [
        ("LIGHT", "应急点亮功能正常"),
        ("BATTERY", "蓄电池放电时间达标"),
        ("DIRECTION", "疏散指示方向正确"),
    ],
}

CHECKLIST_VERSION = "v2026.09"
