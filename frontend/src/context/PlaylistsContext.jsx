// The logged-in user's playlists, shared by every block (★ on cards, picker, home page).
// Loaded once per login instead of once per card.
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useUser } from './UserContext.jsx'

export const PlaylistsContext = createContext(null)

export function PlaylistsProvider({ children }) {
  const { user } = useUser()
  const [playlists, setPlaylists] = useState([])

  // Reload whenever the logged-in user changes (login, logout, switch)
  useEffect(() => {
    setPlaylists([])
    if (!user) return
    let ignore = false // drop a late answer that belongs to the previous user
    api('/playlists/mine')
      .then((mine) => { if (!ignore) setPlaylists(mine) })
      .catch(() => {})
    return () => { ignore = true }
  }, [user])

  // Swap one playlist for the version the backend just sent back
  function replace(updated) {
    setPlaylists((list) => list.map((p) => (p.id === updated.id ? updated : p)))
  }

  async function create(name) {
    const playlist = await api('/playlists', { method: 'POST', body: { name } })
    setPlaylists((list) => [...list, playlist])
    return playlist
  }

  async function setMovie(playlistId, movieId, inPlaylist) {
    const method = inPlaylist ? 'PUT' : 'DELETE'
    replace(await api(`/playlists/${playlistId}/movies/${movieId}`, { method }))
  }

  async function remove(playlistId) {
    await api(`/playlists/${playlistId}`, { method: 'DELETE' })
    setPlaylists((list) => list.filter((p) => p.id !== playlistId))
  }

  const isInAny = (movieId) => playlists.some((p) => p.movie_ids.includes(movieId))

  return (
    <PlaylistsContext.Provider value={{ playlists, create, setMovie, remove, isInAny }}>
      {children}
    </PlaylistsContext.Provider>
  )
}

export function usePlaylists() {
  return useContext(PlaylistsContext)
}
