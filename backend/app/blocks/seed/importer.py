"""Imports seed_playlists.json: puts the example data back exactly as the file has it.

Everyone doing the exercise imports the same file, so after an import the seeded
data always matches it: a seeded playlist deleted in the app comes back, and its
movies and the seeded ratings are reset to the file's values.
Running it again never duplicates anything, because every row is matched on a
natural key first: users by name, playlists by the file's id ("pl-01"),
ratings by (user, movie).
Data created in the app (other playlists, other ratings) is never touched.

The file has no passwords, so every seed user gets DEMO_PASSWORD (written in the
README): anyone testing the app can log in as ana, bruno or carla.
"""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.blocks.movies import service as movies
from app.blocks.playlists.models import Playlist
from app.blocks.playlists.service import add_to_playlist
from app.blocks.ratings.service import upsert as upsert_rating
from app.blocks.tmdb.client import TmdbError
from app.blocks.users.service import get_or_create, hash_password

DEMO_PASSWORD = "demo1234"  # ponytail: public demo password for the example users, by design


def import_seed(db: Session, data: dict, warm_cache: bool = True) -> list[str]:
    """Import the file's data. Returns warnings about problems found in the data."""
    warnings = []
    users = {}  # name -> User, so each user's password is hashed once per import (Argon2 is slow)

    def user_for(name: str):
        name = name.strip().lower()  # same cleaning as the login
        if name not in users:
            user = get_or_create(db, name)
            user.password_hash = hash_password(DEMO_PASSWORD)  # reset, like the rest of the example data
            users[name] = user
        return users[name]

    for entry in data.get("utilizadores", []):
        user_for(entry["nome"])

    for entry in data.get("playlists", []):
        if entry.get("apagada"):
            continue  # deleted in the source: not part of the data

        # Owner first: looking them up runs a query, and SQLAlchemy saves pending rows
        # before each query ("autoflush") -- a new playlist without owner would be rejected.
        owner = user_for(entry["utilizador"])
        playlist = db.scalar(select(Playlist).where(Playlist.external_id == entry["id"]))
        if playlist is None:
            playlist = Playlist(external_id=entry["id"], owner=owner, name=entry["nome"])
            db.add(playlist)
        playlist.name = entry["nome"]
        playlist.owner = owner

        playlist.movies.clear()  # reset to exactly the file's movies
        db.flush()  # delete the old movie rows now, before adding the file's ones back
        for film in sorted(entry.get("filmes", []), key=lambda f: f["ordem"]):
            # False when the same movie is listed twice in this playlist: keep the first
            if not add_to_playlist(playlist, film["tmdb_id"], position=film["ordem"]):
                warnings.append(f"{entry['id']}: movie {film['tmdb_id']} is listed twice, kept the first")

    for entry in data.get("notas", []):
        stars = entry["estrelas"]
        if not (isinstance(stars, int) and 1 <= stars <= 10):
            warnings.append(f"rating by {entry['utilizador']} on {entry['tmdb_id']}: {stars} is not 1-10, skipped")
            continue
        user = user_for(entry["utilizador"])
        rated_at = datetime.fromisoformat(entry["data"])  # "2026-09-01" -> date and time
        upsert_rating(db, user.id, entry["tmdb_id"], stars, rated_at)

    db.commit()

    if warm_cache:
        _warm_cache(db, data, warnings)
    return warnings


def _warm_cache(db: Session, data: dict, warnings: list[str]) -> None:
    """Load every imported movie's details now, so pages are instant later.

    Goes through the normal cache + throttle: movies already cached cost no request.
    """
    if not settings.tmdb_api_key:
        warnings.append("TMDB_API_KEY not set: movie details not pre-loaded")
        return
    ids = {f["tmdb_id"] for p in data.get("playlists", []) if not p.get("apagada") for f in p.get("filmes", [])}
    ids |= {n["tmdb_id"] for n in data.get("notas", [])}
    for tmdb_id in sorted(ids):
        try:
            movies.detail(db, tmdb_id)
        except TmdbError as error:
            warnings.append(f"movie {tmdb_id}: {error}")
