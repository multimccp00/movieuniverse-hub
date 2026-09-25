// Keeps "who is logged in" in one place so any block can read it with useUser().
// The login itself lives in an httpOnly cookie the page can't read, so on start
// we simply ask the backend "who am I?".
import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

export const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  // true while we ask the backend, so pages don't flash the login form
  const [checking, setChecking] = useState(true)

  // Runs once when the app opens. 401 (not logged in) is normal: user stays null.
  useEffect(() => {
    api('/users/me')
      .then(setUser)
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  async function login(username, password) {
    setUser(await api('/users/login', { method: 'POST', body: { username, password } }))
  }

  async function register(username, password) {
    setUser(await api('/users/register', { method: 'POST', body: { username, password } }))
  }

  async function logout() {
    await api('/users/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
