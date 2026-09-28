// Login form: username + password, switchable between "Log in" and "Create account".
// Lives inside the sign-in modal; onSuccess runs once the user is logged in.
import { useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import './LoginBlock.css'

const MODES = [['login', 'Log in'], ['register', 'Create account']]
const DEMO_USERS = ['ana', 'bruno', 'carla']

export default function LoginBlock({ onSuccess }) {
  const { login, register } = useUser()
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setBusy(true)
    try {
      await (isLogin ? login : register)(username, password)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      {/* Segmented control: two choices, one selected, so it's a radio group */}
      <div className="login__modes" role="radiogroup" aria-label="Log in or create an account">
        {MODES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            className="login__mode"
            onClick={() => {
              setMode(value)
              setError('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="login__field">
        Username
        <input
          className="input login__input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="login__field">
        Password
        <input
          className="input login__input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // tells password managers whether to fill a saved password or suggest a new one
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={isLogin ? undefined : 8}
          maxLength={isLogin ? undefined : 128}
          aria-describedby={isLogin ? undefined : 'password-hint'}
          required
        />
      </label>
      {!isLogin && <p className="login__hint" id="password-hint">8 to 128 characters.</p>}

      {/* role="alert" makes screen readers announce the error */}
      {error && <p className="login__error" role="alert">{error}</p>}

      <button className="btn btn--primary login__submit" type="submit" disabled={busy}>
        {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
      </button>

      {isLogin && (
        <p className="login__demo">
          Try a demo account:
          {DEMO_USERS.map((name) => (
            <button key={name} type="button" className="login__chip" onClick={() => setUsername(name)}>
              {name}
            </button>
          ))}
          <span className="login__password">demo1234</span>
        </p>
      )}
    </form>
  )
}
