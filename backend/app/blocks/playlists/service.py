"""Playlist logic. Anyone can view a playlist; only its owner can change it."""
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.blocks.movies import service as movies
from app.blocks.playlists.models import Playlist, PlaylistMovie
from app.blocks.playlists.schemas import PlaylistDetail, PlaylistMovieOut, PlaylistOut
from app.blocks.ratings.service import combined_for
from app.blocks.tmdb.client import TmdbError
from app.blocks.users.models import User


def to_out(playlist: Playlist) -> PlaylistOut:
    return PlaylistOut(
        id=playlist.id,
        name=playlist.name,
        owner=playlist.owner.username,
        movie_ids=[m.tmdb_id for m in playlist.movies],
    )


def existing(db: Session, playlist_id: int) -> Playlist:
    """The playlist, or 404 if it doesn't exist."""
    playlist = db.get(Playlist, playlist_id)
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


def _owned(db: Session, user: User, playlist_id: int) -> Playlist:
    """The playlist, or 403 if it belongs to someone else."""
    playlist = existing(db, playlist_id)
    if playlist.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    return playlist


def add_to_playlist(playlist: Playlist, tmdb_id: int, position: int | None = None) -> bool:
    """Append a movie unless it's already there. Returns False for a duplicate.

    Shared by the API and the seed import (which passes the file's position).
    """
    if any(m.tmdb_id == tmdb_id for m in playlist.movies):
        return False
    if position is None:
        position = max((m.position for m in playlist.movies), default=0) + 1
    playlist.movies.append(PlaylistMovie(tmdb_id=tmdb_id, position=position))
    return True


def list_all(db: Session) -> list[Playlist]:
    return list(db.scalars(select(Playlist).order_by(Playlist.id)))


def list_for_user(db: Session, user: User) -> list[Playlist]:
    return list(db.scalars(select(Playlist).where(Playlist.user_id == user.id).order_by(Playlist.id)))


def create(db: Session, user: User, name: str) -> Playlist:
    playlist = Playlist(user_id=user.id, name=name)
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return playlist


def delete(db: Session, user: User, playlist_id: int) -> None:
    db.delete(_owned(db, user, playlist_id))  # its movie rows go too (cascade)
    db.commit()


def _movie_or_placeholder(db: Session, tmdb_id: int) -> PlaylistMovieOut:
    # One missing movie (removed from TMDB, TMDB down) must not break the whole playlist page
    try:
        movie = movies.detail(db, tmdb_id)
        score = combined_for(db, tmdb_id).score
    except TmdbError:
        return PlaylistMovieOut(
            id=tmdb_id, title="Unavailable movie", year=None, poster_url=None,
            backdrop_url=None, vote_average=0, vote_count=0, score=None,
        )
    # model_validate ignores the detail-only fields (overview, genres...)
    return PlaylistMovieOut.model_validate({**movie.model_dump(), "score": score})


def detail(db: Session, playlist_id: int) -> PlaylistDetail:
    playlist = existing(db, playlist_id)
    return PlaylistDetail(
        **to_out(playlist).model_dump(),
        movies=[_movie_or_placeholder(db, m.tmdb_id) for m in playlist.movies],
    )


def add_movie(db: Session, user: User, playlist_id: int, tmdb_id: int) -> Playlist:
    playlist = _owned(db, user, playlist_id)
    movies.detail(db, tmdb_id)  # 404 if the movie doesn't exist on TMDB (and warms the cache)
    add_to_playlist(playlist, tmdb_id)
    db.commit()
    return playlist


def remove_movie(db: Session, user: User, playlist_id: int, tmdb_id: int) -> Playlist:
    playlist = _owned(db, user, playlist_id)
    playlist.movies = [m for m in playlist.movies if m.tmdb_id != tmdb_id]
    db.commit()
    return playlist
