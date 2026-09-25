# Decisions

Why the project is built the way it is. Each entry: what was chosen, what else was considered, why.

## The three main decisions

1. **The combined score is a Bayesian average** (section 12). Every vote counts once, TMDB or app, and every movie starts with 1,000 imaginary votes of 6.0. Few votes stay near 6.0, many votes give the real average: 8.9 with 12 votes scores 6.03, 8.4 with 30,000 scores 8.32, and three app users giving 10 don't change the order. It's one pure function used everywhere.
2. **Every TMDB answer is cached in MySQL, and the cache is treated as required** (section 8). All TMDB calls go through one function that checks the cache first, so the same request never reaches TMDB twice, even after a restart, and the rate limit is respected with a throttle on top.
3. **The code is organised in self-contained "blocks"** (section 2), like WordPress: one folder per feature on the backend (table, JSON shapes, logic, endpoints) and one folder per UI piece on the frontend (component, CSS, test), with a single design-system stylesheet. This is what let password login replace name-only login by changing one function (section 7).

## Contents
1. Stack · 2. Structure · 3. Running · 4. Tables · 5. Tests · 6. Proxy · 7. Login · 8. Cache · 9. Search and movie pages · 10. Playlists and ratings · 11. Seed import (and the problems in the seed data) · 12. Combined score (and why the number of votes matters) · 13. Comparing playlists · 14. The higher/lower game

## 1. Stack

| Part | Choice | Why |
|---|---|---|
| Backend | Python + FastAPI | Recommended in the brief. FastAPI generates the OpenAPI/Swagger spec automatically (`/docs`), which the brief values, and validates input from type hints. Chosen over Django (too much built-in for a small API) and Flask (no validation or OpenAPI out of the box). |
| Frontend | React + Vite | Recommended in the brief. Components map directly onto the "blocks" structure below. Vite over Next.js: no server rendering needed, simpler setup. |
| Database | MySQL 8 | Not in the recommended list, so, as the brief asks, in two lines: relational data (users, playlists, ratings) with foreign keys and unique constraints fits SQL, and MySQL is a widely used SQL database. It runs in Docker, so it adds no setup for whoever runs the project. |
| ORM | SQLAlchemy | Tables as Python classes, no hand-written SQL, and the same code runs on MySQL (app) and SQLite (tests). |

## 2. Structure: blocks

Inspired by WordPress blocks: the app is built from small, self-contained, reusable pieces.

- **Frontend:** `src/blocks/<Name>/` holds one component + its own CSS + its test. `src/pages/` only arranges blocks (like templates). `src/styles/style.css` is the design system only: tokens (colors, spacing, fonts) and shared base styles. Blocks use tokens, never raw values, so the look changes in one place.
- **Backend:** `app/blocks/<feature>/` holds `models.py` (tables), `schemas.py` (JSON in/out), `service.py` (logic), `router.py` (HTTP endpoints). A block only gets the files it needs.
- **Why:** each feature is in one folder, so it is easy to find, read and test. Routers stay thin (HTTP only) and logic lives in services, so logic can be tested and reused without HTTP.
- **Deliberately not added:** repository layers, interfaces, dependency-injection containers. They add files without adding value at this size.

## 3. Running: Docker Compose

- One command, `docker compose up --build`, starts MySQL, the API and the frontend. The only prerequisite is Docker.
- Considered: a `.bat` script. Rejected because it is Windows-only and still needs MySQL, Python and Node installed by hand, which fails the "one command on a clean machine" requirement.

## 4. Database tables: created at startup, no migrations

- Tables are created from the models when the API starts (`create_all`).
- Considered: Alembic (versioned migration scripts). Not needed yet: the data can always be rebuilt with `docker compose down -v` plus the seed import. Alembic becomes worth it once there is data that cannot be wiped.

## 5. Tests: in-memory SQLite

- Backend tests use a fresh, empty SQLite database in memory for each test: fast, isolated, and no running MySQL needed.
- Trade-off: the code must avoid MySQL-only SQL, which is easy because everything goes through SQLAlchemy. The real MySQL is checked by running the app with Docker.
- Frontend tests (Vitest + Testing Library) test each block on its own, with the backend faked.

