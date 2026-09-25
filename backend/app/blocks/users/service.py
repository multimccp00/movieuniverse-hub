"""User logic: find or create users, and work out who is making a request."""
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.users.models import User


def get_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def get_or_create(db: Session, username: str) -> User:
    """Return the user with this name, creating it the first time."""
    user = get_by_username(db, username)
    if user is None:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)  # reload to get the id the database generated
    return user


def get_optional_user(
    x_user: str | None = Header(default=None),  # reads the "X-User" request header
    db: Session = Depends(get_db),
) -> User | None:
    """FastAPI dependency: who is making this request? None if nobody is logged in.

    The single place that decides identity. Only this function changes when
    password login arrives; endpoints stay the same.
    """
    # ponytail: trusts the X-User header (username-only identity, allowed by the brief).
    # Anyone can claim any name. Replaced by a session cookie in the password phase.
    if not x_user:
        return None
    return get_by_username(db, x_user.strip().lower())


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """FastAPI dependency for endpoints that require being logged in (401 otherwise)."""
    if user is None:
        raise HTTPException(status_code=401, detail="Not logged in")
    return user
