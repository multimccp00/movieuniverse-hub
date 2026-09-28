// Search pill. Pressing Enter goes to /search?q=..., so every search has its own URL
// (shareable, and the browser Back button works).
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './SearchBar.css'

export default function SearchBar() {
  const [params] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const navigate = useNavigate()

  // The header never unmounts, so when the URL's search changes (Back button,
  // Pager link) copy it into the field to keep them in sync.
  useEffect(() => setQuery(urlQuery), [urlQuery])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  // No button: a form with one field submits on Enter by itself
  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <input
        className={`search-bar__input${urlQuery ? ' search-bar__input--active' : ''}`}
        type="search"
        placeholder="Search movies"
        aria-label="Search movies"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  )
}