## 6. Frontend to backend: Vite proxy

- The browser calls `/api/...` on the frontend's own address, and Vite forwards the call to the API.
- Considered: calling the API directly and enabling CORS on the backend. The proxy avoids CORS configuration completely, and the frontend never hardcodes the API address.

## 7. Login: username + password

The brief allows name-only identity but says a username and password is more robust; if used, passwords must be hashed and only logged-in users may manage their playlists and ratings.

- **Built in two steps on purpose.** First username-only (an `X-User` header), with every endpoint asking one function, `get_current_user`, who the user is. Then passwords: only that function and the users block changed; no playlist or rating endpoint was touched.
- **Passwords are hashed with Argon2** (`argon2-cffi`), one of the two algorithms the brief names. Argon2 is slow and memory-hungry on purpose, which makes guessing passwords from a stolen database very expensive. Each hash has its own random salt, so two users with the same password get different hashes.
- **Rules:** 8 to 128 characters, nothing else. Length is what makes a password strong; "must contain a symbol" rules mostly produce predictable passwords.
- **Sessions are a cookie, not a token the frontend stores.** On login the server creates a random 32-byte token, stores only its SHA-256 hash in the `sessions` table, and sends the token in a cookie that is:
  - `HttpOnly`: page JavaScript can't read it, so an injected script can't steal it;
  - `SameSite=Lax`: not sent with requests started by other websites, which blocks cross-site request forgery;
  - valid 7 days (expiry stored in the database too).
  Logging out deletes the session row, so the token stops working immediately.
  - `Secure` (HTTPS only) is **not** set, because the app runs on plain `http://localhost`. It would be required in production.
- **Why a database session and not a JWT:** a session can be ended on logout by deleting its row; a JWT stays valid until it expires. The database is already there, and one lookup per request is cheap.
- **Login errors don't reveal which usernames exist:** "wrong password" and "no such user" give the same message, and an unknown user still costs the same Argon2 check, so response time doesn't give it away either.
- **Seed users** (ana, bruno, carla have no password in the file) get the demo password `demo1234`, written in the README, so anyone reviewing can log in as them. It's a known password on purpose, for example accounts only.
- **Not done:** limiting repeated login attempts (brute force). Argon2's slowness already limits guessing speed; a per-account attempt limit would be the next step for production.

## 8. TMDB cache

The brief marks the cache optional; here it is treated as required.

