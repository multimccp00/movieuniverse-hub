// Previous / Next page links. hrefFor(page) builds the link, so the block works for any list.
// At the first or last page the button stays, dimmed, so the row doesn't shift.
import { Link } from 'react-router-dom'
import './Pager.css'

function PageLink({ page, hrefFor, enabled, children }) {
  if (!enabled) return <span className="pager__link pager__link--off" aria-disabled="true">{children}</span>
  return <Link className="pager__link" to={hrefFor(page)}>{children}</Link>
}

export default function Pager({ page, totalPages, hrefFor }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pager" aria-label="Pages">
      <PageLink page={page - 1} hrefFor={hrefFor} enabled={page > 1}>← Previous</PageLink>
      <span className="pager__status">Page {page} of {totalPages}</span>
      <PageLink page={page + 1} hrefFor={hrefFor} enabled={page < totalPages}>Next →</PageLink>
    </nav>
  )
}
