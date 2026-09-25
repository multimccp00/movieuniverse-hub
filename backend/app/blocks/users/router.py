"""HTTP endpoints of the users block."""
from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.blocks.users import service
from app.blocks.users.models import User
from app.blocks.users.schemas import Credentials, UserOut

# prefix: every route below starts with /users. tags: groups them in /docs.
router = APIRouter(prefix="/users", tags=["users"])


def _log_in(response: Response, db: Session, user: User) -> User:
    """Start a session and give the browser its token in a cookie."""
    response.set_cookie(
        service.COOKIE_NAME,
        service.start_session(db, user),
        max_age=service.SESSION_DAYS * 24 * 3600,
        httponly=True,  # JavaScript can't read it, so an injected script can't steal it
        samesite="lax",  # not sent with requests coming from other websites
        # secure=True would require HTTPS; this app runs on plain http://localhost
    )
    return user


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: Credentials, response: Response, db: Session = Depends(get_db)):
    """Create an account and log in. 409 if the username is taken."""
    return _log_in(response, db, service.register(db, body.username, body.password))


@router.post("/login", response_model=UserOut)
def login(body: Credentials, response: Response, db: Session = Depends(get_db)):
    """Log in. 401 if the username or password is wrong."""
    return _log_in(response, db, service.authenticate(db, body.username, body.password))


@router.post("/logout", status_code=204)
def logout(response: Response, session: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    """End this browser's session."""
    if session:
        service.end_session(db, session)
    response.delete_cookie(service.COOKIE_NAME)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(service.get_current_user)):
    """Who am I? Used by the frontend on start to know if the browser is logged in."""
    return user
