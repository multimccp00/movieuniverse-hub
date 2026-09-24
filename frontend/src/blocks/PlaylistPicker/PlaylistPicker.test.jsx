import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import PlaylistPicker from './PlaylistPicker.jsx'

const playlists = [
  { id: 1, name: 'Sci-fi', owner: 'ana', movie_ids: [603] },
  { id: 2, name: 'Sunday', owner: 'ana', movie_ids: [] },
]

test('ticked where the movie already is', () => {
  renderWithContext(<PlaylistPicker movieId={603} />, { playlists })
  expect(screen.getByLabelText('Sci-fi').checked).toBe(true)
  expect(screen.getByLabelText('Sunday').checked).toBe(false)
})

test('ticking adds, unticking removes', () => {
  const { setMovie } = renderWithContext(<PlaylistPicker movieId={603} />, { playlists })
  fireEvent.click(screen.getByLabelText('Sunday'))
  expect(setMovie).toHaveBeenCalledWith(2, 603, true)
  fireEvent.click(screen.getByLabelText('Sci-fi'))
  expect(setMovie).toHaveBeenCalledWith(1, 603, false)
})

test('a playlist created here gets the movie', async () => {
  const create = vi.fn(async () => ({ id: 3, name: 'New', owner: 'ana', movie_ids: [] }))
  const { setMovie } = renderWithContext(<PlaylistPicker movieId={603} />, { playlists, create })
  fireEvent.change(screen.getByLabelText('New playlist name'), { target: { value: 'New' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))
  await waitFor(() => expect(setMovie).toHaveBeenCalledWith(3, 603, true))
})
