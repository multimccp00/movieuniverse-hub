"""Users table."""
from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # unique=True: the database itself refuses two users with the same name
    username: Mapped[str] = mapped_column(String(30), unique=True)
    # Empty until password login is added (later phase)
    password_hash: Mapped[str | None] = mapped_column(String(255), default=None)
    # server_default: the database fills in the current time on insert
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