- **Where:** a MySQL table, `tmdb_cache` (key, TMDB's full JSON answer, time fetched). Chosen over Redis (one more service to run) and in-memory caching (lost on every restart). The database is already there and it persists.
- **One door:** every TMDB call goes through one function, `tmdb/client.py:get()`. It looks in the cache first and calls TMDB only on a miss. No code can reach TMDB without going through the cache.
- **Key:** the request itself, e.g. `/movie/603?language=en-US`, with parameters sorted so their order doesn't matter. Searches are normalized first (trimmed, lowercased, spaces collapsed), so "The Matrix" and "  the MATRIX " share one entry. TMDB's search ignores case, so the results are the same.
- **Whole answer stored:** the raw TMDB JSON is cached, not our trimmed-down version. If a later feature needs another field, it's already there.
- **Errors are never cached:** a failed or "not found" answer is not stored, so a temporary TMDB problem doesn't stick.
- **No expiry:** entries never expire. Trade-off: vote counts freeze at the moment they were first fetched, and the same movie can show slightly different counts in a search result and on its detail page, because they are two separate cached requests. `fetched_at` is stored so a max age can be added later (see `features.md`).
- **Rate limit on misses:** TMDB allows 40 requests per 10 seconds. A sliding-window throttle waits when that is reached, and a `429 Too Many Requests` answer is retried once after the time TMDB asks for. The throttle lives in the API process, which is enough for one process.

## 9. Search and movie pages

- The search lives in the URL (`/search?q=matrix&page=2`): results can be bookmarked and shared, and the Back button works.
- The year is always shown next to the title: several different movies share the same title (the brief warns the seed data has this too).
- Missing data is always stated: "No votes" instead of "0", "Unknown year", "No poster", "No synopsis available".
- Posters are loaded by the browser straight from TMDB's image server, which is not part of the API rate limit.

## 10. Playlists and ratings

- **Only TMDB ids are stored** in playlists and ratings, never movie details. Details come from the cache, so there's one source of truth for movie data.
- **Anyone can view a playlist; only its owner can change it** (403 otherwise). Viewing others' lists is needed to compare playlists.
- **Deleting really deletes** the playlist and its movie rows. A "soft delete" (keep the row, mark it deleted) was considered and rejected: keeping data the user deleted has no purpose here (`AI_LOG.md` entry 3).
- **Adding and removing a movie use `PUT` and `DELETE` on the movie's own address** (`/playlists/3/movies/603`). Doing either twice has the same effect as once, so a double click can't add a movie twice.
- **The database enforces the rules too:** the pair (playlist, movie) is the primary key, so a movie can't be in the same playlist twice; ratings have a unique (user, movie) pair and a `CHECK` for 1–10 stars. Even a bug in the code can't break these rules.
- **Adding or rating a movie checks it exists on TMDB** (through the cache), so invented ids are rejected with 404.
- **One unavailable movie doesn't break a playlist page:** if TMDB can't provide a movie, it's shown as "Unavailable movie" instead of failing the whole page.
- **The ★ is filled when the movie is in any of your playlists.** Clicking it opens a picker with one checkbox per playlist, plus "create a playlist with this movie". The same picker is on the movie page.

## 11. Seed import

Command: `python -m app.cli seed dados/seed_playlists.json`

- **Purpose: the example data matches the file after every import.** Everyone doing the exercise imports the same file, so everyone starts from the same data. A seeded playlist deleted in the app comes back; seeded playlists' movies and seeded ratings are reset to the file's values.
- **Never duplicates:** every row is matched on a natural key first: users by name, playlists by the file's id (`pl-01`, stored as `external_id`), ratings by (user, movie). Found = reset to the file, not found = created.
- **Data created in the app is never touched** (other playlists, other ratings).
- **Automatic only on a new database:** docker-compose runs it with `--if-empty` on every start, which imports only when the database has no users yet. So the first start gets the example data, and restarts keep what users changed. An earlier version ran the full import on every start and reset users' changes at each restart (`AI_LOG.md` entry 2).
- **It pre-loads the cache** with every imported movie (30 distinct), so pages are instant from the first visit. Movies already cached cost no request.

### Problems found in the seed data (the brief warns about these)

| Problem | Where | How it's handled |
|---|---|---|
| Deleted playlists | `pl-03`, `pl-07` (`"apagada": true`) | Not imported: they are deleted in the source data. |
| Same movie twice in one playlist | `pl-01`: Inception (27205) at positions 1 and 6 | Keep the first position, skip the second, print a warning. The database would refuse the duplicate anyway. |
| Same title, different years | Dune: 841 (1984) in `pl-05`, 438631 (2021) in `pl-01` | Movies are identified by TMDB id, never by title. Cards always show the year. |
| Movies only in deleted playlists | 550 (Fight Club), 807 (Se7en), 348, 289, all in `pl-03` | Not imported, since their only playlist isn't. Nothing else references them (no ratings), so nothing is left pointing at them. They can still be found by search like any movie. |

Also handled defensively (not present in the file): star values outside 1–10 are skipped with a warning; usernames are cleaned the same way as at login.

## 12. Combined score

**Code:** `backend/app/blocks/scoring/combined.py`, `combined_score(tmdb_avg, tmdb_votes, app_avg, app_votes)`. A pure function, as the brief requires: numbers in, a score and an explanation out, no database, network or interface. The movie page and the playlist comparison both call this one function (through `ratings.service.combined_for`, which only gathers the numbers), and a future game would too.

### Why the number of votes matters
An average says nothing about how much to trust it. A movie rated 8.9 by 12 people and one rated 8.4 by 30,000 people: the second is almost certainly the better-liked movie, because 12 votes can easily be 12 fans. A simple average of the two averages (TMDB's and the app's) would also be wrong: 3 app votes would count as much as 30,000 TMDB votes. So the rule has to weigh everything by the number of votes behind it.

### The rule: a Bayesian average
1. **Pool the votes.** Every vote counts once, whether it came from TMDB or from this app:
   `pooled = (tmdb_avg × tmdb_votes + app_avg × app_votes) / total_votes`
2. **Pull towards a prior.** Pretend every movie also received `PRIOR_VOTES = 1000` votes of `PRIOR_SCORE = 6.0`:
   `score = (pooled × total_votes + 6.0 × 1000) / (total_votes + 1000)`

With few real votes, the 1,000 imaginary ones dominate and the score stays near 6.0. With many real votes they stop mattering and the score becomes the real average. This is the idea IMDb uses for its Top 250.

- **No votes at all** (none on TMDB, none in the app): no score. The movie page says "Not enough information".
- **Result:** a score from 0 to 10 (it's an average of 0–10 values), rounded to 2 decimals, plus the total number of votes it's based on, shown on the movie page next to the TMDB score: "Combined 8.3 · 40,263 votes".

### The brief's checks, with real numbers

| Case | Combined |
|---|---|
| 8.9 with 12 votes | **6.03** |
| 8.4 with 30,000 votes | **8.32** |
| 8.9 with 12 votes + three app users giving 10 | **6.05** (still far below 8.32: the order doesn't change) |
| no votes anywhere | no score, "Not enough information" |

All four are automated tests (`backend/tests/test_scoring.py`).

### Why these two constants
- **`PRIOR_SCORE = 6.0`**: where a movie with no evidence starts. Slightly above the middle of the scale, because the average TMDB rating of movies people actually rate is around 6–6.5. Starting at 5 would unfairly punish every little-known movie; starting at 7 would reward them.
- **`PRIOR_VOTES = 1000`**: how many real votes a movie needs before its own average counts as much as the prior. With 1,000 votes, a movie is halfway between 6.0 and its real average; with 30,000 it's at 97% of its real average. It's big enough that tens of votes (or three app users) can't push an obscure movie above a well-known one, and small enough that a movie with a few thousand votes is judged on its own merits.
- **Trade-off:** good but little-known movies are pulled down. A movie at 7.8 with 500 votes gets 6.60. That's intended: the brief values confidence over a high average from few votes. Both constants are at the top of the file, so they're easy to tune.
- **App votes count exactly like TMDB votes.** Giving them extra weight would let a handful of users overrule thousands of TMDB votes, which is what the brief forbids.

## 13. Comparing playlists

`GET /compare?a=1&b=2`, page `/compare`.

- **Anyone's playlists can be compared**, including other users' (that's why playlists are viewable by everyone).
- **The better playlist has the higher average combined score** of its movies, as the brief asks. It uses the same `combined_score` function as the movie page.
- **Movies without a combined score are left out of the average** (no votes at all, or unavailable on TMDB): counting them as 0 would punish a playlist for containing a new movie. The page says "average of 4 of 5 movies" so it's visible.
- **Tie** when both averages are equal (2 decimals). **No winner** when one playlist has no scored movie at all (e.g. empty): the page says why.
- **Comparing a playlist with itself** is refused (422).
- **Extra comparisons shown:** the movies in both playlists, how many movies each has, and every movie's combined score side by side.
- Each distinct movie is scored once, even when it's in both playlists.

## 14. The higher/lower game (optional): not built

The brief marks the game as optional. It was deliberately left out to finish the required parts well, and is the first item in `features.md`.

What is already in place for it: the combined score is one pure function (`combined_score`), so the game would call it directly, as the brief requires ("the same function, not a copy"). The rules the brief asks to decide (minimum score gap for a pair, which low-vote movies to leave out, pairs from the whole catalog or only the user's playlists) are listed in `features.md` to be decided when it's built.
