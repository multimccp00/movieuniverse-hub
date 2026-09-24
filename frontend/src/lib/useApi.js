// Hook: load data from our API for a path, and reload when the path changes.
// Returns { data, error, loading }. Pass null as path to load nothing.
import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) })

  useEffect(() => {
    if (!path) {
      setState({ data: null, error: null, loading: false })
      return
    }
    // If the path changes before the answer arrives (fast typing, quick page
    // change), `ignore` makes sure the old, late answer is thrown away.
    let ignore = false
    // Keep the previous data while loading so the page doesn't flash empty
    setState((previous) => ({ ...previous, error: null, loading: true }))
    api(path)
      .then((data) => { if (!ignore) setState({ data, error: null, loading: false }) })
      .catch((error) => { if (!ignore) setState({ data: null, error, loading: false }) })
    return () => { ignore = true } // React runs this when the path changes
  }, [path])

  return state
}
