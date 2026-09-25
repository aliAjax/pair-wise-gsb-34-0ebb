import os

PORT = int(os.getenv("PORT", "8000"))

DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "app_db")
DB_USER = os.getenv("DB_USER", "app_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "app_password")

JWT_SECRET = os.getenv("JWT_SECRET", "local-dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))

_LOCAL_DB = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "fire_inspect_local.db")
)

DATABASE_URL = os.getenv("DATABASE_URL") or (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    if DB_HOST
    else f"sqlite:///{_LOCAL_DB}"
)
