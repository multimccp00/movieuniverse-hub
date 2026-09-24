import { fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import UserRating from './UserRating.jsx'

// Fake backend: GET answers `summary`; PUT answers with the new rating applied
function fakeRatingsApi(summary) {
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const body = options.method === 'PUT'
      ? { ...summary, my_stars: JSON.parse(options.body).stars }
      : summary
    return { ok: true, status: 200, json: async () => body }
  }))
}

afterEach(() => vi.unstubAllGlobals())

test('shows app average and lets a logged-in user rate', async () => {
  fakeRatingsApi({ my_stars: null, app_average: 8.5, app_count: 2 })
  renderWithContext(<UserRating movieId={603} />, { user: { id: 1, username: 'ana' } })

  expect(await screen.findByText('8.5 · 2 votes')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '8' }))
  expect(await screen.findByText('Your rating: 8/10')).toBeTruthy()
  expect(fetch).toHaveBeenLastCalledWith('/api/ratings/603', expect.objectContaining({ method: 'PUT' }))
})

test('logged out: no buttons, "No votes" when nobody rated', async () => {
  fakeRatingsApi({ my_stars: null, app_average: null, app_count: 0 })
  renderWithContext(<UserRating movieId={603} />)
  expect(await screen.findByText('No votes')).toBeTruthy()
  expect(screen.getByText('Log in to rate this movie.')).toBeTruthy()
  expect(screen.queryByRole('button')).toBeNull()
})
