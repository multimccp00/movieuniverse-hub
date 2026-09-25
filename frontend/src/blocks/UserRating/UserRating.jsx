// App users' ratings for a movie + buttons 1-10 to give (or change) your own.
// The data comes from the page (useRatings), so the combined score elsewhere updates too.
import { useUser } from '../../context/UserContext.jsx'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import './UserRating.css'

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function UserRating({ summary, error, onRate }) {
  const { user } = useUser()

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
                onClick={() => onRate(stars)}
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
