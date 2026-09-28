// Head to head: two playlist cards (each with its own dropdown), the verdict, each side's
// movies with a score bar, and the movies they share.
// `result` is null until two different playlists are picked. onPick('a' | 'b', id) changes a side.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatScore } from '../../lib/format.js'
import './CompareResult.css'

function verdict({ a, b, winner }) {
  if (winner === null) {
    const empty = a.average === null ? a : b
    return `Can't compare: “${empty.name}” has no movie with a score yet.`
  }
  if (winner === 'tie') return <>It&apos;s a tie: both average <span className="compare__amber">{formatScore(a.average)}</span>.</>
  const [best, other] = winner === 'a' ? [a, b] : [b, a]
  return <>“{best.name}” wins: <span className="compare__amber">{formatScore(best.average)}</span> vs {formatScore(other.average)}.</>
}

// The bar shows the score between 5 and 10 (below 5 = empty, 10 = full)
function barWidth(score) {
  return `${Math.min(Math.max((score - 5) / 5, 0), 1) * 100}%`
}

function Side({ label, side, playlists, value, onPick, isWinner, isLead }) {
  const posters = side?.movies.slice(0, 6) ?? []
  const classes = ['compare__side']
  if (isLead) classes.push('compare__side--lead')

  return (
    <section className={classes.join(' ')}>
      <div className="compare__strip">
        {posters.length === 0 && <div className="placeholder" />}
        {posters.map((m) => (
          <div key={m.id} className="placeholder">{m.poster_url && <img src={m.poster_url} alt="" />}</div>
        ))}
      </div>
      {isWinner && <span className="compare__badge">Winner</span>}
      <div className="compare__body">
        {/* A real <select>, drawn as a row: "Sci-fi · ana  ▾" */}
        <label className="compare__picker">
          <span className="visually-hidden">{label}</span>
          <select value={value} onChange={(e) => onPick(e.target.value)}>
            <option value="">Choose a playlist</option>
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.owner}</option>
            ))}
          </select>
        </label>
        <p className={`compare__average${isWinner ? ' compare__amber' : ''}`}>
          {side ? formatScore(side.average) : '—'}
        </p>
        {side && (
          <p className="muted">
            average of {side.scored_count} of {side.movie_count} movies
            {side.scored_count < side.movie_count && ' (movies without a score are left out)'}
          </p>
        )}
      </div>
    </section>
  )
}

function MovieList({ side, shared, isWinner, hidden }) {
  if (side.movies.length === 0) return <p className={`muted${hidden ? ' compare__hidden' : ''}`}>This playlist is empty.</p>
  return (
    <ul className={`compare__movies${hidden ? ' compare__hidden' : ''}`} role="list">
      {side.movies.map((m) => (
        <li key={m.id} className="compare__movie">
          <span>
            <Link to={`/movies/${m.id}`} className="compare__title">{m.title}</Link>
            <span className="muted"> ({m.year ?? '?'})</span>
            {shared.has(m.id) && <span className="compare__both">Both</span>}
          </span>
          <span className="compare__bar" aria-hidden="true">
            {m.score !== null && (
              <span className={isWinner ? 'compare__bar-fill compare__bar-fill--win' : 'compare__bar-fill'} style={{ width: barWidth(m.score) }} />
            )}
          </span>
          <span className="compare__score">{m.score === null ? '—' : formatScore(m.score)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CompareResult({ playlists = [], a = '', b = '', result, onPick }) {
  const [shown, setShown] = useState('a') // phones show one side's list at a time
  const winner = result?.winner
  const shared = new Set(result?.common.map((m) => m.id))

  const side = (key, label, value) => (
    <Side
      label={label}
      side={result?.[key]}
      playlists={playlists}
      value={value}
      onPick={(id) => onPick(key, id)}
      isWinner={winner === key}
      isLead={winner === key || winner === 'tie'}
    />
  )

  return (
    <div className="compare">
      <header className="compare__intro">
        <h1 className="eyebrow">Head to head</h1>
        <p className="muted">Higher average combined score wins. Any two playlists, anyone&apos;s.</p>
      </header>

      <div className="compare__arena">
        {side('a', 'First playlist', a)}
        <span className="compare__vs" aria-hidden="true">VS</span>
        {side('b', 'Second playlist', b)}
      </div>

      {a && a === b && <p className="compare__verdict muted">Choose two different playlists.</p>}

      {result && (
        <>
          <p className="compare__verdict" role="status">{verdict(result)}</p>

          <div className="compare__tabs" role="radiogroup" aria-label="Show the movies of">
            {['a', 'b'].map((key) => (
              <button key={key} type="button" role="radio" aria-checked={shown === key} onClick={() => setShown(key)}>
                {result[key].name}
              </button>
            ))}
          </div>

          <div className="compare__lists">
            <MovieList side={result.a} shared={shared} isWinner={winner === 'a'} hidden={shown !== 'a'} />
            <MovieList side={result.b} shared={shared} isWinner={winner === 'b'} hidden={shown !== 'b'} />
          </div>

          <section className="compare__common">
            <h2 className="section-label">In both playlists ({result.common.length})</h2>
            {result.common.length === 0 ? (
              <p className="muted">No movies in common.</p>
            ) : (
              <ul className="compare__chips" role="list">
                {result.common.map((m) => (
                  <li key={m.id}>
                    <Link to={`/movies/${m.id}`} className="compare__chip">
                      <span className="compare__chip-poster placeholder">{m.poster_url && <img src={m.poster_url} alt="" />}</span>
                      <span>
                        <span className="compare__title">{m.title}</span>
                        <span className="compare__chip-year muted">{m.year ?? '?'}</span>
                      </span>
                      <span className="combined compare__chip-score">{m.score === null ? '—' : formatScore(m.score)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
