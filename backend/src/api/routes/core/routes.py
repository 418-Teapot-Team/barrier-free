from typing import Annotated

from fastapi import Path
from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter
from pydantic import TypeAdapter
from starlette import status

from api.db.tables import UserDisability
from api.routes.auth.routes import authenticated_route
from api.state import CurrentUser, DbConn

from ...db.tables.users import UserRole
from . import services
from .schemas import (
    CreateNodeAccessibilityPropositionBody,
    CreateNodeCommentBody,
    NodeSchema,
    PredictAccessibilityBody,
    UpdateNodeBody,
)

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


@router.get("/nodes")
async def list_nodes(db_conn: DbConn):
    nodes = await services.list_nodes(db_conn=db_conn)
    return JSONResponse(
        content=TypeAdapter(list[NodeSchema]).dump_python(nodes, mode="json")
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


@router.post("/accessibility_propositions")
@authenticated_route
async def create_accessibility_proposition(
    db_conn: DbConn,
    user: CurrentUser,
    body: CreateNodeAccessibilityPropositionBody,
):
    proposition_id = await services.create_accessibility_proposition(
        db_conn=db_conn,
        osm_id=body.osm_id,
        user_id=user.id,
        text=body.text,
        accessibility=body.accessibility,
    )
    return JSONResponse(
        content={"id": proposition_id},
        status_code=status.HTTP_201_CREATED,
    )


@router.delete(
    "/accessibility_propositions/{proposition_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
@authenticated_route
async def delete_accessibility_proposition(
    db_conn: DbConn,
    user: CurrentUser,
    proposition_id: Annotated[int, Path()],
):
    await services.delete_accessibility_proposition(
        db_conn=db_conn,
        user_id=user.id,
        proposition_id=proposition_id,
    )


@router.post("/predict_accessibility")
async def predict_accessibility(body: PredictAccessibilityBody):
    return await services.predict_accessibility(text=body.text)
