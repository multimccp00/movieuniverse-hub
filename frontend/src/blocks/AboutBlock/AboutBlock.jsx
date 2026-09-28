// "About" screen: what the app does, how the combined score works (with two worked examples),
// and TMDB attribution (TMDB's terms ask apps to credit them and say they aren't endorsed by TMDB).
import './AboutBlock.css'

// Same rule as the backend (scoring/combined.py): 1,000 starting votes of 6.0, then every real vote once
const PRIOR_VOTES = 1000
const PRIOR_AVERAGE = 6

const EXAMPLES = [
  { average: 8.9, votes: 12 },
  { average: 8.4, votes: 30000 },
].map((ex) => ({
  ...ex,
  combined: (PRIOR_VOTES * PRIOR_AVERAGE + ex.average * ex.votes) / (PRIOR_VOTES + ex.votes),
  priorShare: PRIOR_VOTES / (PRIOR_VOTES + ex.votes), // how much of the bar the starting votes take
}))

export default function AboutBlock() {
  return (
    <article className="about">
      <div className="about__intro">
        <p className="eyebrow">About</p>
        <h1 className="about__headline">One score.<br />Every vote<br />counts once.</h1>
        <p className="about__text">
          Search movies, build playlists, rate from 1 to 10, and compare playlists.
          Movie data comes from TMDB; playlists and ratings are stored by this app.
        </p>
        <p className="about__text">
          Every movie starts with 1,000 imaginary votes of 6.0. A few enthusiastic votes can&apos;t push an
          unknown movie above a well-known one; thousands of votes reveal its real average.
        </p>
      </div>

      <div className="about__explain">
        <p className="about__formula">
          combined = (1000 × 6.0 + sum of all votes)
          <br />
          <span className="about__formula-under">÷ (1000 + number of votes)</span>
        </p>

        {EXAMPLES.map((ex) => (
          <section key={ex.votes} className="about__example">
            <p className="about__example-head">
              <span>
                <strong>{ex.average}</strong>
                <span className="muted"> average from {ex.votes.toLocaleString('en-US')} votes</span>
              </span>
              <span className="combined about__example-score">{ex.combined.toFixed(2)}</span>
            </p>
            {/* grey = the 1,000 starting votes, amber = the real ones, to scale */}
            <div className="about__bar" aria-hidden="true">
              <span className="about__bar-prior" style={{ width: `${ex.priorShare * 100}%` }} />
              <span className="about__bar-real" />
            </div>
            <p className="about__bar-legend muted">
              <span>1,000 starting votes of 6.0</span>
              <span>{ex.votes.toLocaleString('en-US')} real votes</span>
            </p>
          </section>
        ))}

        <p className="about__attribution muted">
          This product uses the TMDB API but is not endorsed or certified by TMDB.{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">themoviedb.org</a>
        </p>
      </div>
    </article>
  )
}
