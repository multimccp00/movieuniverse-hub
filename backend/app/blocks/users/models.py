"""Users and their login sessions."""
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # unique=True: the database itself refuses two users with the same name
    username: Mapped[str] = mapped_column(String(30), unique=True)
    # Argon2 hash of the password -- never the password itself
    password_hash: Mapped[str | None] = mapped_column(String(255), default=None)


class LoginSession(Base):
    """One logged-in browser. The browser holds the secret token in a cookie;
    the database only holds a hash of it, so a leaked database can't be used to log in."""
    __tablename__ = "sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # sha256 hex
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    expires_at: Mapped[datetime]
