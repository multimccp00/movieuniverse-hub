import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { UserProvider } from '../../context/UserContext.jsx'
import LoginBlock from './LoginBlock.jsx'

// Fake backend: GET /users/me says "not logged in"; the POST answers `status` + `body`
function fakeFetch(status, body) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url === '/api/users/me') return { ok: false, status: 401, json: async () => ({ detail: 'Not logged in' }) }
    return { ok: status < 400, status, json: async () => body }
  }))
}

afterEach(() => vi.unstubAllGlobals())

function fillAndSubmit(buttonName) {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ana' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo1234' } })
  fireEvent.click(screen.getByRole('button', { name: buttonName }))
}

function sentBody() {
  return JSON.parse(fetch.mock.lastCall[1].body)
}

test('logs in with username and password', async () => {
  fakeFetch(200, { id: 1, username: 'ana' })
  render(<UserProvider><LoginBlock /></UserProvider>)
  fillAndSubmit('Log in')
  await vi.waitFor(() => expect(fetch).toHaveBeenLastCalledWith('/api/users/login', expect.anything()))
  expect(sentBody()).toEqual({ username: 'ana', password: 'demo1234' })
})

test('can switch to creating an account', async () => {
  fakeFetch(201, { id: 2, username: 'ana' })
  render(<UserProvider><LoginBlock /></UserProvider>)
  fireEvent.click(screen.getByRole('button', { name: 'No account? Create one' }))
  fillAndSubmit('Create account')
  await vi.waitFor(() => expect(fetch).toHaveBeenLastCalledWith('/api/users/register', expect.anything()))
})

test('shows the error from the backend', async () => {
  fakeFetch(401, { detail: 'Wrong username or password' })
  render(<UserProvider><LoginBlock /></UserProvider>)
  fillAndSubmit('Log in')
  expect((await screen.findByRole('alert')).textContent).toBe('Wrong username or password')
})
