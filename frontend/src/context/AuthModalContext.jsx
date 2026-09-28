// "Sign in first": a logged-out user who presses ★, rates, or clicks "Sign in" gets the
// sign-in modal instead of a dead end. After logging in, onSuccess finishes what they started
// (e.g. opens the ★ picker for that movie).
import { createContext, useContext, useState } from 'react'
import AuthModal from '../blocks/AuthModal/AuthModal.jsx'

export const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  // The open request ({ reason, movie, onSuccess }), or null when the modal is closed
  const [request, setRequest] = useState(null)

  return (
    <AuthModalContext.Provider value={{ open: setRequest }}>
      {children}
      {request && <AuthModal {...request} onClose={() => setRequest(null)} />}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}
