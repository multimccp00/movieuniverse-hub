// A score with its label and vote count, e.g. "TMDB  7.8 · 12,340 votes".
// Used for TMDB, app users and the combined score.
import { formatVotes } from '../../lib/format.js'
import './ScoreBadge.css'

export default function ScoreBadge({ label, average, count, emptyText = 'No votes' }) {
  return (
    <p className="score-badge">
      <span className="score-badge__label">{label}</span>
      <span>{count ? formatVotes(average, count) : emptyText}</span>
    </p>
  )
}
