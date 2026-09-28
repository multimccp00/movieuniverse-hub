from datetime import timedelta

from app.blocks.tmdb import client, refresh
from app.blocks.tmdb.models import TmdbCache, utcnow
from tests import fake_tmdb


def age(db, days):
    """Pretend every cache entry was fetched `days` ago."""
    for entry in db.query(TmdbCache):
        entry.fetched_at = utcnow() - timedelta(days=days)
    db.commit()


def test_old_entry_gets_the_new_vote_count(db, tmdb, monkeypatch):
    client.get(db, "/movie/603")
    age(db, 8)
    monkeypatch.setitem(fake_tmdb.MATRIX, "vote_count", 27000)  # TMDB has new votes since

    assert refresh.refresh_stale(db) == 1
    entry = db.query(TmdbCache).one()
    assert entry.payload["vote_count"] == 27000
    assert entry.fetched_at > utcnow() - timedelta(minutes=1)
    assert client.get(db, "/movie/603")["vote_count"] == 27000  # users now get the new count


def test_recent_entry_is_left_alone(db, tmdb):
    client.get(db, "/movie/603")
    age(db, 2)
    assert refresh.refresh_stale(db) == 0
    assert len(tmdb.requests) == 1  # only the original fetch


def test_oldest_first_and_small_batches(db, tmdb):
    client.get(db, "/movie/603")
    client.get(db, "/movie/777")
    age(db, 8)
    db.get(TmdbCache, "/movie/777?language=en-US").fetched_at -= timedelta(days=1)  # older
    db.commit()
    assert refresh.refresh_stale(db, limit=1) == 1
    assert tmdb.requests[-1].url.path == "/3/movie/777"


def test_search_with_ampersand_is_refreshed_with_the_same_query(db, tmdb):
    client.get(db, "/search/movie", {"query": "tom & jerry", "page": 1})
    age(db, 8)
    assert refresh.refresh_stale(db) == 1
    assert tmdb.requests[-1].url.params["query"] == "tom & jerry"


def test_tmdb_down_keeps_the_old_answer_and_retries_later(db, tmdb):
    client.get(db, "/movie/603")
    age(db, 8)
    tmdb.status["/movie/603"] = 500
    assert refresh.refresh_stale(db) == 0
    entry = db.query(TmdbCache).one()
    assert entry.payload["title"] == "The Matrix"  # still served
    assert entry.fetched_at < utcnow() - timedelta(days=7)  # still old: tried again next time
    assert refresh.refresh_stale(db) == 1  # TMDB is back


def test_a_user_arriving_stops_the_batch(db, tmdb):
    client.get(db, "/movie/603")
    age(db, 8)
    assert refresh.refresh_stale(db, keep_going=lambda: False) == 0
    assert len(tmdb.requests) == 1


def test_keys_are_only_trusted_when_they_rebuild_exactly():
    assert refresh.parse_key("/movie/603?language=en-US") == ("/movie/603", {"language": "en-US"})
    # a search for "a&page=2" can't be told apart from two page parameters: skipped
    assert refresh.parse_key("/search/movie?language=en-US&page=1&query=a&page=2") is None
    assert refresh.parse_key("/search/movie?language=en-US&page=1&query=a&zeta=1") is None


def test_requests_mark_the_app_as_busy(client, monkeypatch):
    monkeypatch.setattr(refresh, "IDLE_SECONDS", 60)
    client.get("/health")
    assert not refresh.is_idle()
    monkeypatch.setattr(refresh, "IDLE_SECONDS", 0)
    assert refresh.is_idle()
