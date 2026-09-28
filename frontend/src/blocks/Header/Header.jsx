// Header block: brand, navigation, search pill, user menu. On phones the navigation moves
// to a tab bar at the bottom, and movie/playlist pages get a round Back button instead.
// Styles live in Header.css next to it.
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar.jsx'
import UserMenu from '../UserMenu/UserMenu.jsx'
import './Header.css'

const TABS = [['/', 'Home'], ['/search', 'Search'], ['/compare', 'Compare'], ['/about', 'About']]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isDetail = pathname.startsWith('/movies/') || pathname.startsWith('/playlists/')
  // Pages with a big backdrop: the header sits on top of it, with no line under it
  const hasHero = pathname === '/' || isDetail

  const classes = ['header']
  if (!hasHero) classes.push('header--solid')
  if (isDetail) classes.push('header--detail')
  if (pathname === '/search') classes.push('header--search')

  function goBack() {
    // The router counts the pages visited in this app; if this is the first one, go home instead of leaving
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <>
      <header className={classes.join(' ')}>
        <button type="button" className="header__back" aria-label="Back" onClick={goBack}>←</button>
        <Link to="/" className="header__brand">MovieUniverse<span className="header__hub"> Hub</span></Link>
        <nav className="header__nav" aria-label="Main">
          <NavLink to="/" end>Discover</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="header__search"><SearchBar /></div>
        <div className="header__user"><UserMenu /></div>
      </header>

      <nav className="tabbar" aria-label="Main">
        {TABS.map(([to, label]) => (
          <NavLink key={to} to={to} end className="tabbar__link">{label}</NavLink>
        ))}
      </nav>
    </>
  )
}
