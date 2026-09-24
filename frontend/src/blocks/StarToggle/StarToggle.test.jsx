import { fireEvent, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import StarToggle from './StarToggle.jsx'

const ana = { id: 1, username: 'ana' }
const scifi = { id: 1, name: 'Sci-fi', owner: 'ana', movie_ids: [603] }

test('hidden when logged out', () => {
  renderWithContext(<StarToggle movieId={603} />)
  expect(screen.queryByRole('button')).toBeNull()
})

test('filled star when the movie is in a playlist, empty otherwise', () => {
  renderWithContext(<><StarToggle movieId={603} /><StarToggle movieId={78} /></>, { user: ana, playlists: [scifi] })
  expect(screen.getByRole('button', { name: 'In your playlists, change' }).textContent).toBe('★')
  expect(screen.getByRole('button', { name: 'Add to a playlist' }).textContent).toBe('☆')
})

test('click opens the playlist picker', () => {
  renderWithContext(<StarToggle movieId={603} />, { user: ana, playlists: [scifi] })
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByLabelText('Sci-fi')).toBeTruthy()
})
