import json
from pathlib import Path

from sqlalchemy import func, select

from app.blocks.playlists.models import Playlist, PlaylistMovie
from app.blocks.ratings.models import Rating
from app.blocks.seed.importer import DEMO_PASSWORD, import_seed
from app.blocks.tmdb.models import TmdbCache
from app.blocks.users.models import User
from tests.conftest import login

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


def playlist(db, external_id):
    return db.scalar(select(Playlist).where(Playlist.external_id == external_id))


def test_real_seed_file_imports(db, tmdb):
    tmdb.any_movie = True
    warnings = import_seed(db, SEED)
    # 10 playlists minus the 2 deleted ones = 8; their 43 movie rows minus the duplicate = 42
    assert row_counts(db) == {"User": 3, "Playlist": 8, "PlaylistMovie": 42, "Rating": 20}
    assert db.scalar(select(func.count()).select_from(TmdbCache)) == 30  # every imported movie, pre-loaded
    assert warnings == ["pl-01: movie 27205 is listed twice, kept the first"]


def test_running_twice_does_not_duplicate(db, tmdb):
    tmdb.any_movie = True
    import_seed(db, SEED)
    before = row_counts(db)
    requests_before = len(tmdb.requests)

    import_seed(db, SEED)
    assert row_counts(db) == before
    assert len(tmdb.requests) == requests_before  # second run: all movies come from the cache


def test_deleted_playlists_are_not_imported(db, tmdb):
    import_seed(db, SEED, warm_cache=False)
    assert playlist(db, "pl-03") is None
    assert playlist(db, "pl-07") is None


def test_duplicate_movie_keeps_first_position(db, tmdb):
    import_seed(db, SEED, warm_cache=False)
    pl01 = playlist(db, "pl-01")
    assert [m.tmdb_id for m in pl01.movies] == [27205, 603, 157336, 78, 438631]
    assert pl01.movies[0].position == 1


def test_import_restores_the_example_data(db, client, tmdb):
    """Everyone imports the same file, so importing again puts it back as it was."""
    import_seed(db, SEED, warm_cache=False)
    ana = login(client, "ana", DEMO_PASSWORD)
    pl01_id = playlist(db, "pl-01").id
    pl02_id = playlist(db, "pl-02").id

    client.put("/ratings/603", json={"stars": 2}, headers=ana)  # file says 8
    client.delete(f"/playlists/{pl01_id}/movies/603", headers=ana)  # remove a seeded movie
    client.delete(f"/playlists/{pl02_id}", headers=ana)  # delete a seeded playlist
    mine = client.post("/playlists", json={"name": "Mine"}, headers=ana).json()  # app-made data

    import_seed(db, SEED, warm_cache=False)
    db.expire_all()  # re-read everything from the database
    assert client.get("/ratings/603", headers=ana).json()["my_stars"] == 8
    assert 603 in [m.tmdb_id for m in playlist(db, "pl-01").movies]
    assert playlist(db, "pl-02") is not None
    assert client.get(f"/playlists/{mine['id']}").status_code == 200  # untouched


def test_seed_users_log_in_with_the_demo_password(db, client, tmdb):
    import_seed(db, SEED, warm_cache=False)
    for name in ("ana", "bruno", "carla"):
        response = client.post("/users/login", json={"username": name, "password": DEMO_PASSWORD})
        assert response.status_code == 200, name


def test_invalid_stars_are_skipped(db, tmdb):
    data = {"utilizadores": [{"nome": "ana"}],
            "notas": [{"utilizador": "ana", "tmdb_id": 603, "estrelas": 11, "data": "2026-09-01"}]}
    warnings = import_seed(db, data, warm_cache=False)
    assert row_counts(db)["Rating"] == 0
    assert "not 1-10" in warnings[0]
