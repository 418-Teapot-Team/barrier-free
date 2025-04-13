from enum import StrEnum

from sqlalchemy import ARRAY, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import EnumMixin, TableBase, intpk


class UserDisability(EnumMixin, StrEnum):
    WHEELCHAIR = "wheelchair"
    BLIND = "blind"
    DEAF = "deaf"


class UserRole(EnumMixin, StrEnum):
    USER = "user"
    ADMIN = "admin"


class User(TableBase):
    __tablename__ = "users"

    id: Mapped[intpk]
    email: Mapped[str] = mapped_column(unique=True)
    pwd_hash: Mapped[str]
    role: Mapped[UserRole] = mapped_column(default=UserRole.USER)
    disabilities: Mapped[list[UserDisability]] = mapped_column(ARRAY(String))
