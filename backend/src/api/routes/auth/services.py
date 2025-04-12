from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from sqlalchemy import sql
from sqlalchemy.ext.asyncio import AsyncConnection

from api.db.tables.users import User, UserDisability
from api.settings import settings

from .schemas import UserSchema


async def register(
    db_conn: AsyncConnection,
    email: str,
    password: str,
    disabilities: list[UserDisability],
) -> int:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt).hex()

    query = (
        sql.insert(User)
        .values(
            email=email,
            pwd_hash=hashed_password,
            disabilities=disabilities,
        )
        .returning(User.id)
    )

    try:
        cursor_result = await db_conn.execute(query)
        await db_conn.commit()
        return cursor_result.scalar_one()
    except Exception as e:
        print(f"{e!r}")
        raise Exception("User already exists") from e


async def login(db_conn: AsyncConnection, email: str, password: str) -> str:
    """
    Authenticate a user and return a JWT token.

    Checks if the user exists and if the password is correct.
    On success, returns a JWT token containing the user ID, email, and an expiration.
    """
    query = sql.select(User).where(User.email == email)
    result = await db_conn.execute(query)
    user = result.mappings().one_or_none()

    if not user:
        raise Exception("Incorrect email")

    password_bytes = password.encode("utf-8")
    hashed_password = bytes.fromhex(user.pwd_hash)
    if not bcrypt.checkpw(
        password=password_bytes,
        hashed_password=hashed_password,
    ):
        raise Exception("Incorrect password")

    jwt_expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    token_payload = {"user_id": user.id, "email": user.email, "exp": jwt_expire}
    return jwt.encode(
        payload=token_payload,
        key=settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


async def get_user(db_conn: AsyncConnection, user_id: int) -> UserSchema:
    query = sql.select(User).where(User.id == user_id)
    cursor_result = await db_conn.execute(query)
    user = cursor_result.mappings().one_or_none()
    if user is None:
        raise Exception("User does not exist")

    return UserSchema.model_validate(user)
