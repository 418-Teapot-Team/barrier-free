from fastapi.routing import APIRouter

from api.db.tables import UserDisability

router = APIRouter()


@router.get("/disabilities")
async def get_disabilities():
    return list(UserDisability)
