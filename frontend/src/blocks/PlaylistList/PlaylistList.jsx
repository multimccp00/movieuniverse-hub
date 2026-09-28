// Playlist tiles: a mosaic of 4 posters, the name, the average combined score and the movie count.
// showOwner = other people's playlists: smaller tiles, "owner · N movies".
// scroll = one sideways-scrolling row on phones. `children` (e.g. a "New playlist" tile) comes last.
import { Link } from 'react-router-dom'
import { useApi } from '../../lib/useApi.js'
import { averageScore, formatScore } from '../../lib/format.js'
import './PlaylistList.css'

// Each tile loads its own playlist for the posters and scores. Cheap: the backend
// keeps TMDB's answers in its cache, so this never waits on TMDB twice.
function Tile({ playlist, showOwner }) {
  const { data } = useApi(`/playlists/${playlist.id}`)
  const movies = data?.movies ?? []
  const average = averageScore(movies)
  const count = playlist.movie_ids.length
  const countText = `${count} ${count === 1 ? 'movie' : 'movies'}`

  return (
    <li>
      <Link to={`/playlists/${playlist.id}`} className="playlist-tile">
        <div className="playlist-tile__mosaic">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="playlist-tile__cell placeholder">
              {movies[i]?.poster_url && <img src={movies[i].poster_url} alt="" loading="lazy" />}
            </div>
          ))}
        </div>
        <span className="playlist-tile__row">
          <span className="playlist-tile__name">{playlist.name}</span>
          {average !== null && <span className="combined playlist-tile__average">{formatScore(average)}</span>}
        </span>
        <span className="playlist-tile__meta muted">
          {showOwner ? `${playlist.owner} · ${countText}` : countText}
          {!showOwner && average !== null && ' · avg combined'}
        </span>
      </Link>
    </li>
  )
}

export default function PlaylistList({ playlists, showOwner = false, scroll = false, emptyText = 'No playlists yet.', children }) {
  if (playlists.length === 0 && !children) return <p className="muted">{emptyText}</p>

  const classes = ['playlist-list']
  if (showOwner) classes.push('playlist-list--compact')
  if (scroll) classes.push('playlist-list--scroll')

  return (
    <div className={classes.join(' ')}>
      <ul className="playlist-list__tiles" role="list">
        {playlists.map((p) => <Tile key={p.id} playlist={p} showOwner={showOwner} />)}
      </ul>
      {children}
    </div>
  )
}
