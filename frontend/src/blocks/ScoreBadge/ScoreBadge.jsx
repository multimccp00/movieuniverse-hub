// A score with its label and vote count, e.g. "TMDB  7.8 · 12,340 votes".
// Reused later for the combined score.
import { formatVotes } from '../../lib/format.js'
import './ScoreBadge.css'

export default function ScoreBadge({ label, average, count }) {
  return (
    <p className="score-badge">
      <span className="score-badge__label">{label}</span>
      <span>{formatVotes(average, count)}</span>
    </p>
  )
}
