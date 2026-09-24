"""HTTP endpoints of the movies block."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.movies import service
from app.blocks.movies.schemas import MovieDetail, SearchResults

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=SearchResults)
def search(
    # Query(...) = required URL parameter ?q=...; FastAPI answers 422 if it breaks the rules
    q: str = Query(min_length=1, max_length=100, pattern=r"\S"),  # \S: not only spaces
    page: int = Query(default=1, ge=1, le=500),  # TMDB serves at most 500 pages
    db: Session = Depends(get_db),
):
    """Search movies by title."""
    return service.search(db, q, page)


@router.get("/{tmdb_id}", response_model=MovieDetail)
def detail(tmdb_id: int, db: Session = Depends(get_db)):
    """One movie: synopsis, genres, runtime, poster, TMDB score and vote count."""
    return service.detail(db, tmdb_id)
