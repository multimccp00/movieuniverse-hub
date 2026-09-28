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

## More from the TMDB API

Only search and movie details are used today. Best fits for this app:

### Cast, director and trailer on the movie page
- Use `append_to_response`: `/movie/{id}?append_to_response=credits,videos` returns details + cast/crew + trailers in **one** request and one cache entry.
- Show top-billed cast, the director, and the official YouTube trailer.

### Trending / popular on the home page
- `/trending/movie/week` or `/movie/popular`, so the home page isn't empty before a search.
- Cached like everything else. These lists change daily, so they would need a shorter max age than the 7 days used by the cache refresh (`tmdb/refresh.py`).

### Where to watch in Portugal
- `/movie/{id}/watch/providers`, filtered to `PT`: streaming, rent, buy.
- Relevant for NOS (TV and streaming). Data comes from JustWatch, so the page must credit JustWatch.

### Other endpoints available
- Recommendations / similar movies, reviews, keywords, release dates and age ratings, images, IMDb id, collections (franchises).
- Discover: filter by genre, year, rating, vote count, language.
- People: search, actor/director pages with filmography.
- TV: search, details, seasons, episodes (see TV shows above).
