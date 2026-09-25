// App shell: Header on every page, then the page that matches the URL.
import { Routes, Route } from 'react-router-dom'
import Header from './blocks/Header/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import MovieDetailPage from './pages/MovieDetailPage.jsx'
import PlaylistPage from './pages/PlaylistPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import AboutPage from './pages/AboutPage.jsx'

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/playlists/:id" element={<PlaylistPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  )
}
