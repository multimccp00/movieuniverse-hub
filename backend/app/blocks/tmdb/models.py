"""Cache table: one row per distinct TMDB request, holding TMDB's full JSON answer."""
from datetime import datetime

from sqlalchemy import JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class TmdbCache(Base):
    __tablename__ = "tmdb_cache"

    # e.g. "/movie/603?language=en-US" -- the request itself is the key
    cache_key: Mapped[str] = mapped_column(String(255), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON)
    # Stored so a max-age refresh can be added later (see features.md)
    fetched_at: Mapped[datetime] = mapped_column(server_default=func.now())
