import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { UserContext } from '../../context/UserContext.jsx'
import UserMenu from './UserMenu.jsx'

// Give the block a fake context instead of the real provider
function renderWith(value) {
  return render(<UserContext.Provider value={value}><UserMenu /></UserContext.Provider>)
}

test('shows username and logs out on click', () => {
  const logout = vi.fn()
  renderWith({ user: { id: 1, username: 'ana' }, logout })
  expect(screen.getByText('ana')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
  expect(logout).toHaveBeenCalled()
})

test('renders nothing when logged out', () => {
  const { container } = renderWith({ user: null, logout: vi.fn() })
  expect(container.innerHTML).toBe('')
})
