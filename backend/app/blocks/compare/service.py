"""Comparing two playlists: which has the better average combined score, and what they share."""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.blocks.compare.schemas import Comparison, PlaylistSide, ScoredMovie
from app.blocks.movies import service as movies
from app.blocks.playlists.models import Playlist
from app.blocks.playlists.service import existing
from app.blocks.ratings.service import combined_for
from app.blocks.tmdb.client import TmdbError


def _scored(db: Session, tmdb_id: int) -> ScoredMovie:
    try:
        movie = movies.detail(db, tmdb_id)
        score = combined_for(db, tmdb_id).score
    except TmdbError:  # unavailable movie: shown, but left out of the average
        return ScoredMovie(id=tmdb_id, title="Unavailable movie", year=None, score=None)
    return ScoredMovie(id=movie.id, title=movie.title, year=movie.year, score=score)


def _side(playlist: Playlist, scored: dict[int, ScoredMovie]) -> PlaylistSide:
    films = [scored[m.tmdb_id] for m in playlist.movies]
    scores = [f.score for f in films if f.score is not None]  # movies with no score don't count
    return PlaylistSide(
        id=playlist.id,
        name=playlist.name,
        owner=playlist.owner.username,
        movie_count=len(films),
        scored_count=len(scores),
        average=round(sum(scores) / len(scores), 2) if scores else None,
        movies=films,
    )


def _winner(a: PlaylistSide, b: PlaylistSide) -> str | None:
    if a.average is None or b.average is None:
        return None
    if a.average == b.average:
        return "tie"
    return "a" if a.average > b.average else "b"


def compare(db: Session, a_id: int, b_id: int) -> Comparison:
    if a_id == b_id:
        raise HTTPException(status_code=422, detail="Choose two different playlists")
    a, b = existing(db, a_id), existing(db, b_id)  # 404 if either doesn't exist

    a_ids = {m.tmdb_id for m in a.movies}
    b_ids = {m.tmdb_id for m in b.movies}
    # Score each distinct movie once, even if it's in both playlists
    scored = {tmdb_id: _scored(db, tmdb_id) for tmdb_id in a_ids | b_ids}

    side_a, side_b = _side(a, scored), _side(b, scored)
    common = [scored[m.tmdb_id] for m in a.movies if m.tmdb_id in b_ids]  # in A's order
    return Comparison(a=side_a, b=side_b, winner=_winner(side_a, side_b), common=common)
