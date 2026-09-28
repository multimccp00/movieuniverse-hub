// One movie in a grid: poster, title, year, a score, and the ★ playlist toggle.
// Search results show the TMDB score and its votes; playlist movies (which come with `score`) show the
// combined score, in amber. `position` numbers the card (playlist page).
// The ★ sits next to the link, not inside it: a button inside a link is invalid HTML
// and clicking it would also open the movie.
import { Link } from 'react-router-dom'
import { formatCount, formatScore } from '../../lib/format.js'
import StarToggle from '../StarToggle/StarToggle.jsx'
import './MovieCard.css'

function Score({ movie }) {
  if ('score' in movie) {
    return movie.score === null
      ? <span className="muted">No score</span>
      : <span className="combined movie-card__combined">{formatScore(movie.score)}</span>
  }
  if (!movie.vote_count) return <span className="muted">No votes</span>
  // The brief: the TMDB score always comes with its number of votes
  return (
    <span title="TMDB score">
      <strong>{movie.vote_average.toFixed(1)}</strong> <span className="muted">· {formatCount(movie.vote_count)}</span>
    </span>
  )
}

export default function MovieCard({ movie, position }) {
  return (
    <article className={`movie-card${position ? ' movie-card--ranked' : ''}`}>
      <Link to={`/movies/${movie.id}`} className="movie-card__link">
        <div className="movie-card__poster placeholder">
          {movie.poster_url ? (
            // loading="lazy": the browser only downloads posters that scroll into view
            <img src={movie.poster_url} alt="" loading="lazy" />
          ) : (
            <span className="movie-card__no-poster">No poster</span>
          )}
        </div>
        <h3 className="movie-card__title">{movie.title}</h3>
        <p className="movie-card__facts">
          {/* Year always shown: different movies share the same title */}
          <span className="muted">{movie.year ?? 'Unknown year'}</span>
          <Score movie={movie} />
        </p>
      </Link>
      {position && <span className="movie-card__position">{String(position).padStart(2, '0')}</span>}
      <div className="movie-card__star">
        <StarToggle movie={movie} />
      </div>
    </article>
  )
}
