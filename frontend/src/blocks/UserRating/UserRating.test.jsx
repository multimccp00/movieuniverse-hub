import { fireEvent, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import UserRating from './UserRating.jsx'

const ana = { id: 1, username: 'ana' }
const matrix = { id: 603, title: 'The Matrix' }

test('shows your rating and lets a logged-in user rate', () => {
  const onRate = vi.fn()
  renderWithContext(
    <UserRating movie={matrix} summary={{ my_stars: 8, app_average: 8.5, app_count: 2 }} onRate={onRate} />,
    { user: ana },
  )
  expect(screen.getByText('8/10')).toBeTruthy()
  expect(screen.getByRole('button', { name: '8' }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: '9' }))
  expect(onRate).toHaveBeenCalledWith(9)
})

test('logged out: rating asks to sign in first, then rates', () => {
  const onRate = vi.fn()
  const { auth } = renderWithContext(
    <UserRating movie={matrix} summary={{ my_stars: null, app_average: null, app_count: 0 }} onRate={onRate} />,
  )
  expect(screen.getByRole('button', { name: 'Sign in to rate' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '7' }))
  expect(onRate).not.toHaveBeenCalled()
  auth.open.mock.lastCall[0].onSuccess() // what the modal does after a successful login
  expect(onRate).toHaveBeenCalledWith(7)
})

test('shows an error', () => {
  renderWithContext(<UserRating movie={matrix} summary={null} error="Not logged in" onRate={vi.fn()} />, { user: ana })
  expect(screen.getByRole('alert').textContent).toBe('Not logged in')
})
