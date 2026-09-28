// Checkbox per playlist: ticked = the movie is in it. Plus "create a playlist with this movie".
// Used inside the ★ popover (a list of rows) and on the movie page (variant="chips":
// "✓ name" / "+ name" pills). Both are real checkboxes, only styled differently.
import { useState } from 'react'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import NewPlaylistForm from '../NewPlaylistForm/NewPlaylistForm.jsx'
import './PlaylistPicker.css'

export default function PlaylistPicker({ movieId, variant = 'list' }) {
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

  // A new playlist created here gets this movie straight away
  const newForm = <NewPlaylistForm onCreated={(p) => change(p.id, true)} />

  return (
    <div className={`playlist-picker playlist-picker--${variant}`}>
      {playlists.length === 0 && variant === 'list' && <p className="muted">No playlists yet.</p>}
      <ul className="playlist-picker__list" role="list">
        {playlists.map((p) => (
          <li key={p.id}>
            <label className="playlist-picker__item">
              <input
                type="checkbox"
                className="playlist-picker__box"
                checked={p.movie_ids.includes(movieId)}
                onChange={(e) => change(p.id, e.target.checked)}
              />
              {p.name}
            </label>
          </li>
        ))}
        {variant === 'chips' && (
          <li>
            {/* <details>: the "+ New playlist" chip opens the field, no JavaScript needed */}
            <details className="playlist-picker__new">
              <summary className="playlist-picker__item playlist-picker__item--new">+ New playlist</summary>
              {newForm}
            </details>
          </li>
        )}
      </ul>
      {error && <p className="error" role="alert">{error}</p>}
      {variant === 'list' && <div className="playlist-picker__footer">{newForm}</div>}
    </div>
  )
}
