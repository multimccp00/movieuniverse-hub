import { fireEvent, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import UserRating from './UserRating.jsx'

const ana = { id: 1, username: 'ana' }

test('shows app average and lets a logged-in user rate', () => {
  const onRate = vi.fn()
  renderWithContext(
    <UserRating summary={{ my_stars: 8, app_average: 8.5, app_count: 2 }} onRate={onRate} />,
    { user: ana },
  )
  expect(screen.getByText('8.5 · 2 votes')).toBeTruthy()
  expect(screen.getByText('Your rating: 8/10')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '9' }))
  expect(onRate).toHaveBeenCalledWith(9)
})

test('logged out: no buttons, "No votes" when nobody rated', () => {
  renderWithContext(<UserRating summary={{ my_stars: null, app_average: null, app_count: 0 }} onRate={vi.fn()} />)
  expect(screen.getByText('No votes')).toBeTruthy()
  expect(screen.getByText('Log in to rate this movie.')).toBeTruthy()
  expect(screen.queryByRole('button')).toBeNull()
})

test('shows an error', () => {
  renderWithContext(<UserRating summary={null} error="Not logged in" onRate={vi.fn()} />, { user: ana })
  expect(screen.getByRole('alert').textContent).toBe('Not logged in')
})
