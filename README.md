# MovieUniverse Hub

A web app to search movies from [TMDB](https://www.themoviedb.org/), build personal playlists, rate movies, and compare playlists using a **combined score** that weighs TMDB's votes and this app's votes by how many there are.

What you can do:
- **Search** movies by title and open a movie page: synopsis, genres, runtime, poster, the TMDB score with its vote count ("8.4 · 40,259 votes", or "No votes"), and the **combined score** next to it.
- **Log in** (or create an account) and **build playlists**: the ★ on any movie card or on the movie page adds or removes it. Your playlists are featured on the home page.
- **Rate** movies from 1 to 10, and change your rating later.
- **Compare** two playlists (anyone's): which has the better average combined score, and which movies they share.

Stack: React (Vite) · Python (FastAPI) · MySQL 8 · Docker Compose. Why: `DECISIONS.md`.

---

## 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose). Nothing else: Python, Node and MySQL all run inside containers.
- A free TMDB account, for the API key.

## 2. The TMDB key

1. Create an account at https://www.themoviedb.org/ and go to **Settings → API** (https://www.themoviedb.org/settings/api).
2. Request an API key (personal / non-commercial use).
3. Copy the **API Key** (the short 32-character one, not the "Read Access Token").

The key goes only in your local `.env` file, which git ignores. Never commit it, and never paste it into an AI tool.

## 3. Install and run

```bash
git clone https://github.com/multimccp00/movieuniverse-hub.git
cd movieuniverse-hub
cp .env.example .env
```

Open `.env` and fill in every value:

| Variable | What to put |
|---|---|
| `TMDB_API_KEY` | your TMDB API key |
| `MYSQL_ROOT_PASSWORD` | any password (MySQL's admin, used only inside Docker) |
| `MYSQL_DATABASE` | any name, e.g. `movieuniverse` |
| `MYSQL_USER` | any name, e.g. `movie` |
| `MYSQL_PASSWORD` | any password |

Then start everything with one command:

```bash
docker compose up --build
```

The first start takes a few minutes (downloading images, installing dependencies, creating the database). When the log shows `Uvicorn running on http://0.0.0.0:8000`, open:

- **App:** http://localhost:5173
- **API documentation (Swagger / OpenAPI):** http://localhost:8000/docs

On the first start, the database tables are created and the example data is imported automatically.

To stop: `Ctrl+C`, or `docker compose down`. Data is kept between runs. To delete everything and start from zero: `docker compose down -v`.

## 4. Logging in

- Example users: **ana**, **bruno**, **carla**, all with the password **`demo1234`**.
- Or create your own account: "Sign in" (top right), then "Create account". Passwords need 8 to 128 characters.

Passwords are stored hashed with Argon2, and the login is kept in an `HttpOnly` cookie (`DECISIONS.md`, section 7).

## 5. Example data import

`dados/seed_playlists.json` (provided with the exercise, not edited): 3 users, 10 playlists, 20 ratings.

It's imported automatically on the first start. To run it by hand at any time:

```bash
docker compose exec api python -m app.cli seed dados/seed_playlists.json
```

It puts the example data back exactly as the file has it: seeded playlists deleted in the app come back, seeded movies and ratings return to the file's values, and the example users' password is reset to `demo1234`. It can run any number of times without duplicating anything, and data created in the app is not touched.

How the file's deliberate problems are handled (deleted playlists, a movie listed twice, movies with the same title, movies only in deleted playlists): `DECISIONS.md`, section 11.

## 6. Tests

With the app running:

```bash
docker compose exec api pytest
docker compose exec web npm test
```

- **Backend:** 63 tests (pytest). Each test uses a fresh in-memory database and a fake TMDB, so they never touch your data or the internet.
- **Frontend:** 42 tests (Vitest + Testing Library), one file per block.

### Test cases

The cases from the brief (the combined score rules, "no votes", the seed file's problems, comparison, security, cache, clean start) and their results, one sentence each: **`RELATORIO.md`**.

## 7. Export

**The data** (users, playlists, ratings, cache) as an SQL file:

```bash
docker compose exec db sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --no-tablespaces "$MYSQL_DATABASE"' > backup.sql
```

**The API specification** (OpenAPI 3.1), to import into Postman, Insomnia or any OpenAPI tool:

```bash
curl http://localhost:8000/openapi.json -o openapi.json
```

## 8. How it works

### The combined score

Every movie gets one score from 0 to 10 that mixes TMDB's votes and this app's votes. Every vote counts once, and every movie starts with 1,000 imaginary votes of 6.0, so a few votes can't push an unknown movie to the top: 8.9 with 12 votes scores 6.03, while 8.4 with 30,000 votes scores 8.32. A movie with no votes at all shows "Not enough information". Full rule and reasoning: `DECISIONS.md`, section 12.

### Cache

Every TMDB request goes through one function (`backend/app/blocks/tmdb/client.py`, `get()`), which stores TMDB's answer in the MySQL table `tmdb_cache` and reuses it next time. The same request is never sent to TMDB twice, including after a restart. Searches are normalized (case, spaces), so different spellings of the same search share one entry. Errors are not cached. Requests that do reach TMDB are throttled to 40 per 10 seconds, and a "too many requests" answer is retried once. The example import pre-loads its 30 movies. Details and trade-offs: `DECISIONS.md`, section 8.

### Project layout

```
backend/                 Python API (FastAPI)
  app/blocks/<feature>/  one folder per feature: models (tables), schemas (JSON), service (logic), router (endpoints)
    users/ tmdb/ movies/ playlists/ ratings/ scoring/ compare/ seed/
  app/cli.py             the seed import command
  tests/                 backend tests
frontend/                React app (Vite)
  src/blocks/<Name>/     one folder per UI piece: component + its CSS + its test
  src/pages/             pages: they only arrange blocks
  src/styles/style.css   the design system (colours, spacing, fonts)
dados/                   the example data file
```

### Documents

| File | What's in it |
|---|---|
| `DECISIONS.md` | The three main decisions, every design choice with its alternatives, the combined score rule, the problems in the seed data, why the number of votes matters, the stack justification |
| `RELATORIO.md` | Test cases and their results |
| `AI_LOG.md` | Situations where the AI was wrong or overruled, and what was done instead |
| `features.md` | Ideas left for later (the higher/lower game, watch status, TV shows, cache refresh) |

## 9. Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and posters come from [The Movie Database (TMDB)](https://www.themoviedb.org/).

## License

MIT, see `LICENSE`.
