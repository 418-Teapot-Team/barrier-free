from sqlalchemy import ForeignKey as Fk
from sqlalchemy.orm import Mapped, mapped_column

from .base import TableBase, timestamptz_now
from .users import User, intpk


class NodeComment(TableBase):
    __tablename__ = "node_comments"

    id: Mapped[intpk]
    osm_id: Mapped[str]
    user_id: Mapped[int] = mapped_column(Fk(User.id, ondelete="CASCADE"))
    text: Mapped[str]
    created_at: Mapped[timestamptz_now]
