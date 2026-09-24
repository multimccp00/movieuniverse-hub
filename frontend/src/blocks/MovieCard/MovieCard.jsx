// One movie in a grid: poster, title, year, TMDB score. The whole card links to the movie page.
import { Link } from 'react-router-dom'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import './MovieCard.css'

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      {movie.poster_url ? (
        // loading="lazy": the browser only downloads posters that scroll into view
        <img className="movie-card__poster" src={movie.poster_url} alt="" loading="lazy" />
      ) : (
        <div className="movie-card__poster movie-card__poster--empty">No poster</div>
      )}
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        {/* Year always shown: the data has different movies with the same title */}
        <p className="muted">{movie.year ?? 'Unknown year'}</p>
        <ScoreBadge label="TMDB" average={movie.vote_average} count={movie.vote_count} />
      </div>
    </Link>
  )
}
