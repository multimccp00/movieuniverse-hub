// "About" screen content: what the app does, how the combined score works, and TMDB attribution
// (TMDB's terms ask apps to credit them and say they aren't endorsed by TMDB).
import './AboutBlock.css'

export default function AboutBlock() {
  return (
    <article className="about stack">
      <h1>About MovieUniverse Hub</h1>
      <p>
        Search movies, build playlists, rate movies from 1 to 10, and compare playlists.
        Movie data comes from TMDB; playlists and ratings are stored by this app.
      </p>

      <section className="stack">
        <h2>The combined score</h2>
        <p>
          Every movie gets one score that mixes TMDB&apos;s votes with this app&apos;s votes. Every vote counts
          once, and every movie starts with 1,000 imaginary votes of 6.0. So a movie with only a few votes
          stays close to 6.0, and one with thousands of votes gets its real average. A handful of very
          enthusiastic votes can&apos;t push an unknown movie above a well-known one.
        </p>
      </section>

      <section className="stack">
        <h2>Data source</h2>
        <p className="about__attribution">
          This product uses the TMDB API but is not endorsed or certified by TMDB.{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">themoviedb.org</a>
        </p>
      </section>
    </article>
  )
}
