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

## Project layout

- `backend/` — Python FastAPI API. Code grouped in `app/blocks/<feature>/`.
- `frontend/` — React (Vite). Reusable UI pieces in `src/blocks/`, pages in `src/pages/`, design system in `src/styles/style.css`.
- `dados/seed_playlists.json` — example data (not edited).

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
