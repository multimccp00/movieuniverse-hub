# AI log

Situations where the AI suggested something wrong, or something I chose not to use, and what I did instead.

## 1. MySQL healthcheck said "ready" too early
- **AI suggested:** `mysqladmin ping -h localhost` as the Docker healthcheck.
- **Problem:** on a fresh database, MySQL first runs a temporary setup server that only listens on the local socket. `localhost` uses that socket, so the check passed before the real server was up. The api started, got `Connection refused`, and crashed.
- **What I did instead:** changed it to `-h 127.0.0.1`, which forces a network (TCP) check, the same way the api connects. Verified by wiping the database (`docker compose down -v`) and starting again.

## 2. Seed import overwrote users' changes on every restart
- **AI suggested:** a seed import that "updates if it exists, creates if not" (upsert), run automatically on every API start.
- **Problem:** running it on every start meant the seed file won every time. A rating changed in the app went back to the seed value, a deleted seeded playlist came back, a removed movie reappeared. It was spotted when the second run on real MySQL printed "ratings updated: 20" even though nothing had changed.
- **What I did instead:** the import only creates what is missing and never touches existing rows. It still never duplicates, and app changes survive restarts. Added a test that changes a rating, removes a movie and deletes a playlist, re-imports, and checks all three changes are kept.
