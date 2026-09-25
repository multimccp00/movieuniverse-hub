# AI log

Situations where the AI suggested something wrong, or something I chose not to use, and what I did instead.

## 1. MySQL healthcheck said "ready" too early
- **AI suggested:** `mysqladmin ping -h localhost` as the Docker healthcheck.
- **Problem:** on a fresh database, MySQL first runs a temporary setup server that only listens on the local socket. `localhost` uses that socket, so the check passed before the real server was up. The api started, got `Connection refused`, and crashed.
- **What I did instead:** changed it to `-h 127.0.0.1`, which forces a network (TCP) check, the same way the api connects. Verified by wiping the database (`docker compose down -v`) and starting again.

## 2. Seed import ran on every start and reset users' changes
- **AI suggested:** a seed import that "updates if it exists, creates if not", run automatically on every API start.
- **Problem:** because it ran on every start, every restart reset the seeded data: a rating changed in the app went back to the file's value. It was spotted when the second start on real MySQL printed "ratings updated: 20" even though nobody had changed anything.
- **AI's first fix, also rejected:** make the import only create missing rows and never update. That kept users' changes, but then importing the file no longer restored the example data, which is its purpose (see entry 3).
- **What I did instead:** kept "the import restores the file's data" and changed *when* it runs automatically: docker-compose runs it with `--if-empty`, only on a brand-new database. Restarts keep the app's changes; running the command by hand restores the example data. Tested both on real MySQL: change a rating, restart (kept), import by hand (restored).

## 3. Soft delete for playlists
- **AI suggested:** "soft delete": deleting a playlist only marks it with a `deleted_at` date and hides it, the row stays. Reasons given: the seed file marks deleted playlists (`"apagada": true`), and the import could then see "already imported" and not bring a deleted playlist back.
- **Why I rejected it:** keeping a playlist the user deleted has no purpose in this app, and the import is *supposed* to bring the example playlists back: everyone doing the exercise imports the same file so everyone has the same data. Blocking that was working against the requirement.
- **What I did instead:** deleting really deletes (the playlist and its movie rows). Playlists marked `"apagada"` in the file are not imported at all. Re-importing restores the example playlists.
