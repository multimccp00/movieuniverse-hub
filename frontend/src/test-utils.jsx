// Test helper: render a block with fake user + playlists contexts and a router,
// so each test only states what matters to it.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { UserContext } from './context/UserContext.jsx'
import { PlaylistsContext } from './context/PlaylistsContext.jsx'

export function renderWithContext(ui, { user = null, playlists = [], ...playlistFns } = {}) {
  const playlistsValue = {
    playlists,
    create: vi.fn(),
    setMovie: vi.fn(),
    remove: vi.fn(),
    isInAny: (movieId) => playlists.some((p) => p.movie_ids.includes(movieId)),
    ...playlistFns, // a test can pass its own create/setMovie to check calls
  }
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, checking: false, login: vi.fn(), logout: vi.fn() }}>
        <PlaylistsContext.Provider value={playlistsValue}>{ui}</PlaylistsContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  )
  return playlistsValue
}
