"""Shape of the JSON answer of GET /compare."""
from typing import Literal

from pydantic import BaseModel


class ScoredMovie(BaseModel):
    id: int
    title: str
    year: int | None
    poster_url: str | None
    score: float | None  # combined score; None = not enough information


class PlaylistSide(BaseModel):
    """One of the two compared playlists."""
    id: int
    name: str
    owner: str
    movie_count: int
    scored_count: int  # movies that have a combined score (the ones in the average)
    average: float | None  # average combined score; None if no movie has one
    movies: list[ScoredMovie]


class Comparison(BaseModel):
    a: PlaylistSide
    b: PlaylistSide
    winner: Literal["a", "b", "tie"] | None  # None: a side has no scored movie, can't compare
    common: list[ScoredMovie]  # movies in both playlists
