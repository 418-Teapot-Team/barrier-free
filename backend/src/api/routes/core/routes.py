from typing import Annotated

from fastapi import Path
from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter
from starlette import status

from api.db.tables import UserDisability
from api.routes.auth.routes import authenticated_route
from api.state import CurrentUser, DbConn

from ...db.tables.users import UserRole
from . import services
from .schemas import CreateNodeCommentBody, UpdateNodeBody

router = APIRouter()


@router.get("/disabilities")
async def get_disabilities():
    return list(UserDisability)


@router.post("/comments")
@authenticated_route
async def create_comments(
    db_conn: DbConn,
    user: CurrentUser,
    body: CreateNodeCommentBody,
):
    comment_id = await services.create_comment(
        db_conn=db_conn,
        osm_id=body.osm_id,
        user_id=user.id,
        text=body.text,
    )
    return JSONResponse(
        content={"id": comment_id},
        status_code=status.HTTP_201_CREATED,
    )


@router.delete("/comments/{id}", status_code=status.HTTP_204_NO_CONTENT)
@authenticated_route
async def delete_comment(
    db_conn: DbConn,
    user: CurrentUser,
    id: Annotated[int, Path()],
):
    await services.delete_comment(
        db_conn=db_conn,
        user_id=user.id,
        comment_id=id,
    )


@router.patch("/nodes/{osm_id}", status_code=status.HTTP_204_NO_CONTENT)
@authenticated_route
async def update_node(
    db_conn: DbConn,
    user: CurrentUser,
    osm_id: Annotated[str, Path()],
    body: UpdateNodeBody,
):
    if user.role != UserRole.ADMIN:
        return JSONResponse(
            content={"error": "Only admins are allowed to update the nodes"},
            status_code=status.HTTP_403_FORBIDDEN,
        )

    await services.update_node(
        db_conn=db_conn,
        osm_id=osm_id,
        accessibility=body.accessibility,
    )
