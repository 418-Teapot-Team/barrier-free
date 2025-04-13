from pydantic import BaseModel


class CreateNodeCommentBody(BaseModel):
    osm_id: str
    text: str
