"""HTTP endpoints of the ratings block."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.ratings import service
from app.blocks.ratings.schemas import MyRating, RatingIn, RatingSummary
from app.blocks.users.models import User
from app.blocks.users.service import get_current_user, get_optional_user

router = APIRouter(prefix="/ratings", tags=["ratings"])


# Declared before /{tmdb_id}: otherwise "mine" would be read as a movie id (and fail as not a number)
@router.get("/mine", response_model=list[MyRating])
def mine(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Your ratings, highest first."""
    return [MyRating(tmdb_id=r.tmdb_id, stars=r.stars) for r in service.mine(db, user)]


@router.get("/{tmdb_id}", response_model=RatingSummary)
def get_summary(tmdb_id: int, user: User | None = Depends(get_optional_user), db: Session = Depends(get_db)):
    """App users' average for a movie, plus your own rating if you're logged in."""
    return service.summary(db, user, tmdb_id)


@router.put("/{tmdb_id}", response_model=RatingSummary)
def rate(tmdb_id: int, body: RatingIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Rate a movie 1-10, or change your rating. One rating per user per movie."""
    return service.rate(db, user, tmdb_id, body.stars)
