import { fireEvent, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import StarToggle from './StarToggle.jsx'

const ana = { id: 1, username: 'ana' }
const scifi = { id: 1, name: 'Sci-fi', owner: 'ana', movie_ids: [603] }
const matrix = { id: 603, title: 'The Matrix' }
const alien = { id: 348, title: 'Alien' }

test('logged out: asks to sign in first, then opens the picker', () => {
  const { auth } = renderWithContext(<StarToggle movie={matrix} />)
  fireEvent.click(screen.getByRole('button', { name: 'Add to a playlist' }))
  expect(auth.open).toHaveBeenCalledWith(expect.objectContaining({ reason: 'save', movie: matrix }))
  expect(typeof auth.open.mock.lastCall[0].onSuccess).toBe('function') // opens the picker after login
})

test('filled star when the movie is in a playlist, empty otherwise', () => {
  renderWithContext(<><StarToggle movie={matrix} /><StarToggle movie={alien} /></>, { user: ana, playlists: [scifi] })
  expect(screen.getByRole('button', { name: 'In your playlists, change' }).textContent).toBe('★')
  expect(screen.getByRole('button', { name: 'Add to a playlist' }).textContent).toBe('☆')
})

test('click opens the playlist picker, Esc closes it', () => {
  renderWithContext(<StarToggle movie={matrix} />, { user: ana, playlists: [scifi] })
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('The Matrix')).toBeTruthy() // "Save The Matrix to…"
  expect(screen.getByLabelText('Sci-fi')).toBeTruthy()
  fireEvent.keyDown(screen.getByLabelText('Sci-fi'), { key: 'Escape' })
  expect(screen.queryByLabelText('Sci-fi')).toBeNull()
})

test('pill variant counts the playlists', () => {
  renderWithContext(<StarToggle movie={matrix} variant="pill" />, { user: ana, playlists: [scifi] })
  expect(screen.getByRole('button').textContent).toBe('★ In 1 playlist')
})
