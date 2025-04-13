from copy import copy
from types import FunctionType
from typing import Any, Callable

import jwt
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)
from starlette.routing import BaseRoute, Match
from starlette.types import Scope

from .common.authentication import AuthenticatedUser, is_route_authenticated
from .routes.auth.services import get_user
from .settings import settings
from .state import db_engine, set_user


def _match_routes(routes: list[BaseRoute], scope: Scope) -> FunctionType | None:
    """Find route function by given routes list and request's scope"""

    for route in routes:
        match, child_scope = route.matches(scope)
        if match != Match.FULL:
            continue

        scope.update(child_scope)
        endpoint: FastAPI | FunctionType = scope["endpoint"]

        if isinstance(endpoint, FunctionType):
            return endpoint
        elif isinstance(endpoint, StaticFiles):
            continue
        else:
            return _match_routes(endpoint.routes, scope)


def _resolve_route(request: Request) -> Callable[..., Any] | None:
    """
    Find an endpoint function based on the request based.
    It's mainly useful in middlewares where endpoint function is not available
    right away.
    """

    app: FastAPI = request.app
    try:
        return request.state._route
    except AttributeError:
        request.state._route = _match_routes(app.routes, copy(request.scope))
        return request.state._route


class JWTAuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        route = _resolve_route(request)
        if not route or not is_route_authenticated(route):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                content={"error": "Invalid token"},
                status_code=401,
            )

        token = auth_header[len("Bearer ") :]
        try:
            payload = jwt.decode(
                jwt=token,
                key=settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                content={"error": "Token expired"},
                status_code=401,
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                content={"error": "Invalid token"},
                status_code=401,
            )

        user_id = payload["user_id"]
        async with db_engine.connect() as db_conn:
            user = await get_user(db_conn=db_conn, user_id=user_id)

        set_user(
            request=request,
            user=AuthenticatedUser(id=payload["user_id"], role=user.role),
        )

        return await call_next(request)
