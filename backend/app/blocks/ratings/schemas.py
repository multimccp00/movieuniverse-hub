"""Shapes of the JSON going in and out of the ratings endpoints."""
from pydantic import BaseModel, Field


class RatingIn(BaseModel):
    """Body of PUT /ratings/{tmdb_id}."""
    stars: int = Field(ge=1, le=10)  # 422 if outside 1..10


class CombinedOut(BaseModel):
    """The combined score (TMDB + app votes). score None = not enough information."""
    score: float | None
    votes: int
    explanation: str


class RatingSummary(BaseModel):
    """Everything about how a movie is rated: the app's users, your own rating, and the combined score."""
    my_stars: int | None  # None: not logged in, or hasn't rated it
    app_average: float | None  # None: no app user has rated it
    app_count: int
    combined: CombinedOut
