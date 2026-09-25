// The result of comparing two playlists: who wins, each side's average and movies, and what they share.
import { Link } from 'react-router-dom'
import { formatScore } from '../../lib/format.js'
import './CompareResult.css'

function verdict({ a, b, winner }) {
  if (winner === null) {
    const empty = a.average === null ? a : b
    return `Can't compare: “${empty.name}” has no movie with a score yet.`
  }
  if (winner === 'tie') return `It's a tie: both average ${formatScore(a.average)}.`
  const [best, other] = winner === 'a' ? [a, b] : [b, a]
  return `“${best.name}” wins: ${formatScore(best.average)} vs ${formatScore(other.average)}.`
}

function MovieList({ movies, emptyText }) {
  if (movies.length === 0) return <p className="muted">{emptyText}</p>
  return (
    <ul className="compare-result__movies" role="list">
      {movies.map((m) => (
        <li key={m.id}>
          <Link to={`/movies/${m.id}`}>{m.title}</Link>
          <span className="muted"> ({m.year ?? '?'})</span>
          <span className="compare-result__score">{formatScore(m.score)}</span>
        </li>
      ))}
    </ul>
  )
}

function Side({ side, isWinner }) {
  return (
    <section className={`compare-result__side${isWinner ? ' compare-result__side--winner' : ''}`}>
      <h2><Link to={`/playlists/${side.id}`}>{side.name}</Link></h2>
      <p className="muted">by {side.owner}</p>
      <p className="compare-result__average">{formatScore(side.average)}</p>
      <p className="muted">
        average of {side.scored_count} of {side.movie_count} movies
        {side.scored_count < side.movie_count && ' (movies without a score are left out)'}
      </p>
      <MovieList movies={side.movies} emptyText="This playlist is empty." />
    </section>
  )
}

export default function CompareResult({ result }) {
  return (
    <div className="stack">
      <p className="compare-result__verdict" role="status">{verdict(result)}</p>
      <div className="compare-result__sides">
        <Side side={result.a} isWinner={result.winner === 'a'} />
        <Side side={result.b} isWinner={result.winner === 'b'} />
      </div>
      <section className="stack">
        <h2>In both playlists ({result.common.length})</h2>
        <MovieList movies={result.common} emptyText="No movies in common." />
      </section>
    </div>
  )
}
