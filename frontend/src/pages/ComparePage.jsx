// /compare?a=1&b=2 -- pick two playlists (anyone's) and compare them.
// The choice lives in the URL, like search: shareable, and Back works.
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import CompareResult from '../blocks/CompareResult/CompareResult.jsx'

export default function ComparePage() {
  const [params] = useSearchParams()
  const a = params.get('a') ?? ''
  const b = params.get('b') ?? ''
  const navigate = useNavigate()

  const playlists = useApi('/playlists')
  const comparison = useApi(a && b && a !== b ? `/compare?a=${a}&b=${b}` : null)

  if (playlists.error) return <p role="alert">Could not load playlists: {playlists.error.message}</p>
  if (!playlists.data) return <p className="muted">Loading…</p>

  // While a new comparison loads, useApi still holds the previous one: only show it if it matches
  const result = comparison.data
  const current = result && String(result.a.id) === a && String(result.b.id) === b ? result : null

  // Changing one dropdown keeps the other side as it is
  function pick(side, id) {
    const next = { a, b, [side]: id }
    navigate(`/compare?a=${next.a}&b=${next.b}`)
  }

  return (
    <>
      <CompareResult
        playlists={playlists.data}
        a={a}
        b={b}
        result={current}
        onPick={pick}
      />
      {comparison.error && <p role="alert">Could not compare: {comparison.error.message}</p>}
    </>
  )
}
