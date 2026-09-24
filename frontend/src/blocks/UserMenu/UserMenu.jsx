// Shows the logged-in username + log out button. Shows nothing when logged out.
import { useUser } from '../../context/UserContext.jsx'
import './UserMenu.css'

export default function UserMenu() {
  const { user, logout } = useUser()
  if (!user) return null

  return (
    <div className="user-menu">
      <span className="user-menu__name">{user.username}</span>
      <button className="btn" onClick={logout}>Log out</button>
    </div>
  )
}
