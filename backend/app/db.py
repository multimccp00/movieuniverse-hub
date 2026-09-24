"""Database connection. Every block imports Base and get_db from here."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# The engine knows how to reach the database. pool_pre_ping checks a connection
# is still alive before using it (MySQL closes idle connections).
engine = create_engine(settings.database_url, pool_pre_ping=True)

# A "session" is one conversation with the database (queries + commit).
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    """Parent class of every table. Base.metadata knows all tables."""


def get_db():
    """FastAPI dependency: opens a session per request and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
