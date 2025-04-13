from fastapi.routing import APIRouter

from .auth.routes import router as auth_router
from .core.routes import router as core_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth")
router.include_router(core_router)
