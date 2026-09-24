// "New playlist" field + button. onCreated(playlist) lets the parent react (e.g. add a movie to it).
import { useState } from 'react'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import './NewPlaylistForm.css'

export default function NewPlaylistForm({ onCreated }) {
  const { create } = usePlaylists()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

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

  return (
    <form className="new-playlist" onSubmit={handleSubmit}>
      <input
        className="input new-playlist__input"
        placeholder="New playlist name"
        aria-label="New playlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className="btn" type="submit">Create</button>
      {error && <p className="new-playlist__error" role="alert">{error}</p>}
    </form>
  )
}
