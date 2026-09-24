// Login block: one field (username) + button. Reusable on any page.
import { useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import './LoginBlock.css'

export default function LoginBlock() {
  const { login } = useUser()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setBusy(true)
    try {
      await login(username)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="login stack" onSubmit={handleSubmit}>
      <h2>Who's watching?</h2>
      <label className="stack login__field">
        <span>Username</span>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      {/* role="alert" makes screen readers announce the error */}
      {error && <p className="login__error" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
      <p className="muted login__hint">New name? An account is created for you.</p>
    </form>
  )
}
