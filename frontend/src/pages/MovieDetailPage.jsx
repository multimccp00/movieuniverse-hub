// /movies/603 -- the movie with its scores, its ratings, and (logged in) which of your playlists it's in.
import { useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import { useRatings } from '../lib/useRatings.js'
import { useUser } from '../context/UserContext.jsx'
import MovieDetail from '../blocks/MovieDetail/MovieDetail.jsx'
import UserRating from '../blocks/UserRating/UserRating.jsx'
import PlaylistPicker from '../blocks/PlaylistPicker/PlaylistPicker.jsx'

export default function MovieDetailPage() {
  const { id } = useParams() // the "603" from the URL
  const { data, error } = useApi(`/movies/${id}`)
  const ratings = useRatings(id) // shared by MovieDetail (combined score) and UserRating
  const { user } = useUser()

  if (error?.status === 404) return <p>Movie not found.</p>
  if (error) return <p role="alert">Could not load the movie: {error.message}</p>
  if (!data) return <p className="muted">Loading…</p>

  return (
    <div className="stack">
      <MovieDetail movie={data} combined={ratings.summary?.combined} />
      <UserRating summary={ratings.summary} error={ratings.error} onRate={ratings.rate} />
      {user && (
        <section className="stack">
          <h2>In your playlists</h2>
          <PlaylistPicker movieId={data.id} />
        </section>
      )}
    </div>
  )
}
