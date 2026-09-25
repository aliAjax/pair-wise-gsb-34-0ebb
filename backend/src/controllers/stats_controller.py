from src.services.stats_service import StatsService

service = StatsService()


def dashboard(db):
    return service.dashboard(db)


def monthly_report(db, month):
    return service.monthly_report(db, month)
