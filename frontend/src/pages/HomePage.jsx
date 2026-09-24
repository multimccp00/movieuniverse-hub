// Page = template. It only arranges blocks; blocks hold the logic.
import { useUser } from '../context/UserContext.jsx'
import { usePlaylists } from '../context/PlaylistsContext.jsx'
import LoginBlock from '../blocks/LoginBlock/LoginBlock.jsx'
import PlaylistList from '../blocks/PlaylistList/PlaylistList.jsx'
import NewPlaylistForm from '../blocks/NewPlaylistForm/NewPlaylistForm.jsx'

export default function HomePage() {
  const { user, checking } = useUser()
  const { playlists } = usePlaylists()
  if (checking) return null // still checking a saved login, show nothing for a moment

  if (!user) return <LoginBlock />

  return (
    <section className="stack">
      <h1>Hi, {user.username}</h1>
      <h2>Your playlists</h2>
      <PlaylistList playlists={playlists} emptyText="No playlists yet. Create one below, or use ☆ on any movie." />
      <NewPlaylistForm />
    </section>
  )
}
