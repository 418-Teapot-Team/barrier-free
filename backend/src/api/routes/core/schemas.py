from pydantic import BaseModel

from api.db.tables.core import NodeAccessibility


class CreateNodeCommentBody(BaseModel):
    osm_id: str
    text: str


class UpdateNodeBody(BaseModel):
    accessibility: NodeAccessibility
