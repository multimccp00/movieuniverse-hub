"""Entry point: builds the FastAPI app and plugs in every block's router."""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts: create any table that doesn't exist yet.
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="MovieUniverse Hub API", lifespan=lifespan)


@app.get("/health")
def health():
    """Simple check that the API is running."""
    return {"status": "ok"}
