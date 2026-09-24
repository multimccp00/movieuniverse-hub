"""The only door to TMDB. Every TMDB request in the app goes through get().

get() looks in the cache table first; only on a miss does it call TMDB,
and then it stores the answer so the same request never goes out twice.
"""
import time

import httpx
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.blocks.tmdb.models import TmdbCache
from app.blocks.tmdb.throttle import SlidingWindow

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_URL = "https://image.tmdb.org/t/p/w342"  # posters: browser loads them directly

_http = httpx.Client(timeout=10)  # one reusable connection pool
_throttle = SlidingWindow(limit=40, window=10)


class TmdbError(Exception):
    """TMDB failed or refused. `status` is TMDB's HTTP status (404 = not found)."""

    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def cache_key(path: str, params: dict) -> str:
    # Sorted, so {a:1, b:2} and {b:2, a:1} give the same key. Plain text (not
    # %-encoded) so accented searches stay short enough for the 255-char column.
    return path + "?" + "&".join(f"{k}={v}" for k, v in sorted(params.items()))


def fetch(path: str, params: dict) -> dict:
    """Call TMDB over the network (no cache). Retries once if TMDB says "too many requests"."""
    if not settings.tmdb_api_key:
        raise TmdbError(503, "TMDB_API_KEY is not set in .env")

    for attempt in range(2):
        _throttle.wait_for_slot()
        try:
            response = _http.get(
                BASE_URL + path, params={**params, "api_key": settings.tmdb_api_key}
            )
        except httpx.HTTPError:
            raise TmdbError(502, "Could not reach TMDB")

        # 429 = rate limited. TMDB says how long to wait in Retry-After.
        if response.status_code == 429 and attempt == 0:
            time.sleep(float(response.headers.get("Retry-After", 1)))
            continue
        if response.status_code == 404:
            raise TmdbError(404, "Not found on TMDB")
        if response.status_code != 200:
            raise TmdbError(502, f"TMDB answered {response.status_code}")
        return response.json()


def get(db: Session, path: str, params: dict | None = None) -> dict:
    """Cached TMDB GET. Hit: answer from the database. Miss: fetch, store, answer."""
    params = {"language": "en-US", **(params or {})}
    key = cache_key(path, params)

    cached = db.get(TmdbCache, key)  # lookup by primary key
    if cached is not None:
        return cached.payload

    data = fetch(path, params)  # errors are raised here, so they are never cached
    db.add(TmdbCache(cache_key=key, payload=data))
    try:
        db.commit()
    except IntegrityError:
        # Two requests missed at the same moment and the other one saved first. Fine.
        db.rollback()
    return data
