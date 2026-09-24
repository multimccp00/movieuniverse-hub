// Keeps "who is logged in" in one place so any block can read it with useUser().
import { createContext, useContext, useEffect, useState } from 'react'
import { api, USER_KEY } from '../api/client.js'

export const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  // true while we check a saved login with the backend, so pages don't flash the login form
  const [checking, setChecking] = useState(true)

  // Runs once when the app opens: is there a saved username, and is it still valid?
  useEffect(() => {
    if (!localStorage.getItem(USER_KEY)) {
      setChecking(false)
      return
    }
    api('/users/me')
      .then(setUser)
      .catch((err) => {
        // 401 = user no longer exists (e.g. database was reset): forget it.
        // Other errors (backend down) keep the saved name for next time.
        if (err.status === 401) localStorage.removeItem(USER_KEY)
      })
      .finally(() => setChecking(false))
  }, [])

  async function login(username) {
    const loggedIn = await api('/users/login', { method: 'POST', body: { username } })
    localStorage.setItem(USER_KEY, loggedIn.username)
    setUser(loggedIn)
  }

  function logout() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
