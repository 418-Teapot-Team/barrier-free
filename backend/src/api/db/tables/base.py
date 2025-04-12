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
