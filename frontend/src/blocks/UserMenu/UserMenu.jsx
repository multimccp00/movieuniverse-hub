// Logged in: avatar + username, opening a small menu with "Log out".
// Logged out: a "Sign in" pill that opens the sign-in modal.
// The menu is a native <details>: opens and closes on click or Enter, no JavaScript needed.
import { useUser } from '../../context/UserContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import './UserMenu.css'

export default function UserMenu() {
  const { user, logout } = useUser()
  const auth = useAuthModal()

  if (!user) {
    return (
      <button type="button" className="user-menu__signin" onClick={() => auth.open({})}>
        Sign in
      </button>
    )
  }

  return (
    <details className="user-menu">
      <summary className="user-menu__toggle">
        <span className="user-menu__avatar" aria-hidden="true">{user.username[0].toUpperCase()}</span>
        <span className="user-menu__name">{user.username}</span>
        <span className="user-menu__caret" aria-hidden="true">▾</span>
      </summary>
      <div className="user-menu__panel">
        <button type="button" className="user-menu__item" onClick={logout}>Log out</button>
      </div>
    </details>
  )
}
