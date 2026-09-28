"""A pretend TMDB for tests: answers from a dict and counts every request it gets."""
import httpx

from app.blocks.tmdb import client
from app.blocks.tmdb.throttle import SlidingWindow

MATRIX = {
    "id": 603, "title": "The Matrix", "release_date": "1999-03-30",
    "poster_path": "/matrix.jpg", "backdrop_path": "/matrix-wide.jpg", "vote_average": 8.2, "vote_count": 26000,
    "overview": "A hacker learns the truth.", "runtime": 136,
    "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}],
}

SMALL = {  # a well-rated movie with few votes
    "id": 777, "title": "Small Gem", "release_date": "2020-01-01", "poster_path": None,
    "vote_average": 9.0, "vote_count": 10, "overview": "", "runtime": 90, "genres": [],
}

UNRELEASED = {  # a movie with no votes, no date, no poster
    "id": 999, "title": "Unreleased", "release_date": "", "poster_path": None,
    "vote_average": 0, "vote_count": 0, "overview": "", "runtime": 0, "genres": [],
}


class FakeTmdb:
    def __init__(self, monkeypatch):
        self.requests = []  # every request that reached "TMDB"
        self.status = {}  # path -> status code to answer instead of 200
        self.any_movie = False  # True: every /movie/<id> exists (for the seed file's ids)
        monkeypatch.setattr(client.settings, "tmdb_api_key", "test-key")
        monkeypatch.setattr(client, "_http", httpx.Client(transport=httpx.MockTransport(self.handle)))
        monkeypatch.setattr(client, "_throttle", SlidingWindow(limit=1000, window=10))
        monkeypatch.setattr(client.time, "sleep", lambda seconds: None)  # don't really wait

    def handle(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        path = request.url.path.removeprefix("/3")
        if path in self.status:
            return httpx.Response(self.status.pop(path), headers={"Retry-After": "0"})
        if path == "/search/movie":
            return httpx.Response(200, json={
                "page": 1, "total_pages": 1, "total_results": 1, "results": [MATRIX],
            })
        movies = {"/movie/603": MATRIX, "/movie/777": SMALL, "/movie/999": UNRELEASED}
        if path in movies:
            return httpx.Response(200, json=movies[path])
        if self.any_movie and path.startswith("/movie/"):
            tmdb_id = int(path.removeprefix("/movie/"))
            return httpx.Response(200, json={**MATRIX, "id": tmdb_id, "title": f"Movie {tmdb_id}"})
        return httpx.Response(404, json={})
