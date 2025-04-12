from typing import Annotated

from annotated_types import MinLen
from pydantic import BaseModel, EmailStr, Field

from api.db.tables.users import UserDisability, UserRole


class RegisterBody(BaseModel):
    email: EmailStr
    password: Annotated[str, MinLen(1)]
    disabilities: list[UserDisability] = Field(default_factory=list)


class LoginBody(BaseModel):
    email: EmailStr
    password: Annotated[str, MinLen(1)]


class UserSchema(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    disabilities: list[UserDisability]
