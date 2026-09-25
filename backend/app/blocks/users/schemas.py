"""Shapes of the JSON going in and out of the users endpoints."""
from pydantic import BaseModel, field_validator


class Credentials(BaseModel):
    """Body of POST /users/register and POST /users/login."""
    username: str
    password: str

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

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        # Length is what makes a password strong; no "must contain a symbol" rules
        if not 8 <= len(value) <= 128:
            raise ValueError("password must be 8 to 128 characters")
        return value


class UserOut(BaseModel):
    """What the API sends back about a user. Never includes password_hash."""
    id: int
    username: str

    # lets pydantic read the fields straight from a User database object
    model_config = {"from_attributes": True}
