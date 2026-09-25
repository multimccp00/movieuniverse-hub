// Tiles linking to playlists, with movie count (and owner, when showing other people's lists).
import { Link } from 'react-router-dom'
import './PlaylistList.css'

export default function PlaylistList({ playlists, showOwner = false, emptyText = 'No playlists yet.' }) {
  if (playlists.length === 0) return <p className="muted">{emptyText}</p>

  return (
    <ul className="playlist-list" role="list">
      {playlists.map((p) => (
        <li key={p.id}>
          <Link to={`/playlists/${p.id}`} className="playlist-list__item">
            <span className="playlist-list__name">{p.name}</span>
            <span className="muted">
              {p.movie_ids.length} {p.movie_ids.length === 1 ? 'movie' : 'movies'}
              {showOwner && ` · by ${p.owner}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
