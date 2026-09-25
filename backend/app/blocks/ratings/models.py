"""User ratings: 1 to 10 stars, one per user per movie."""
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Rating(Base):
    __tablename__ = "ratings"
    # Rules enforced by the database itself, whatever the code does:
    __table_args__ = (
        UniqueConstraint("user_id", "tmdb_id", name="one_rating_per_user_movie"),
        CheckConstraint("stars BETWEEN 1 AND 10", name="stars_1_to_10"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    tmdb_id: Mapped[int]
    stars: Mapped[int]
    rated_at: Mapped[datetime] = mapped_column(server_default=func.now())
