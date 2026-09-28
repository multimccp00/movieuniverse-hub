// Buttons 1-10 to give (or change) your rating. The data comes from the page (useRatings),
// so the combined score in MovieDetail updates at once.
// Logged out, a button opens the sign-in modal and gives that rating once you're in.
import { useUser } from '../../context/UserContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import './UserRating.css'

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function UserRating({ movie, summary, error, onRate }) {
  const { user } = useUser()
  const auth = useAuthModal()
  const mine = summary?.my_stars ?? 0

  function handleClick(stars) {
    if (user) onRate(stars)
    else auth.open({ reason: 'rate', movie, onSuccess: () => onRate(stars) })
  }

  // Selected value: amber. Values under it: soft amber, so the choice reads like a bar.
  function buttonClass(stars) {
    if (stars === mine) return 'user-rating__button user-rating__button--on'
    if (stars < mine) return 'user-rating__button user-rating__button--below'
    return 'user-rating__button'
  }

  return (
    <section className="user-rating">
      <div className="section-head">
        <h2 className="section-label">Your rating</h2>
        {!user && (
          <button type="button" className="user-rating__signin" onClick={() => auth.open({ reason: 'rate', movie })}>
            Sign in to rate
          </button>
        )}
        {user && mine > 0 && <span className="muted">{mine}/10</span>}
      </div>
      <div className="user-rating__buttons" role="group" aria-label="Your rating">
        {STARS.map((stars) => (
          <button
            key={stars}
            type="button"
            className={buttonClass(stars)}
            aria-pressed={stars === mine}
            onClick={() => handleClick(stars)}
          >
            {stars}
          </button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
