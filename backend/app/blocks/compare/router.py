"""HTTP endpoint of the compare block."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.compare import service
from app.blocks.compare.schemas import Comparison

router = APIRouter(prefix="/compare", tags=["compare"])


@router.get("", response_model=Comparison)
def compare(a: int = Query(ge=1), b: int = Query(ge=1), db: Session = Depends(get_db)):
    """Compare two playlists (?a=1&b=2): average combined score, winner, movies in common."""
    return service.compare(db, a, b)
