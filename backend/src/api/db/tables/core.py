from enum import StrEnum

from sqlalchemy import ForeignKey as Fk
from sqlalchemy.orm import Mapped, mapped_column

from .base import EnumMixin, TableBase, strpk, timestamptz_now
from .users import User, intpk


class NodeComment(TableBase):
    __tablename__ = "node_comments"

    id: Mapped[intpk]
    osm_id: Mapped[str]
    user_id: Mapped[int] = mapped_column(Fk(User.id, ondelete="CASCADE"))
    text: Mapped[str]
    created_at: Mapped[timestamptz_now]


class NodeAccessibility(EnumMixin, StrEnum):
    FULL = "full"
    PARTIAL = "partial"
    NONE = "none"


class NodeAccessibilityProposition(TableBase):
    __tablename__ = "node_accessability_propositions"

    id: Mapped[intpk]
    osm_id: Mapped[str]
    user_id: Mapped[int] = mapped_column(Fk(User.id, ondelete="CASCADE"))
    text: Mapped[str]
    accessibility: Mapped[NodeAccessibility]
    created_at: Mapped[timestamptz_now]


class Node(TableBase):
    __tablename__ = "nodes"

    osm_id: Mapped[strpk]
    accessibility: Mapped[NodeAccessibility]
