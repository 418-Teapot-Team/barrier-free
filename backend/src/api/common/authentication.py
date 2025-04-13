from typing import Callable, ParamSpec, TypeVar

from pydantic import BaseModel

from api.db.tables.users import UserRole

T = TypeVar("T")
P = ParamSpec("P")


def authenticated_route(func: Callable[P, T]) -> Callable[P, T]:
    setattr(func, "_is_route_authenticated", True)
    return func


def is_route_authenticated(func: Callable[P, T]) -> bool:
    return getattr(func, "_is_route_authenticated", False)


class AuthenticatedUser(BaseModel):
    id: int
    role: UserRole
