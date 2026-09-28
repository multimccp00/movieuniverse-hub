// Home page hero: one movie on a big backdrop, as a place to start.
// Logged in: your highest-rated movie that is in one of your playlists ("You rated this 10").
// Nothing rated yet, or logged out: the first movie of the first playlist in `playlists`.
// `playlists` is null while they are still loading.
import { Link } from 'react-router-dom'
import { useUser } from '../../context/UserContext.jsx'
import { useApi } from '../../lib/useApi.js'
import { formatRuntime } from '../../lib/format.js'
import Backdrop from '../Backdrop/Backdrop.jsx'
import './HomeHero.css'

// myRatings come best first from the backend, so the first match is the favourite
function pickMovie(playlists, myRatings) {
  const playlistWith = (movieId) => playlists.find((p) => p.movie_ids.includes(movieId))
  const best = myRatings.find((r) => playlistWith(r.tmdb_id))
  if (best) return { id: best.tmdb_id, stars: best.stars, playlist: playlistWith(best.tmdb_id) }
  const first = playlists.find((p) => p.movie_ids.length > 0)
  return first ? { id: first.movie_ids[0], stars: null, playlist: first } : null
}

export default function HomeHero({ playlists }) {
  const { user } = useUser()
  const myRatings = useApi(user ? '/ratings/mine' : null)
  const waiting = !playlists || (user && !myRatings.data && !myRatings.error)
  const pick = waiting ? null : pickMovie(playlists, myRatings.data ?? [])
  const { data: movie, error } = useApi(pick ? `/movies/${pick.id}` : null)

  // Keep the space while loading, so the page below doesn't jump
  if (waiting || (pick && !movie && !error)) return <section className="home-hero" aria-busy="true" />

  if (!pick || error) {
    return (
      <section className="home-hero">
        <p className="eyebrow">{user ? `Hi, ${user.username}` : 'Welcome'}</p>
        <h1 className="hero-title">Find your next movie</h1>
        <p className="home-hero__meta">Search for a movie, then use ★ to start a playlist.</p>
      </section>
    )
  }

  const { playlist, stars } = pick
  let eyebrow = `From ${playlist.owner}’s “${playlist.name}”`
  if (user) eyebrow = stars ? `Hi, ${user.username} · You rated this ${stars}` : `Hi, ${user.username}`
  const runtime = formatRuntime(movie.runtime)

  return (
    <section className="home-hero">
      <Backdrop movies={[movie]} size="home" />
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="hero-title">{movie.title}</h1>
      <p className="home-hero__meta">
        {movie.year && <span>{movie.year}</span>}
        {movie.genres.length > 0 && <span className="home-hero__genres">{movie.genres.join(', ')}</span>}
        {runtime && <span>{runtime}</span>}
        {user && <span>In {playlist.name}</span>}
      </p>
      <div className="home-hero__actions">
        <Link className="btn btn--primary" to={`/movies/${movie.id}`}>Open movie</Link>
        <Link className="btn" to={`/compare?a=${playlist.id}`}>Compare its playlist</Link>
      </div>
    </section>
  )
}
