// "New playlist" field + Create button. onCreated(playlist) lets the parent react (e.g. add a movie to it).
// variant="tile": the dashed tile at the end of "Your playlists" on the home page.
import { useState } from 'react'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import './NewPlaylistForm.css'

export default function NewPlaylistForm({ onCreated, variant }) {
  const { create } = usePlaylists()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const isTile = variant === 'tile'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      const playlist = await create(name)
      setName('')
      onCreated?.(playlist) // ?. = only call it if the parent passed one
    } catch (err) {
      setError(err.message)
    }
  }

  const form = (
    <form className="new-playlist" onSubmit={handleSubmit}>
      <input
        className="input new-playlist__input"
        placeholder={isTile ? 'Name' : 'New playlist'}
        aria-label="New playlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className="btn btn--small" type="submit">Create</button>
      {error && <p className="new-playlist__error error" role="alert">{error}</p>}
    </form>
  )

  if (!isTile) return form

  return (
    <div className="new-playlist-tile">
      <p className="new-playlist-tile__title">New playlist</p>
      {form}
      <p className="new-playlist-tile__hint">Or use ★ on any movie.</p>
    </div>
  )
}
