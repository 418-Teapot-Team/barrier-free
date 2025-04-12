from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncConnection, create_async_engine

from .db.utils import get_db_url
from .common.authentication import AuthenticatedUser
from .settings import settings

db_engine = create_async_engine(
    url=get_db_url(settings.DATABASE_URL),
    pool_size=15,
)


async def get_db_conn():
    async with db_engine.connect() as conn:
        yield conn


DbConn = Annotated[AsyncConnection, Depends(get_db_conn)]


def set_user(request: Request, user: AuthenticatedUser) -> None:
    request.state.user = user


def get_user(request: Request) -> AuthenticatedUser:
    return request.state.user


CurrentUser = Annotated[AuthenticatedUser, Depends(get_user)]
