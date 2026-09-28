// Page = template. It only arranges blocks; blocks hold the logic.
// Logged out, the page still works: hero + community playlists (and search in the header).
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { usePlaylists } from '../context/PlaylistsContext.jsx'
import { useApi } from '../lib/useApi.js'
import HomeHero from '../blocks/HomeHero/HomeHero.jsx'
import PlaylistList from '../blocks/PlaylistList/PlaylistList.jsx'
import NewPlaylistForm from '../blocks/NewPlaylistForm/NewPlaylistForm.jsx'

export default function HomePage() {
  const { user, checking } = useUser()
  const { playlists: mine } = usePlaylists()
  const everyone = useApi('/playlists')
  if (checking) return null // still checking a saved login, show nothing for a moment

  const community = everyone.data?.filter((p) => p.owner !== user?.username) ?? null

  return (
    <>
      <HomeHero playlists={user ? mine : community} />

      {user && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-label">Your playlists</h2>
            <span className="muted">{mine.length} {mine.length === 1 ? 'playlist' : 'playlists'}</span>
          </div>
          <PlaylistList playlists={mine} scroll>
            <NewPlaylistForm variant="tile" />
          </PlaylistList>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="section-label">From the community</h2>
          <Link to="/compare">Compare any two →</Link>
        </div>
        {everyone.error && <p role="alert">Could not load playlists: {everyone.error.message}</p>}
        {community && <PlaylistList playlists={community} showOwner emptyText="No playlists from other users yet." />}
      </section>
    </>
  )
}
