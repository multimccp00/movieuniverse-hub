// One movie in a grid: poster, title, year, TMDB score, and the ★ playlist toggle.
// The ★ sits next to the link, not inside it: a button inside a link is invalid HTML
// and clicking it would also open the movie.
import { Link } from 'react-router-dom'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import StarToggle from '../StarToggle/StarToggle.jsx'
import './MovieCard.css'

export default function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <Link to={`/movies/${movie.id}`} className="movie-card__link">
        {movie.poster_url ? (
          // loading="lazy": the browser only downloads posters that scroll into view
          <img className="movie-card__poster" src={movie.poster_url} alt="" loading="lazy" />
        ) : (
          <div className="movie-card__poster movie-card__poster--empty">No poster</div>
        )}
        <div className="movie-card__body">
          <h3 className="movie-card__title">{movie.title}</h3>
          {/* Year always shown: different movies share the same title */}
          <p className="muted">{movie.year ?? 'Unknown year'}</p>
          <ScoreBadge label="TMDB" average={movie.vote_average} count={movie.vote_count} />
        </div>
      </Link>
      <div className="movie-card__star">
        <StarToggle movieId={movie.id} />
      </div>
    </article>
  )
}
