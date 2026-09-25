from sqlalchemy import select

from src.models.hazard_ticket import HazardTicket


class HazardTicketRepository:
    def find_all(self, db, rectify_status=None, severity=None, owner_id=None):
        stmt = select(HazardTicket).order_by(HazardTicket.id.desc())
        if rectify_status:
            stmt = stmt.where(HazardTicket.rectify_status == rectify_status)
        if severity:
            stmt = stmt.where(HazardTicket.severity == severity)
        if owner_id:
            stmt = stmt.where(HazardTicket.owner_id == owner_id)
        return db.scalars(stmt).all()

    def find_by_id(self, db, ticket_id):
        return db.get(HazardTicket, ticket_id)

    def find_by_result(self, db, result_id):
        return db.scalars(
            select(HazardTicket).where(HazardTicket.result_id == result_id)
        ).first()

    def find_open_by_result_ids(self, db, result_ids):
        if not result_ids:
            return []
        stmt = select(HazardTicket).where(
            HazardTicket.result_id.in_(result_ids),
            HazardTicket.rectify_status != "CLOSED",
        )
        return db.scalars(stmt).all()

    def insert(self, db, row: HazardTicket):
        db.add(row)
        db.flush()
        return row
