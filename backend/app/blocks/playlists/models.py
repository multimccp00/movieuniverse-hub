"""Playlists and the movies in them."""
from datetime import datetime

from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.blocks.users.models import User


class Playlist(Base):
    __tablename__ = "playlists"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Id from the seed file ("pl-01"), so importing twice updates instead of duplicating.
    # Empty for playlists created in the app.
    external_id: Mapped[str | None] = mapped_column(String(20), unique=True, default=None)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    # Soft delete: set = deleted (hidden everywhere), but the row stays
    deleted_at: Mapped[datetime | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # relationship: lets code write playlist.owner / playlist.movies instead of queries
    owner: Mapped[User] = relationship()
    movies: Mapped[list["PlaylistMovie"]] = relationship(
        order_by="PlaylistMovie.position",
        cascade="all, delete-orphan",  # removing from the list deletes the row
    )


class PlaylistMovie(Base):
    """One movie in one playlist. Only the TMDB id is stored; details come from the cache."""
    __tablename__ = "playlist_movies"

    # Primary key is the PAIR (playlist, movie): the database refuses the same
    # movie twice in one playlist.
    playlist_id: Mapped[int] = mapped_column(ForeignKey("playlists.id"), primary_key=True)
    tmdb_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    position: Mapped[int]
