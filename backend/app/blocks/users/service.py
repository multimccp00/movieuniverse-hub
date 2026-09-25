"""User logic: passwords, login sessions, and working out who is making a request."""
import hashlib
import secrets
from datetime import datetime, timedelta

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.users.models import LoginSession, User

COOKIE_NAME = "session"
SESSION_DAYS = 7

_hasher = PasswordHasher()  # Argon2: slow on purpose, so guessing passwords is expensive
# Checked when the username doesn't exist, so a wrong name takes as long as a
# wrong password and response time doesn't reveal which usernames exist.
_DUMMY_HASH = _hasher.hash("not-a-real-password")


def hash_password(password: str) -> str:
    return _hasher.hash(password)  # includes a random salt: same password, different hash


def _verify(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):  # wrong password, or unreadable hash
        return False


def _password_matches(password_hash: str | None, password: str) -> bool:
    if password_hash is None:  # no such user (or no password set)
        _verify(_DUMMY_HASH, password)  # spend the same time anyway, then refuse
        return False
    return _verify(password_hash, password)


def get_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def get_or_create(db: Session, username: str) -> User:
    """Return the user with this name, creating it the first time (used by the seed import)."""
    user = get_by_username(db, username)
    if user is None:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)  # reload to get the id the database generated
    return user


def register(db: Session, username: str, password: str) -> User:
    if get_by_username(db, username) is not None:
        raise HTTPException(status_code=409, detail="Username already taken")  # 409 = conflict
    user = User(username=username, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, username: str, password: str) -> User:
    user = get_by_username(db, username)
    if not _password_matches(user.password_hash if user else None, password):
        # Same message for "no such user" and "wrong password": don't reveal which
        raise HTTPException(status_code=401, detail="Wrong username or password")
    return user


def _digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def start_session(db: Session, user: User) -> str:
    """Create a login session. Returns the secret token for the browser's cookie."""
    token = secrets.token_urlsafe(32)  # 32 random bytes: impossible to guess
    db.add(LoginSession(
        token_hash=_digest(token),
        user_id=user.id,
        expires_at=datetime.now() + timedelta(days=SESSION_DAYS),
    ))
    db.commit()
    return token


def end_session(db: Session, token: str) -> None:
    db.execute(delete(LoginSession).where(LoginSession.token_hash == _digest(token)))
    db.commit()


def get_optional_user(
    session: str | None = Cookie(default=None),  # reads the "session" cookie
    db: Session = Depends(get_db),
) -> User | None:
    """FastAPI dependency: who is making this request? None if nobody is logged in.

    The single place that decides identity: every endpoint goes through here.
    """
    if not session:
        return None
    login = db.get(LoginSession, _digest(session))
    if login is None or login.expires_at < datetime.now():
        return None
    return db.get(User, login.user_id)


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """FastAPI dependency for endpoints that require being logged in (401 otherwise)."""
    if user is None:
        raise HTTPException(status_code=401, detail="Not logged in")
    return user
