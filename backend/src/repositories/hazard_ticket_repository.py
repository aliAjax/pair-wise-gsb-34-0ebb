from sqlalchemy import select

from src.models.hazard_ticket import HazardTicket


class HazardTicketRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self, rectify_status=None, severity=None, result_id=None):
        stmt = select(HazardTicket).order_by(HazardTicket.id.desc())
        if rectify_status:
            stmt = stmt.where(HazardTicket.rectify_status == rectify_status)
        if severity:
            stmt = stmt.where(HazardTicket.severity == severity)
        if result_id:
            stmt = stmt.where(HazardTicket.result_id == result_id)
        return list(self.session.scalars(stmt).all())

    def find_by_id(self, id: int):
        return self.session.get(HazardTicket, id)

    def find_open_by_result(self, result_id: int):
        stmt = select(HazardTicket).where(
            HazardTicket.result_id == result_id,
            HazardTicket.rectify_status != "CLOSED",
        )
        return list(self.session.scalars(stmt).all())

    def find_open_by_device(self, device_id: int):
        from src.models.inspection_result import InspectionResult

        stmt = (
            select(HazardTicket)
            .join(InspectionResult, HazardTicket.result_id == InspectionResult.id)
            .where(InspectionResult.device_id == device_id, HazardTicket.rectify_status != "CLOSED")
        )
        return list(self.session.scalars(stmt).all())

    def insert(self, row: HazardTicket):
        self.session.add(row)
        self.session.flush()
        return row
