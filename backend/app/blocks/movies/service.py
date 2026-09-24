"""Movie logic: ask TMDB (through the cache) and reshape its answer for our frontend."""
from sqlalchemy.orm import Session

from app.blocks.tmdb import client as tmdb
from app.blocks.movies.schemas import MovieDetail, MovieSummary, SearchResults


def normalize_query(query: str) -> str:
    # "  The   MATRIX " -> "the matrix". TMDB search ignores case, so this changes
    # nothing in the results but makes both spellings share one cache entry.
    return " ".join(query.split()).lower()


def _year(release_date: str | None) -> int | None:
    # TMDB gives "1999-03-30", or "" when unknown
    return int(release_date[:4]) if release_date else None


def _poster(poster_path: str | None) -> str | None:
    return tmdb.IMAGE_URL + poster_path if poster_path else None


def _summary(raw: dict) -> MovieSummary:
    return MovieSummary(
        id=raw["id"],
        title=raw["title"],
        year=_year(raw.get("release_date")),
        poster_url=_poster(raw.get("poster_path")),
        vote_average=raw.get("vote_average") or 0,
        vote_count=raw.get("vote_count") or 0,
    )


def search(db: Session, query: str, page: int) -> SearchResults:
    raw = tmdb.get(db, "/search/movie", {"query": normalize_query(query), "page": page})
    return SearchResults(
        page=raw["page"],
        total_pages=raw["total_pages"],
        total_results=raw["total_results"],
        results=[_summary(movie) for movie in raw["results"]],
    )


def detail(db: Session, tmdb_id: int) -> MovieDetail:
    raw = tmdb.get(db, f"/movie/{tmdb_id}")
    return MovieDetail(
        **_summary(raw).model_dump(),
        overview=raw.get("overview") or "",
        genres=[genre["name"] for genre in raw.get("genres", [])],
        runtime=raw.get("runtime") or None,  # TMDB uses 0 for "unknown"
    )
