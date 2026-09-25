from sqlalchemy import select

from src.models.sys_user import SysUser


class UserRepository:
    def find_all(self, db):
        return db.scalars(select(SysUser).order_by(SysUser.id)).all()

    def find_by_id(self, db, user_id):
        return db.get(SysUser, user_id)

    def find_by_username(self, db, username):
        return db.scalars(
            select(SysUser).where(SysUser.username == username)
        ).first()
