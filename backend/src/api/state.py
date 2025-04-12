from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine

from .db.utils import get_db_url
from .settings import settings

# DbConn = Annotated[AsyncConnection, Depends(get_db_conn)]


db_engine = create_async_engine(
    url=get_db_url(settings.DATABASE_URL),
    pool_size=15,
)
