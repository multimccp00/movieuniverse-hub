"""Background refresh of old cache entries, so vote counts don't stay frozen forever.

It only works when BOTH are true:
1. the app is idle: no request for IDLE_SECONDS (a middleware in main.py calls touch()),
2. the entry is older than MAX_AGE.

Users are always answered from the cache, fresh or not: they never wait for a refresh.
Refreshes go through client.fetch(), so through the same throttle as everything else.
"""
import logging
import re
import threading
import time
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.blocks.tmdb import client
from app.blocks.tmdb.models import TmdbCache, utcnow

MAX_AGE = timedelta(days=7)
IDLE_SECONDS = 5 * 60
CHECK_EVERY = 60  # seconds between two "is it idle?" checks
BATCH = 20  # at most this many TMDB calls per check

# The only parameters our cache keys contain (see client.get and movies/service.py)
KNOWN_PARAMS = {"language", "page", "query"}

log = logging.getLogger(__name__)
_last_request = time.monotonic()


def touch() -> None:
    """Someone is using the app right now."""
    global _last_request
    _last_request = time.monotonic()


def is_idle() -> bool:
    return time.monotonic() - _last_request >= IDLE_SECONDS


def parse_key(key: str) -> tuple[str, dict] | None:
    """Turn a cache key back into the request that made it.

    "/search/movie?language=en-US&page=1&query=tom & jerry"
    -> ("/search/movie", {"language": "en-US", "page": "1", "query": "tom & jerry"})

    Keys are plain text, so a search can itself contain "&" or "=". A "&" only starts a
    new parameter when a name and "=" follow it. The result is used only if it has known
    parameters and rebuilds the exact same key; otherwise None (never refresh a guess).
    """
    path, _, query = key.partition("?")
    parts = re.split(r"&(?=\w+=)", query) if query else []
    if not all("=" in part for part in parts):
        return None
    params = dict(part.split("=", 1) for part in parts)
    if not params.keys() <= KNOWN_PARAMS or client.cache_key(path, params) != key:
        return None
    return path, params


def refresh_stale(db: Session, max_age=MAX_AGE, limit=BATCH, keep_going=lambda: True) -> int:
    """Re-fetch the oldest entries older than max_age. Returns how many were refreshed.

    keep_going() is checked before each TMDB call: the batch stops as soon as a user shows up.
    """
    old = db.scalars(
        select(TmdbCache)
        .where(TmdbCache.fetched_at < utcnow() - max_age)
        .order_by(TmdbCache.fetched_at)  # most outdated first
        .limit(limit)
    ).all()

    refreshed = 0
    for entry in old:
        if not keep_going():
            break
        request = parse_key(entry.cache_key)
        try:
            if request is None:
                raise client.TmdbError(400, "cache key can't be turned back into a request")
            entry.payload = client.fetch(*request)
            refreshed += 1
        except client.TmdbError as error:
            if error.status not in (400, 404):
                continue  # TMDB down or busy: keep the old answer, try again next idle period
            # Can't ever be refreshed (bad key, or gone from TMDB): keep the old answer and
            # only look at it again after another max_age, so it doesn't block the queue.
        entry.fetched_at = utcnow()
        db.commit()  # one entry at a time: progress is kept if the batch stops
    return refreshed


def start(session_factory) -> None:
    """Run the refresh check every CHECK_EVERY seconds in a background thread.

    daemon=True: the thread stops with the server, it never keeps it alive.
    """
    def loop():
        while True:
            time.sleep(CHECK_EVERY)
            if not is_idle():
                continue
            try:
                with session_factory() as db:
                    count = refresh_stale(db, keep_going=is_idle)
                if count:
                    log.info("cache refresh: %d entries updated", count)
            except Exception:  # database down, etc.: log it, the loop must survive
                log.exception("cache refresh failed")

    threading.Thread(target=loop, daemon=True, name="cache-refresh").start()
