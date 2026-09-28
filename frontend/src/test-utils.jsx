// Test helper: render a block with fake user + playlists + sign-in modal contexts and a router,
// so each test only states what matters to it.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { UserContext } from './context/UserContext.jsx'
import { PlaylistsContext } from './context/PlaylistsContext.jsx'
import { AuthModalContext } from './context/AuthModalContext.jsx'

export function renderWithContext(ui, { user = null, playlists = [], logout = vi.fn(), ...playlistFns } = {}) {
  const playlistsValue = {
    playlists,
    create: vi.fn(),
    setMovie: vi.fn(),
    remove: vi.fn(),
    isInAny: (movieId) => playlists.some((p) => p.movie_ids.includes(movieId)),
    ...playlistFns, // a test can pass its own create/setMovie to check calls
  }
  const auth = { open: vi.fn() } // a test can check the sign-in modal was asked for
  const result = render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, checking: false, login: vi.fn(), logout }}>
        <PlaylistsContext.Provider value={playlistsValue}>
          <AuthModalContext.Provider value={auth}>{ui}</AuthModalContext.Provider>
        </PlaylistsContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  )
  return { ...playlistsValue, auth, container: result.container }
}
