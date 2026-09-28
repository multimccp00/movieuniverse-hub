// /playlists/3 -- one playlist's movies. The owner also gets a Delete button.
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import { useUser } from '../context/UserContext.jsx'
import { usePlaylists } from '../context/PlaylistsContext.jsx'
import PlaylistHero from '../blocks/PlaylistHero/PlaylistHero.jsx'
import MovieGrid from '../blocks/MovieGrid/MovieGrid.jsx'

export default function PlaylistPage() {
  const { id } = useParams()
  const { data, error } = useApi(`/playlists/${id}`)
  const { user } = useUser()
  const { playlists, remove } = usePlaylists()
  const navigate = useNavigate()

  if (error?.status === 404) return <p>Playlist not found.</p>
  if (error) return <p role="alert">Could not load the playlist: {error.message}</p>
  if (!data) return <p className="muted">Loading…</p>

  // If it's mine, follow my live list: un-starring a movie here removes it at once
  const mine = playlists.find((p) => p.id === data.id)
  const movies = mine ? data.movies.filter((m) => mine.movie_ids.includes(m.id)) : data.movies

  async function handleDelete() {
    if (!window.confirm(`Delete "${data.name}"?`)) return
    await remove(data.id)
    navigate('/')
  }

  return (
    <>
      <PlaylistHero playlist={data} movies={movies} isOwner={user?.username === data.owner} onDelete={handleDelete} />
      <MovieGrid movies={movies} ranked emptyText="This playlist is empty. Use ☆ on any movie to add it." />
    </>
  )
}
