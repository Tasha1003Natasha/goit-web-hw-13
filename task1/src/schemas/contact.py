from datetime import date, datetime
import re
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from src.schemas.user import UserResponse

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactSchema(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    surname: str = Field(min_length=3, max_length=50)
    email: str = Field(max_length=254)
    phone: str = Field(max_length=20)
    birthday: date
    info: str | None = Field(default=None, max_length=250)
    completed: Optional[bool] = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        if not EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Invalid email address")
        return email


class ContactUpdateSchema(ContactSchema):
    completed: bool


class ContactResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    phone: str
    birthday: date
    info: str | None = None
    completed: bool
    created_at: datetime | None
    updated_at: datetime | None
    user: UserResponse | None

    model_config = ConfigDict(from_attributes=True)
