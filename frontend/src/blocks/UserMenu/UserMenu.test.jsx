import { fireEvent, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import UserMenu from './UserMenu.jsx'

test('shows username and logs out from the menu', () => {
  const logout = vi.fn()
  renderWithContext(<UserMenu />, { user: { id: 1, username: 'ana' }, logout })
  expect(screen.getByText('ana')).toBeTruthy()
  fireEvent.click(screen.getByText('ana')) // opens the menu
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
  expect(logout).toHaveBeenCalled()
})

test('logged out: a Sign in button that opens the sign-in modal', () => {
  const { auth } = renderWithContext(<UserMenu />)
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  expect(auth.open).toHaveBeenCalled()
})
