// Top of a playlist page: its movies' backdrops, name, owner, count, average combined score,
// and the actions (Compare with…, and Delete for the owner).
import { Link } from 'react-router-dom'
import { averageScore, formatScore } from '../../lib/format.js'
import Backdrop from '../Backdrop/Backdrop.jsx'
import './PlaylistHero.css'

export default function PlaylistHero({ playlist, movies, isOwner, onDelete }) {
  const average = averageScore(movies)

  return (
    <header className="playlist-hero">
      <Backdrop movies={movies.slice(0, 5)} size="playlist" />
      <div className="playlist-hero__top">
        <div className="playlist-hero__heading">
          <p className="eyebrow">Playlist · by {isOwner ? 'you' : playlist.owner}</p>
          <h1 className="hero-title">{playlist.name}</h1>
          <p className="playlist-hero__count">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</p>
        </div>
        {average !== null && (
          <p className="playlist-hero__average">
            <span className="eyebrow">Avg combined</span>
            <span className="combined playlist-hero__score">{formatScore(average)}</span>
          </p>
        )}
      </div>
      <div className="playlist-hero__actions">
        <Link className="btn btn--primary" to={`/compare?a=${playlist.id}`}>Compare with…</Link>
        {isOwner && <button type="button" className="btn btn--danger" onClick={onDelete}>Delete playlist</button>}
      </div>
    </header>
  )
}
