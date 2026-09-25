"""Shapes of the JSON going in and out of the ratings endpoints."""
from pydantic import BaseModel, Field


class RatingIn(BaseModel):
    """Body of PUT /ratings/{tmdb_id}."""
    stars: int = Field(ge=1, le=10)  # 422 if outside 1..10


class RatingSummary(BaseModel):
    """What the app's users think of one movie, plus the current user's own rating."""
    my_stars: int | None  # None: not logged in, or hasn't rated it
    app_average: float | None  # None: no app user has rated it
    app_count: int
