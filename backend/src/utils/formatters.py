from datetime import date, datetime


def audit_target(kind, id):
    return f"{kind}#{id}"


def format_date(value):
    if value is None or value == "":
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def format_datetime(value):
    if value is None or value == "":
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def format_percent(part, total):
    if not total:
        return 0.0
    return round(part * 100.0 / total, 1)
