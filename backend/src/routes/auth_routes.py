from fastapi import APIRouter

from src.controllers.auth_controller import list_users, login

router = APIRouter(prefix="/api/auth", tags=["Auth"])
router.get("/users")(list_users)
router.post("/login")(login)
