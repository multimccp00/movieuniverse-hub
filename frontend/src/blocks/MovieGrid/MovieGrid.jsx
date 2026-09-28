// A grid of MovieCards, or a message when the list is empty. Reused by search and playlists.
// ranked = playlist page: 5 columns, cards numbered 01, 02..., and a plain list on phones.
import MovieCard from '../MovieCard/MovieCard.jsx'
import './MovieGrid.css'

export default function MovieGrid({ movies, ranked = false, emptyText = 'No movies found.' }) {
  if (movies.length === 0) return <p className="muted">{emptyText}</p>

  return (
    <ul className={`movie-grid${ranked ? ' movie-grid--ranked' : ''}`} role="list">
      {movies.map((movie, index) => (
        // key: lets React track each card between redraws
        <li key={movie.id}><MovieCard movie={movie} position={ranked ? index + 1 : undefined} /></li>
      ))}
    </ul>
  )
}
