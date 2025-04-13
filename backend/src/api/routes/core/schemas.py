from datetime import datetime

from pydantic import BaseModel

from api.db.tables.core import NodeAccessibility
from api.db.tables.users import UserDisability


class CreateNodeCommentBody(BaseModel):
    osm_id: str
    text: str


class UpdateNodeBody(BaseModel):
    accessibility: NodeAccessibility


class NodeCommentUser(BaseModel):
    id: int
    email: str
    disabilities: list[UserDisability]


class NodeCommentSchema(BaseModel):
    user: NodeCommentUser
    text: str
    created_at: datetime


class NodeSchema(BaseModel):
    osm_id: str
    accessibility: NodeAccessibility | None
    comments: list[NodeCommentSchema]
