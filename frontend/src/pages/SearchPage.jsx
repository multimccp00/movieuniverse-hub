// /search?q=matrix&page=2 -- the URL holds the search, the page reads it and shows results.
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.js'
import MovieGrid from '../blocks/MovieGrid/MovieGrid.jsx'
import Pager from '../blocks/Pager/Pager.jsx'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''
  const page = Number(params.get('page')) || 1

  // encodeURIComponent: makes spaces and symbols safe inside a URL
  const query = encodeURIComponent(q)
  const { data, error, loading } = useApi(q ? `/movies/search?q=${query}&page=${page}` : null)

  if (!q) return <p className="muted">Type a movie title in the search bar.</p>
  if (error) return <p role="alert">Search failed: {error.message}</p>
  if (!data) return <p className="muted">Searching…</p>

  return (
    <section className="stack" aria-busy={loading}>
      <h1>
        {data.total_results.toLocaleString('en-US')} results for “{q}”
      </h1>
      <MovieGrid movies={data.results} />
      <Pager
        page={data.page}
        totalPages={Math.min(data.total_pages, 500)}
        hrefFor={(p) => `/search?q=${query}&page=${p}`}
      />
    </section>
  )
}
