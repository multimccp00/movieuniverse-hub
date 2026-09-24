"""Imports seed_playlists.json. Safe to run any number of times.

It runs on every API start, so it only CREATES what is missing and never changes
what exists: nothing is duplicated, and changes made in the app (a new rating,
a deleted playlist, a removed movie) survive restarts.

Rows are matched on a natural key: users by name, playlists by their file id
("pl-01"), ratings by (user, movie).
"""
from collections import Counter
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.blocks.movies import service as movies
from app.blocks.playlists.models import Playlist
from app.blocks.playlists.service import add_to_playlist
from app.blocks.ratings.models import Rating
from app.blocks.tmdb.client import TmdbError
from app.blocks.users.service import get_by_username, get_or_create


def import_seed(db: Session, data: dict, warm_cache: bool = True) -> tuple[Counter, list[str]]:
    """Returns (counts of what changed, human-readable warnings about the data)."""
    counts = Counter()  # a dict that starts every key at 0
    warnings = []

    def user_for(name: str):
        name = name.strip().lower()  # same cleaning as the login
        if get_by_username(db, name) is None:
            counts["users created"] += 1
        return get_or_create(db, name)

    for entry in data.get("utilizadores", []):
        user_for(entry["nome"])

    for entry in data.get("playlists", []):
        # Owner first: looking them up runs a query, and SQLAlchemy saves pending rows
        # before each query ("autoflush") -- a new playlist without owner would be rejected.
        owner = user_for(entry["utilizador"])
        if db.scalar(select(Playlist.id).where(Playlist.external_id == entry["id"])):
            continue  # imported before: leave it exactly as the users have it now

        playlist = Playlist(external_id=entry["id"], owner=owner, name=entry["nome"])
        # "apagada" = deleted in the source: imported, but hidden everywhere
        playlist.deleted_at = datetime.now() if entry.get("apagada") else None
        db.add(playlist)
        counts["playlists created"] += 1

        for film in sorted(entry.get("filmes", []), key=lambda f: f["ordem"]):
            # False when the same movie is listed twice in this playlist: keep the first
            if add_to_playlist(playlist, film["tmdb_id"], position=film["ordem"]):
                counts["playlist movies added"] += 1
            else:
                warnings.append(f"{entry['id']}: movie {film['tmdb_id']} is listed twice, kept the first")

    for entry in data.get("notas", []):
        stars = entry["estrelas"]
        if not (isinstance(stars, int) and 1 <= stars <= 10):
            warnings.append(f"rating by {entry['utilizador']} on {entry['tmdb_id']}: {stars} is not 1-10, skipped")
            continue
        user = user_for(entry["utilizador"])
        exists = db.scalar(select(Rating.id).where(Rating.user_id == user.id, Rating.tmdb_id == entry["tmdb_id"]))
        if exists:
            continue  # the user may have changed it in the app: keep theirs
        rated_at = datetime.fromisoformat(entry["data"])  # "2026-09-01" -> date and time
        db.add(Rating(user_id=user.id, tmdb_id=entry["tmdb_id"], stars=stars, rated_at=rated_at))
        counts["ratings created"] += 1

    db.commit()

    if warm_cache:
        _warm_cache(db, data, counts, warnings)
    return counts, warnings


def _warm_cache(db: Session, data: dict, counts: Counter, warnings: list[str]) -> None:
    """Load every seed movie's details now, so pages are instant later.

    Includes movies that only appear in deleted playlists: cheap, and ready if restored.
    Goes through the normal cache + throttle: movies already cached cost no request.
    """
    if not settings.tmdb_api_key:
        warnings.append("TMDB_API_KEY not set: movie details not pre-loaded")
        return
    ids = {f["tmdb_id"] for p in data.get("playlists", []) for f in p.get("filmes", [])}
    ids |= {n["tmdb_id"] for n in data.get("notas", [])}
    for tmdb_id in sorted(ids):
        try:
            movies.detail(db, tmdb_id)
            counts["movie details ready"] += 1
        except TmdbError as error:
            warnings.append(f"movie {tmdb_id}: {error}")
