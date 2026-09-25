from app.blocks.scoring.combined import combined_score
from tests.conftest import login


def playlist_with(client, headers, name, movie_ids):
    playlist = client.post("/playlists", json={"name": name}, headers=headers).json()
    for tmdb_id in movie_ids:
        client.put(f"/playlists/{playlist['id']}/movies/{tmdb_id}", headers=headers)
    return playlist["id"]


def compare(client, a, b):
    return client.get("/compare", params={"a": a, "b": b})


def test_playlist_with_better_average_wins(client, tmdb):
    ana = login(client, "ana")
    popular = playlist_with(client, ana, "Popular", [603])  # 8.2 with 26,000 votes
    obscure = playlist_with(client, ana, "Obscure", [777])  # 9.0 with 10 votes
    body = compare(client, popular, obscure).json()

    matrix = combined_score(8.2, 26_000, None, 0).score  # the same function the app uses
    assert body["a"]["average"] == matrix
    assert body["winner"] == "a"  # many votes beat few, even with a lower TMDB average


def test_movies_without_a_score_are_left_out_of_the_average(client, tmdb):
    ana = login(client, "ana")
    a = playlist_with(client, ana, "With unreleased", [603, 999])  # 999 has no votes at all
    b = playlist_with(client, ana, "Matrix only", [603])
    body = compare(client, a, b).json()
    assert body["a"]["movie_count"] == 2
    assert body["a"]["scored_count"] == 1
    assert body["a"]["average"] == body["b"]["average"]
    assert body["winner"] == "tie"


def test_movies_in_common(client, tmdb):
    ana = login(client, "ana")
    a = playlist_with(client, ana, "A", [603, 777])
    b = playlist_with(client, login(client, "bruno"), "B", [777, 999])  # someone else's list
    body = compare(client, a, b).json()
    assert [m["id"] for m in body["common"]] == [777]


def test_no_winner_when_a_side_has_no_scores(client, tmdb):
    ana = login(client, "ana")
    a = playlist_with(client, ana, "A", [603])
    b = playlist_with(client, ana, "Empty", [])
    body = compare(client, a, b).json()
    assert body["b"]["average"] is None
    assert body["winner"] is None


def test_app_ratings_count_in_the_score(client, tmdb):
    ana = login(client, "ana")
    a = playlist_with(client, ana, "A", [999])  # no TMDB votes: no score yet
    b = playlist_with(client, ana, "B", [603])
    assert compare(client, a, b).json()["a"]["average"] is None
    client.put("/ratings/999", json={"stars": 10}, headers=ana)
    assert compare(client, a, b).json()["a"]["average"] is not None  # one app vote gives it a score


def test_invalid_comparisons(client, tmdb):
    ana = login(client, "ana")
    a = playlist_with(client, ana, "A", [603])
    assert compare(client, a, a).status_code == 422  # same playlist twice
    assert compare(client, a, 12345).status_code == 404  # doesn't exist
    assert client.get("/compare", params={"a": a}).status_code == 422  # b missing
