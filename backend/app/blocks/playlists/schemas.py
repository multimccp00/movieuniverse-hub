"""Shapes of the JSON going in and out of the playlist endpoints."""
from pydantic import BaseModel, field_validator

from app.blocks.movies.schemas import MovieSummary


class PlaylistIn(BaseModel):
    """Body of POST /playlists."""
    name: str

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not 1 <= len(value) <= 100:
            raise ValueError("name must be 1 to 100 characters")
        return value


class PlaylistOut(BaseModel):
    """A playlist in a list. movie_ids lets the frontend fill the ★ without extra requests."""
    id: int
    name: str
    owner: str  # username
    movie_ids: list[int]


class PlaylistMovieOut(MovieSummary):
    """A movie on a playlist page: the card fields plus its combined score."""
    score: float | None  # None = not enough information


class PlaylistDetail(PlaylistOut):
    """One playlist with its movies' details, in playlist order."""
    movies: list[PlaylistMovieOut]
