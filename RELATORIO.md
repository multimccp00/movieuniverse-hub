# Test report

Result of each test case, one sentence per case. Automated tests: **62 backend** (pytest) and **32 frontend** (Vitest), all passing. Run them with `docker compose exec api pytest` and `docker compose exec web npm test`.

## Cases from the brief

| # | Case | Result |
|---|---|---|
| 1 | A movie with 8.9 and 12 votes must not end above one with 8.4 and 30,000 votes. | Passes: the first scores 6.03, the second 8.32 (`test_scoring.py::test_few_votes_cannot_beat_many_votes`). |
| 2 | Three app users giving 10 must not change that order. | Passes: the first rises only to 6.05, still below 8.32 (`test_three_app_users_giving_10_do_not_change_the_order`). |
| 3 | A movie with no TMDB votes and no app votes has no combined score and says there isn't enough information. | Passes: score is empty and the text starts with "Not enough information" (`test_no_votes_means_no_score`); checked on real data with "The Matrix 5" (0 votes). |
| 4 | The TMDB score is always shown with its number of votes, and a movie without votes shows "no votes", never "0". | Passes: "8.2 · 26,000 votes" and "No votes" (`format.test.js`, `ScoreBadge.test.jsx`, `MovieCard.test.jsx`). |
| 5 | The movie page shows the combined score next to the TMDB score and says how many votes it's based on. | Passes: "Combined 8.3 · 40,263 votes" next to "TMDB 8.4 · 40,259 votes" for Inception (`MovieDetail.test.jsx`, checked in the browser). |
| 6 | The combined score isn't a simple average of the two averages. | Passes: every vote counts once, so 100 TMDB votes of 8 plus 100 app votes of 6 equal 200 votes of 7 (`test_every_vote_counts_once`). |
| 7 | The seed import can run twice without duplicating data. | Passes: row counts and TMDB requests are identical after a second run (`test_seed.py::test_running_twice_does_not_duplicate`). |
| 8 | Deleted playlists in the seed file are handled. | Passes: `pl-03` and `pl-07` (`"apagada": true`) are not imported (`test_deleted_playlists_are_not_imported`). |
| 9 | A movie listed twice in the same playlist is handled. | Passes: Inception in `pl-01` is kept once, at its first position, with a warning (`test_duplicate_movie_keeps_first_position`). |
| 10 | Movies with the same title and different years are told apart. | Passes: Dune (1984, id 841) and Dune (2021, id 438631) are separate movies by TMDB id, and every card shows the year (`MovieCard.test.jsx`, checked on real data). |
| 11 | Movies that only exist in deleted playlists are handled. | Passes: 550, 807, 348 and 289 are not imported with their deleted playlist and nothing references them (counts in `test_real_seed_file_imports`). |
| 12 | Each user gives one rating per movie, 1 to 10, and can change it. | Passes: rating again changes the rating instead of adding one, and 0 or 11 are refused (`test_ratings.py`), also by a database constraint (checked on MySQL). |
| 13 | Playlists and their movies are stored in the database, and ★ adds or removes a movie. | Passes: add, remove, order kept, no duplicates (`test_playlists.py`, `StarToggle.test.jsx`, `PlaylistPicker.test.jsx`). |
| 14 | Two playlists can be compared, showing the one with the better average rating. | Passes: the higher average combined score wins, ties and "no winner" are handled (`test_compare.py`, `CompareResult.test.jsx`); on the seed data, "Ficção científica" beats "Maratona sci-fi" 8.09 vs 7.97. |
| 15 | Passwords are stored hashed, and only logged-in users manage their playlists and ratings. | Passes: stored as Argon2 hashes, changes without login get 401, and other users' playlists get 403 (`test_users.py`, `test_playlists.py`). |
| 16 | Cache: answers already fetched from TMDB are reused. | Passes: the same request reaches TMDB once, even after a restart (`test_tmdb_cache.py`); in the running app the first search took 341 ms and the repeat 25 ms. |
| 17 | The app starts with one command on a clean machine, following the README. | Passes: a fresh clone of the repository with only `.env` added started with `docker compose up --build`, imported the example data and served the app. |

## Other automated checks

- **Search:** results are trimmed to what the page needs, spelling variants share one cache entry, and empty searches are refused (`test_movies.py`).
- **Rate limit:** the throttle waits only when 40 requests fall within 10 seconds, and a "too many requests" answer is retried once (`test_throttle.py`, `test_tmdb_cache.py`).
- **Errors:** an unknown movie gives 404, TMDB failures aren't cached, and a missing TMDB key gives a clear message (`test_tmdb_cache.py`, `test_movies.py`).
- **Login:** wrong password and unknown user get the same answer, logout makes the session token useless, and expired sessions are refused (`test_users.py`).
- **Seed users:** ana, bruno and carla log in with the demo password after an import, and an import restores seeded data changed in the app without touching app-made data (`test_seed.py`).
- **Frontend blocks:** login and account creation, search bar, movie cards, ratings, playlist picker, comparison result and the About page each have their own tests.
