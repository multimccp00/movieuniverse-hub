// Page = template. It only arranges blocks; blocks hold the logic.
import { useUser } from '../context/UserContext.jsx'
import LoginBlock from '../blocks/LoginBlock/LoginBlock.jsx'

export default function HomePage() {
  const { user, checking } = useUser()
  if (checking) return null // still checking a saved login, show nothing for a moment

  if (!user) return <LoginBlock />

  return (
    <section className="stack">
      <h1>Hi, {user.username}</h1>
      <p className="muted">Search movies, build playlists, compare them.</p>
    </section>
  )
}
