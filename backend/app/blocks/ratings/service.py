"""Rating logic."""
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.blocks.movies import service as movies
from app.blocks.ratings.models import Rating
from app.blocks.ratings.schemas import RatingSummary
from app.blocks.users.models import User


def upsert(db: Session, user_id: int, tmdb_id: int, stars: int) -> None:
    """Create the user's rating, or change it if one exists ("upsert" = update or insert)."""
    rating = db.scalar(select(Rating).where(Rating.user_id == user_id, Rating.tmdb_id == tmdb_id))
    if rating is None:
        db.add(Rating(user_id=user_id, tmdb_id=tmdb_id, stars=stars))
    else:
        rating.stars = stars
        rating.rated_at = datetime.now()


def app_stats(db: Session, tmdb_id: int) -> tuple[float | None, int]:
    """Average stars and number of ratings from this app's users. (None, 0) if none."""
    average, count = db.execute(
        select(func.avg(Rating.stars), func.count()).where(Rating.tmdb_id == tmdb_id)
    ).one()
    return (float(average) if count else None), count


def summary(db: Session, user: User | None, tmdb_id: int) -> RatingSummary:
    mine = None
    if user is not None:
        mine = db.scalar(select(Rating.stars).where(Rating.user_id == user.id, Rating.tmdb_id == tmdb_id))
    average, count = app_stats(db, tmdb_id)
    return RatingSummary(my_stars=mine, app_average=average, app_count=count)


def rate(db: Session, user: User, tmdb_id: int, stars: int) -> RatingSummary:
    movies.detail(db, tmdb_id)  # 404 if the movie doesn't exist on TMDB
    upsert(db, user.id, tmdb_id, stars)
    db.commit()
    return summary(db, user, tmdb_id)
