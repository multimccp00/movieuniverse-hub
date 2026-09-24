import pytest

from app.blocks.tmdb import client
from app.blocks.tmdb.models import TmdbCache
from tests.fake_tmdb import FakeTmdb


@pytest.fixture
def tmdb(monkeypatch):
    return FakeTmdb(monkeypatch)


def test_second_request_is_served_from_cache(db, tmdb):
    first = client.get(db, "/movie/603")
    second = client.get(db, "/movie/603")
    assert first == second
    assert len(tmdb.requests) == 1  # only the first one reached TMDB
    assert db.query(TmdbCache).count() == 1


def test_cache_survives_a_new_session(db, tmdb):
    # Cache lives in the database, not in memory: a fresh session still hits it
    client.get(db, "/movie/603")
    db.expunge_all()  # forget everything this session had loaded
    client.get(db, "/movie/603")
    assert len(tmdb.requests) == 1


def test_param_order_does_not_matter():
    assert client.cache_key("/x", {"a": 1, "b": 2}) == client.cache_key("/x", {"b": 2, "a": 1})


def test_errors_are_not_cached(db, tmdb):
    with pytest.raises(client.TmdbError) as error:
        client.get(db, "/movie/12345")
    assert error.value.status == 404
    assert db.query(TmdbCache).count() == 0


def test_rate_limited_request_is_retried_once(db, tmdb):
    tmdb.status["/movie/603"] = 429  # first answer: "too many requests"
    assert client.get(db, "/movie/603")["title"] == "The Matrix"
    assert len(tmdb.requests) == 2


def test_missing_api_key_is_a_clear_error(db, tmdb, monkeypatch):
    monkeypatch.setattr(client.settings, "tmdb_api_key", "")
    with pytest.raises(client.TmdbError, match="TMDB_API_KEY"):
        client.get(db, "/movie/603")
