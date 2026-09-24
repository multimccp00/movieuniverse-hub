"""Entry point: builds the FastAPI app and plugs in every block's router."""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import Base, engine
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


@app.get("/health")
def health():
    """Simple check that the API is running."""
    return {"status": "ok"}
