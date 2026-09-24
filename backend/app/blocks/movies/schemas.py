"""What our API sends to the frontend about movies (a trimmed-down TMDB answer)."""
from pydantic import BaseModel


class MovieSummary(BaseModel):
    """One card in a list of search results."""
    id: int  # TMDB id
    title: str
    year: int | None  # None when TMDB has no release date
    poster_url: str | None
    vote_average: float
    vote_count: int


class SearchResults(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MovieSummary]


class MovieDetail(MovieSummary):
    """Everything on the movie page: the summary fields plus these."""
    overview: str
    genres: list[str]
    runtime: int | None  # minutes
