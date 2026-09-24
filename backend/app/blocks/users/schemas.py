"""Shapes of the JSON going in and out of the users endpoints."""
from pydantic import BaseModel, field_validator


class LoginIn(BaseModel):
    """Body of POST /users/login."""
    username: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str) -> str:
        # "  Ana " and "ana" are the same user: trim spaces, lowercase
        value = value.strip().lower()
        if not 2 <= len(value) <= 30:
            raise ValueError("username must be 2 to 30 characters")
        if not all(c.isalnum() or c in "_.-" for c in value):
            raise ValueError("username may only use letters, numbers, _ . -")
        return value


class UserOut(BaseModel):
    """What the API sends back about a user. Never includes password_hash."""
    id: int
    username: str

    # lets pydantic read the fields straight from a User database object
    model_config = {"from_attributes": True}
