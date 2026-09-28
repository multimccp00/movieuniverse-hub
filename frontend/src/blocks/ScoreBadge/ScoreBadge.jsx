// One score as a column: small mono label, big number, vote count under it.
// Used for TMDB, this app's users and the combined score (accent: amber, bigger, 2 decimals).
// No votes shows emptyText instead of a 0.
import { formatCount, formatScore } from '../../lib/format.js'
import './ScoreBadge.css'

export default function ScoreBadge({ label, average, count, emptyText = 'No votes', accent = false }) {
  return (
    <div className={`score-badge${accent ? ' score-badge--accent' : ''}`}>
      <span className="score-badge__label">{label}</span>
      {count ? (
        <>
          <span className="score-badge__value">{accent ? formatScore(average) : average.toFixed(1)}</span>
          {/* The brief: every score says how many votes it's based on */}
          <span className="score-badge__count">{formatCount(count)}</span>
        </>
      ) : (
        <span className="score-badge__empty">{emptyText}</span>
      )}
    </div>
  )
}
