// A grid of MovieCards, or a message when the list is empty. Reused by search and playlists.
import MovieCard from '../MovieCard/MovieCard.jsx'

export default function MovieGrid({ movies, emptyText = 'No movies found.' }) {
  if (movies.length === 0) return <p className="muted">{emptyText}</p>

  return (
    <ul className="grid" role="list">
      {movies.map((movie) => (
        // key: lets React track each card between redraws
        <li key={movie.id}><MovieCard movie={movie} /></li>
      ))}
    </ul>
  )
}
