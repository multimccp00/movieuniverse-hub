def test_search_returns_trimmed_movies(client, tmdb):
    body = client.get("/movies/search", params={"q": "matrix"}).json()
    assert body["total_results"] == 1
    assert body["results"][0] == {
        "id": 603, "title": "The Matrix", "year": 1999,
        "poster_url": "https://image.tmdb.org/t/p/w342/matrix.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/matrix-wide.jpg",
        "vote_average": 8.2, "vote_count": 26000,
    }


def test_search_spelling_variants_share_one_cache_entry(client, tmdb):
    client.get("/movies/search", params={"q": "The Matrix"})
    client.get("/movies/search", params={"q": "  the   MATRIX "})
    assert len(tmdb.requests) == 1


def test_search_rejects_empty_query(client, tmdb):
    assert client.get("/movies/search", params={"q": ""}).status_code == 422
    assert client.get("/movies/search", params={"q": "   "}).status_code == 422
    assert client.get("/movies/search").status_code == 422
    assert tmdb.requests == []


def test_detail(client, tmdb):
    body = client.get("/movies/603").json()
    assert body["genres"] == ["Action", "Science Fiction"]
    assert body["runtime"] == 136
    assert body["overview"] == "A hacker learns the truth."


def test_detail_with_missing_data(client, tmdb):
    body = client.get("/movies/999").json()
    assert body["year"] is None
    assert body["poster_url"] is None
    assert body["backdrop_url"] is None
    assert body["runtime"] is None
    assert body["vote_count"] == 0


def test_unknown_movie_is_404(client, tmdb):
    response = client.get("/movies/12345")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not found on TMDB"}
