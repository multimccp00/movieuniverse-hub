"""HTTP endpoints of the users block."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.users import service
from app.blocks.users.models import User
from app.blocks.users.schemas import LoginIn, UserOut

# prefix: every route below starts with /users. tags: groups them in /docs.
router = APIRouter(prefix="/users", tags=["users"])


@router.post("/login", response_model=UserOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    """Log in with just a username. The user is created on first login."""
    return service.get_or_create(db, body.username)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(service.get_current_user)):
    """Who am I? Used by the frontend to check a saved login is still valid."""
    return user
