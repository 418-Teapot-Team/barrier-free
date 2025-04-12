import re
from datetime import datetime
from typing import Annotated

from sqlalchemy import (
    BigInteger,
    DateTime,
    Integer,
    MetaData,
    SmallInteger,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import DeclarativeBase, mapped_column, registry

intpk = Annotated[int, mapped_column(Integer, primary_key=True)]
strpk = Annotated[str, mapped_column(String, primary_key=True)]
bigintpk = Annotated[int, mapped_column(BigInteger, primary_key=True)]
smallintpk = Annotated[int, mapped_column(SmallInteger, primary_key=True)]


timestamptz = Annotated[
    datetime,
    mapped_column(DateTime(timezone=True)),
]
timestamptz_now = Annotated[
    datetime,
    mapped_column(DateTime(timezone=True), server_default=func.now()),
]


constraint_naming_convention: dict[str, str] = {
    "pk": "%(table_name)s_pkey",
    "fk": "%(table_name)s_%(column_0_N_name)s_%(referred_table_name)s_fkey",
    "ix": "%(table_name)s_%(column_0_N_name)s_idx",
    "uq": "%(table_name)s_%(column_0_N_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
}


class TableBase(DeclarativeBase):
    __allow_unmapped__ = True

    registry = registry(
        metadata=MetaData(naming_convention=constraint_naming_convention),
        type_annotation_map={},
    )


class EnumMixin:
    """Helper class to properly map enum types."""

    def __init_subclass__(cls) -> None:
        super().__init_subclass__()
        TableBase.registry.update_type_annotation_map({cls: cls.as_sqla_enum()})

    @classmethod
    def get_type_name(cls) -> str:
        """Split string on capital letters.

        Example: `FooBar` -> `foo_bar`
        """
        return "_".join(re.findall("[A-Z][^A-Z]*", cls.__name__)).lower()

    @classmethod
    def as_sqla_enum(cls) -> ENUM:
        """Return PostgreSQL dialect enum object."""
        return ENUM(
            cls,
            name=cls.get_type_name(),
            values_callable=lambda e: [str(i.value) for i in e],
            create_type=False,
        )
