// Header block: brand, search, navigation links, user menu. Styles live in Header.css next to it.
import { Link } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar.jsx'
import UserMenu from '../UserMenu/UserMenu.jsx'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">MovieUniverse Hub</Link>
        <SearchBar />
        <nav className="header__nav">
          <Link to="/">Home</Link>
          <Link to="/compare">Compare</Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
