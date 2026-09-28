from tests.conftest import login


def app_part(body):
    """The app-ratings fields of a summary (without the combined score)."""
    return {key: body[key] for key in ("my_stars", "app_average", "app_count")}


def test_rate_and_change_rating(client, tmdb):
    ana = login(client, "ana")
    assert client.put("/ratings/603", json={"stars": 7}, headers=ana).json()["my_stars"] == 7
    body = client.put("/ratings/603", json={"stars": 9}, headers=ana).json()
    assert app_part(body) == {"my_stars": 9, "app_average": 9.0, "app_count": 1}  # changed, not added


def test_average_over_users(client, tmdb):
    client.put("/ratings/603", json={"stars": 10}, headers=login(client, "ana"))
    client.put("/ratings/603", json={"stars": 7}, headers=login(client, "bruno"))
    body = client.get("/ratings/603").json()  # not logged in
    assert app_part(body) == {"my_stars": None, "app_average": 8.5, "app_count": 2}


def test_no_ratings(client, tmdb):
    body = client.get("/ratings/603").json()
    assert app_part(body) == {"my_stars": None, "app_average": None, "app_count": 0}


def test_summary_includes_the_combined_score(client, tmdb):
    client.put("/ratings/603", json={"stars": 10}, headers=login(client, "ana"))
    combined = client.get("/ratings/603").json()["combined"]
    assert combined["votes"] == 26_001  # 26,000 TMDB + 1 app
    assert "26,000 TMDB + 1 app" in combined["explanation"]


def test_movie_without_votes_has_no_combined_score(client, tmdb):
    combined = client.get("/ratings/999").json()["combined"]  # 0 TMDB votes, 0 app votes
    assert combined["score"] is None
    assert combined["explanation"].startswith("Not enough information")


def test_stars_must_be_1_to_10(client, tmdb):
    ana = login(client, "ana")
    for stars in (0, 11, -1):
        assert client.put("/ratings/603", json={"stars": stars}, headers=ana).status_code == 422


def test_rating_requires_login_and_real_movie(client, tmdb):
    assert client.put("/ratings/603", json={"stars": 5}).status_code == 401
    assert client.put("/ratings/12345", json={"stars": 5}, headers=login(client, "ana")).status_code == 404
    assert client.get("/ratings/12345").status_code == 404


def test_my_ratings_best_first(client, tmdb):
    ana = login(client, "ana")
    client.put("/ratings/603", json={"stars": 7}, headers=ana)
    client.put("/ratings/777", json={"stars": 9}, headers=ana)
    client.put("/ratings/603", json={"stars": 10}, headers=login(client, "bruno"))  # not ana's
    assert client.get("/ratings/mine", headers=ana).json() == [
        {"tmdb_id": 777, "stars": 9}, {"tmdb_id": 603, "stars": 7},
    ]
    assert client.get("/ratings/mine").status_code == 401
