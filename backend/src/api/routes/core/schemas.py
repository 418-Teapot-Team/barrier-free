from datetime import datetime

from pydantic import BaseModel

from api.db.tables.core import NodeAccessibility
from api.db.tables.users import UserDisability


class CreateNodeCommentBody(BaseModel):
    osm_id: str
    text: str


class UpdateNodeBody(BaseModel):
    accessibility: NodeAccessibility


class UserSchema(BaseModel):
    id: int
    email: str
    disabilities: list[UserDisability]


class NodeCommentSchema(BaseModel):
    id: int
    user: UserSchema
    text: str
    created_at: datetime


class NodeAccessibilityPropositionSchema(BaseModel):
    id: int
    user: UserSchema
    text: str
    accessibility: NodeAccessibility
    created_at: datetime


class NodeSchema(BaseModel):
    osm_id: str
    accessibility: NodeAccessibility | None
    comments: list[NodeCommentSchema]
    accessibility_propositions: list[NodeAccessibilityPropositionSchema]


class CreateNodeAccessibilityPropositionBody(BaseModel):
    osm_id: str
    text: str
    accessibility: NodeAccessibility
