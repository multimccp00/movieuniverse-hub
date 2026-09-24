// Header block: brand + navigation links. Styles live in Header.css next to it.
import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">MovieUniverse Hub</Link>
        <nav className="header__nav">
          <Link to="/">Home</Link>
        </nav>
      </div>
    </header>
  )
}
