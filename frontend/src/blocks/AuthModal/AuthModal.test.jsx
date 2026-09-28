import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { UserProvider } from '../../context/UserContext.jsx'
import { AuthModalProvider, useAuthModal } from '../../context/AuthModalContext.jsx'

const matrix = { id: 603, title: 'The Matrix', poster_url: null }

// Fake backend: not logged in at first; logging in as ana works
function fakeFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url === '/api/users/me') return { ok: false, status: 401, json: async () => ({ detail: 'Not logged in' }) }
    return { ok: true, status: 200, json: async () => ({ id: 1, username: 'ana' }) }
  }))
}

afterEach(() => vi.unstubAllGlobals())

// Stands in for the ★ button: asks for the modal, and says what to do after login
function SaveButton({ onSuccess }) {
  const auth = useAuthModal()
  return <button onClick={() => auth.open({ reason: 'save', movie: matrix, onSuccess })}>Save</button>
}

function renderApp(onSuccess) {
  render(
    <UserProvider>
      <AuthModalProvider><SaveButton onSuccess={onSuccess} /></AuthModalProvider>
    </UserProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
}

test('says why, and finishes the action after logging in', async () => {
  fakeFetch()
  const onSuccess = vi.fn()
  renderApp(onSuccess)
  expect(screen.getByRole('dialog').textContent).toContain('Sign in to save The Matrix to a playlist.')

  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ana' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo1234' } })
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

  await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled())
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('the close button closes it without running the action', () => {
  fakeFetch()
  const onSuccess = vi.fn()
  renderApp(onSuccess)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(onSuccess).not.toHaveBeenCalled()
})
