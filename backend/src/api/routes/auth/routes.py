from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter
from starlette import status

from api.state import CurrentUser, DbConn

from ...common.authentication import authenticated_route
from . import services
from .schemas import LoginBody, RegisterBody

router = APIRouter()


@router.post("/register")
async def register(db_conn: DbConn, body: RegisterBody):
    try:
        user_id = await services.register(
            db_conn=db_conn,
            email=body.email,
            password=body.password,
            disabilities=body.disabilities,
        )
        return JSONResponse(
            content={"user_id": user_id},
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@router.post("/login")
async def login(db_conn: DbConn, body: LoginBody):
    try:
        token = await services.login(
            db_conn=db_conn,
            email=body.email,
            password=body.password,
        )
        return JSONResponse(content={"token": token})
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


@router.get("/me")
@authenticated_route
async def me(db_conn: DbConn, user: CurrentUser):
    db_user = await services.get_user(db_conn=db_conn, user_id=user.id)
    return JSONResponse(content=db_user.model_dump())
