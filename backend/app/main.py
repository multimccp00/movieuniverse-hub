"""Entry point: builds the FastAPI app and plugs in every block's router."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.db import Base, engine
from app.blocks.movies.router import router as movies_router
from app.blocks.playlists.router import router as playlists_router
from app.blocks.ratings.router import router as ratings_router
from app.blocks.tmdb.client import TmdbError  # client.py also loads the cache table
from app.blocks.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts: create any table that doesn't exist yet.
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="MovieUniverse Hub API", lifespan=lifespan)

# Plug in each block. Importing a router also imports its models,
# which is how create_all() above learns those tables exist.
app.include_router(users_router)
app.include_router(movies_router)
app.include_router(playlists_router)
app.include_router(ratings_router)


@app.exception_handler(TmdbError)
def tmdb_error(request: Request, exc: TmdbError):
    """Any TMDB failure, from any endpoint, becomes a clean JSON error.

    404 stays 404 (movie doesn't exist); anything else means TMDB is the problem,
    not our API, so the status is kept as TMDB-related (502/503).
    """
    return JSONResponse(status_code=exc.status, content={"detail": str(exc)})


@app.get("/health")
def health():
    """Simple check that the API is running."""
    return {"status": "ok"}
