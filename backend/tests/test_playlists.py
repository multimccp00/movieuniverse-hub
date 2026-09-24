from app.blocks.tmdb.models import TmdbCache
from tests.conftest import login


def create(client, headers, name="Sci-fi"):
    return client.post("/playlists", json={"name": name}, headers=headers).json()


def test_create_and_list_my_playlists(client, tmdb):
    ana = login(client, "ana")
    bruno = login(client, "bruno")
    create(client, ana, "  Sci-fi  ")
    create(client, bruno, "Action")

    mine = client.get("/playlists/mine", headers=ana).json()
    assert [(p["name"], p["owner"]) for p in mine] == [("Sci-fi", "ana")]  # name trimmed
    assert len(client.get("/playlists").json()) == 2  # everyone's


def test_login_required_to_create(client, tmdb):
    assert client.post("/playlists", json={"name": "x"}).status_code == 401


def test_add_and_remove_movie(client, tmdb):
    ana = login(client, "ana")
    playlist = create(client, ana)
    url = f"/playlists/{playlist['id']}/movies/603"

    assert client.put(url, headers=ana).json()["movie_ids"] == [603]
    assert client.put(url, headers=ana).json()["movie_ids"] == [603]  # twice: still once
    detail = client.get(f"/playlists/{playlist['id']}").json()
    assert detail["movies"][0]["title"] == "The Matrix"

    assert client.delete(url, headers=ana).json()["movie_ids"] == []


def test_movies_keep_the_order_they_were_added(client, tmdb):
    ana = login(client, "ana")
    playlist = create(client, ana)
    for tmdb_id in (999, 603):
        client.put(f"/playlists/{playlist['id']}/movies/{tmdb_id}", headers=ana)
    assert client.get(f"/playlists/{playlist['id']}").json()["movie_ids"] == [999, 603]


def test_unknown_movie_cannot_be_added(client, tmdb):
    ana = login(client, "ana")
    playlist = create(client, ana)
    assert client.put(f"/playlists/{playlist['id']}/movies/12345", headers=ana).status_code == 404


def test_only_owner_can_change_a_playlist(client, tmdb):
    ana = login(client, "ana")
    bruno = login(client, "bruno")
    playlist = create(client, ana)
    assert client.put(f"/playlists/{playlist['id']}/movies/603", headers=bruno).status_code == 403
    assert client.delete(f"/playlists/{playlist['id']}", headers=bruno).status_code == 403
    assert client.get(f"/playlists/{playlist['id']}").status_code == 200  # but anyone can view


def test_deleted_playlist_disappears(client, tmdb):
    ana = login(client, "ana")
    playlist = create(client, ana)
    assert client.delete(f"/playlists/{playlist['id']}", headers=ana).status_code == 204
    assert client.get(f"/playlists/{playlist['id']}").status_code == 404
    assert client.get("/playlists/mine", headers=ana).json() == []


def test_unavailable_movie_does_not_break_playlist(client, tmdb, db):
    ana = login(client, "ana")
    playlist = create(client, ana)
    client.put(f"/playlists/{playlist['id']}/movies/603", headers=ana)
    db.query(TmdbCache).delete()  # forget it...
    tmdb.status["/movie/603"] = 500  # ...and TMDB is down
    movies = client.get(f"/playlists/{playlist['id']}").json()["movies"]
    assert movies[0]["title"] == "Unavailable movie"
