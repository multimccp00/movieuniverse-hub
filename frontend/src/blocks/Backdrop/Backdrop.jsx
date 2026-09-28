// The wide image behind a page's hero, fading into the page background.
// Several movies (playlist page) = their backdrops side by side.
// A movie with no backdrop uses its poster, blurred and enlarged, so the hero never looks empty.
// Purely decorative: hidden from screen readers.
import './Backdrop.css'

export default function Backdrop({ movies, size }) {
  if (movies.length === 0) return null

  return (
    <div className={`backdrop backdrop--${size}`} aria-hidden="true">
      {movies.map((movie) => {
        const src = movie.backdrop_url ?? movie.poster_url
        const poster = !movie.backdrop_url
        return (
          <div key={movie.id} className="backdrop__cell">
            {src && <img className={`backdrop__img${poster ? ' backdrop__img--poster' : ''}`} src={src} alt="" />}
          </div>
        )
      })}
    </div>
  )
}
