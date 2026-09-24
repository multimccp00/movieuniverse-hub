import json
from pathlib import Path

from sqlalchemy import func, select

from app.blocks.playlists.models import Playlist, PlaylistMovie
from app.blocks.ratings.models import Rating
from app.blocks.seed.importer import import_seed
from app.blocks.users.models import User

# The real file from the brief, never edited. Found by walking up the folders:
# it's at <repo>/dados locally and at /app/dados inside the Docker container.
SEED_FILE = next(
    folder / "dados" / "seed_playlists.json"
    for folder in Path(__file__).parents
    if (folder / "dados" / "seed_playlists.json").exists()
)
SEED = json.loads(SEED_FILE.read_text("utf-8"))


def row_counts(db):
    return {table.__name__: db.scalar(select(func.count()).select_from(table))
            for table in (User, Playlist, PlaylistMovie, Rating)}


def test_real_seed_file_imports(db, tmdb):
    tmdb.any_movie = True
    counts, warnings = import_seed(db, SEED)
    # 51 movie rows in the file, minus the duplicate in pl-01 = 50
    assert row_counts(db) == {"User": 3, "Playlist": 10, "PlaylistMovie": 50, "Rating": 20}
    assert counts["movie details ready"] == 34  # every distinct movie, pre-loaded into the cache
    assert warnings == ["pl-01: movie 27205 is listed twice, kept the first"]


def test_running_twice_changes_nothing(db, tmdb):
    tmdb.any_movie = True
    import_seed(db, SEED)
    before = row_counts(db)
    requests_before = len(tmdb.requests)

    counts, warnings = import_seed(db, SEED)
    assert row_counts(db) == before
    assert counts == {"movie details ready": 34}  # nothing created
    assert warnings == []
    assert len(tmdb.requests) == requests_before  # second run: all movies come from the cache


def test_changes_made_in_the_app_survive_a_second_import(db, client, tmdb):
    import_seed(db, SEED, warm_cache=False)
    ana = {"X-User": "ana"}
    pl01 = db.scalar(select(Playlist).where(Playlist.external_id == "pl-01"))
    pl02 = db.scalar(select(Playlist).where(Playlist.external_id == "pl-02"))

    client.put("/ratings/603", json={"stars": 2}, headers=ana)  # seed says 8
    client.delete(f"/playlists/{pl01.id}/movies/603", headers=ana)  # remove a seeded movie
    client.delete(f"/playlists/{pl02.id}", headers=ana)  # delete a seeded playlist

    import_seed(db, SEED, warm_cache=False)
    db.expire_all()  # re-read everything from the database
    assert client.get("/ratings/603", headers=ana).json()["my_stars"] == 2
    assert 603 not in [m.tmdb_id for m in pl01.movies]
    assert pl02.deleted_at is not None


def test_deleted_playlists_are_hidden(db, tmdb):
    import_seed(db, SEED, warm_cache=False)
    deleted = db.scalars(select(Playlist.external_id).where(Playlist.deleted_at.is_not(None))).all()
    assert sorted(deleted) == ["pl-03", "pl-07"]


def test_duplicate_movie_keeps_first_position(db, tmdb):
    import_seed(db, SEED, warm_cache=False)
    pl01 = db.scalar(select(Playlist).where(Playlist.external_id == "pl-01"))
    assert [m.tmdb_id for m in pl01.movies] == [27205, 603, 157336, 78, 438631]
    assert pl01.movies[0].position == 1


def test_invalid_stars_are_skipped(db, tmdb):
    data = {"utilizadores": [{"nome": "ana"}],
            "notas": [{"utilizador": "ana", "tmdb_id": 603, "estrelas": 11, "data": "2026-09-01"}]}
    counts, warnings = import_seed(db, data, warm_cache=False)
    assert counts["ratings created"] == 0
    assert "not 1-10" in warnings[0]
