// Previous / Next page links. hrefFor(page) builds the link, so the block works for any list.
import { Link } from 'react-router-dom'
import './Pager.css'

export default function Pager({ page, totalPages, hrefFor }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? <Link className="btn" to={hrefFor(page - 1)}>← Previous</Link> : <span />}
      <span className="muted">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link className="btn" to={hrefFor(page + 1)}>Next →</Link> : <span />}
    </nav>
  )
}
