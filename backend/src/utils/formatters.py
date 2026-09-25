from datetime import date, datetime


def audit_target(kind, id):
    return f"{kind}#{id}"


def today() -> date:
    return date.today()


def now() -> datetime:
    return datetime.now()


def parse_date(value, field: str = "date") -> date:
    """把 'YYYY-MM-DD' 或 ISO 时间字符串解析为 date，失败抛 ValueError。"""
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if not value or not isinstance(value, str):
        raise ValueError(f"{field} 不能为空")
    text = value.strip()[:10]
    return date.fromisoformat(text)


def is_overdue(plan: date | None, done: bool) -> bool:
    """计划日期已过且未完成 -> 逾期。"""
    return bool(plan) and not done and plan < today()


def to_iso(value):
    if value is None:
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)
