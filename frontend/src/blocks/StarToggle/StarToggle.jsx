// The ★ on a movie. Filled when the movie is in any of your playlists; clicking opens the
// playlist picker in a popover. Logged out, it opens the sign-in modal, then the picker.
// variant="pill": the "★ In 2 playlists" button on the movie page.
import { useEffect, useRef, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import PlaylistPicker from '../PlaylistPicker/PlaylistPicker.jsx'
import './StarToggle.css'

export default function StarToggle({ movie, variant = 'icon' }) {
  const { user } = useUser()
  const { playlists } = usePlaylists()
  const auth = useAuthModal()
  const [open, setOpen] = useState(false)
  const [alignLeft, setAlignLeft] = useState(false)
  const box = useRef(null)

  // Close when clicking anywhere outside the ★ and its popover
  useEffect(() => {
    if (!open) return
    const closeIfOutside = (e) => box.current?.contains(e.target) || setOpen(false)
    document.addEventListener('pointerdown', closeIfOutside)
    return () => document.removeEventListener('pointerdown', closeIfOutside)
  }, [open])

  function show() {
    // Near the left edge of the screen, open the popover to the right so it stays on screen
    setAlignLeft(box.current.getBoundingClientRect().left < 300)
    setOpen(true)
  }

  function handleClick() {
    if (!user) auth.open({ reason: 'save', movie, onSuccess: show })
    else if (open) setOpen(false)
    else show()
  }

  const count = playlists.filter((p) => p.movie_ids.includes(movie.id)).length
  const saved = count > 0
  const pillText = saved ? `★ In ${count} ${count === 1 ? 'playlist' : 'playlists'}` : '☆ Save to playlist'

  return (
    <div
      ref={box}
      className="star-toggle"
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)} // Esc closes the popover
    >
      <button
        type="button"
        className={`star-toggle__button star-toggle__button--${variant}${saved ? ' star-toggle__button--on' : ''}`}
        aria-label={variant === 'icon' ? (saved ? 'In your playlists, change' : 'Add to a playlist') : undefined}
        aria-expanded={open}
        onClick={handleClick}
      >
        {variant === 'icon' ? (saved ? '★' : '☆') : pillText}
      </button>
      {open && (
        <div className={`star-toggle__popover${alignLeft ? ' star-toggle__popover--left' : ''}`}>
          <p className="star-toggle__title">Save <strong>{movie.title}</strong> to…</p>
          <PlaylistPicker movieId={movie.id} />
        </div>
      )}
    </div>
  )
}
