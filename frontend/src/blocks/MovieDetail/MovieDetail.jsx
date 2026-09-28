// The movie page: backdrop hero with poster, title, facts and the three scores (combined,
// TMDB, this app), then the synopsis. `summary` (ratings + combined score) arrives
// separately, from useRatings. `children` fill the column next to the synopsis
// (your rating, your playlists).
import { formatRuntime } from '../../lib/format.js'
import Backdrop from '../Backdrop/Backdrop.jsx'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import StarToggle from '../StarToggle/StarToggle.jsx'
import './MovieDetail.css'

export default function MovieDetail({ movie, summary, children }) {
  const runtime = formatRuntime(movie.runtime)
  const combined = summary?.combined

  return (
    <article className="movie-detail">
      <Backdrop movies={[movie]} size="movie" />
      {/* Phones: a round ★ over the backdrop instead of the pill in the score row */}
      <div className="movie-detail__star"><StarToggle movie={movie} /></div>

      <div className="movie-detail__hero">
        <div className="movie-detail__poster placeholder">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={`Poster of ${movie.title}`} />
          ) : (
            <span className="muted">No poster</span>
          )}
        </div>

        <div className="movie-detail__heading">
          <h1 className="hero-title">{movie.title}</h1>
          <p className="movie-detail__meta">
            <span>{movie.year ?? 'Unknown year'}</span>
            <span>{movie.genres.length ? movie.genres.join(', ') : 'No genres listed'}</span>
            {runtime && <span>{runtime}</span>}
          </p>

          <div className="movie-detail__scores">
            {combined && (
              <ScoreBadge
                accent
                label="Combined"
                average={combined.score}
                count={combined.score === null ? 0 : combined.votes}
                emptyText="Not enough information"
              />
            )}
            <ScoreBadge label="TMDB" average={movie.vote_average} count={movie.vote_count} />
            {summary && <ScoreBadge label="This app" average={summary.app_average} count={summary.app_count} />}
            <div className="movie-detail__save"><StarToggle movie={movie} variant="pill" /></div>
          </div>
        </div>
      </div>

      <div className="movie-detail__body">
        <section className="movie-detail__synopsis">
          <h2 className="section-label">Synopsis</h2>
          <p className="movie-detail__overview">{movie.overview || 'No synopsis available.'}</p>
          {combined && <p className="movie-detail__explanation">{combined.explanation}</p>}
        </section>
        {children && <aside className="movie-detail__aside">{children}</aside>}
      </div>
    </article>
  )
}
