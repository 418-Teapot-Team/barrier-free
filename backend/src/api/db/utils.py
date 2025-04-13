from typing import Any

from sqlalchemy import JSON, URL, ColumnElement, Function, func, make_url, sql
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.type_api import TypeEngine


def get_db_url(url: str) -> URL:
    sqlalchemy_url = make_url(url)
    return sqlalchemy_url.set(drivername="postgresql+psycopg_async")


def json_build_object(values: dict[Any, Any]) -> Function[Any]:
    args = tuple(x for item in values.items() for x in item)
    return func.json_build_object(*args)


def empty_array(tp: type[TypeEngine] = JSON) -> ColumnElement:
    return sql.cast(sql.literal("{}"), ARRAY(tp))
