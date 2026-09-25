// Login block: username + password, switchable between "Log in" and "Create account".
import { useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import './LoginBlock.css'

export default function LoginBlock() {
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
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  return (
    <form className="login stack" onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Log in' : 'Create account'}</h2>
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
      <label className="stack login__field">
        <span>Password</span>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // tells password managers whether to fill a saved password or suggest a new one
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={isLogin ? undefined : 8}
          required
        />
      </label>
      {/* role="alert" makes screen readers announce the error */}
      {error && <p className="login__error" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
      </button>
      <button className="login__switch" type="button" onClick={switchMode}>
        {isLogin ? 'No account? Create one' : 'Have an account? Log in'}
      </button>
      {isLogin && (
        <p className="muted login__hint">Example users: ana, bruno, carla. Password: demo1234</p>
      )}
    </form>
  )
}
