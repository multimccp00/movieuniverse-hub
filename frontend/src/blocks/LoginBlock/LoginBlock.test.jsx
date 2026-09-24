import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { UserProvider } from '../../context/UserContext.jsx'
import LoginBlock from './LoginBlock.jsx'

// Fake the backend: fetch returns the given status and JSON body
function fakeFetch(status, body) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: status < 400,
    status,
    json: async () => body,
  })))
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function submit(name) {
  render(<UserProvider><LoginBlock /></UserProvider>)
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

test('logging in saves the username', async () => {
  fakeFetch(200, { id: 1, username: 'ana' })
  submit('Ana')
  await waitFor(() => expect(localStorage.getItem('username')).toBe('ana'))
  expect(fetch).toHaveBeenCalledWith('/api/users/login', expect.objectContaining({ method: 'POST' }))
})

test('shows the error from the backend', async () => {
  fakeFetch(422, { detail: [{ msg: 'Value error, username must be 2 to 30 characters' }] })
  submit('a')
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'username must be 2 to 30 characters')
})
