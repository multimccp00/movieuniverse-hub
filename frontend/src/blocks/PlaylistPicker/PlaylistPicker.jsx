// Checkbox per playlist: ticked = the movie is in it. Plus "create a playlist with this movie".
// Used inside the ★ popover on cards and on the movie page.
import { useState } from 'react'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import NewPlaylistForm from '../NewPlaylistForm/NewPlaylistForm.jsx'
import './PlaylistPicker.css'

export default function PlaylistPicker({ movieId }) {
  const { playlists, setMovie } = usePlaylists()
  const [error, setError] = useState('')

  async function change(playlistId, inPlaylist) {
    setError('')
    try {
      await setMovie(playlistId, movieId, inPlaylist)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="playlist-picker stack">
      {playlists.length === 0 && <p className="muted">No playlists yet.</p>}
      <ul className="playlist-picker__list" role="list">
        {playlists.map((p) => (
          <li key={p.id}>
            <label className="playlist-picker__item">
              <input
                type="checkbox"
                checked={p.movie_ids.includes(movieId)}
                onChange={(e) => change(p.id, e.target.checked)}
              />
              {p.name}
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="playlist-picker__error" role="alert">{error}</p>}
      {/* A new playlist created here gets this movie straight away */}
      <NewPlaylistForm onCreated={(p) => change(p.id, true)} />
    </div>
  )
}
