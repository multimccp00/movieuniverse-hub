"""Shared test setup. pytest loads this file automatically.

Every test that asks for `client` gets the API wired to a brand-new, empty
SQLite database that lives in memory and disappears after the test.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from tests.fake_tmdb import FakeTmdb


@pytest.fixture
def db():
    # StaticPool: reuse one connection, otherwise each connection would get
    # its own separate (empty) in-memory database
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


@pytest.fixture
def client(db):
    # Swap the real get_db (MySQL) for one that returns the test session
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def tmdb(monkeypatch):
    """A fake TMDB (see fake_tmdb.py); tests never go online."""
    return FakeTmdb(monkeypatch)


def login(client, username, password="password123"):
    """Register (or log in, if the name exists) and return headers carrying the session cookie.

    The test client would also remember the cookie by itself; clearing that memory keeps
    each request explicit, so a test can switch between users and also send none.
    """
    response = client.post("/users/register", json={"username": username, "password": password})
    if response.status_code == 409:  # already exists: log in instead
        response = client.post("/users/login", json={"username": username, "password": password})
    token = response.cookies["session"]
    client.cookies.clear()
    return {"Cookie": f"session={token}"}
