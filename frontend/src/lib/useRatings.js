// Hook: one movie's ratings summary (app average, my rating, combined score) + a rate() function.
// Lives in the page so two blocks share it: rating in UserRating updates the combined
// score shown in MovieDetail at once.
import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useUser } from '../context/UserContext.jsx'

export function useRatings(movieId) {
  const { user } = useUser()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Reload when the movie or the logged-in user changes (my_stars depends on who you are)
  useEffect(() => {
    let ignore = false
    setError('')
    api(`/ratings/${movieId}`)
      .then((data) => { if (!ignore) setSummary(data) })
      .catch((err) => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [movieId, user])

  async function rate(stars) {
    setError('')
    try {
      // The backend answers with the updated summary (new combined score included)
      setSummary(await api(`/ratings/${movieId}`, { method: 'PUT', body: { stars } }))
    } catch (err) {
      setError(err.message)
    }
  }

  return { summary, error, rate }
}
