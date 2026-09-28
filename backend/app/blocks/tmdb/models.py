"""Cache table: one row per distinct TMDB request, holding TMDB's full JSON answer."""
from datetime import datetime, timezone

from sqlalchemy import JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def utcnow() -> datetime:
    # UTC, like the database's own clock in Docker and SQLite, so the ages compare correctly
    return datetime.now(timezone.utc).replace(tzinfo=None)


class TmdbCache(Base):
    __tablename__ = "tmdb_cache"

    # e.g. "/movie/603?language=en-US" -- the request itself is the key
    cache_key: Mapped[str] = mapped_column(String(255), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON)
    # When TMDB answered; refresh.py re-fetches entries that are too old
    fetched_at: Mapped[datetime] = mapped_column(default=utcnow, server_default=func.now())
