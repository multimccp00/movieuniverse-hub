// App shell: Header on every page, then the page that matches the URL.
import { Routes, Route } from 'react-router-dom'
import Header from './blocks/Header/Header.jsx'
import HomePage from './pages/HomePage.jsx'

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </>
  )
}
