# MovieUniverse Hub

Search movies from TMDB, build playlists, rate movies and compare playlists using a combined score.

> Work in progress. Full install, seed, test and cache docs come in later phases.

## Run (Docker)

Prerequisite: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Copy `.env.example` to `.env` and fill in every value (TMDB key + any MySQL user/passwords you choose).
2. Start everything:
   ```bash
   docker compose up --build
   ```
3. Open:
   - App: http://localhost:5173
   - API docs (Swagger): http://localhost:8000/docs

The example data (`dados/seed_playlists.json`: users ana, bruno and carla, their playlists and 20 ratings) is imported automatically on the first start. Log in with one of those names to see their playlists.

## Example data import

Runs automatically on the first start (empty database). To run it by hand at any time:

```bash
docker compose exec api python -m app.cli seed dados/seed_playlists.json
```

It puts the example data back exactly as the file has it: seeded playlists deleted in the app come back, and seeded movies and ratings return to the file's values. Nothing is ever duplicated, and data created in the app is not touched. Playlists marked `"apagada"` in the file are not imported.

To start over from scratch: `docker compose down -v` (deletes the database), then `docker compose up`.

## Tests

```bash
docker compose exec api pytest
docker compose exec web npm test
```

## Cache

Every TMDB request goes through one function (`backend/app/blocks/tmdb/client.py`, `get()`), which stores TMDB's answer in the MySQL table `tmdb_cache` and reuses it next time. The same request is never sent to TMDB twice, including after a restart. Searches are normalized (case, spaces), so different spellings of the same search share one entry. Errors are not cached. Requests that do reach TMDB are throttled to 40 per 10 seconds. Details and trade-offs: `DECISIONS.md`, section 8.

## Project layout

- `backend/` — Python FastAPI API. Code grouped in `app/blocks/<feature>/`.
- `frontend/` — React (Vite). Reusable UI pieces in `src/blocks/`, pages in `src/pages/`, design system in `src/styles/style.css`.
- `dados/seed_playlists.json` — example data (not edited).

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
