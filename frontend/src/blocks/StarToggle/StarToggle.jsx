// The ★ on a movie card. Filled when the movie is in any of your playlists;
// clicking opens the playlist picker. Hidden when logged out.
import { useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { usePlaylists } from '../../context/PlaylistsContext.jsx'
import PlaylistPicker from '../PlaylistPicker/PlaylistPicker.jsx'
import './StarToggle.css'

export default function StarToggle({ movieId }) {
  const { user } = useUser()
  const { isInAny } = usePlaylists()
  const [open, setOpen] = useState(false)
  if (!user) return null

  const saved = isInAny(movieId)

  return (
    <div
      className="star-toggle"
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)} // Esc closes the popover
    >
      <button
        type="button"
        className={`star-toggle__button${saved ? ' star-toggle__button--on' : ''}`}
        aria-label={saved ? 'In your playlists, change' : 'Add to a playlist'}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {saved ? '★' : '☆'}
      </button>
      {open && (
        <div className="star-toggle__popover">
          <PlaylistPicker movieId={movieId} />
        </div>
      )}
    </div>
  )
}
