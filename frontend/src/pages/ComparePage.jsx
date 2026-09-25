// /compare?a=1&b=2 -- pick two playlists (anyone's) and compare them.
// The choice lives in the URL, like search: shareable, and Back works.
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import CompareForm from '../blocks/CompareForm/CompareForm.jsx'
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

  return (
    <section className="stack">
      <h1>Compare playlists</h1>
      <p className="muted">The winner has the higher average combined score (TMDB + this app&apos;s votes).</p>
      <CompareForm
        key={`${a}-${b}`} // new URL (e.g. Back button) = rebuild the form with the URL's choice
        playlists={playlists.data}
        initialA={a}
        initialB={b}
        onCompare={(x, y) => navigate(`/compare?a=${x}&b=${y}`)}
      />
      {comparison.error && <p role="alert">Could not compare: {comparison.error.message}</p>}
      {comparison.data && <CompareResult result={comparison.data} />}
    </section>
  )
}
