// App users' ratings for a movie + buttons 1-10 to give (or change) your own.
import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useUser } from '../../context/UserContext.jsx'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import './UserRating.css'

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function UserRating({ movieId }) {
  const { user } = useUser()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Reload when the movie or the logged-in user changes (my_stars depends on who you are)
  useEffect(() => {
    let ignore = false
    api(`/ratings/${movieId}`)
      .then((data) => { if (!ignore) setSummary(data) })
      .catch((err) => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [movieId, user])

  async function rate(stars) {
    setError('')
    try {
      // The backend answers with the updated summary: use it directly, no reload needed
      setSummary(await api(`/ratings/${movieId}`, { method: 'PUT', body: { stars } }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="user-rating stack">
      <h2>Ratings from this app</h2>
      {summary && <ScoreBadge label="App" average={summary.app_average} count={summary.app_count} />}

      {user ? (
        <div className="stack user-rating__mine">
          <p>{summary?.my_stars ? `Your rating: ${summary.my_stars}/10` : 'Rate this movie:'}</p>
          <div className="user-rating__buttons" role="group" aria-label="Your rating">
            {STARS.map((stars) => (
              <button
                key={stars}
                type="button"
                className={`user-rating__button${summary?.my_stars === stars ? ' user-rating__button--on' : ''}`}
                aria-pressed={summary?.my_stars === stars}
                onClick={() => rate(stars)}
              >
                {stars}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted">Log in to rate this movie.</p>
      )}
      {error && <p className="user-rating__error" role="alert">{error}</p>}
    </section>
  )
}
