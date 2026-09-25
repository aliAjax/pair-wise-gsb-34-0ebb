from sqlalchemy import select

from src.models.app_user import AppUser


class AppUserRepository:
    def __init__(self, session):
        self.session = session

    def find_all(self):
        return list(self.session.scalars(select(AppUser).order_by(AppUser.id)).all())

    def find_by_id(self, id: int):
        return self.session.get(AppUser, id)

    def find_by_username(self, username: str):
        stmt = select(AppUser).where(AppUser.username == username)
        return self.session.scalars(stmt).first()
