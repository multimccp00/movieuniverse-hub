// The sign-in modal: says why you need to sign in, then the login form.
// A native <dialog> opened with showModal() gives, for free: focus stays inside,
// Esc closes it, the page behind can't be clicked, and focus goes back to the
// button that opened it.
import { useEffect, useRef } from 'react'
import LoginBlock from '../LoginBlock/LoginBlock.jsx'
import './AuthModal.css'

function Reason({ reason, movie }) {
  if (reason === 'save') return <>Sign in to save <strong>{movie.title}</strong> to a playlist.</>
  if (reason === 'rate') return <>Sign in to rate <strong>{movie.title}</strong>.</>
  return <>Sign in to save movies to playlists and rate them.</>
}

export default function AuthModal({ reason, movie, onSuccess, onClose }) {
  const dialog = useRef(null)

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  function close() {
    dialog.current.close() // fires onClose, which removes the modal
  }

  return (
    <dialog
      ref={dialog}
      className="auth-modal"
      aria-label="Sign in"
      onClose={onClose}
      // A click on the dimmed area around the card lands on the <dialog> itself
      onClick={(e) => e.target === dialog.current && close()}
    >
      <div className="auth-modal__grabber" aria-hidden="true" />
      <div className="auth-modal__context">
        {movie?.poster_url && <img className="auth-modal__poster" src={movie.poster_url} alt="" />}
        <p className="auth-modal__reason"><Reason reason={reason} movie={movie} /></p>
        <button type="button" className="auth-modal__close" aria-label="Close" onClick={close}>×</button>
      </div>
      <LoginBlock
        onSuccess={() => {
          close()
          onSuccess?.()
        }}
      />
    </dialog>
  )
}
