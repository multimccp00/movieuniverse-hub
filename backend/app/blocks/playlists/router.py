"""HTTP endpoints of the playlists block."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.playlists import service
from app.blocks.playlists.schemas import PlaylistDetail, PlaylistIn, PlaylistOut
from app.blocks.users.models import User
from app.blocks.users.service import get_current_user

router = APIRouter(prefix="/playlists", tags=["playlists"])


@router.get("", response_model=list[PlaylistOut])
def list_all(db: Session = Depends(get_db)):
    """Every playlist that isn't deleted, from every user (used to compare lists)."""
    return [service.to_out(p) for p in service.list_all(db)]


@router.get("/mine", response_model=list[PlaylistOut])
def mine(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The logged-in user's playlists."""
    return [service.to_out(p) for p in service.list_for_user(db, user)]


@router.post("", response_model=PlaylistOut, status_code=201)
def create(body: PlaylistIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create an empty playlist. 201 = created."""
    return service.to_out(service.create(db, user, body.name))


@router.get("/{playlist_id}", response_model=PlaylistDetail)
def detail(playlist_id: int, db: Session = Depends(get_db)):
    """One playlist with its movies."""
    return service.detail(db, playlist_id)


@router.delete("/{playlist_id}", status_code=204)
def delete(playlist_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete (hide) one of your playlists. 204 = done, nothing to send back."""
    service.delete(db, user, playlist_id)


# PUT/DELETE on the movie's own address: doing either twice changes nothing more,
# so a double click can't add a movie twice.
@router.put("/{playlist_id}/movies/{tmdb_id}", response_model=PlaylistOut)
def add_movie(
    playlist_id: int, tmdb_id: int,
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    """Add a movie to one of your playlists (no-op if it's already there)."""
    return service.to_out(service.add_movie(db, user, playlist_id, tmdb_id))


@router.delete("/{playlist_id}/movies/{tmdb_id}", response_model=PlaylistOut)
def remove_movie(
    playlist_id: int, tmdb_id: int,
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    """Remove a movie from one of your playlists."""
    return service.to_out(service.remove_movie(db, user, playlist_id, tmdb_id))
