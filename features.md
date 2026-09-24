# Feature backlog (lowest priority)

Ideas deliberately left out of the current scope. Build only after all core phases are done.

## Higher / lower game
- Show two movies; the user picks which has the higher combined score. Right answer: next pair. Wrong: game over, show streak.
- Must call the same `combined_score` function as the rest of the app (no copied logic).
- Store highscores (who, score, date) to show the best result.
- Decide and document in DECISIONS.md: minimum score gap for a pair, which low-vote movies are excluded, pairs from whole catalog or only the user's playlists.

## Watch status
- Per user, per title: `plan_to_watch`, `watching`, `completed`, `dropped`, `on_hold`.
- Table `watch_status(user_id, media_type, tmdb_id, status, updated_at)`, unique on `(user_id, media_type, tmdb_id)`.
- Status dropdown block on the movie card and detail page; filter lists by status.

## TV shows
- Needed for watch status to make sense on series.
- TMDB endpoints `/search/tv` and `/tv/{id}`.
- Add a `media_type` column (`movie` | `tv`) to playlist, rating and status tables (reset DB: `docker compose down -v`).

## Cache refresh
- Cache entries currently never expire. Add a max age (e.g. refresh vote counts after 7 days).
