// Full movie information: poster, title, year, genres, runtime, TMDB score, synopsis.
import { formatRuntime } from '../../lib/format.js'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import './MovieDetail.css'

export default function MovieDetail({ movie }) {
  const runtime = formatRuntime(movie.runtime)

  return (
    <article className="movie-detail">
      {movie.poster_url ? (
        <img className="movie-detail__poster" src={movie.poster_url} alt={`Poster of ${movie.title}`} />
      ) : (
        <div className="movie-detail__poster movie-detail__poster--empty">No poster</div>
      )}

      <div className="stack">
        <h1>
          {movie.title} <span className="muted">({movie.year ?? 'Unknown year'})</span>
        </h1>

        <p className="movie-detail__facts muted">
          {movie.genres.length ? movie.genres.join(', ') : 'No genres listed'}
          {runtime && ` · ${runtime}`}
        </p>

        <ScoreBadge label="TMDB" average={movie.vote_average} count={movie.vote_count} />

        <section className="stack">
          <h2>Synopsis</h2>
          <p>{movie.overview || 'No synopsis available.'}</p>
        </section>
      </div>
    </article>
  )
}
