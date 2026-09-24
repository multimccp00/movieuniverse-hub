// /movies/603 -- loads one movie and shows it with the MovieDetail block.
import { useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import MovieDetail from '../blocks/MovieDetail/MovieDetail.jsx'

export default function MovieDetailPage() {
  const { id } = useParams() // the "603" from the URL
  const { data, error } = useApi(`/movies/${id}`)

  if (error?.status === 404) return <p>Movie not found.</p>
  if (error) return <p role="alert">Could not load the movie: {error.message}</p>
  if (!data) return <p className="muted">Loading…</p>

  return <MovieDetail movie={data} />
}
