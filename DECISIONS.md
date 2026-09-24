# Decisions

Why the project is built the way it is. Each entry: what was chosen, what else was considered, why.

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

## 7. Identity: username only (for now)

- The brief allows identifying users by a chosen name only. Logging in with a new name creates the user.
- Usernames are trimmed and lowercased, so "Ana" and "ana" are the same person.
- The frontend sends the name in an `X-User` header, and the backend reads it in one function, `get_current_user`.
- Known limitation: the header can be faked. Password login (hashed passwords + secure cookie) is planned next. Because every endpoint goes through `get_current_user`, only that function will change.

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

## Still to write
- Combined score rule (Phase 5)
- Problems found in the seed data (Phase 3)
- The vote-count question from the brief
