from fastapi import APIRouter

from app.api.routes import patients, login, private, users, utils, agent
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(patients.router)
api_router.include_router(agent.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
